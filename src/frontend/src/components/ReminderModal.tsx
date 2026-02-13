import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';

interface ReminderModalProps {
  open: boolean;
  reminder: {
    id: string;
    note: string;
    date: string;
    time: string;
  } | null;
  onDismiss: () => void;
  onDelete: () => void;
}

export default function ReminderModal({ open, reminder, onDismiss, onDelete }: ReminderModalProps) {
  if (!reminder) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onDismiss()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-full">
              <Bell className="w-5 h-5 text-amber-600 dark:text-amber-500" />
            </div>
            <DialogTitle>Reminder</DialogTitle>
          </div>
          <DialogDescription>
            {reminder.date} at {reminder.time}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-base">{reminder.note}</p>
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onDismiss} className="flex-1">
            Dismiss
          </Button>
          <Button variant="destructive" onClick={onDelete} className="flex-1">
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
