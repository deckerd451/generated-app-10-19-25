import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, Variants, useAnimationControls } from 'framer-motion';
import { useUserProfileStore } from '@/stores/userProfileStore';
import { useEcosystemStore } from '@/stores/ecosystemStore';
import { cn } from '@/lib/utils';
import { User, Calendar, Users, Building, GitBranch, BrainCircuit, Briefcase, Library } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { EcosystemNodeDetail } from './EcosystemNodeDetail';
import type { NodeType, Relationship } from '@/types/ecosystem';
const usePrevious = <T,>(value: T): T | undefined => {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};
const nodeVariants: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 260,
      damping: 20,
    },
  },
  pulse: {
    scale: [1, 1.2, 1],
    transition: {
      duration: 0.5,
      ease: 'easeInOut',
    },
  },
};
const lineVariants: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: (isHovered: boolean) => ({
    pathLength: 1,
    opacity: isHovered ? 1 : 0.5,
    transition: {
      duration: 0.8,
      ease: 'easeInOut' as const,
    },
  }),
};
interface NodeProps {
  id: NodeType;
  icon: React.ReactNode;
  label: string;
  position: string;
  hasData?: boolean;
  isHovered?: boolean;
  onMouseEnter: (id: string) => void;
  onMouseLeave: () => void;
  setRef: (el: HTMLDivElement | null) => void;
  animationControls: any;
  isCentral?: boolean;
}
const Node: React.FC<NodeProps> = ({ id, icon, label, position, hasData, isHovered, onMouseEnter, onMouseLeave, setRef, animationControls, isCentral = false }) => {
  const nodeContent = (
    <motion.div
      className={cn(isCentral ? "" : "cursor-pointer")}
      animate={{ scale: isHovered ? 1.1 : 1 }}
    >
      <div
        className={cn(
          'rounded-full border-2 border-dashed flex items-center justify-center transition-colors duration-300',
          isCentral ? 'w-20 h-20 md:w-24 md:h-24' : 'w-16 h-16 md:w-20 md:h-20',
          hasData ? 'bg-primary/10 border-primary text-primary' : 'bg-muted text-muted-foreground border-border',
          isHovered && hasData && 'bg-primary/20 border-solid'
        )}
      >
        {icon}
      </div>
    </motion.div>
  );
  return (
    <motion.div
      ref={setRef}
      variants={nodeVariants}
      animate={animationControls}
      className={cn('absolute flex flex-col items-center gap-2 transition-transform duration-300', position)}
      onMouseEnter={() => onMouseEnter(id)}
      onMouseLeave={onMouseLeave}
    >
      {isCentral ? (
        <Popover>
          <PopoverTrigger asChild>{nodeContent}</PopoverTrigger>
          <PopoverContent className="w-auto p-0" side="bottom" align="center">
            <EcosystemNodeDetail nodeType="you" />
          </PopoverContent>
        </Popover>
      ) : (
        <Popover>
          <PopoverTrigger asChild disabled={!hasData}>{nodeContent}</PopoverTrigger>
          {hasData && (
            <PopoverContent className="w-auto p-0" side="bottom" align="center">
              <EcosystemNodeDetail nodeType={id} />
            </PopoverContent>
          )}
        </Popover>
      )}
      <span className={cn(
        'text-xs md:text-sm font-medium text-center transition-colors duration-300',
        isHovered && hasData ? 'text-primary' : 'text-muted-foreground'
      )}>{label}</span>
    </motion.div>
  );
};
const relationshipTypeToNodeId: Record<Relationship['sourceType'], NodeType> = {
  goal: 'you',
  interest: 'you',
  contact: 'contacts',
  event: 'events',
  community: 'communities',
  communityResource: 'communities',
  organization: 'organizations',
  skill: 'skills',
  project: 'projects',
  knowledge: 'knowledge',
};
interface EcosystemGraphProps {
  highlightedNodes: NodeType[] | null;
}
export const EcosystemGraph: React.FC<EcosystemGraphProps> = ({ highlightedNodes }) => {
  const profile = useUserProfileStore();
  const ecosystem = useEcosystemStore();
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number }>>({});
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const youControls = useAnimationControls();
  const contactsControls = useAnimationControls();
  const eventsControls = useAnimationControls();
  const communitiesControls = useAnimationControls();
  const projectsControls = useAnimationControls();
  const skillsControls = useAnimationControls();
  const organizationsControls = useAnimationControls();
  const knowledgeControls = useAnimationControls();
  const prevProfile = usePrevious(profile);
  const prevEcosystem = usePrevious(ecosystem);
  const animationControlsMap = useMemo(() => ({
    you: youControls,
    contacts: contactsControls,
    events: eventsControls,
    communities: communitiesControls,
    projects: projectsControls,
    skills: skillsControls,
    organizations: organizationsControls,
    knowledge: knowledgeControls,
  }), [youControls, contactsControls, eventsControls, communitiesControls, projectsControls, skillsControls, organizationsControls, knowledgeControls]);
  useEffect(() => {
    if (highlightedNodes && highlightedNodes.length > 0) {
      highlightedNodes.forEach(nodeId => {
        if (animationControlsMap[nodeId]) {
          animationControlsMap[nodeId].start("pulse");
        }
      });
    }
  }, [highlightedNodes, animationControlsMap]);
  useEffect(() => {
    if (prevProfile && (profile.goals !== prevProfile.goals || profile.interests !== prevProfile.interests || profile.background !== prevProfile.background)) {
      youControls.start("pulse");
    }
  }, [profile, prevProfile, youControls]);
  useEffect(() => {
    if (prevEcosystem && ecosystem.contacts.length > prevEcosystem.contacts.length) {
      contactsControls.start("pulse");
    }
  }, [ecosystem.contacts, prevEcosystem, contactsControls]);
  useEffect(() => {
    if (prevEcosystem && ecosystem.events.length > prevEcosystem.events.length) {
      eventsControls.start("pulse");
    }
  }, [ecosystem.events, prevEcosystem, eventsControls]);
  useEffect(() => {
    if (prevEcosystem && ecosystem.communities.length > prevEcosystem.communities.length) {
      communitiesControls.start("pulse");
    }
  }, [ecosystem.communities, prevEcosystem, communitiesControls]);
  const hasProfileData = !!profile.goals || (profile.interests && profile.interests.length > 0) || !!profile.background;
  const nodes = [
    { id: 'you', icon: <User className="w-10 h-10 md:w-12 md:h-12" />, label: 'You', position: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2', hasData: hasProfileData, controls: youControls, isCentral: true },
    { id: 'contacts', icon: <Users className="w-8 h-8" />, label: 'Contacts', position: 'top-0 left-1/2 -translate-x-1/2', hasData: ecosystem.contacts.length > 0 || ecosystem.linkedInConnected, controls: contactsControls },
    { id: 'communities', icon: <Building className="w-8 h-8" />, label: 'Communities', position: 'top-[15%] right-[5%]', hasData: ecosystem.communities.length > 0 || ecosystem.slackConnected, controls: communitiesControls },
    { id: 'projects', icon: <GitBranch className="w-8 h-8" />, label: 'Projects', position: 'bottom-[15%] right-[5%]', hasData: ecosystem.projects.length > 0 || ecosystem.githubConnected || ecosystem.notionConnected, controls: projectsControls },
    { id: 'events', icon: <Calendar className="w-8 h-8" />, label: 'Events', position: 'bottom-0 left-1/2 -translate-x-1/2', hasData: ecosystem.events.length > 0 || ecosystem.googleCalendarConnected, controls: eventsControls },
    { id: 'organizations', icon: <Briefcase className="w-8 h-8" />, label: 'Organizations', position: 'bottom-[15%] left-[5%]', hasData: ecosystem.organizations.length > 0 || ecosystem.crunchbaseConnected, controls: organizationsControls },
    { id: 'skills', icon: <BrainCircuit className="w-8 h-8" />, label: 'Skills', position: 'top-[15%] left-[5%]', hasData: ecosystem.skills.length > 0, controls: skillsControls },
    { id: 'knowledge', icon: <Library className="w-8 h-8" />, label: 'Knowledge', position: 'top-1/2 -left-4 -translate-y-1/2', hasData: ecosystem.knowledge.length > 0, controls: knowledgeControls },
  ];
  const activeNodes = nodes.filter(n => n.hasData && n.id !== 'you');
  const calculatePositions = useCallback(() => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const newPositions: Record<string, { x: number; y: number }> = {};
    Object.entries(nodeRefs.current).forEach(([id, el]) => {
      if (el) {
        const rect = el.getBoundingClientRect();
        newPositions[id] = {
          x: rect.left - containerRect.left + rect.width / 2,
          y: rect.top - containerRect.top + rect.height / 2,
        };
      }
    });
    setNodePositions(newPositions);
  }, []);
  useEffect(() => {
    calculatePositions();
    const resizeObserver = new ResizeObserver(calculatePositions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    return () => resizeObserver.disconnect();
  }, [calculatePositions]);
  const centerPos = nodePositions['you'];
  const uniqueNodeLinks = ecosystem.relationships.reduce((acc, rel) => {
    const sourceNode = relationshipTypeToNodeId[rel.sourceType as keyof typeof relationshipTypeToNodeId];
    const targetNode = relationshipTypeToNodeId[rel.targetType as keyof typeof relationshipTypeToNodeId];
    if (sourceNode && targetNode && sourceNode !== targetNode) {
      const key = [sourceNode, targetNode].sort().join('-');
      acc.add(key);
    }
    return acc;
  }, new Set<string>());
  return (
    <motion.div
      ref={containerRef}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative w-full h-full aspect-square max-w-md mx-auto"
    >
      <svg className="absolute inset-0 w-full h-full overflow-visible">
        <AnimatePresence>
          {/* Center-out lines */}
          {centerPos && activeNodes.map(node => {
            const targetPos = nodePositions[node.id];
            const isLineHovered = hoveredNode === node.id || hoveredNode === 'you';
            if (!targetPos) return null;
            return (
              <motion.line
                key={`line-you-${node.id}`}
                variants={lineVariants}
                custom={isLineHovered}
                initial="hidden"
                animate="visible"
                exit="hidden"
                x1={centerPos.x}
                y1={centerPos.y}
                x2={targetPos.x}
                y2={targetPos.y}
                className={cn(
                  "transition-all duration-300",
                  isLineHovered ? "stroke-accent" : "stroke-border"
                )}
                strokeWidth={isLineHovered ? 2 : 1.5}
                strokeDasharray="4 2"
              />
            );
          })}
          {/* Relationship lines */}
          {Array.from(uniqueNodeLinks).map(linkKey => {
            const [sourceNodeId, targetNodeId] = linkKey.split('-');
            const sourcePos = nodePositions[sourceNodeId];
            const targetPos = nodePositions[targetNodeId];
            const isLineHovered = hoveredNode === sourceNodeId || hoveredNode === targetNodeId;
            if (!sourcePos || !targetPos) return null;
            return (
              <motion.line
                key={`line-rel-${linkKey}`}
                variants={lineVariants}
                custom={isLineHovered}
                initial="hidden"
                animate="visible"
                exit="hidden"
                x1={sourcePos.x}
                y1={sourcePos.y}
                x2={targetPos.x}
                y2={targetPos.y}
                className={cn(
                  "transition-all duration-300",
                  isLineHovered ? "stroke-primary" : "stroke-border"
                )}
                strokeWidth={isLineHovered ? 2.5 : 2}
              />
            );
          })}
        </AnimatePresence>
      </svg>
      {nodes.map(node => (
        <Node
          key={node.id}
          id={node.id as NodeType}
          icon={node.icon}
          label={node.label}
          position={node.position}
          hasData={node.hasData}
          isHovered={hoveredNode === node.id}
          onMouseEnter={(id) => node.hasData && setHoveredNode(id)}
          onMouseLeave={() => setHoveredNode(null)}
          setRef={(el) => (nodeRefs.current[node.id] = el)}
          animationControls={node.controls}
          isCentral={node.isCentral}
        />
      ))}
    </motion.div>
  );
};