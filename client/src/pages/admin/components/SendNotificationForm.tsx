import React from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';

const SendNotificationForm: React.FC = () => {
  return (
    <div className="">
      <h2 className="text-lg font-bold text-yellow-200 mb-4">Send Notification</h2>
      <div className="grid gap-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="subject" className="text-right">
            Subject
          </Label>
          <Input id="subject" className="col-span-3" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="message" className="text-right">
            Message
          </Label>
          <Textarea id="message" className="col-span-3" />
        </div>
        <div className="flex justify-end">
          <Button>Send</Button>
        </div>
      </div>
    </div>
  );
};

export default SendNotificationForm;
