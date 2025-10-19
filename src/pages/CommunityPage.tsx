import React, { useEffect, useState, useCallback } from 'react';
import { motion, Variants } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { communityService } from '@/lib/communityService';
import type { CommunityResource, AnonymizedInsight } from '../../worker/types';
import { Users, Lightbulb, BookOpen, Wrench, UserCircle, Link as LinkIcon, PlusCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { EcosystemRelationshipManager } from '@/components/ecosystem/EcosystemRelationshipManager';
import { ContributeInsightForm } from '@/components/community/ContributeInsightForm';
const resourceIconMap: { [key: string]: React.ReactNode } = {
  article: <BookOpen className="w-5 h-5" />,
  tool: <Wrench className="w-5 h-5" />,
  contact: <UserCircle className="w-5 h-5" />,
};
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};
export function CommunityPage() {
  const [resources, setResources] = useState<CommunityResource[]>([]);
  const [insights, setInsights] = useState<AnonymizedInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const [resourcesRes, insightsRes] = await Promise.all([
      communityService.getResources(),
      communityService.getInsights(),
    ]);
    if (resourcesRes.success && resourcesRes.data) {
      setResources(resourcesRes.data);
    }
    if (insightsRes.success && insightsRes.data) {
      setInsights(insightsRes.data);
    }
    setIsLoading(false);
  }, []);
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex-1 p-6 sm:p-8 lg:p-10"
    >
      <ScrollArea className="h-full pr-4">
        <div className="flex-shrink-0 mb-6">
          <h1 className="text-3xl font-display flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" />
            Community Intelligence
          </h1>
          <p className="text-lg text-muted-foreground mt-1">
            Leverage and contribute to shared knowledge from the CYNQ community.
          </p>
        </div>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <motion.div variants={itemVariants} className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-accent" />
                  Shared Resources
                </CardTitle>
                <CardDescription>
                  Helpful articles, tools, and contacts shared within the community.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
                  </div>
                ) : resources.length > 0 ? (
                  <div className="space-y-4">
                    {resources.map((resource) => (
                      <div key={resource.id}>
                        <div className="p-4 rounded-lg border border-dashed bg-muted/50">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-primary">{resourceIconMap[resource.type]}</span>
                            <h3 className="font-semibold">{resource.title}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{resource.description}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex flex-wrap gap-2">
                              {resource.tags.map((tag) => (
                                <Badge key={tag} variant="secondary">{tag}</Badge>
                              ))}
                            </div>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <LinkIcon className="w-3 h-3 mr-2" />
                                  Link to Ecosystem
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[625px]">
                                <DialogHeader>
                                  <DialogTitle>Link Community Resource</DialogTitle>
                                  <DialogDescription>
                                    Connect '{resource.title}' to an item in your personal ecosystem.
                                  </DialogDescription>
                                </DialogHeader>
                                <EcosystemRelationshipManager preselectedSource={{ id: resource.id, name: resource.title, type: 'communityResource' }} />
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">No community resources have been shared yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={itemVariants} className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PlusCircle className="w-6 h-6 text-accent" />
                  Contribute an Insight
                </CardTitle>
                <CardDescription>
                  Share an anonymized piece of knowledge with the community.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ContributeInsightForm onSuccess={fetchData} />
              </CardContent>
            </Card>
            <Card className="flex-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-6 h-6 text-accent" />
                  Anonymized Insights
                </CardTitle>
                <CardDescription>
                  Trends and patterns identified from the community to help guide you.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
                  </div>
                ) : insights.length > 0 ? (
                  <ul className="space-y-3">
                    {insights.map((insight) => (
                      <li key={insight.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <Lightbulb className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                        <p className="text-sm">{insight.text}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">No community insights available yet.</p>
                    <p className="text-xs text-muted-foreground/80 mt-1">Why not be the first to contribute?</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </ScrollArea>
    </motion.div>
  );
}