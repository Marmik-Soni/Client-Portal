"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function sendMessageAction(projectId: string, content: string) {
  if (!content.trim()) {
    return { error: "Message content cannot be empty." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized: You must be signed in to send messages." };
  }

  // Insert message (RLS verifies client/admin access to project)
  const { error } = await supabase.from("messages").insert({
    project_id: projectId,
    sender_id: user.id,
    content: content.trim(),
  });

  if (error) {
    return { error: `Failed to send message: ${error.message}` };
  }

  revalidatePath(`/dashboard/projects/${projectId}`);
  revalidatePath(`/admin/projects/${projectId}`);
  return { success: true };
}

export async function getSignedDownloadUrlAction(filePath: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  // RLS on storage.objects checks if client has access to download
  const { data, error } = await supabase.storage
    .from("project-files")
    .createSignedUrl(filePath, 3600); // 1 hour validity

  if (error || !data?.signedUrl) {
    return { error: error?.message || "Could not generate download link." };
  }

  return { url: data.signedUrl };
}
