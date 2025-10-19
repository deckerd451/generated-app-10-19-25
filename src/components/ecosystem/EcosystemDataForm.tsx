import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useEcosystemStore } from '@/stores/ecosystemStore';
import { Plus, X, Users, Calendar, Building, Database, Briefcase, BrainCircuit, GitBranch, Library } from 'lucide-react';
import { toast } from 'sonner';
import type { Contact, KismetEvent, Community, Organization, Skill, Project, KnowledgeItem } from '@/types/ecosystem';
type AnyItem = Contact | KismetEvent | Community | Organization | Skill | Project | KnowledgeItem;
type DataType = 'contacts' | 'events' | 'communities' | 'organizations' | 'skills' | 'projects' | 'knowledge';
export const EcosystemDataForm: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [emailValue, setEmailValue] = useState('');
  const [urlValue, setUrlValue] = useState('');
  const [activeTab, setActiveTab] = useState<DataType>('contacts');
  const store = useEcosystemStore();
  const dataMap = {
    contacts: { items: store.contacts, add: store.addContact, remove: store.removeContact, placeholder: 'Add a key contact...', icon: <Users className="w-5 h-5" /> },
    events: { items: store.events, add: store.addEvent, remove: store.removeEvent, placeholder: 'Add an important event...', icon: <Calendar className="w-5 h-5" /> },
    communities: { items: store.communities, add: store.addCommunity, remove: store.removeCommunity, placeholder: 'Add a community...', icon: <Building className="w-5 h-5" /> },
    organizations: { items: store.organizations, add: store.addOrganization, remove: store.removeOrganization, placeholder: 'Add an organization...', icon: <Briefcase className="w-5 h-5" /> },
    skills: { items: store.skills, add: store.addSkill, remove: store.removeSkill, placeholder: 'Add a skill...', icon: <BrainCircuit className="w-5 h-5" /> },
    projects: { items: store.projects, add: store.addProject, remove: store.removeProject, placeholder: 'Add a project...', icon: <GitBranch className="w-5 h-5" /> },
    knowledge: { items: store.knowledge, add: store.addKnowledgeItem, remove: store.removeKnowledgeItem, placeholder: 'Add an article, paper, etc.', icon: <Library className="w-5 h-5" /> }
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    if (activeTab === 'contacts') {
      (dataMap[activeTab].add as (name: string, email?: string) => void)(inputValue.trim(), emailValue.trim() || undefined);
    } else if (activeTab === 'knowledge') {
      (dataMap[activeTab].add as (name: string, url?: string) => void)(inputValue.trim(), urlValue.trim() || undefined);
    } else {
      (dataMap[activeTab].add as (name: string) => void)(inputValue.trim());
    }
    toast.success(`'${inputValue.trim()}' added to ${activeTab}.`);
    setInputValue('');
    setEmailValue('');
    setUrlValue('');
  };
  const handleRemove = (item: AnyItem) => {
    dataMap[activeTab].remove(item.id);
    toast.info(`'${item.name}' removed from ${activeTab}.`);
  };
  const currentData = dataMap[activeTab];
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold flex items-center gap-2">
        <Database className="w-5 h-5 text-accent" />
        Ecosystem Data
      </h3>
      <p className="text-muted-foreground text-sm">
        Add key people, events, and groups. This helps CYNQ find relevant connections and opportunities for you.
      </p>
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as DataType)} className="w-full">
        <TabsList className="flex flex-wrap justify-center h-auto">
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="communities">Communities</TabsTrigger>
          <TabsTrigger value="organizations">Orgs</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="knowledge">Knowledge</TabsTrigger>
        </TabsList>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <TabsContent value={activeTab} className="mt-4">
              <form onSubmit={handleSubmit} className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder={currentData.placeholder}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="bg-muted"
                  />
                  <Button type="submit" size="icon" variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {activeTab === 'knowledge' && (
                  <Input
                    type="text"
                    placeholder="Add a URL (optional)..."
                    value={urlValue}
                    onChange={(e) => setUrlValue(e.target.value)}
                    className="bg-muted"
                  />
                )}
                {activeTab === 'contacts' && (
                  <Input
                    type="email"
                    placeholder="Add an email (optional)..."
                    value={emailValue}
                    onChange={(e) => setEmailValue(e.target.value)}
                    className="bg-muted"
                  />
                )}
              </form>
              <ScrollArea className="h-48 mt-4 pr-4">
                <div className="space-y-2">
                  <AnimatePresence>
                    {currentData.items.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center justify-between p-2 rounded-md bg-muted/50"
                      >
                        <span className="text-sm font-medium truncate">{item.name}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-destructive"
                          onClick={() => handleRemove(item)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {currentData.items.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center pt-8">
                      No {activeTab} added yet.
                    </p>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </motion.div>
        </AnimatePresence>
      </Tabs>
    </div>
  );
};