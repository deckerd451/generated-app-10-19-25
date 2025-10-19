import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Plus, MessageSquare, Settings, LogOut, Globe, Users, QrCode, Upload } from 'lucide-react';
import { motion } from 'framer-motion';
import type { SessionInfo } from '../../../worker/types';
import { useAuthStore } from '@/stores/authStore';
import { useUserProfileStore } from '@/stores/userProfileStore';
import { useEcosystemStore } from '@/stores/ecosystemStore';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { SnapshotModal } from '@/components/snapshot/SnapshotModal';
interface SidebarProps {
  sessions: SessionInfo[];
  activeSessionId: string | null;
  onNewConsultation: () => void;
  onSwitchSession: (sessionId: string) => void;
}
const NavItem: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div whileHover={{ x: 4 }} transition={{ type: 'spring', stiffness: 300 }}>
    {children}
  </motion.div>
);
export const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  activeSessionId,
  onNewConsultation,
  onSwitchSession,
}) => {
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);
  const clearProfile = useUserProfileStore((state) => state.clear);
  const clearEcosystem = useEcosystemStore((state) => state.clear);
  const isProfileActive = location.pathname === '/profile';
  const isEcosystemActive = location.pathname === '/ecosystem';
  const isCommunityActive = location.pathname === '/community';
  const isImportActive = location.pathname === '/import';
  const isChatActive = !isProfileActive && !isEcosystemActive && !isCommunityActive && !isImportActive;
  const handleLogout = () => {
    toast.info("Clearing local data and logging out...");
    clearProfile();
    clearEcosystem();
    logout();
  };
  return (
    <aside className="w-[280px] min-w-[280px] bg-muted/50 flex flex-col p-4 h-full rounded-l-2xl border-r">
      <Link to="/chat" className="px-2 pb-4 border-b block group">
        <div className="flex items-center gap-2 transition-opacity duration-200 group-hover:opacity-80">
          <h1 className="text-3xl font-display text-foreground">CYNQ</h1>
        </div>
      </Link>
      <div className="py-4 space-y-2">
        <NavItem>
          <Button className="w-full justify-start" onClick={onNewConsultation}>
            <Plus className="w-4 h-4 mr-2" />
            New Consultation
          </Button>
        </NavItem>
        <NavItem>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" className="w-full justify-start">
                <QrCode className="w-4 h-4 mr-2" />
                CYNQ Snapshot
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <SnapshotModal />
            </DialogContent>
          </Dialog>
        </NavItem>
        <NavItem>
          <Button asChild variant="ghost" className="w-full justify-start relative">
            <Link to="/import">
              <Upload className="w-4 h-4 mr-2" />
              Import Snapshot
              {isImportActive && (
                <motion.div
                  layoutId="active-nav-indicator"
                  className="absolute inset-0 bg-secondary rounded-lg -z-10"
                />
              )}
            </Link>
          </Button>
        </NavItem>
        <NavItem>
          <Button asChild variant="ghost" className="w-full justify-start relative">
            <Link to="/ecosystem">
              <Globe className="w-4 h-4 mr-2" />
              My Ecosystem
              {isEcosystemActive && (
                <motion.div
                  layoutId="active-nav-indicator"
                  className="absolute inset-0 bg-secondary rounded-lg -z-10"
                />
              )}
            </Link>
          </Button>
        </NavItem>
        <NavItem>
          <Button asChild variant="ghost" className="w-full justify-start relative">
            <Link to="/community">
              <Users className="w-4 h-4 mr-2" />
              Community
              {isCommunityActive && (
                <motion.div
                  layoutId="active-nav-indicator"
                  className="absolute inset-0 bg-secondary rounded-lg -z-10"
                />
              )}
            </Link>
          </Button>
        </NavItem>
      </div>
      <p className="px-2 text-sm font-semibold text-muted-foreground mb-2">
        Recent
      </p>
      <ScrollArea className="flex-1 -mx-2">
        <div className="px-2 space-y-1">
          {sessions.length > 0 ? (
            sessions.map((session) => (
              <NavItem key={session.id}>
                <Button
                  variant="ghost"
                  className="w-full justify-start truncate relative"
                  onClick={() => onSwitchSession(session.id)}
                >
                  <MessageSquare className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{session.title}</span>
                  {activeSessionId === session.id && isChatActive && (
                    <motion.div
                      layoutId="active-nav-indicator"
                      className="absolute inset-0 bg-secondary rounded-lg -z-10"
                    />
                  )}
                </Button>
              </NavItem>
            ))
          ) : (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-muted-foreground">
                Your past consultations will appear here.
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="pt-4 border-t mt-auto">
        <div className="flex items-center justify-between">
          <NavItem>
            <Button asChild variant="ghost" className="w-full justify-start relative">
              <Link to="/profile">
                <Settings className="w-4 h-4 mr-2" />
                My Profile
                {isProfileActive && (
                  <motion.div
                    layoutId="active-nav-indicator"
                    className="absolute inset-0 bg-secondary rounded-lg -z-10"
                  />
                )}
              </Link>
            </Button>
          </NavItem>
          <ThemeToggle />
        </div>
        <NavItem>
          <Button variant="ghost" className="w-full justify-start text-muted-foreground" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </NavItem>
      </div>
    </aside>
  );
};