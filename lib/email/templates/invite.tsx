import * as React from "react";
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Button,
  Hr,
  Preview,
} from "@react-email/components";

interface InviteEmailProps {
  clientEmail: string;
  companyName?: string;
  projectName: string;
  actionLink: string;
}

export function InviteEmailTemplate({
  clientEmail,
  companyName,
  projectName,
  actionLink,
}: Readonly<InviteEmailProps>): React.ReactElement {
  const recipientName = companyName || clientEmail.split("@")[0];

  return (
    <Html>
      <Head />
      <Preview>You have been invited to collaborate on {projectName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerSection}>
            <Heading style={headerTitle}>Client Portal</Heading>
          </Section>

          <Section style={bodySection}>
            <Heading style={title}>Welcome, {recipientName}!</Heading>
            <Text style={paragraph}>
              You have been invited to our private client portal to collaborate on your new project:{" "}
              <strong>{projectName}</strong>.
            </Text>
            <Text style={paragraph}>
              Inside the portal, you will be able to track your project progress, securely access
              and download project files, and communicate directly with our team.
            </Text>
            <Text style={paragraph}>
              To get started, click the button below to verify your email and set up your private
              account password:
            </Text>

            <Section style={buttonContainer}>
              <Button style={button} href={actionLink}>
                Accept Invitation & Set Password
              </Button>
            </Section>

            <Hr style={hr} />

            <Text style={subtext}>
              If the button above does not work, copy and paste this URL into your web browser:
            </Text>
            <Text style={linkText}>{actionLink}</Text>
          </Section>

          <Section style={footerSection}>
            <Text style={footerText}>
              &copy; {new Date().getFullYear()} Client Portal. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles for React Email
const main: React.CSSProperties = {
  backgroundColor: "#0a0a0a",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
  color: "#ffffff",
  padding: "40px 0",
};

const container: React.CSSProperties = {
  margin: "0 auto",
  padding: "0",
  width: "100%",
  maxWidth: "580px",
  backgroundColor: "#171717",
  border: "1px solid #262626",
  borderRadius: "12px",
  overflow: "hidden",
};

const headerSection: React.CSSProperties = {
  backgroundColor: "#000000",
  padding: "24px 32px",
  borderBottom: "1px solid #262626",
};

const headerTitle: React.CSSProperties = {
  fontSize: "20px",
  fontWeight: "600",
  color: "#ffffff",
  margin: "0",
  letterSpacing: "-0.5px",
};

const bodySection: React.CSSProperties = {
  padding: "36px 32px",
};

const title: React.CSSProperties = {
  fontSize: "24px",
  fontWeight: "700",
  color: "#ffffff",
  margin: "0 0 20px 0",
  letterSpacing: "-0.5px",
};

const paragraph: React.CSSProperties = {
  fontSize: "15px",
  lineHeight: "24px",
  color: "#d4d4d4",
  margin: "0 0 16px 0",
};

const buttonContainer: React.CSSProperties = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button: React.CSSProperties = {
  backgroundColor: "#ffffff",
  color: "#000000",
  fontSize: "15px",
  fontWeight: "600",
  borderRadius: "8px",
  padding: "14px 28px",
  textDecoration: "none",
  display: "inline-block",
};

const hr: React.CSSProperties = {
  borderColor: "#262626",
  margin: "28px 0 20px 0",
};

const subtext: React.CSSProperties = {
  fontSize: "13px",
  color: "#737373",
  margin: "0 0 8px 0",
};

const linkText: React.CSSProperties = {
  fontSize: "12px",
  color: "#a3a3a3",
  wordBreak: "break-all" as const,
  margin: "0",
};

const footerSection: React.CSSProperties = {
  backgroundColor: "#0f0f0f",
  padding: "20px 32px",
  borderTop: "1px solid #262626",
  textAlign: "center" as const,
};

const footerText: React.CSSProperties = {
  fontSize: "12px",
  color: "#525252",
  margin: "0",
};
