import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useUserProfileStore } from '@/stores/userProfileStore';
import { useEcosystemStore } from '@/stores/ecosystemStore';
import { toast } from 'sonner';
import { Upload, Loader, Check, Camera } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { QrScanner } from '@/components/snapshot/QrScanner';
import { useIsMobile } from '@/hooks/use-mobile';
const snapshotSchema = z.object({
  profile: z.object({
    goals: z.string().optional(),
    interests: z.array(z.string()).optional(),
    background: z.string().optional(),
  }).optional(),
  ecosystem: z.object({
    contacts: z.array(z.string()).optional(),
    events: z.array(z.string()).optional(),
    communities: z.array(z.string()).optional(),
    organizations: z.array(z.string()).optional(),
    skills: z.array(z.string()).optional(),
    projects: z.array(z.string()).optional(),
    knowledge: z.array(z.object({ name: z.string(), url: z.string().optional() })).optional(),
  }).optional(),
  generatedAt: z.string().datetime(),
});
const importFormSchema = z.object({
  snapshotJson: z.string().min(1, "Snapshot data cannot be empty.").refine((data) => {
    try {
      const parsed = JSON.parse(data);
      snapshotSchema.parse(parsed);
      return true;
    } catch (error) {
      return false;
    }
  }, {
    message: "Invalid snapshot data. Please paste the exact JSON from the QR code.",
  }),
});
type ImportFormValues = z.infer<typeof importFormSchema>;
type ImportStatus = 'idle' | 'importing' | 'imported';
export function ImportSnapshotPage() {
  const navigate = useNavigate();
  const importProfile = useUserProfileStore((state) => state.importProfile);
  const importEcosystem = useEcosystemStore((state) => state.importEcosystem);
  const [importStatus, setImportStatus] = useState<ImportStatus>('idle');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const isMobile = useIsMobile();
  const form = useForm<ImportFormValues>({
    resolver: zodResolver(importFormSchema),
    defaultValues: {
      snapshotJson: "",
    },
  });
  const onSubmit = (data: ImportFormValues) => {
    setImportStatus('importing');
    try {
      const snapshot = JSON.parse(data.snapshotJson);
      let totalImported = 0;
      let importedTypes: string[] = [];
      if (snapshot.profile) {
        importProfile(snapshot.profile);
        if (snapshot.profile.goals || (snapshot.profile.interests && snapshot.profile.interests.length > 0) || snapshot.profile.background) {
          importedTypes.push('you');
        }
      }
      if (snapshot.ecosystem) {
        const result = importEcosystem({
          contacts: snapshot.ecosystem.contacts?.map((name: string) => ({ name })) || [],
          events: snapshot.ecosystem.events?.map((name: string) => ({ name })) || [],
          communities: snapshot.ecosystem.communities?.map((name: string) => ({ name })) || [],
          organizations: snapshot.ecosystem.organizations?.map((name: string) => ({ name })) || [],
          skills: snapshot.ecosystem.skills?.map((name: string) => ({ name })) || [],
          projects: snapshot.ecosystem.projects?.map((name: string) => ({ name })) || [],
          knowledge: snapshot.ecosystem.knowledge || [],
        });
        totalImported = Object.values(result.importedCounts).reduce((sum: number, count: number) => sum + count, 0);
        importedTypes = [...new Set([...importedTypes, ...result.importedTypes])];
      }
      toast.success("Snapshot imported successfully!", {
        description: `${totalImported} new items were added to your ecosystem. Profile data has been merged.`,
      });
      setImportStatus('imported');
      form.reset();
      navigate('/ecosystem', { state: { highlightedNodes: importedTypes } });
    } catch (error) {
      toast.error("Import failed.", {
        description: "There was an error processing the snapshot data.",
      });
      setImportStatus('idle');
    }
  };
  const handleScan = (result: string) => {
    setIsScannerOpen(false);
    form.setValue('snapshotJson', result);
    toast.success("QR Code Scanned!", {
      description: "Snapshot data has been populated. Click 'Import Data' to continue.",
    });
    // Automatically trigger form submission
    form.handleSubmit(onSubmit)();
  };
  const handleScanError = (error: any) => {
    console.error('QR Scan Error:', error);
    toast.error("QR Scan Failed", {
      description: error?.message || "Could not scan the QR code. Please check camera permissions and try again.",
    });
    setIsScannerOpen(false);
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex-1 p-6 sm:p-8 lg:p-10 overflow-y-auto"
    >
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-display flex items-center gap-3">
            <Upload className="w-8 h-8 text-primary" />
            Import CYNQ Snapshot
          </CardTitle>
          <CardDescription className="text-lg">
            Paste the JSON data from a scanned QR code or scan it directly to merge another user's ecosystem data with your own.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="snapshotJson"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold">Snapshot Data</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Paste the JSON content here, or use the scanner...'
                        className="min-h-[200px] text-sm font-mono bg-muted"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex flex-col sm:flex-row justify-end gap-2">
                {isMobile && (
                  <Dialog open={isScannerOpen} onOpenChange={setIsScannerOpen}>
                    <DialogTrigger asChild>
                      <Button type="button" variant="outline" size="lg">
                        <Camera className="w-4 h-4 mr-2" />
                        Scan QR Code
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="p-0 max-w-md">
                      <DialogHeader className="p-4 pb-0">
                        <DialogTitle>Scan Snapshot QR Code</DialogTitle>
                        <DialogDescription>Point your camera at a QR code to automatically import the snapshot data.</DialogDescription>
                      </DialogHeader>
                      <QrScanner onScan={handleScan} onError={handleScanError} />
                    </DialogContent>
                  </Dialog>
                )}
                <Button type="submit" size="lg" className="font-bold w-full sm:w-48" disabled={importStatus === 'importing'}>
                  {importStatus === 'idle' && 'Import Data'}
                  {importStatus === 'importing' && <><Loader className="w-4 h-4 mr-2 animate-spin" /> Importing...</>}
                  {importStatus === 'imported' && <><Check className="w-4 h-4 mr-2" /> Imported!</>}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </motion.div>
  );
}