-- ====================================================================
-- Client Portal — Phase 1 Migration: Full Schema & RLS Setup
-- ====================================================================

-- 1. Helper Function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Helper Function to get current user's client_id (if they are a client)
CREATE OR REPLACE FUNCTION public.get_my_client_id()
RETURNS uuid AS $$
BEGIN
  RETURN (
    SELECT id FROM public.clients
    WHERE profile_id = auth.uid()
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ====================================================================
-- 2. Profiles Table (One row per auth.users)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  role text NOT NULL DEFAULT 'client' CHECK (role IN ('admin', 'client')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies:
-- Admin can view/modify all profiles
CREATE POLICY "Admins have full access to profiles"
  ON public.profiles FOR ALL
  TO authenticated
  USING (public.is_admin());

-- Users can read and update their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

-- Trigger: Automatically insert into public.profiles when new user is created in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'client')
  )
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ====================================================================
-- 3. Clients Table (Business entities linked to profiles once onboarded)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid UNIQUE REFERENCES public.profiles(id) ON DELETE SET NULL,
  company_name text,
  email text NOT NULL UNIQUE,
  invited_at timestamptz NOT NULL DEFAULT now(),
  onboarded boolean NOT NULL DEFAULT false
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Clients policies:
CREATE POLICY "Admins have full access to clients"
  ON public.clients FOR ALL
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Clients can view their own client record"
  ON public.clients FOR SELECT
  TO authenticated
  USING (profile_id = auth.uid());

-- ====================================================================
-- 4. Projects Table
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'in_progress', 'review', 'completed', 'on_hold')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Projects policies:
CREATE POLICY "Admins have full access to projects"
  ON public.projects FOR ALL
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Clients can view their own projects"
  ON public.projects FOR SELECT
  TO authenticated
  USING (client_id = public.get_my_client_id());

-- ====================================================================
-- 5. Project Files Table (Metadata for files stored in Supabase Storage)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.project_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_path text NOT NULL,       -- Storage path inside 'project-files' bucket
  file_size bigint,
  mime_type text,
  uploaded_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.project_files ENABLE ROW LEVEL SECURITY;

-- Project files policies:
CREATE POLICY "Admins have full access to project_files"
  ON public.project_files FOR ALL
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Clients can view files in their own projects"
  ON public.project_files FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE id = project_files.project_id AND client_id = public.get_my_client_id()
    )
  );

-- ====================================================================
-- 6. Messages Table (Threaded discussion per project)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Messages policies:
CREATE POLICY "Admins have full access to messages"
  ON public.messages FOR ALL
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Clients can view messages in their own projects"
  ON public.messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE id = messages.project_id AND client_id = public.get_my_client_id()
    )
  );

CREATE POLICY "Clients can insert messages into their own projects"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE id = messages.project_id AND client_id = public.get_my_client_id()
    )
  );

-- ====================================================================
-- 7. Invoices Table (Razorpay invoicing structure)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  amount_cents bigint NOT NULL,  -- e.g., in paise for INR or cents for USD
  currency text NOT NULL DEFAULT 'INR',
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  razorpay_invoice_id text,
  razorpay_payment_id text,
  due_date date,
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Invoices policies:
CREATE POLICY "Admins have full access to invoices"
  ON public.invoices FOR ALL
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Clients can view their own invoices"
  ON public.invoices FOR SELECT
  TO authenticated
  USING (client_id = public.get_my_client_id());

-- ====================================================================
-- 8. Push Subscriptions Table (Multi-device VAPID subscriptions)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  endpoint text NOT NULL UNIQUE,
  keys_p256dh text NOT NULL,
  keys_auth text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Push Subscriptions policies:
CREATE POLICY "Admins can view push_subscriptions"
  ON public.push_subscriptions FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Users can manage own push subscriptions"
  ON public.push_subscriptions FOR ALL
  TO authenticated
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

-- ====================================================================
-- 9. Storage Bucket Setup (project-files)
-- ====================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-files', 'project-files', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies for 'project-files' bucket:
CREATE POLICY "Admins have full storage access"
  ON storage.objects FOR ALL
  TO authenticated
  USING (bucket_id = 'project-files' AND public.is_admin())
  WITH CHECK (bucket_id = 'project-files' AND public.is_admin());

CREATE POLICY "Clients can download files for their own projects"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'project-files' AND
    EXISTS (
      SELECT 1 FROM public.project_files pf
      JOIN public.projects p ON p.id = pf.project_id
      WHERE pf.file_path = storage.objects.name AND p.client_id = public.get_my_client_id()
    )
  );

-- Enable Realtime for messages and projects tables by adding them to supabase_realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages, public.projects;
