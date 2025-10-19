import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserProfileStore } from '@/stores/userProfileStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { Plus, Trash2, Target } from 'lucide-react';
export const GoalManager: React.FC = () => {
  const { goals, addGoal, removeGoal, toggleGoalCompletion } = useUserProfileStore();
  const [newGoalText, setNewGoalText] = useState('');
  const handleAddGoal = () => {
    if (newGoalText.trim()) {
      addGoal(newGoalText.trim());
      toast.success("Goal added!");
      setNewGoalText('');
    }
  };
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Add a new goal..."
          value={newGoalText}
          onChange={(e) => setNewGoalText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddGoal();
            }
          }}
          className="bg-muted"
        />
        <Button type="button" onClick={handleAddGoal}>
          <Plus className="w-4 h-4 mr-2" /> Add Goal
        </Button>
      </div>
      <ScrollArea className="h-48 pr-4 border rounded-xl bg-muted/50">
        <div className="p-4 space-y-2">
          <AnimatePresence>
            {goals.length > 0 ? (
              goals.map((goal) => (
                <motion.div
                  key={goal.id}
                  layout
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-3 p-2 rounded-md bg-background"
                >
                  <Checkbox
                    id={`goal-${goal.id}`}
                    checked={goal.completed}
                    onCheckedChange={() => toggleGoalCompletion(goal.id)}
                  />
                  <label
                    htmlFor={`goal-${goal.id}`}
                    className={`flex-1 text-sm font-medium cursor-pointer transition-colors ${
                      goal.completed ? 'text-muted-foreground line-through' : 'text-foreground'
                    }`}
                  >
                    {goal.text}
                  </label>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => removeGoal(goal.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-10">
                <Target className="w-8 h-8 mx-auto text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">No goals added yet.</p>
                <p className="text-xs text-muted-foreground/80">Add your first goal above to get started!</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>
    </div>
  );
};