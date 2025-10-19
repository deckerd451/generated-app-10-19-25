import type { OAuthToken } from './types';
/**
 * Generates the authorization URL for the mock Google OAuth 2.0 flow.
 * This redirects to our internal mock consent page.
 */
export function getGoogleAuthUrl(): string {
  // The real callback URL that the mock consent page will redirect to.
  const realCallbackUrl = '/api/auth/google/callback';
  // The URL of our mock consent page.
  const mockConsentUrl = new URL('/auth/mock-consent/google', 'http://localhost'); // Base is placeholder
  mockConsentUrl.searchParams.set('callback_url', realCallbackUrl);
  // Return a relative path for the redirect.
  return `${mockConsentUrl.pathname}${mockConsentUrl.search}`;
}
/**
 * Handles the callback from the mock consent page for Google.
 * This simulates exchanging an authorization code for an access token.
 * @param code The authorization code (unused in this mock).
 */
export async function handleGoogleCallback(code: string): Promise<OAuthToken> {
  console.log(`Simulating token exchange for Google with code: ${code}`);
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
  return {
    accessToken: `mock_google_access_token_${crypto.randomUUID()}`,
    refreshToken: `mock_google_refresh_token_${crypto.randomUUID()}`,
    expiresIn: 3600,
    scope: 'https://www.googleapis.com/auth/calendar.readonly',
  };
}
/**
 * Generates the authorization URL for the mock LinkedIn OAuth 2.0 flow.
 * This redirects to our internal mock consent page.
 */
export function getLinkedInAuthUrl(): string {
  const realCallbackUrl = '/api/auth/linkedin/callback';
  const mockConsentUrl = new URL('/auth/mock-consent/linkedin', 'http://localhost'); // Base is placeholder
  mockConsentUrl.searchParams.set('callback_url', realCallbackUrl);
  return `${mockConsentUrl.pathname}${mockConsentUrl.search}`;
}
/**
 * Handles the callback from the mock consent page for LinkedIn.
 * This simulates exchanging an authorization code for an access token.
 * @param code The authorization code (unused in this mock).
 */
