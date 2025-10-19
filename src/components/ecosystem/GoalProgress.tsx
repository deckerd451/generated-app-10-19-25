import React from 'react';
import { useUserProfileStore } from '@/stores/userProfileStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Target, CheckCircle2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
export const GoalProgress: React.FC = () => {
  const { goals } = useUserProfileStore();
  const completedGoals = goals.filter(g => g.completed);
  const activeGoals = goals.filter(g => !g.completed);
  const progressPercentage = goals.length > 0 ? (completedGoals.length / goals.length) * 100 : 0;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-accent" />
          Goal Progress
        </CardTitle>
        <CardDescription>
          You've completed {completedGoals.length} of {goals.length} goals.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Progress value={progressPercentage} className="w-full mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-sm mb-2">Active Goals</h4>
            <ScrollArea className="h-24 pr-3">
              {activeGoals.length > 0 ? (
                <ul className="space-y-2">
                  {activeGoals.map(goal => (
                    <li key={goal.id} className="text-sm text-foreground flex items-start gap-2">
                      <Target className="w-3 h-3 mt-1 flex-shrink-0 text-primary" />
                      <span>{goal.text}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-muted-foreground italic">No active goals.</p>
              )}
            </ScrollArea>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-2">Completed Goals</h4>
            <ScrollArea className="h-24 pr-3">
              {completedGoals.length > 0 ? (
                <ul className="space-y-2">
                  {completedGoals.map(goal => (
                    <li key={goal.id} className="text-sm text-muted-foreground line-through flex items-start gap-2">
                       <CheckCircle2 className="w-3 h-3 mt-1 flex-shrink-0 text-green-500" />
                       <span>{goal.text}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-muted-foreground italic">No completed goals yet.</p>
              )}
            </ScrollArea>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};