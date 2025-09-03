import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Textarea } from '../../../components/ui/textarea';
import { Label } from '../../../components/ui/label';

interface RespondToTicketModalProps {
  ticket: any;
}

const RespondToTicketModal: React.FC<RespondToTicketModalProps> = ({ ticket }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">View</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Respond to Ticket</DialogTitle>
          <DialogDescription>
            Respond to the support ticket from {ticket.userId}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="message" className="text-right">
              Message
            </Label>
            <Textarea id="message" className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Send Response</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RespondToTicketModal;
