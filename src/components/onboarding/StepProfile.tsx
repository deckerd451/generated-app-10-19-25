import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useUserProfileStore } from '@/stores/userProfileStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Sparkles, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
const profileStepSchema = z.object({
  goals: z.array(z.string()).min(1, "Please add at least one goal.").max(10),
  interests: z.array(z.string()).min(1, "Please add at least one interest.").max(20),
});
type ProfileStepValues = z.infer<typeof profileStepSchema>;
interface StepProfileProps {
  onNext: () => void;
}
export const StepProfile: React.FC<StepProfileProps> = ({ onNext }) => {
  const { goals, interests, addGoal, setInterests } = useUserProfileStore();
  const [goalInput, setGoalInput] = useState('');
  const [interestInput, setInterestInput] = useState('');
  const form = useForm<ProfileStepValues>({
    resolver: zodResolver(profileStepSchema),
    defaultValues: {
      goals: goals.map(g => g.text) || [],
      interests: interests || [],
    },
  });
  const handleAddGoal = () => {
    if (goalInput.trim() !== '') {
      const currentGoals = form.getValues('goals') || [];
      if (!currentGoals.includes(goalInput.trim())) {
        form.setValue('goals', [...currentGoals, goalInput.trim()]);
        setGoalInput('');
      } else {
        toast.info("This goal has already been added.");
      }
    }
  };
  const handleRemoveGoal = (goalToRemove: string) => {
    const currentGoals = form.getValues('goals') || [];
    form.setValue('goals', currentGoals.filter(g => g !== goalToRemove));
  };
  const handleAddInterest = () => {
    if (interestInput.trim() !== '') {
      const currentInterests = form.getValues('interests') || [];
      if (!currentInterests.includes(interestInput.trim())) {
        form.setValue('interests', [...currentInterests, interestInput.trim()]);
        setInterestInput('');
      } else {
        toast.info("This interest has already been added.");
      }
    }
  };
  const handleRemoveInterest = (interestToRemove: string) => {
    const currentInterests = form.getValues('interests') || [];
    form.setValue('interests', currentInterests.filter(i => i !== interestToRemove));
  };
  const onSubmit = (data: ProfileStepValues) => {
    // Clear existing goals before adding new ones to prevent duplication
    const existingGoals = useUserProfileStore.getState().goals;
    existingGoals.forEach(g => useUserProfileStore.getState().removeGoal(g.id));
    data.goals.forEach(goalText => addGoal(goalText));
    setInterests(data.interests);
    onNext();
  };
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="goals"
            render={() => (
              <FormItem>
                <FormLabel className="text-lg font-semibold flex items-center gap-2">
                  <Target className="w-5 h-5 text-accent" />
                  What are your primary goals?
                </FormLabel>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g., Find a co-founder..."
                    value={goalInput}
                    onChange={(e) => setGoalInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddGoal(); } }}
                    className="bg-muted"
                  />
                  <Button type="button" variant="outline" onClick={handleAddGoal}><Plus className="w-4 h-4 mr-2" /> Add</Button>
                </div>
                <FormMessage />
                <div className="flex flex-wrap gap-2 pt-2 min-h-[40px]">
                  <AnimatePresence>
                    {form.watch('goals')?.map((goal) => (
                      <motion.div key={goal} layout initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}>
                        <Badge variant="secondary" className="text-base py-1 pl-3 pr-2">
                          {goal}
                          <button type="button" onClick={() => handleRemoveGoal(goal)} className="ml-2 rounded-full hover:bg-destructive/20 p-0.5"><X className="w-3 h-3" /></button>
                        </Badge>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="interests"
            render={() => (
              <FormItem>
                <FormLabel className="text-lg font-semibold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-accent" />
                  What are your key interests?
                </FormLabel>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g., AI ethics, venture capital..."
                    value={interestInput}
                    onChange={(e) => setInterestInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddInterest(); } }}
                    className="bg-muted"
                  />
                  <Button type="button" variant="outline" onClick={handleAddInterest}><Plus className="w-4 h-4 mr-2" /> Add</Button>
                </div>
                <FormMessage />
                <div className="flex flex-wrap gap-2 pt-2 min-h-[40px]">
                  <AnimatePresence>
                    {form.watch('interests')?.map((interest) => (
                      <motion.div key={interest} layout initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}>
                        <Badge variant="secondary" className="text-base py-1 pl-3 pr-2">
                          {interest}
                          <button type="button" onClick={() => handleRemoveInterest(interest)} className="ml-2 rounded-full hover:bg-destructive/20 p-0.5"><X className="w-3 h-3" /></button>
                        </Badge>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </FormItem>
            )}
          />
          <div className="flex justify-end">
            <Button type="submit" size="lg">Next</Button>
          </div>
        </form>
      </Form>
    </motion.div>
  );
};