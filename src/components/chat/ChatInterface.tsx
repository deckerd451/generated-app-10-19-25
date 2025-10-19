import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { WelcomeScreen } from './WelcomeScreen';
import { ChatMessage } from './ChatMessage';
import { chatService } from '@/lib/chat';
import type { ChatState, SessionInfo, UserProfileContext } from '../../../worker/types';
import { toast } from '@/components/ui/sonner';
import { useUserProfileStore } from '@/stores/userProfileStore';
import { useEcosystemStore } from '@/stores/ecosystemStore';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ChatSkeleton } from './ChatSkeleton';
import { ChatTakeaways } from './ChatTakeaways';
import type { ChatTakeaway } from '../../../worker/types';
import { TypingIndicator } from './TypingIndicator';
interface ChatInterfaceProps {
  activeSessionId: string | null;
  activeSession?: SessionInfo;
  loadSessions: () => Promise<void>;
}
export const ChatInterface: React.FC<ChatInterfaceProps> = ({ activeSessionId, activeSession, loadSessions }) => {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    sessionId: activeSessionId || '',
    isProcessing: false,
    model: 'google-ai-studio/gemini-2.5-flash',
    streamingMessage: ''
  });
  const [input, setInput] = useState('');
  const [proactiveMode, setProactiveMode] = useState(true);
  const [takeaways, setTakeaways] = useState<ChatTakeaway[]>([]);
  const [takeawaysFetched, setTakeawaysFetched] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { goals, interests, background } = useUserProfileStore();
  const { contacts, events, communities, organizations, skills, projects, knowledge, relationships } = useEcosystemStore();
  const userContext = useMemo((): UserProfileContext => ({
    goals, interests, background, contacts, events, communities, organizations, skills, projects, knowledge, relationships
  }), [goals, interests, background, contacts, events, communities, organizations, skills, projects, knowledge, relationships]);
  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  };
  useEffect(() => {
    scrollToBottom();
  }, [chatState.messages, chatState.streamingMessage, chatState.isProcessing]);
  const loadSession = useCallback(async (sessionId: string) => {
    setChatState(prev => ({ ...prev, messages: [], streamingMessage: '', isProcessing: true }));
    chatService.switchSession(sessionId);
    const response = await chatService.getMessages();
    if (response.success && response.data) {
      setChatState(response.data);
    } else {
      toast.error("Failed to load consultation.");
      setChatState(prev => ({ ...prev, isProcessing: false }));
    }
  }, []);
  useEffect(() => {
    if (activeSessionId) {
      loadSession(activeSessionId);
      setTakeaways([]);
      setTakeawaysFetched(false);
    } else {
      setChatState({
        messages: [],
        sessionId: '',
        isProcessing: false,
        model: 'google-ai-studio/gemini-2.5-flash',
        streamingMessage: ''
      });
    }
  }, [activeSessionId, loadSession]);
  useEffect(() => {
    const fetchTakeaways = async () => {
      if (activeSessionId && chatState.messages.length > 4 && !takeawaysFetched && !chatState.isProcessing) {
        setTakeawaysFetched(true); // Mark as fetched to prevent re-fetching
        const response = await chatService.getTakeaways(activeSessionId, userContext);
        if (response.success && response.data) {
          setTakeaways(response.data);
        }
      }
    };
    fetchTakeaways();
  }, [activeSessionId, chatState.messages.length, chatState.isProcessing, takeawaysFetched, userContext]);
  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
  };
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || chatState.isProcessing || !activeSessionId) return;
    setTakeaways([]); // Clear previous takeaways on new message
    const messageContent = input.trim();
    setInput('');
    const userMessage = {
      id: crypto.randomUUID(),
      role: 'user' as const,
      content: messageContent,
      timestamp: Date.now()
    };
    const isFirstUserMessage = chatState.messages.length === 0;
    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isProcessing: true,
      streamingMessage: ''
    }));
    await chatService.sendMessage(messageContent, userContext, proactiveMode, chatState.model, (chunk) => {
      setChatState(prev => ({
        ...prev,
        streamingMessage: (prev.streamingMessage || '') + chunk
      }));
    });
    const response = await chatService.getMessages();
    if (response.success && response.data) {
      setChatState(response.data);
      if (isFirstUserMessage && activeSession?.title.startsWith('Chat ')) {
        const summaryResponse = await chatService.summarizeSession(activeSessionId);
        if (summaryResponse.success) {
          await loadSessions();
        }
      }
    } else {
      toast.error("There was an issue with the AI response.");
      setChatState(prev => ({ ...prev, isProcessing: false }));
    }
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };
  const renderContent = () => {
    if (chatState.isProcessing && chatState.messages.length === 0) {
      return <ChatSkeleton />;
    }
    if (chatState.messages.length === 0 && !chatState.isProcessing) {
      return <WelcomeScreen onPromptClick={handlePromptClick} />;
    }
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        {chatState.messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {chatState.streamingMessage && (
          <ChatMessage message={{ role: 'assistant', content: chatState.streamingMessage, id: 'streaming' }} />
        )}
        {chatState.isProcessing && !chatState.streamingMessage && (
          <TypingIndicator />
        )}
      </div>
    );
  };
  return (
    <div className="flex flex-col h-full bg-background rounded-r-2xl">
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSessionId || 'welcome'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </ScrollArea>
      <ChatTakeaways takeaways={takeaways} onClear={() => setTakeaways([])} />
      <div className="p-4 sm:p-6 lg:p-8 border-t border-border bg-background">
        <form onSubmit={handleSubmit} className="relative">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Start a new consultation..."
            className="w-full pr-16 py-3 text-base rounded-full bg-muted focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 resize-none"
            rows={1}
            disabled={chatState.isProcessing || !activeSessionId}
          />
          <Button
            type="submit"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full w-10 h-10 bg-accent hover:bg-accent/90"
            disabled={!input.trim() || chatState.isProcessing || !activeSessionId}
          >
            <Send className="w-5 h-5" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
        <div className="flex items-center justify-between mt-3 px-2">
            <p className="text-xs text-muted-foreground">
                Built with ❤️ at Cloudflare. AI can make mistakes.
            </p>
            <div className="flex items-center space-x-2">
                <Switch id="proactive-mode" checked={proactiveMode} onCheckedChange={setProactiveMode} />
                <Label htmlFor="proactive-mode" className="flex items-center text-xs font-medium text-muted-foreground">
                    <Sparkles className="w-3 h-3 mr-1 text-accent" />
                    Proactive Mode
                </Label>
            </div>
        </div>
      </div>
    </div>
  );
};