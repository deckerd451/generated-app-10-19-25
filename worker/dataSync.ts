import type { GoogleCalendarEvent, LinkedInContact, GitHubRepo, SlackChannel, NotionPage } from './types';
/**
 * Simulates fetching recent events from the Google Calendar API.
 * In a real implementation, this would use an OAuth token to make a real API call.
 * @returns A promise that resolves to an array of mock calendar events.
 */
export async function fetchGoogleCalendarEvents(): Promise<GoogleCalendarEvent[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  return [
    {
      id: 'gcal-event-1',
      summary: 'AI Tech Summit 2024',
      start: { dateTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString() },
    },
    {
      id: 'gcal-event-2',
      summary: 'Quarterly Strategy Meeting',
      start: { dateTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString() },
    },
    {
      id: 'gcal-event-3',
      summary: 'Networking Mixer @ TechHub',
      start: { dateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() },
    },
  ];
}
/**
 * Simulates fetching recent connections from the LinkedIn API.
 * In a real implementation, this would use an OAuth token to make a real API call.
 * @returns A promise that resolves to an array of mock LinkedIn contacts.
 */
export async function fetchLinkedInContacts(): Promise<LinkedInContact[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  return [
    {
      id: 'li-contact-1',
      name: 'Jane Doe',
      headline: 'Lead AI Researcher at InnovateCorp',
    },
    {
      id: 'li-contact-2',
      name: 'John Smith',
      headline: 'Venture Partner at Future Ventures',
    },
    {
      id: 'li-contact-3',
      name: 'Sam Wilson',
      headline: 'Founder & CEO at ConnectSphere',
    },
  ];
}
/**
 * Simulates fetching repositories from the GitHub API.
 */
export async function fetchGitHubRepos(): Promise<GitHubRepo[]> {
  await new Promise(resolve => setTimeout(resolve, 1200));
  return [
    { id: 'gh-repo-1', name: 'dex-aei-frontend', description: 'The main user interface for the Dex AEI application.' },
    { id: 'gh-repo-2', name: 'ecosystem-data-importer', description: 'Service for ingesting and normalizing data from various sources.' },
    { id: 'gh-repo-3', name: 'ai-insights-engine', description: 'Core machine learning models for generating predictive insights.' },
  ];
}
/**
 * Simulates fetching channels from the Slack API.
 */
export async function fetchSlackChannels(): Promise<SlackChannel[]> {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return [
    { id: 'sl-chan-1', name: '#general', topic: 'Company-wide announcements and updates.' },
    { id: 'sl-chan-2', name: '#ai-research', topic: 'Discussions on the latest in AI/ML.' },
    { id: 'sl-chan-3', name: '#product-feedback', topic: 'User feedback and feature requests.' },
  ];
}
/**
 * Simulates fetching pages from the Notion API.
 */
export async function fetchNotionPages(): Promise<NotionPage[]> {
  await new Promise(resolve => setTimeout(resolve, 1400));
  return [
    { id: 'nt-page-1', title: '2024 Product Roadmap', url: 'https://www.notion.so/mock/2024-product-roadmap' },
    { id: 'nt-page-2', title: 'Competitive Analysis Q3', url: 'https://www.notion.so/mock/competitive-analysis-q3' },
    { id: 'nt-page-3', title: 'User Interview Notes', url: 'https://www.notion.so/mock/user-interview-notes' },
  ];
}