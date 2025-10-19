import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { communityService } from '@/lib/communityService';
import { toast } from 'sonner';
import { Send, Loader } from 'lucide-react';
const insightFormSchema = z.object({
  insightText: z.string()
    .min(20, { message: "Please provide a more detailed insight (at least 20 characters)." })
    .max(280, { message: "Insight must be 280 characters or less." }),
});
type InsightFormValues = z.infer<typeof insightFormSchema>;
interface ContributeInsightFormProps {
  onSuccess: () => void;
}
export const ContributeInsightForm: React.FC<ContributeInsightFormProps> = ({ onSuccess }) => {
  const form = useForm<InsightFormValues>({
    resolver: zodResolver(insightFormSchema),
    defaultValues: {
      insightText: "",
    },
  });
  const { isSubmitting } = form.formState;
  const onSubmit = async (data: InsightFormValues) => {
    const response = await communityService.submitInsight(data.insightText);
    if (response.success) {
      toast.success("Thank you for your contribution!", {
        description: "Your insight has been added to the community.",
      });
      form.reset();
      onSuccess();
    } else {
      toast.error("Failed to submit insight.", {
        description: response.error || "Please try again later.",
      });
    }
  };
  return (
    <motion.div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="insightText"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="sr-only">Your Insight</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Share a trend, a useful connection, or a piece of advice..."
                    className="min-h-[80px] text-base rounded-xl bg-muted"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Contribute
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </motion.div>
  );
};