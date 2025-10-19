import React, { useMemo, useState, useEffect } from 'react';
import { motion, Variants } from 'framer-motion';
import { Lightbulb, Users, Zap, Calendar, Building, Plus, Link as LinkIcon, BookOpen, CheckSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useEcosystemStore } from '@/stores/ecosystemStore';
import { useUserProfileStore } from '@/stores/userProfileStore';
import { toast } from 'sonner';
import type { EcosystemInsight, CommunityResource } from '../../../worker/types';
import type { EcosystemDataItem, Contact, Relationship, Goal } from '@/types/ecosystem';
import { communityService } from '@/lib/communityService';
import { ErrorDisplay } from '@/components/ui/ErrorDisplay';
const iconMap: { [key: string]: React.ReactNode } = {
  connections: <Users className="w-5 h-5" />,
  events: <Calendar className="w-5 h-5" />,
  communities: <Building className="w-5 h-5" />,
  opportunities: <Zap className="w-5 h-5" />,
  learning: <CheckSquare className="w-5 h-5" />,
  default: <Lightbulb className="w-5 h-5" />,
};
interface EcosystemInsightsProps {
  insights: EcosystemInsight[];
  isLoading: boolean;
  error: string | null;
}
export const EcosystemInsights: React.FC<EcosystemInsightsProps> = ({ insights, isLoading, error }) => {
  const { addContact, addEvent, addCommunity, addRelationship, relationships, contacts, events, communities } = useEcosystemStore();
  const userProfile = useUserProfileStore();
  const [communityResources, setCommunityResources] = useState<CommunityResource[]>([]);
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
    return [
      ...(userProfile.goals || []).map((goal: Goal) => ({ id: goal.id, name: goal.text, type: 'goal' as const })),
      ...(userProfile.interests || []).map((interest, index) => ({ id: `interest-${index}`, name: interest, type: 'interest' as const })),
      ...contacts.map((c: Contact) => ({ id: c.id, name: c.name, type: 'contact' as const })),
      ...events.map(e => ({ id: e.id, name: e.name, type: 'event' as const })),
      ...communities.map(c => ({ id: c.id, name: c.name, type: 'community' as const })),
    ];
  }, [userProfile.goals, userProfile.interests, contacts, events, communities]);
  const handleAction = (insight: EcosystemInsight) => {
    const { actionableType, suggestedName, suggestedRelationship, suggestedResourceId } = insight;
    if (!actionableType) return;
    switch (actionableType) {
      case 'contact':
        if (suggestedName) {
          addContact(suggestedName);
          toast.success(`'${suggestedName}' added to your contacts.`);
        }
        break;
      case 'event':
        if (suggestedName) {
          addEvent(suggestedName);
          toast.success(`'${suggestedName}' added to your events.`);
        }
        break;
      case 'community':
        if (suggestedName) {
          addCommunity(suggestedName);
          toast.success(`'${suggestedName}' added to your communities.`);
        }
        break;
      case 'relationship':
        if (suggestedRelationship) {
          const { sourceId, targetId } = suggestedRelationship;
          const alreadyExists = relationships.some(
            (r: Relationship) => (r.sourceId === sourceId && r.targetId === targetId) || (r.sourceId === targetId && r.targetId === sourceId)
          );
          if (alreadyExists) {
            toast.info("This relationship already exists.");
            return;
          }
          addRelationship(suggestedRelationship);
          const sourceName = allDataItems.find(i => i.id === suggestedRelationship.sourceId)?.name || 'Item';
          const targetName = allDataItems.find(i => i.id === suggestedRelationship.targetId)?.name || 'Item';
          toast.success(`Linked '${sourceName}' and '${targetName}'.`);
        }
        break;
      case 'communityResource':
        if (suggestedResourceId) {
          const resource = communityResources.find(r => r.id === suggestedResourceId);
          if (resource) {
            toast.info(resource.title, {
              description: resource.description,
            });
          }
        }
        break;
      case 'learningPath':
        // No direct action, information is displayed in the card.
        break;
    }
  };
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 100,
      },
    },
  };
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-start space-x-4 p-4 rounded-lg bg-muted/50">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      );
    }
    if (error) {
      return (
        <ErrorDisplay
          variant="inline"
          title="Could not load insights"
          message={error}
        />
      );
    }
    if (!insights || insights.length === 0) {
      return null; // Don't render the section if there are no insights
    }
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-3"
      >
        {insights.map((insight, index) => (
          <motion.div key={index} variants={itemVariants}>
            <div className="bg-muted/50 border-dashed border rounded-lg hover:border-solid hover:border-primary/50 transition-all duration-200 p-4">
              <div className="flex flex-row items-start gap-4 space-y-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  {iconMap[insight.icon] || iconMap.default}
                </div>
                <div className="flex-1">
                  <p className="text-base font-semibold">{insight.title}</p>
                  <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
                </div>
              </div>
              {insight.actionableType === 'learningPath' && insight.suggestedPath && (
                <div className="mt-4 pl-12">
                  <h4 className="text-sm font-semibold mb-2">{insight.suggestedPath.title}</h4>
                  <ul className="space-y-2">
                    {insight.suggestedPath.steps.map((step, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckSquare className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {insight.actionableType && insight.actionableType !== 'learningPath' && (
                <div className="flex justify-end mt-3">
                  {insight.actionableType === 'relationship' ? (
                    <Button size="sm" variant="outline" onClick={() => handleAction(insight)}>
                      <LinkIcon className="w-4 h-4 mr-2" />
                      Create Link
                    </Button>
                  ) : insight.actionableType === 'communityResource' ? (
                    <Button size="sm" variant="outline" onClick={() => handleAction(insight)}>
                      <BookOpen className="w-4 h-4 mr-2" />
                      View Resource
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => handleAction(insight)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add to Ecosystem
                    </Button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>
    );
  };
  return (
    <Card>
      <CardHeader>
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-accent" />
          AI Insights
        </h3>
        <p className="text-muted-foreground text-sm !mt-2">
          Actionable suggestions from CYNQ based on your ecosystem.
        </p>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
};