export async function handleLinkedInCallback(code: string): Promise<OAuthToken> {
  console.log(`Simulating token exchange for LinkedIn with code: ${code}`);
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
  return {
    accessToken: `mock_linkedin_access_token_${crypto.randomUUID()}`,
    refreshToken: null,
    expiresIn: 5184000, // 60 days
    scope: 'r_liteprofile r_emailaddress',
  };
}
// --- New Mock Auth Functions ---
export function getGitHubAuthUrl(): string {
  const realCallbackUrl = '/api/auth/github/callback';
  const mockConsentUrl = new URL('/auth/mock-consent/github', 'http://localhost');
  mockConsentUrl.searchParams.set('callback_url', realCallbackUrl);
  return `${mockConsentUrl.pathname}${mockConsentUrl.search}`;
}
export async function handleGitHubCallback(code: string): Promise<OAuthToken> {
  console.log(`Simulating token exchange for GitHub with code: ${code}`);
  await new Promise(resolve => setTimeout(resolve, 500));
  return {
    accessToken: `mock_github_access_token_${crypto.randomUUID()}`,
    refreshToken: `mock_github_refresh_token_${crypto.randomUUID()}`,
    expiresIn: 28800,
    scope: 'repo,read:user',
  };
}
export function getSlackAuthUrl(): string {
  const realCallbackUrl = '/api/auth/slack/callback';
  const mockConsentUrl = new URL('/auth/mock-consent/slack', 'http://localhost');
  mockConsentUrl.searchParams.set('callback_url', realCallbackUrl);
  return `${mockConsentUrl.pathname}${mockConsentUrl.search}`;
}
export async function handleSlackCallback(code: string): Promise<OAuthToken> {
  console.log(`Simulating token exchange for Slack with code: ${code}`);
  await new Promise(resolve => setTimeout(resolve, 500));
  return {
    accessToken: `mock_slack_access_token_${crypto.randomUUID()}`,
    refreshToken: null,
    expiresIn: 86400,
    scope: 'users:read,channels:read',
  };
}
export function getNotionAuthUrl(): string {
  const realCallbackUrl = '/api/auth/notion/callback';
  const mockConsentUrl = new URL('/auth/mock-consent/notion', 'http://localhost');
  mockConsentUrl.searchParams.set('callback_url', realCallbackUrl);
  return `${mockConsentUrl.pathname}${mockConsentUrl.search}`;
}
export async function handleNotionCallback(code: string): Promise<OAuthToken> {
  console.log(`Simulating token exchange for Notion with code: ${code}`);
  await new Promise(resolve => setTimeout(resolve, 500));
  return {
    accessToken: `mock_notion_access_token_${crypto.randomUUID()}`,
    refreshToken: null,
    expiresIn: 3600,
    scope: 'read_content',
  };
}
// --- Final Set of Mock Auth Functions ---
export function getMeetupAuthUrl(): string {
  const realCallbackUrl = '/api/auth/meetup/callback';
  const mockConsentUrl = new URL('/auth/mock-consent/meetup', 'http://localhost');
  mockConsentUrl.searchParams.set('callback_url', realCallbackUrl);
  return `${mockConsentUrl.pathname}${mockConsentUrl.search}`;
}
export async function handleMeetupCallback(code: string): Promise<OAuthToken> {
  console.log(`Simulating token exchange for Meetup with code: ${code}`);
  await new Promise(resolve => setTimeout(resolve, 500));
  return { accessToken: `mock_meetup_access_token_${crypto.randomUUID()}`, refreshToken: null, expiresIn: 3600, scope: 'basic' };
}
export function getDiscordAuthUrl(): string {
  const realCallbackUrl = '/api/auth/discord/callback';
  const mockConsentUrl = new URL('/auth/mock-consent/discord', 'http://localhost');
  mockConsentUrl.searchParams.set('callback_url', realCallbackUrl);
  return `${mockConsentUrl.pathname}${mockConsentUrl.search}`;
}
export async function handleDiscordCallback(code: string): Promise<OAuthToken> {
  console.log(`Simulating token exchange for Discord with code: ${code}`);
  await new Promise(resolve => setTimeout(resolve, 500));
  return { accessToken: `mock_discord_access_token_${crypto.randomUUID()}`, refreshToken: null, expiresIn: 604800, scope: 'identify' };
}
export function getEventbriteAuthUrl(): string {
  const realCallbackUrl = '/api/auth/eventbrite/callback';
  const mockConsentUrl = new URL('/auth/mock-consent/eventbrite', 'http://localhost');
  mockConsentUrl.searchParams.set('callback_url', realCallbackUrl);
  return `${mockConsentUrl.pathname}${mockConsentUrl.search}`;
}
export async function handleEventbriteCallback(code: string): Promise<OAuthToken> {
  console.log(`Simulating token exchange for Eventbrite with code: ${code}`);
  await new Promise(resolve => setTimeout(resolve, 500));
  return { accessToken: `mock_eventbrite_access_token_${crypto.randomUUID()}`, refreshToken: null, expiresIn: 7200, scope: 'events_read' };
}
export function getCrunchbaseAuthUrl(): string {
  const realCallbackUrl = '/api/auth/crunchbase/callback';
  const mockConsentUrl = new URL('/auth/mock-consent/crunchbase', 'http://localhost');
  mockConsentUrl.searchParams.set('callback_url', realCallbackUrl);
  return `${mockConsentUrl.pathname}${mockConsentUrl.search}`;
}
export async function handleCrunchbaseCallback(code: string): Promise<OAuthToken> {
  console.log(`Simulating token exchange for Crunchbase with code: ${code}`);
  await new Promise(resolve => setTimeout(resolve, 500));
  return { accessToken: `mock_crunchbase_access_token_${crypto.randomUUID()}`, refreshToken: null, expiresIn: 86400, scope: 'organization.read' };
}
export function getTwitterAuthUrl(): string {
  const realCallbackUrl = '/api/auth/twitter/callback';
  const mockConsentUrl = new URL('/auth/mock-consent/twitter', 'http://localhost');
  mockConsentUrl.searchParams.set('callback_url', realCallbackUrl);
  return `${mockConsentUrl.pathname}${mockConsentUrl.search}`;
}
export async function handleTwitterCallback(code: string): Promise<OAuthToken> {
  console.log(`Simulating token exchange for Twitter with code: ${code}`);
  await new Promise(resolve => setTimeout(resolve, 500));
  return { accessToken: `mock_twitter_access_token_${crypto.randomUUID()}`, refreshToken: null, expiresIn: 7200, scope: 'tweet.read users.read' };
}