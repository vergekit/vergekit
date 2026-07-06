import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from 'react-email';
import * as React from 'react';

export interface ResetPasswordEmailProps {
  appName: string;
  name?: string | null;
  resetUrl: string;
}

const bodyStyle: React.CSSProperties = {
  margin: '0',
  backgroundColor: '#f8fafc',
  fontFamily: 'Arial, sans-serif',
};

const outerSectionStyle: React.CSSProperties = {
  padding: '32px 16px',
};

const cardStyle: React.CSSProperties = {
  maxWidth: '560px',
  backgroundColor: '#ffffff',
  border: '1px solid #e2e8f0',
};

const contentStyle: React.CSSProperties = {
  padding: '32px',
};

const headingStyle: React.CSSProperties = {
  margin: '0 0 16px',
  color: '#0f172a',
  fontSize: '24px',
  lineHeight: '32px',
};

const bodyTextStyle: React.CSSProperties = {
  margin: '0 0 20px',
  color: '#334155',
  fontSize: '16px',
  lineHeight: '24px',
};

const buttonStyle: React.CSSProperties = {
  backgroundColor: '#0f172a',
  color: '#ffffff',
  padding: '12px 18px',
  fontWeight: 700,
};

const dividerStyle: React.CSSProperties = {
  borderTop: '1px solid #e2e8f0',
  margin: '28px 0',
};

const footerTextStyle: React.CSSProperties = {
  margin: '0 0 12px',
  color: '#64748b',
  fontSize: '13px',
  lineHeight: '20px',
};

const urlTextStyle: React.CSSProperties = {
  ...footerTextStyle,
  marginBottom: '0',
};

export default function ResetPasswordEmail({
  appName,
  name,
  resetUrl,
}: ResetPasswordEmailProps) {
  const greeting = name ? `Hi ${name},` : 'Hi,';

  return (
    <Html lang="en">
      <Head>
        <title>{`Reset your ${appName} password`}</title>
      </Head>
      <Body style={bodyStyle}>
        <Preview>Reset your {appName} password.</Preview>
        <Section style={outerSectionStyle}>
          <Container style={cardStyle}>
            <Section style={contentStyle}>
              <Heading as="h1" style={headingStyle}>
                Reset password
              </Heading>
              <Text style={bodyTextStyle}>
                {`${greeting} use the button below to choose a new password for ${appName}.`}
              </Text>
              <Button href={resetUrl} style={buttonStyle}>
                Reset password
              </Button>
              <Hr style={dividerStyle} />
              <Text style={footerTextStyle}>
                If you did not request a password reset, you can ignore this
                email.
              </Text>
              <Text style={urlTextStyle}>{resetUrl}</Text>
            </Section>
          </Container>
        </Section>
      </Body>
    </Html>
  );
}
