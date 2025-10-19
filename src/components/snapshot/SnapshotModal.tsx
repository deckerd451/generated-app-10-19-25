import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { useUserProfileStore } from '@/stores/userProfileStore';
import { useEcosystemStore } from '@/stores/ecosystemStore';
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import type { Contact } from '@/types/ecosystem';
export const SnapshotModal: React.FC = () => {
  const { goals, interests, background } = useUserProfileStore();
  const { contacts, events, communities, organizations, skills, projects, knowledge } = useEcosystemStore();
  const snapshotData = {
    profile: {
      goals,
      interests: interests ?? [],
      background,
    },
    ecosystem: {
      // Intentionally omitting emails from contacts for privacy
      contacts: (contacts ?? []).map((c: Contact) => c.name),
      events: (events ?? []).map(e => e.name),
      communities: (communities ?? []).map(c => c.name),
      organizations: (organizations ?? []).map(o => o.name),
      skills: (skills ?? []).map(s => s.name),
      projects: (projects ?? []).map(p => p.name),
      knowledge: (knowledge ?? []).map(k => ({ name: k.name, url: k.url })),
    },
    generatedAt: new Date().toISOString(),
  };
  const jsonString = JSON.stringify(snapshotData);
  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-2xl font-display text-center">CYNQ Snapshot</DialogTitle>
        <DialogDescription className="text-center">
          Scan this QR code to share a snapshot of your ecosystem.
        </DialogDescription>
      </DialogHeader>
      <div className="flex flex-col md:flex-row items-center gap-6 py-4">
        <div className="p-4 bg-white rounded-lg shadow-md">
          <QRCodeCanvas value={jsonString} size={200} level="M" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold mb-2">Data included in this snapshot:</h3>
          <ScrollArea className="h-48 pr-4">
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><Badge variant="secondary">{(snapshotData.profile.interests ?? []).length}</Badge> Interests</div>
              <div className="flex items-center gap-2"><Badge variant="secondary">{(snapshotData.ecosystem.contacts ?? []).length}</Badge> Contacts (names only)</div>
              <div className="flex items-center gap-2"><Badge variant="secondary">{(snapshotData.ecosystem.events ?? []).length}</Badge> Events</div>
              <div className="flex items-center gap-2"><Badge variant="secondary">{(snapshotData.ecosystem.communities ?? []).length}</Badge> Communities</div>
              <div className="flex items-center gap-2"><Badge variant="secondary">{(snapshotData.ecosystem.organizations ?? []).length}</Badge> Organizations</div>
              <div className="flex items-center gap-2"><Badge variant="secondary">{(snapshotData.ecosystem.skills ?? []).length}</Badge> Skills</div>
              <div className="flex items-center gap-2"><Badge variant="secondary">{(snapshotData.ecosystem.projects ?? []).length}</Badge> Projects</div>
              <div className="flex items-center gap-2"><Badge variant="secondary">{(snapshotData.ecosystem.knowledge ?? []).length}</Badge> Knowledge Items</div>
              <p className="text-xs italic pt-2">Your goals, background, and contact emails are kept private and are not included.</p>
            </div>
          </ScrollArea>
        </div>
      </div>
    </>
  );
};