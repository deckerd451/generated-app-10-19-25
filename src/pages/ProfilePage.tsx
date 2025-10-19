import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useUserProfileStore } from '@/stores/userProfileStore';
import { toast } from 'sonner';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { User, Target, Sparkles, Loader, Check, Plus, X } from 'lucide-react';
import { GoalManager } from '@/components/profile/GoalManager';
const profileFormSchema = z.object({
  interests: z.array(z.string()).max(20, "You can add up to 20 interests.").optional(),
  background: z.string().max(1000, "Background must be 1000 characters or less.").optional(),
});
type ProfileFormValues = z.infer<typeof profileFormSchema>;
type SaveStatus = 'idle' | 'saving' | 'saved';
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};
export function ProfilePage() {
  const { interests, background, setInterests, setBackground } = useUserProfileStore();
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [interestInput, setInterestInput] = useState('');
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      interests: [],
      background: '',
    },
  });
  useEffect(() => {
    form.reset({ interests, background });
  }, [interests, background, form]);
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
  const onSubmit = (data: ProfileFormValues) => {
    setSaveStatus('saving');
    setInterests(data.interests || []);
    setBackground(data.background || '');
    setSaveStatus('saved');
    toast.success('Profile updated successfully!', {
      description: 'CYNQ will now use this information to provide better insights.',
    });
    setTimeout(() => setSaveStatus('idle'), 2000);
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex-1 p-6 sm:p-8 lg:p-10 overflow-y-auto"
    >
      <Card className="border-none shadow-none bg-transparent">
        <CardHeader>
          <CardTitle className="text-3xl font-display flex items-center gap-3">
            <User className="w-8 h-8 text-primary" />
            My Profile
          </CardTitle>
          <CardDescription className="text-lg">
            Help CYNQ understand you better. The more it knows, the more it can help.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            <motion.div variants={itemVariants}>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <Target className="w-5 h-5 text-accent" />
                  My Goals
                </h3>
                <GoalManager />
              </div>
            </motion.div>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <motion.div variants={itemVariants}>
                  <FormField
                    control={form.control}
                    name="interests"
                    render={() => (
                      <FormItem>
                        <FormLabel className="text-xl font-semibold flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-accent" />
                          My Interests
                        </FormLabel>
                        <div className="flex gap-2">
                          <Input
                            placeholder="e.g., AI ethics, venture capital..."
                            value={interestInput}
                            onChange={(e) => setInterestInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddInterest();
                              }
                            }}
                            className="bg-muted"
                          />
                          <Button type="button" onClick={handleAddInterest}>
                            <Plus className="w-4 h-4 mr-2" /> Add
                          </Button>
                        </div>
                        <FormMessage />
                        <div className="flex flex-wrap gap-2 pt-2">
                          <AnimatePresence>
                            {form.watch('interests')?.map((interest) => (
                              <motion.div
                                key={interest}
                                layout
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.5 }}
                                transition={{ duration: 0.2 }}
                              >
                                <Badge variant="secondary" className="text-base py-1 pl-3 pr-2">
                                  {interest}
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveInterest(interest)}
                                    className="ml-2 rounded-full hover:bg-destructive/20 p-0.5"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </Badge>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </div>
                      </FormItem>
                    )}
                  />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <FormField
                    control={form.control}
                    name="background"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xl font-semibold">Professional Background</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Briefly describe your professional journey, skills, and current role."
                            className="min-h-[180px] text-base rounded-xl bg-muted"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>
                <motion.div variants={itemVariants} className="flex justify-end">
                  <Button type="submit" size="lg" className="font-bold w-36" disabled={saveStatus === 'saving'}>
                    {saveStatus === 'idle' && 'Save Changes'}
                    {saveStatus === 'saving' && <><Loader className="w-4 h-4 mr-2 animate-spin" /> Saving...</>}
                    {saveStatus === 'saved' && <><Check className="w-4 h-4 mr-2" /> Saved!</>}
                  </Button>
                </motion.div>
              </form>
            </Form>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}