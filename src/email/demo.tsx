import {
  Body,
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

export interface DemoEmailProps {
  appName: string;
  recipient: string;
  provider: string;
}

const bodyStyle: React.CSSProperties = {
  margin: '0',
  backgroundColor: '#f8fafc',
  fontFamily: 'Arial, sans-serif',
};

const wrapperStyle: React.CSSProperties = {
  padding: '32px 16px',
};

const containerStyle: React.CSSProperties = {
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

const textStyle: React.CSSProperties = {
  margin: '0 0 16px',
  color: '#334155',
  fontSize: '16px',
  lineHeight: '24px',
};

const metaStyle: React.CSSProperties = {
  margin: '0 0 8px',
  color: '#475569',
  fontSize: '14px',
  lineHeight: '20px',
};

const labelStyle: React.CSSProperties = {
  color: '#0f172a',
  fontWeight: 700,
};

const dividerStyle: React.CSSProperties = {
  borderTop: '1px solid #e2e8f0',
  margin: '24px 0',
};

export default function DemoEmail({
  appName,
  recipient,
  provider,
}: DemoEmailProps) {
  return (
    <Html lang="en">
      <Head>
        <title>{`${appName} React Email debug test`}</title>
      </Head>
      <Body style={bodyStyle}>
        <Preview>React Email diagnostic for {appName}.</Preview>
        <Section style={wrapperStyle}>
          <Container style={containerStyle}>
            <Section style={contentStyle}>
              <Heading as="h1" style={headingStyle}>
                React Email diagnostic
              </Heading>
              <Text style={textStyle}>
                React Email diagnostic rendered with React Email components.
                This message confirms that the debug route can render a React
                Email template and send it through the configured provider.
              </Text>
              <Hr style={dividerStyle} />
              <Text style={metaStyle}>
                <span style={labelStyle}>Template source:</span>{' '}
                src/email/demo.tsx
              </Text>
              <Text style={metaStyle}>
                <span style={labelStyle}>React Email components:</span> Html,
                Head, Preview, Body, Section, Container, Heading, Text, Hr
              </Text>
              <Text style={metaStyle}>
                <span style={labelStyle}>Recipient:</span> {recipient}
              </Text>
              <Text style={metaStyle}>
                <span style={labelStyle}>Provider:</span> {provider}
              </Text>
            </Section>
          </Container>
        </Section>
      </Body>
    </Html>
  );
}
