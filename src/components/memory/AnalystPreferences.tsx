import { useMemory } from '@/lib/MemoryContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { Trash2, Sparkles, X, Brain } from 'lucide-react';
import { toast } from 'sonner';

export function AnalystPreferences() {
  const { analystPreferences, removeAnalystPreference, clearAnalystPreferences } = useMemory();

  const handleClearAll = () => {
    clearAnalystPreferences();
    toast.success('Preferences cleared', {
      description: 'ESA has deleted all learned analytical preferences and query habits.',
    });
  };

  const handleRemove = (idx: number, text: string) => {
    removeAnalystPreference(idx);
    toast.info('Preference removed', {
      description: `Removed learned query habit: "${text.slice(0, 30)}..."`,
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center pb-2 border-b border-border/50">
        <div className="space-y-0.5">
          <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Learned Analyst Habits</h4>
          <p className="text-[11px] text-muted-foreground">
            This represents personalized query memory ESA has learned about your reporting and formatting preferences.
          </p>
        </div>

        {/* Clear all dialog trigger */}
        {analystPreferences.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="inline-flex items-center gap-1.5 py-1.5 px-3 bg-destructive/10 hover:bg-destructive/15 text-destructive border border-destructive/20 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-xs">
                <Trash2 className="w-3.5 h-3.5" />
                Clear All Memory
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-background rounded-2xl shadow-xl p-6 max-w-sm">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-base font-bold text-foreground">
                  Clear Learned Preferences?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-xs text-muted-foreground">
                  This action is irreversible. ESA will forget all query habits, chart styling preferences, and reporting structures it has gathered from your sessions.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="pt-4">
                <AlertDialogCancel className="cursor-pointer text-xs font-semibold py-1.5 px-3">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleClearAll}
                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground cursor-pointer text-xs font-semibold py-1.5 px-4"
                >
                  Clear All
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {/* Preferences List */}
      {analystPreferences.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 border border-dashed border-border/60 rounded-2xl bg-muted/5 text-center p-6 space-y-2">
          <Brain className="w-8 h-8 text-muted-foreground/50" />
          <h5 className="text-xs font-bold text-foreground">Memory is empty</h5>
          <p className="text-[11px] text-muted-foreground max-w-xs leading-relaxed">
            ESA has not gathered any analytical habits yet. Run queries and customize chart visuals to populate workspace memory.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <AnimatePresence initial={false}>
            {analystPreferences.map((pref, idx) => (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                key={pref}
                className="bg-primary/5 border border-primary/10 rounded-xl p-3.5 flex items-start justify-between gap-3 shadow-2xs hover:border-primary/20 transition-all group"
              >
                <div className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span className="text-xs text-foreground font-semibold leading-relaxed">
                    {pref}
                  </span>
                </div>
                <button
                  onClick={() => handleRemove(idx, pref)}
                  className="p-1 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-lg transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
