import React, { useState, useMemo, useEffect } from 'react';
import { useEcosystemStore } from '@/stores/ecosystemStore';
import { useUserProfileStore } from '@/stores/userProfileStore';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Link, X, Users, Calendar, Building, Target, Sparkles, BookOpen, Briefcase, BrainCircuit, GitBranch, Library } from 'lucide-react';
import type { EcosystemDataItem, CommunityResource, Relationship, Contact, Goal } from '@/types/ecosystem';
import { communityService } from '@/lib/communityService';
const iconMap: { [key: string]: React.ReactNode } = {
  goal: <Target className="w-4 h-4" />,
  interest: <Sparkles className="w-4 h-4" />,
  contact: <Users className="w-4 h-4" />,
  event: <Calendar className="w-4 h-4" />,
  community: <Building className="w-4 h-4" />,
  communityResource: <BookOpen className="w-4 h-4" />,
  organization: <Briefcase className="w-4 h-4" />,
  skill: <BrainCircuit className="w-4 h-4" />,
  project: <GitBranch className="w-4 h-4" />,
  knowledge: <Library className="w-4 h-4" />,
};
interface EcosystemRelationshipManagerProps {
  preselectedSource?: EcosystemDataItem;
}
export const EcosystemRelationshipManager: React.FC<EcosystemRelationshipManagerProps> = ({ preselectedSource }) => {
  const { contacts, events, communities, organizations, skills, projects, knowledge, relationships, addRelationship, removeRelationship } = useEcosystemStore();
  const { goals, interests } = useUserProfileStore();
  const [communityResources, setCommunityResources] = useState<CommunityResource[]>([]);
  const [source, setSource] = useState<string | null>(preselectedSource?.id || null);
  const [target, setTarget] = useState<string | null>(null);
  useEffect(() => {
    const fetchResources = async () => {
      const res = await communityService.getResources();
      if (res.success && res.data) {
        setCommunityResources(res.data);
      }
    };
    fetchResources();
  }, []);
  const allDataItems: EcosystemDataItem[] = useMemo(() => {
    const parseInterests = (interestsArray: string[]): EcosystemDataItem[] => {
      if (!Array.isArray(interestsArray)) return []; // Defensive check
      return interestsArray.map((interest, index) => ({ id: `interest-${index}`, name: interest, type: 'interest' }));
    };
    return [
      ...goals.map((g: Goal) => ({ id: g.id, name: g.text, type: 'goal' as const })),
      ...parseInterests(interests),
      ...contacts.map((c: Contact) => ({ id: c.id, name: c.name, type: 'contact' as const })),
      ...events.map(e => ({ id: e.id, name: e.name, type: 'event' as const })),
      ...communities.map(c => ({ id: c.id, name: c.name, type: 'community' as const })),
      ...organizations.map(o => ({ id: o.id, name: o.name, type: 'organization' as const })),
      ...skills.map(s => ({ id: s.id, name: s.name, type: 'skill' as const })),
      ...projects.map(p => ({ id: p.id, name: p.name, type: 'project' as const })),
      ...knowledge.map(k => ({ id: k.id, name: k.name, type: 'knowledge' as const })),
      ...communityResources.map(r => ({ id: r.id, name: r.title, type: 'communityResource' as const })),
    ];
  }, [goals, interests, contacts, events, communities, organizations, skills, projects, knowledge, communityResources]);
  const groupedDataItems = useMemo(() => {
    const groups: { [key: string]: EcosystemDataItem[] } = {
      Goals: [], Interests: [], Contacts: [], Events: [], Communities: [], Organizations: [], Skills: [], Projects: [], Knowledge: [], 'Community Resources': [],
    };
    allDataItems.forEach(item => {
      if (item.type === 'goal') groups.Goals.push(item);
      else if (item.type === 'interest') groups.Interests.push(item);
      else if (item.type === 'contact') groups.Contacts.push(item);
      else if (item.type === 'event') groups.Events.push(item);
      else if (item.type === 'community') groups.Communities.push(item);
      else if (item.type === 'organization') groups.Organizations.push(item);
      else if (item.type === 'skill') groups.Skills.push(item);
      else if (item.type === 'project') groups.Projects.push(item);
      else if (item.type === 'knowledge') groups.Knowledge.push(item);
      else if (item.type === 'communityResource') groups['Community Resources'].push(item);
    });
    return Object.entries(groups)
      .filter(([, items]) => items.length > 0)
      .map(([label, options]) => ({
        label,
        options: options.map(opt => ({ value: opt.id, label: opt.name, icon: iconMap[opt.type] }))
      }));
  }, [allDataItems]);
  const handleAddRelationship = () => {
    if (!source || !target) {
      toast.error("Please select a source and a target.");
      return;
    }
    if (source === target) {
      toast.info("Cannot link an item to itself.");
      return;
    }
    const sourceItem = allDataItems.find(item => item.id === source);
    const targetItem = allDataItems.find(item => item.id === target);
    if (!sourceItem || !targetItem) return;
    const existingRelationship = relationships.find(r =>
      (r.sourceId === source && r.targetId === target) || (r.sourceId === target && r.targetId === source)
    );
    if (existingRelationship) {
      toast.info("This relationship already exists.");
    } else {
      addRelationship({
        sourceId: sourceItem.id,
        sourceType: sourceItem.type,
        targetId: targetItem.id,
        targetType: targetItem.type,
      });
      toast.success(`Linked '${sourceItem.name}' and '${targetItem.name}'.`);
    }
    if (!preselectedSource) {
      setSource(null);
    }
    setTarget(null);
  };
  const handleRemoveRelationship = (rel: Relationship) => {
    removeRelationship(rel.id);
    const sourceName = allDataItems.find(i => i.id === rel.sourceId)?.name || 'Item';
    const targetName = allDataItems.find(i => i.id === rel.targetId)?.name || 'Item';
    toast.info(`Unlinked '${sourceName}' and '${targetName}'.`);
  };
  const renderSelectItems = (disabledId: string | null = null) => {
    return groupedDataItems.map((group) => (
      <SelectGroup key={group.label}>
        <SelectLabel>{group.label}</SelectLabel>
        {group.options.map(item => (
          <SelectItem key={item.value} value={item.value} disabled={item.value === disabledId}>
            <div className="flex items-center gap-2">
              {item.icon}
              <span className="truncate">{item.label}</span>
            </div>
          </SelectItem>
        ))}
      </SelectGroup>
    ));
  };
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-2">Create New Link</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <Select value={source || ''} onValueChange={setSource} disabled={!!preselectedSource}>
            <SelectTrigger><SelectValue placeholder="Select source..." /></SelectTrigger>
            <SelectContent>{renderSelectItems(target)}</SelectContent>
          </Select>
          <Select value={target || ''} onValueChange={setTarget}>
            <SelectTrigger><SelectValue placeholder="Select target..." /></SelectTrigger>
            <SelectContent>{renderSelectItems(source)}</SelectContent>
          </Select>
        </div>
        <Button onClick={handleAddRelationship} className="w-full mt-4">
          <Link className="w-4 h-4 mr-2" />
          Create Link
        </Button>
      </div>
      <Separator />
      <div>
        <h3 className="font-semibold mb-2">Existing Links</h3>
        <ScrollArea className="h-48">
          <div className="space-y-2 pr-4">
            {relationships.length > 0 ? relationships.map(rel => {
              const sourceItem = allDataItems.find(i => i.id === rel.sourceId);
              const targetItem = allDataItems.find(i => i.id === rel.targetId);
              if (!sourceItem || !targetItem) return null;
              return (
                <div key={rel.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50 text-sm">
                  <div className="flex items-center gap-2 truncate">
                    <div className="flex items-center gap-1 truncate">
                      {iconMap[sourceItem.type]}
                      <span className="truncate">{sourceItem.name}</span>
                    </div>
                    <Link className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                    <div className="flex items-center gap-1 truncate">
                      {iconMap[targetItem.type]}
                      <span className="truncate">{targetItem.name}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => handleRemoveRelationship(rel)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              );
            }) : (
              <p className="text-sm text-muted-foreground text-center pt-8">No links created yet.</p>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};