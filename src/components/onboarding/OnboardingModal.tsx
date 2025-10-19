import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AnimatePresence } from 'framer-motion';
import { StepProfile } from './StepProfile';
import { StepEcosystem } from './StepEcosystem';
import { StepFinish } from './StepFinish';
import { Progress } from '@/components/ui/progress';
interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}
const steps = [
  { id: 1, title: "Create Your Profile", description: "Let's start with the basics. This helps CYNQ understand your context." },
  { id: 2, title: "Build Your Ecosystem", description: "Add a few key data points. You can always add more later." },
  { id: 3, title: "Ready to Go!", description: "Your personalized AI consultant is ready." },
];
export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, steps.length));
  const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 1));
  const activeStep = steps[currentStep - 1];
  const progressValue = (currentStep / steps.length) * 100;
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg p-8" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader className="text-center mb-4">
          <DialogTitle className="text-2xl font-display">{activeStep.title}</DialogTitle>
          <DialogDescription>{activeStep.description}</DialogDescription>
        </DialogHeader>
        <Progress value={progressValue} className="w-full mb-8" />
        <div className="min-h-[320px]">
          <AnimatePresence mode="wait">
            {currentStep === 1 && <StepProfile key="step1" onNext={handleNext} />}
            {currentStep === 2 && <StepEcosystem key="step2" onNext={handleNext} onBack={handleBack} />}
            {currentStep === 3 && <StepFinish key="step3" onFinish={onClose} />}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
};