import React from 'react';
import { useUserProfileStore } from '@/stores/userProfileStore';
import { useEcosystemStore } from '@/stores/ecosystemStore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Target, Sparkles, Users, Calendar, Building, BrainCircuit, GitBranch, Library, Link as LinkIcon, Mail } from 'lucide-react';
import type { NodeType, Contact, Goal } from '@/types/ecosystem';
interface EcosystemNodeDetailProps {
  nodeType: NodeType;
}
const DetailSection: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; isEmpty?: boolean }> = ({ title, icon, children, isEmpty }) => (
  <div>
    <h4 className="font-semibold text-sm mb-2 flex items-center gap-2 text-muted-foreground">
      {icon}
      {title}
    </h4>
    {isEmpty ? (
      <p className="text-xs text-muted-foreground/80 italic">No data provided yet.</p>
    ) : (
      <div className="text-sm text-foreground">{children}</div>
    )}
  </div>
);
export const EcosystemNodeDetail: React.FC<EcosystemNodeDetailProps> = ({ nodeType }) => {
  const { goals, interests, background } = useUserProfileStore();
  const { contacts, events, communities, organizations, skills, projects, knowledge } = useEcosystemStore();
  const renderContent = () => {
    switch (nodeType) {
      case 'you':
        return (
          <div className="space-y-4">
            <DetailSection title="Goals" icon={<Target className="w-4 h-4" />} isEmpty={!goals || goals.length === 0}>
              <ul className="space-y-1 list-disc pl-4">
                {goals.map(goal => (
                  <li key={goal.id} className="text-xs">{goal.text}</li>
                ))}
              </ul>
            </DetailSection>
            <DetailSection title="Interests" icon={<Sparkles className="w-4 h-4" />} isEmpty={!interests || interests.length === 0}>
              <div className="flex flex-wrap gap-1">
                {interests.map(interest => (
                  <Badge key={interest} variant="secondary">{interest}</Badge>
                ))}
              </div>
            </DetailSection>
            <DetailSection title="Background" icon={<Briefcase className="w-4 h-4" />} isEmpty={!background}>
              <p className="text-xs whitespace-pre-wrap">{background}</p>
            </DetailSection>
          </div>
        );
      case 'knowledge': {
        return (
          <DetailSection title="Key Knowledge" icon={<Library className="w-4 h-4" />} isEmpty={knowledge.length === 0}>
            <div className="space-y-2">
              {knowledge.map(item => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <span className="truncate">{item.name}</span>
                  {item.url && (
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="ml-2 text-primary hover:underline flex-shrink-0">
                      <LinkIcon className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </DetailSection>
        );
      }
      case 'contacts': {
        return (
          <DetailSection title="Key Contacts" icon={<Users className="w-4 h-4" />} isEmpty={contacts.length === 0}>
            <div className="space-y-2">
              {contacts.map((contact: Contact) => (
                <div key={contact.id} className="flex flex-col text-sm">
                  <span className="font-medium truncate">{contact.name}</span>
                  {contact.email && (
                    <a href={`mailto:${contact.email}`} className="flex items-center gap-1 text-xs text-primary hover:underline truncate">
                      <Mail className="w-3 h-3" />
                      <span className="truncate">{contact.email}</span>
                    </a>
                  )}
                </div>
              ))}
            </div>
          </DetailSection>
        );
      }
      case 'events':
      case 'communities':
      case 'organizations':
      case 'skills':
      case 'projects': {
        const dataMap = {
          events: { items: events, icon: <Calendar className="w-4 h-4" /> },
          communities: { items: communities, icon: <Building className="w-4 h-4" /> },
          organizations: { items: organizations, icon: <Briefcase className="w-4 h-4" /> },
          skills: { items: skills, icon: <BrainCircuit className="w-4 h-4" /> },
          projects: { items: projects, icon: <GitBranch className="w-4 h-4" /> },
        };
        const { items, icon } = dataMap[nodeType as keyof typeof dataMap];
        return (
          <DetailSection title={`Key ${nodeType}`} icon={icon} isEmpty={items.length === 0}>
            <div className="flex flex-wrap gap-1">
              {items.map(item => (
                <Badge key={item.id} variant="secondary">{item.name}</Badge>
              ))}
            </div>
          </DetailSection>
        );
      }
      default:
        return <p>No details available.</p>;
    }
  };
  return (
    <div className="p-1">
      <ScrollArea className="max-h-64 w-64">
        <div className="p-3">
          {renderContent()}
        </div>
      </ScrollArea>
    </div>
  );
};