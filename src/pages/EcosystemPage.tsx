import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { motion, Variants } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { EcosystemGraph } from '@/components/ecosystem/EcosystemGraph';
import { EcosystemDataForm } from '@/components/ecosystem/EcosystemDataForm';
import { EcosystemInsights } from '@/components/ecosystem/EcosystemInsights';
import { EcosystemRelationshipManager } from '@/components/ecosystem/EcosystemRelationshipManager';
import { useEcosystemStore } from '@/stores/ecosystemStore';
import { useUserProfileStore } from '@/stores/userProfileStore';
import { dataSyncService } from '@/lib/dataSyncService';
import { Globe, Link as LinkIcon } from 'lucide-react';
import type { UserProfileContext } from "../../worker/types";
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { NodeType } from '@/types/ecosystem';
import { useEcosystemInsights } from '@/hooks/useEcosystemInsights';
import { DataSourceList } from '@/components/ecosystem/DataSourceList';
import { GoalProgress } from '@/components/ecosystem/GoalProgress';
export function EcosystemPage() {
  const store = useEcosystemStore();
  const { goals, interests, background } = useUserProfileStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const [highlightedNodes, setHighlightedNodes] = useState<NodeType[] | null>(null);
  const userContext = useMemo((): UserProfileContext => ({
    goals,
    interests,
    background,
    contacts: store.contacts,
    events: store.events,
    communities: store.communities,
    organizations: store.organizations,
    skills: store.skills,
    projects: store.projects,
    knowledge: store.knowledge,
    relationships: store.relationships,
  }), [goals, interests, background, store.contacts, store.events, store.communities, store.organizations, store.skills, store.projects, store.knowledge, store.relationships]);
  const { insights, isLoading: isLoadingInsights, error: insightsError } = useEcosystemInsights(userContext);
  const handleDataSync = useCallback(async (service: 'google' | 'linkedin' | 'github' | 'slack' | 'notion') => {
    const serviceNameMap = {
      google: 'Google Calendar',
      linkedin: 'LinkedIn',
      github: 'GitHub',
      slack: 'Slack',
      notion: 'Notion',
    };
    const syncToastId = toast.loading(`Syncing data from ${serviceNameMap[service]}...`);
    let response;
    switch (service) {
      case 'google':
        response = await dataSyncService.syncGoogleData();
        if (response.success && response.data) {
          response.data.forEach(event => store.addEvent(event.summary));
          toast.success(`Synced ${response.data.length} events from Google Calendar!`);
        }
        break;
      case 'linkedin':
        response = await dataSyncService.syncLinkedInData();
        if (response.success && response.data) {
          response.data.forEach(contact => store.addContact(`${contact.name} (${contact.headline})`));
          toast.success(`Synced ${response.data.length} contacts from LinkedIn!`);
        }
        break;
      case 'github':
        response = await dataSyncService.syncGitHubData();
        if (response.success) toast.success(`Synced ${response.data?.length || 0} repos from GitHub!`);
        break;
      case 'slack':
        response = await dataSyncService.syncSlackData();
        if (response.success) toast.success(`Synced ${response.data?.length || 0} channels from Slack!`);
        break;
      case 'notion':
        response = await dataSyncService.syncNotionData();
        if (response.success) toast.success(`Synced ${response.data?.length || 0} pages from Notion!`);
        break;
    }
    toast.dismiss(syncToastId);
  }, [store]);
  useEffect(() => {
    const connectedService = searchParams.get('connected');
    if (connectedService) {
      const service = connectedService as 'google' | 'linkedin' | 'github' | 'slack' | 'notion' | 'meetup' | 'discord' | 'eventbrite' | 'crunchbase' | 'twitter';
      const connectionMap = {
        google: { isConnected: store.googleCalendarConnected, connect: store.connectGoogleCalendar, name: 'Google Calendar', sync: true },
        linkedin: { isConnected: store.linkedInConnected, connect: store.connectLinkedIn, name: 'LinkedIn', sync: true },
        github: { isConnected: store.githubConnected, connect: store.connectGithub, name: 'GitHub', sync: true },
        slack: { isConnected: store.slackConnected, connect: store.connectSlack, name: 'Slack', sync: true },
        notion: { isConnected: store.notionConnected, connect: store.connectNotion, name: 'Notion', sync: true },
        meetup: { isConnected: store.meetupConnected, connect: store.connectMeetup, name: 'Meetup', sync: false },
        discord: { isConnected: store.discordConnected, connect: store.connectDiscord, name: 'Discord', sync: false },
        eventbrite: { isConnected: store.eventbriteConnected, connect: store.connectEventbrite, name: 'Eventbrite', sync: false },
        crunchbase: { isConnected: store.crunchbaseConnected, connect: store.connectCrunchbase, name: 'Crunchbase', sync: false },
        twitter: { isConnected: store.twitterConnected, connect: store.connectTwitter, name: 'Twitter / X', sync: false },
      };
      if (service in connectionMap) {
        const { isConnected, connect, name, sync } = connectionMap[service];
        if (!isConnected) {
          connect();
          toast.success(`Connected to ${name}!`);
          if (sync) {
            handleDataSync(service as 'google' | 'linkedin' | 'github' | 'slack' | 'notion');
          }
        }
      }
      searchParams.delete('connected');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams, store, handleDataSync]);
  useEffect(() => {
    if (location.state?.highlightedNodes) {
      setHighlightedNodes(location.state.highlightedNodes as NodeType[]);
      window.history.replaceState({}, '');
    }
  }, [location.state]);
  useEffect(() => {
    if (insights && insights.length > 0) {
      const firstActionable = insights.find(i => i.actionableType);
      if (firstActionable?.actionableType) {
        const nodeTypeMap: { [key: string]: NodeType } = {
          contact: 'contacts',
          event: 'events',
          community: 'communities',
        };
        const nodeToHighlight = nodeTypeMap[firstActionable.actionableType];
        if (nodeToHighlight) {
          setHighlightedNodes([nodeToHighlight]);
        }
      }
    }
  }, [insights]);
  useEffect(() => {
    if (highlightedNodes && highlightedNodes.length > 0) {
      const timer = setTimeout(() => {
        setHighlightedNodes(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [highlightedNodes]);
  const rightColumnVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };
  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex-1 p-6 sm:p-8 lg:p-10 flex flex-col gap-6"
    >
      <div className="flex-shrink-0">
        <h1 className="text-3xl font-display flex items-center gap-3">
          <Globe className="w-8 h-8 text-primary" />
          My Ecosystem
        </h1>
        <p className="text-lg text-muted-foreground mt-1">
          Visualize and manage the data sources that power your CYNQ.
        </p>
      </div>
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-6 min-h-0">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-3"
        >
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle>Ecosystem Map</CardTitle>
              <CardDescription>
                An interactive visualization of your connected data.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex items-center justify-center p-4 md:p-6">
              <EcosystemGraph highlightedNodes={highlightedNodes} />
            </CardContent>
          </Card>
        </motion.div>
        <ScrollArea className="lg:col-span-2 h-full">
          <motion.div
            variants={rightColumnVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6 pr-3"
          >
            <motion.div variants={cardVariants}>
              <GoalProgress />
            </motion.div>
            <motion.div variants={cardVariants}>
              <Card>
                <CardHeader>
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <LinkIcon className="w-5 h-5 text-accent" />
                    Manage Relationships
                  </h3>
                  <p className="text-muted-foreground text-sm !mt-2">
                    Connect different parts of your ecosystem to uncover deeper insights.
                  </p>
                </CardHeader>
                <CardContent>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full">Link Data Points</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[625px]">
                      <DialogHeader>
                        <DialogTitle>Ecosystem Relationship Manager</DialogTitle>
                        <DialogDescription>
                          Create and manage links between your goals, contacts, events, and more.
                        </DialogDescription>
                      </DialogHeader>
                      <EcosystemRelationshipManager />
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={cardVariants}>
              <Card>
                <CardContent className="p-6">
                  <EcosystemDataForm />
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={cardVariants}>
              <DataSourceList />
            </motion.div>
            <motion.div variants={cardVariants}>
              <EcosystemInsights insights={insights} isLoading={isLoadingInsights} error={insightsError} />
            </motion.div>
          </motion.div>
        </ScrollArea>
      </div>
    </motion.div>
  );
}