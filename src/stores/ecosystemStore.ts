import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { Contact, KismetEvent, Community, Organization, Skill, Project, KnowledgeItem, Relationship } from '@/types/ecosystem';
interface EcosystemState {
  contacts: Contact[];
  events: KismetEvent[];
  communities: Community[];
  organizations: Organization[];
  skills: Skill[];
  projects: Project[];
  knowledge: KnowledgeItem[];
  relationships: Relationship[];
  googleCalendarConnected: boolean;
  linkedInConnected: boolean;
  githubConnected: boolean;
  slackConnected: boolean;
  notionConnected: boolean;
  meetupConnected: boolean;
  discordConnected: boolean;
  eventbriteConnected: boolean;
  crunchbaseConnected: boolean;
  twitterConnected: boolean;
  addContact: (name: string, email?: string) => void;
  importEcosystem: (data: {
    contacts?: {name: string;email?: string;}[];
    events?: {name: string;}[];
    communities?: {name: string;}[];
    organizations?: {name: string;}[];
    skills?: {name: string;}[];
    projects?: {name: string;}[];
    knowledge?: {name: string;url?: string;}[];
  }) => {importedCounts: Record<string, number>; importedTypes: string[]};
  removeContact: (id: string) => void;
  addEvent: (name: string) => void;
  removeEvent: (id: string) => void;
  addCommunity: (name: string) => void;
  removeCommunity: (id: string) => void;
  addOrganization: (name: string) => void;
  removeOrganization: (id: string) => void;
  addSkill: (name: string) => void;
  removeSkill: (id: string) => void;
  addProject: (name: string) => void;
  removeProject: (id: string) => void;
  addKnowledgeItem: (name: string, url?: string) => void;
  removeKnowledgeItem: (id: string) => void;
  addRelationship: (relationship: Omit<Relationship, 'id'>) => void;
  removeRelationship: (id: string) => void;
  connectGoogleCalendar: () => void;
  disconnectGoogleCalendar: () => void;
  connectLinkedIn: () => void;
  disconnectLinkedIn: () => void;
  connectGithub: () => void;
  disconnectGithub: () => void;
  connectSlack: () => void;
  disconnectSlack: () => void;
  connectNotion: () => void;
  disconnectNotion: () => void;
  connectMeetup: () => void;
  disconnectMeetup: () => void;
  connectDiscord: () => void;
  disconnectDiscord: () => void;
  connectEventbrite: () => void;
  disconnectEventbrite: () => void;
  connectCrunchbase: () => void;
  disconnectCrunchbase: () => void;
  connectTwitter: () => void;
  disconnectTwitter: () => void;
  clear: () => void;
}
const initialState = {
  contacts: [],
  events: [],
  communities: [],
  organizations: [],
  skills: [],
  projects: [],
  knowledge: [],
  relationships: [],
  googleCalendarConnected: false,
  linkedInConnected: false,
  githubConnected: false,
  slackConnected: false,
  notionConnected: false,
  meetupConnected: false,
  discordConnected: false,
  eventbriteConnected: false,
  crunchbaseConnected: false,
  twitterConnected: false
};
export const useEcosystemStore = create<EcosystemState>()(
  persist(
    (set, get) => ({
      ...initialState,
      importEcosystem: (data) => {
        const importedCounts: Record<string, number> = {
          contacts: 0, events: 0, communities: 0, organizations: 0, skills: 0, projects: 0, knowledge: 0
        };
        const currentState = get();
        const newState = { ...currentState };
        // Contacts
        const existingContactNames = new Set(currentState.contacts.map((c) => c.name.toLowerCase()));
        const newContacts: Contact[] = [];
        (data.contacts || []).forEach((item) => {
          if (!existingContactNames.has(item.name.toLowerCase())) {
            newContacts.push({ id: uuidv4(), name: item.name, email: item.email });
            importedCounts.contacts++;
          }
        });
        newState.contacts = [...currentState.contacts, ...newContacts];
        // Generic merger for simple name-based items
        const merge = <T extends {id: string;name: string;},>(
        currentStateItems: T[],
        importedItems: {name: string;}[] | undefined,
        key: keyof typeof importedCounts)
        : T[] => {
          if (!importedItems) return currentStateItems;
          const existingNames = new Set(currentStateItems.map((i) => i.name.toLowerCase()));
          const newItems: T[] = [];
          importedItems.forEach((item) => {
            if (!existingNames.has(item.name.toLowerCase())) {
              newItems.push({ ...item, id: uuidv4() } as T);
              importedCounts[key]++;
            }
          });
          return [...currentStateItems, ...newItems];
        };
        newState.events = merge(currentState.events, data.events, 'events');
        newState.communities = merge(currentState.communities, data.communities, 'communities');
        newState.organizations = merge(currentState.organizations, data.organizations, 'organizations');
        newState.skills = merge(currentState.skills, data.skills, 'skills');
        newState.projects = merge(currentState.projects, data.projects, 'projects');
        // Knowledge (has URL)
        const existingKnowledgeNames = new Set(currentState.knowledge.map((k) => k.name.toLowerCase()));
        const newKnowledgeItems: KnowledgeItem[] = [];
        (data.knowledge || []).forEach((item) => {
          if (!existingKnowledgeNames.has(item.name.toLowerCase())) {
            newKnowledgeItems.push({ ...item, id: uuidv4() });
            importedCounts.knowledge++;
          }
        });
        newState.knowledge = [...currentState.knowledge, ...newKnowledgeItems];
        set(newState);
        const importedTypes = Object.entries(importedCounts)
          .filter(([, count]) => count > 0)
          .map(([type]) => type);
        return { importedCounts, importedTypes };
      },
      addContact: (name, email) => set((state) => ({ contacts: [...state.contacts, { id: uuidv4(), name, email }] })),
      removeContact: (id) => set((state) => ({ contacts: state.contacts.filter((c) => c.id !== id) })),
      addEvent: (name) => set((state) => ({ events: [...state.events, { id: uuidv4(), name }] })),
      removeEvent: (id) => set((state) => ({ events: state.events.filter((e) => e.id !== id) })),
      addCommunity: (name) => set((state) => ({ communities: [...state.communities, { id: uuidv4(), name }] })),
      removeCommunity: (id) => set((state) => ({ communities: state.communities.filter((c) => c.id !== id) })),
      addOrganization: (name) => set((state) => ({ organizations: [...state.organizations, { id: uuidv4(), name }] })),
      removeOrganization: (id) => set((state) => ({ organizations: state.organizations.filter((o) => o.id !== id) })),
      addSkill: (name) => set((state) => ({ skills: [...state.skills, { id: uuidv4(), name }] })),
      removeSkill: (id) => set((state) => ({ skills: state.skills.filter((s) => s.id !== id) })),
      addProject: (name) => set((state) => ({ projects: [...state.projects, { id: uuidv4(), name }] })),
      removeProject: (id) => set((state) => ({ projects: state.projects.filter((p) => p.id !== id) })),
      addKnowledgeItem: (name, url) => set((state) => ({ knowledge: [...state.knowledge, { id: uuidv4(), name, url }] })),
      removeKnowledgeItem: (id) => set((state) => ({ knowledge: state.knowledge.filter((k) => k.id !== id) })),
      addRelationship: (relationship) => set((state) => ({ relationships: [...state.relationships, { ...relationship, id: uuidv4() }] })),
      removeRelationship: (id) => set((state) => ({ relationships: state.relationships.filter((r) => r.id !== id) })),
      connectGoogleCalendar: () => set({ googleCalendarConnected: true }),
      disconnectGoogleCalendar: () => set({ googleCalendarConnected: false }),
      connectLinkedIn: () => set({ linkedInConnected: true }),
      disconnectLinkedIn: () => set({ linkedInConnected: false }),
      connectGithub: () => set({ githubConnected: true }),
      disconnectGithub: () => set({ githubConnected: false }),
      connectSlack: () => set({ slackConnected: true }),
      disconnectSlack: () => set({ slackConnected: false }),
      connectNotion: () => set({ notionConnected: true }),
      disconnectNotion: () => set({ notionConnected: false }),
      connectMeetup: () => set({ meetupConnected: true }),
      disconnectMeetup: () => set({ meetupConnected: false }),
      connectDiscord: () => set({ discordConnected: true }),
      disconnectDiscord: () => set({ discordConnected: false }),
      connectEventbrite: () => set({ eventbriteConnected: true }),
      disconnectEventbrite: () => set({ eventbriteConnected: false }),
      connectCrunchbase: () => set({ crunchbaseConnected: true }),
      disconnectCrunchbase: () => set({ crunchbaseConnected: false }),
      connectTwitter: () => set({ twitterConnected: true }),
      disconnectTwitter: () => set({ twitterConnected: false }),
      clear: () => set(initialState)
    }),
    {
      name: 'cynq-ecosystem-storage'
    }
  )
);