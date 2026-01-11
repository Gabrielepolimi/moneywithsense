import React from 'react';
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Link,
  Img,
  Hr,
  Button,
  Row,
  Column,
  Preview,
} from '@react-email/components';
import { ScoredArticle } from '../../lib/utils/targeting';

interface NewsletterTemplateProps {
  userName: string;
  userFirstName: string;
  articles: ScoredArticle[];
  userPreferences: {
    totalInterests: number;
  };
  unsubscribeUrl: string;
  preferencesUrl: string;
}

export default function NewsletterTemplate({
  userFirstName,
  articles,
  userPreferences,
  unsubscribeUrl,
  preferencesUrl,
}: NewsletterTemplateProps) {

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Html>
      <Head>
        <title>MoneyWithSense - Your Weekly Finance Insights</title>
        <meta name="description" content="Personalized personal finance articles selected for you" />
      </Head>
      <Preview>
        💰 {userFirstName}, here are your personalized finance articles!
      </Preview>
      
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Row>
              <Column>
                <Heading style={logo}>💰 MoneyWithSense</Heading>
                <Text style={tagline}>Practical money education for everyday people</Text>
              </Column>
            </Row>
          </Section>

          {/* Greeting */}
          <Section style={greeting}>
            <Heading style={h1}>
              Hey {userFirstName}! 👋
            </Heading>
            <Text style={text}>
              Here are the best personal finance articles selected just for you, 
              based on your preferences and interests.
            </Text>
          </Section>

          {/* User Stats */}
          <Section style={statsContainer}>
            <Row>
              <Column style={statItem}>
                <Text style={statNumber}>{userPreferences.totalInterests}</Text>
                <Text style={statLabel}>Topics You Follow</Text>
              </Column>
            </Row>
          </Section>

          {/* Articles */}
          <Section style={articlesSection}>
            <Heading style={h2}>📝 Articles For You</Heading>
            
            {articles.map((article) => (
              <Section key={article._id} style={articleContainer}>
                <Row>
                  <Column style={articleImageColumn}>
                    {article.mainImage && (
                      <Img
                        src={article.mainImage}
                        alt={article.title}
                        style={articleImage}
                      />
                    )}
                  </Column>
                  <Column style={articleContentColumn}>
                    <Heading style={articleTitle}>{article.title}</Heading>
                    <Text style={articleExcerpt}>{article.excerpt}</Text>
                    
                    <Row style={articleMeta}>
                      <Column>
                        <Text style={articleAuthor}>by MoneyWithSense Team</Text>
                      </Column>
                      <Column>
                        <Text style={articleDate}>{formatDate(article.publishedAt)}</Text>
                      </Column>
                    </Row>

                    <Row style={articleTags}>
                      <Column>
                        <Text style={matchScore}>
                          Match: {article.score}%
                        </Text>
                      </Column>
                    </Row>

                    <Button style={readButton} href={`https://moneywithsense.com/articles/${article.slug}`}>
                      Read Article →
                    </Button>
                  </Column>
                </Row>
              </Section>
            ))}
          </Section>

          {/* Call to Action */}
          <Section style={ctaSection}>
            <Heading style={h2}>🎯 Want more personalized content?</Heading>
            <Text style={text}>
              Update your preferences to receive even more targeted articles.
            </Text>
            <Button style={ctaButton} href={preferencesUrl}>
              Update Preferences
            </Button>
          </Section>

          {/* Footer */}
          <Hr style={hr} />
          <Section style={footer}>
            <Text style={footerText}>
              You received this email because you subscribed to the MoneyWithSense newsletter.
            </Text>
            <Row style={footerLinks}>
              <Column>
                <Link style={footerLink} href={preferencesUrl}>
                  Update Preferences
                </Link>
              </Column>
              <Column>
                <Link style={footerLink} href={unsubscribeUrl}>
                  Unsubscribe
                </Link>
              </Column>
            </Row>
            <Text style={footerText}>
              © {new Date().getFullYear()} MoneyWithSense. All rights reserved.
            </Text>
            <Text style={disclaimerText}>
              This email is for informational purposes only and does not constitute financial advice.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '600px',
};

const header = {
  backgroundColor: '#1E6F5C',
  padding: '20px',
  borderRadius: '8px 8px 0 0',
  textAlign: 'center' as const,
};

const logo = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0 0 8px 0',
};

const tagline = {
  color: '#a7f3d0',
  fontSize: '14px',
  margin: '0',
};

const greeting = {
  backgroundColor: '#ffffff',
  padding: '32px 24px',
  borderBottom: '1px solid #e5e7eb',
};

const h1 = {
  color: '#111827',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 16px 0',
};

const h2 = {
  color: '#111827',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '0 0 16px 0',
};

const text = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 16px 0',
};

const statsContainer = {
  backgroundColor: '#ffffff',
  padding: '24px',
  borderBottom: '1px solid #e5e7eb',
};

const statItem = {
  textAlign: 'center' as const,
  padding: '0 16px',
};

const statNumber = {
  color: '#1E6F5C',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 4px 0',
};

const statLabel = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '0',
};

const articlesSection = {
  backgroundColor: '#ffffff',
  padding: '32px 24px',
};

const articleContainer = {
  marginBottom: '32px',
  padding: '24px',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  backgroundColor: '#fafafa',
};

const articleImageColumn = {
  width: '120px',
  paddingRight: '16px',
};

const articleContentColumn = {
  width: '100%',
};

const articleImage = {
  width: '100%',
  height: '80px',
  objectFit: 'cover' as const,
  borderRadius: '4px',
};

const articleTitle = {
  color: '#111827',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 8px 0',
  lineHeight: '24px',
};

const articleExcerpt = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0 0 12px 0',
};

const articleMeta = {
  marginBottom: '8px',
};

const articleAuthor = {
  color: '#6b7280',
  fontSize: '12px',
  margin: '0',
};

const articleDate = {
  color: '#6b7280',
  fontSize: '12px',
  margin: '0',
  textAlign: 'right' as const,
};

const articleTags = {
  marginBottom: '12px',
};

const matchScore = {
  color: '#1E6F5C',
  fontSize: '11px',
  fontWeight: 'bold',
  textAlign: 'right' as const,
  margin: '0',
};

const readButton = {
  backgroundColor: '#1E6F5C',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: 'bold',
  padding: '12px 24px',
  borderRadius: '6px',
  textDecoration: 'none',
  display: 'inline-block',
};

const ctaSection = {
  backgroundColor: '#ffffff',
  padding: '32px 24px',
  textAlign: 'center' as const,
  borderTop: '1px solid #e5e7eb',
};

const ctaButton = {
  backgroundColor: '#243A5E',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  padding: '16px 32px',
  borderRadius: '8px',
  textDecoration: 'none',
  display: 'inline-block',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '32px 0',
};

const footer = {
  backgroundColor: '#ffffff',
  padding: '24px',
  textAlign: 'center' as const,
  borderRadius: '0 0 8px 8px',
};

const footerText = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '0 0 16px 0',
};

const disclaimerText = {
  color: '#9ca3af',
  fontSize: '11px',
  margin: '16px 0 0 0',
  fontStyle: 'italic' as const,
};

const footerLinks = {
  marginBottom: '16px',
};

const footerLink = {
  color: '#1E6F5C',
  fontSize: '14px',
  textDecoration: 'underline',
  margin: '0 16px',
};
