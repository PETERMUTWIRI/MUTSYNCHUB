import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';

interface ViewLogDetailsModalProps {
  log: any;
}

const ViewLogDetailsModal: React.FC<ViewLogDetailsModalProps> = ({ log }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">View</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Audit Log Details</DialogTitle>
          <DialogDescription>
            Full details of the audit log entry.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <pre>{JSON.stringify(log, null, 2)}</pre>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewLogDetailsModal;
