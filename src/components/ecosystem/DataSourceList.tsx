import React from 'react';
import { useEcosystemStore } from '@/stores/ecosystemStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Link as LinkIcon, Users, Building, GitBranch, Calendar, Briefcase, Library, BrainCircuit, Signal } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
type DataSourceId = 'linkedin' | 'google' | 'slack' | 'github' | 'notion' | 'meetup' | 'discord' | 'eventbrite' | 'crunchbase' | 'twitter';
type DataSource = {
  id: DataSourceId;
  name: string;
  description: string;
  icon: React.ReactNode;
};
type Category = {
  id: string;
  name: string;
  icon: React.ReactNode;
  sources: DataSource[];
};
export const DataSourceList: React.FC = () => {
  // The store is kept for potential future use but is not used in the button logic for this phase.
  const store = useEcosystemStore();
  const categories: Category[] = [
    {
      id: 'contacts',
      name: 'Contacts',
      icon: <Users className="w-5 h-5" />,
      sources: [
        { id: 'linkedin', name: 'LinkedIn', description: 'Professional network & contacts.', icon: <img src="https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png" className="w-6 h-6" /> },
      ],
    },
    {
      id: 'communities',
      name: 'Communities',
      icon: <Building className="w-5 h-5" />,
      sources: [
        { id: 'slack', name: 'Slack', description: 'Team communication & channels.', icon: <img src="https://a.slack-edge.com/80588/marketing/img/meta/slack_hash_256.png" className="w-6 h-6" /> },
        { id: 'meetup', name: 'Meetup', description: 'Local groups & events.', icon: <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Meetup_Logo.svg/2560px-Meetup_Logo.svg.png" className="w-6 h-6" /> },
        { id: 'discord', name: 'Discord', description: 'Online communities & chat.', icon: <img src="https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.svg" className="w-6 h-6" /> },
      ],
    },
    {
      id: 'projects',
      name: 'Projects',
      icon: <GitBranch className="w-5 h-5" />,
      sources: [
        { id: 'github', name: 'GitHub', description: 'Code repositories & projects.', icon: <img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" className="w-6 h-6" /> },
        { id: 'notion', name: 'Notion', description: 'Notes, documents & wikis.', icon: <img src="https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png" className="w-6 h-6" /> },
      ],
    },
    {
      id: 'events',
      name: 'Events',
      icon: <Calendar className="w-5 h-5" />,
      sources: [
        { id: 'google', name: 'Google Calendar', description: 'Personal & professional events.', icon: <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" className="w-6 h-6" /> },
        { id: 'eventbrite', name: 'Eventbrite', description: 'Discover & attend events.', icon: <img src="https://cdn.worldvectorlogo.com/logos/eventbrite-1.svg" className="w-6 h-6" /> },
      ],
    },
    {
      id: 'organizations',
      name: 'Organizations',
      icon: <Briefcase className="w-5 h-5" />,
      sources: [
        { id: 'crunchbase', name: 'Crunchbase', description: 'Business information platform.', icon: <img src="https://images.crunchbase.com/image/upload/c_lpad,h_256,w_256,f_auto,q_auto:eco,dpr_1/v1491358288/gvk8wzv534c2oawg5qtn.png" className="w-6 h-6" /> },
      ]
    },
    { id: 'knowledge', name: 'Knowledge', icon: <Library className="w-5 h-5" />, sources: [] },
    {
      id: 'signals',
      name: 'Signals',
      icon: <Signal className="w-5 h-5" />,
      sources: [
        { id: 'twitter', name: 'Twitter / X', description: 'Real-time news & signals.', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 1200 1227"><path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z" fill="currentColor"/></svg> },
      ]
    },
    { id: 'skills', name: 'Skills', icon: <BrainCircuit className="w-5 h-5" />, sources: [] },
  ];
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LinkIcon className="w-5 h-5 text-accent" />
          Data Sources
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" defaultValue={['contacts', 'communities', 'projects', 'events']} className="w-full">
          {categories.map(category => (
            <AccordionItem value={category.id} key={category.id}>
              <AccordionTrigger className="text-base font-semibold">
                <div className="flex items-center gap-2">
                  {category.icon}
                  {category.name}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                {category.sources.length > 0 ? (
                  <div className="space-y-3 pt-2">
                    {category.sources.map(source => (
                      <div key={source.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-3">
                          {source.icon}
                          <div>
                            <p className="font-semibold">{source.name}</p>
                            <p className="text-xs text-muted-foreground">{source.description}</p>
                          </div>
                        </div>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="outline" size="sm" disabled>
                                Coming Soon
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Live integration for {source.name} is planned for a future update.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">Integrations coming soon.</p>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
};