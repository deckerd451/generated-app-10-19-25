import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useEcosystemStore } from '@/stores/ecosystemStore';
import { Plus, Users, Calendar, Building } from 'lucide-react';
import { toast } from 'sonner';
interface StepEcosystemProps {
  onNext: () => void;
  onBack: () => void;
}
type DataType = 'contacts' | 'events' | 'communities';
export const StepEcosystem: React.FC<StepEcosystemProps> = ({ onNext, onBack }) => {
  const [inputs, setInputs] = useState({ contacts: '', events: '', communities: '' });
  const { addContact, addEvent, addCommunity } = useEcosystemStore();
  const handleAdd = (type: DataType) => {
    const value = inputs[type].trim();
    if (!value) return;
    if (type === 'contacts') addContact(value);
    if (type === 'events') addEvent(value);
    if (type === 'communities') addCommunity(value);
    toast.success(`'${value}' added to ${type}.`);
    setInputs(prev => ({ ...prev, [type]: '' }));
  };
  const handleInputChange = (type: DataType, value: string) => {
    setInputs(prev => ({ ...prev, [type]: value }));
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, type: DataType) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd(type);
    }
  };
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="space-y-4">
        <div>
          <label className="text-lg font-semibold flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-accent" />
            Add a key contact
          </label>
          <div className="flex gap-2">
            <Input
              placeholder="e.g., Jane Doe, AI Researcher"
              value={inputs.contacts}
              onChange={(e) => handleInputChange('contacts', e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, 'contacts')}
            />
            <Button type="button" variant="outline" size="icon" onClick={() => handleAdd('contacts')}><Plus className="w-4 h-4" /></Button>
          </div>
        </div>
        <div>
          <label className="text-lg font-semibold flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-accent" />
            Add an important event
          </label>
          <div className="flex gap-2">
            <Input
              placeholder="e.g., AI Tech Summit 2024"
              value={inputs.events}
              onChange={(e) => handleInputChange('events', e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, 'events')}
            />
            <Button type="button" variant="outline" size="icon" onClick={() => handleAdd('events')}><Plus className="w-4 h-4" /></Button>
          </div>
        </div>
        <div>
          <label className="text-lg font-semibold flex items-center gap-2 mb-2">
            <Building className="w-5 h-5 text-accent" />
            Add a community you're part of
          </label>
          <div className="flex gap-2">
            <Input
              placeholder="e.g., Local Entrepreneurs Group"
              value={inputs.communities}
              onChange={(e) => handleInputChange('communities', e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, 'communities')}
            />
            <Button type="button" variant="outline" size="icon" onClick={() => handleAdd('communities')}><Plus className="w-4 h-4" /></Button>
          </div>
        </div>
      </div>
      <div className="flex justify-between">
        <Button type="button" variant="ghost" onClick={onBack}>Back</Button>
        <Button type="button" size="lg" onClick={onNext}>Next</Button>
      </div>
    </motion.div>
  );
};