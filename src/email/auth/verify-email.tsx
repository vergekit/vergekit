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

export interface VerifyEmailProps {
  appName: string;
  name?: string | null;
  verificationUrl: string;
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

export default function VerifyEmail({
  appName,
  name,
  verificationUrl,
}: VerifyEmailProps) {
  const greeting = name ? `Hi ${name},` : 'Hi,';

  return (
    <Html lang="en">
      <Head>
        <title>{`Verify your ${appName} email`}</title>
      </Head>
      <Body style={bodyStyle}>
        <Preview>Confirm your email address for {appName}.</Preview>
        <Section style={outerSectionStyle}>
          <Container style={cardStyle}>
            <Section style={contentStyle}>
              <Heading as="h1" style={headingStyle}>
                Confirm email address
              </Heading>
              <Text style={bodyTextStyle}>
                {`${greeting} use the button below to verify your email address for ${appName}.`}
              </Text>
              <Button href={verificationUrl} style={buttonStyle}>
                Confirm email address
              </Button>
              <Hr style={dividerStyle} />
              <Text style={footerTextStyle}>
                If you did not create an account, you can ignore this email.
              </Text>
              <Text style={urlTextStyle}>{verificationUrl}</Text>
            </Section>
          </Container>
        </Section>
      </Body>
    </Html>
  );
}
