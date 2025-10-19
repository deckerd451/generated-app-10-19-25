import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb, Plus, User, Calendar, Target, X, Building } from 'lucide-react';
import { useUserProfileStore } from '@/stores/userProfileStore';
import { useEcosystemStore } from '@/stores/ecosystemStore';
import { toast } from 'sonner';
import type { ChatTakeaway } from '../../../worker/types';
interface ChatTakeawaysProps {
  takeaways: ChatTakeaway[];
  onClear: () => void;
}
const iconMap = {
  contact: <User className="w-4 h-4" />,
  event: <Calendar className="w-4 h-4" />,
  goal: <Target className="w-4 h-4" />,
  community: <Building className="w-4 h-4" />,
};
export const ChatTakeaways: React.FC<ChatTakeawaysProps> = ({ takeaways, onClear }) => {
  const handleAdd = (takeaway: ChatTakeaway) => {
    switch (takeaway.type) {
      case 'contact':
        useEcosystemStore.getState().addContact(takeaway.value);
        toast.success(`Contact "${takeaway.value}" added to your ecosystem.`);
        break;
      case 'event':
        useEcosystemStore.getState().addEvent(takeaway.value);
        toast.success(`Event "${takeaway.value}" added to your ecosystem.`);
        break;
      case 'community':
        useEcosystemStore.getState().addCommunity(takeaway.value);
        toast.success(`Community "${takeaway.value}" added to your ecosystem.`);
        break;
      case 'goal': {
        useUserProfileStore.getState().addGoal(takeaway.value);
        toast.success(`Goal "${takeaway.value}" added to your profile.`);
        break;
      }
    }
    onClear();
  };
  if (takeaways.length === 0) {
    return null;
  }
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, height: 0 }}
        animate={{ opacity: 1, y: 0, height: 'auto' }}
        exit={{ opacity: 0, y: 20, height: 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="px-4 sm:px-6 lg:px-8 pb-4"
      >
        <Card className="bg-primary/5 border-primary/20 border-dashed">
          <CardHeader className="flex-row items-start justify-between pb-2">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <Lightbulb className="w-5 h-5 text-primary" />
                Key Takeaways
              </CardTitle>
              <CardDescription className="text-xs">
                CYNQ has identified these actionable items from your conversation.
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon" className="h-6 w-6 -mt-1 -mr-1" onClick={onClear}>
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {takeaways.map((takeaway, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded-md bg-background">
                  <div className="flex items-start gap-3">
                    <span className="text-primary mt-1">{iconMap[takeaway.type]}</span>
                    <div>
                      <p className="text-sm font-semibold">{takeaway.value}</p>
                      <p className="text-xs text-muted-foreground">{takeaway.description}</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => handleAdd(takeaway)}>
                    <Plus className="w-3 h-3 mr-1.5" />
                    Add
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};