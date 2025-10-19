import React from 'react';
import { motion } from 'framer-motion';
import { Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Message } from '../../../worker/types';
interface ChatMessageProps {
  message: Message | { role: 'assistant'; content: string; id: string };
}
const parseMarkdown = (text: string) => {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  lines.forEach((line, index) => {
    if (line.startsWith('* ')) {
      elements.push(
        <li key={index} className="ml-4 list-disc">
          {line.substring(2)}
        </li>
      );
    } else {
      const parts = line.split(/(\*\*.*?\*\*)/g);
      elements.push(
        <p key={index}>
          {parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={i}>{part.slice(2, -2)}</strong>;
            }
            return part;
          })}
        </p>
      );
    }
  });
  return elements;
};
export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn('flex items-start gap-3', isUser ? 'justify-end' : 'justify-start')}
    >
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Bot className="w-5 h-5 text-primary" />
        </div>
      )}
      <div
        className={cn(
          'max-w-md lg:max-w-xl px-4 py-3 rounded-2xl relative prose prose-sm dark:prose-invert prose-p:m-0',
          isUser
            ? 'bg-primary text-primary-foreground rounded-br-none'
            : 'bg-muted text-foreground rounded-bl-none'
        )}
      >
        <div className="whitespace-pre-wrap text-base leading-relaxed">
          {parseMarkdown(message.content)}
        </div>
      </div>
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
          <User className="w-5 h-5 text-accent" />
        </div>
      )}
    </motion.div>
  );
};