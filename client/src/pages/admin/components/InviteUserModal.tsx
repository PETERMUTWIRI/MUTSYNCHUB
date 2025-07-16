import React, { useState } from 'react';
import { createUser } from '../../../api/admin';
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
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { useToast } from '../../../hooks/use-toast';

const InviteUserModal: React.FC = () => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', role: '', org: '' });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs: { [key: string]: string } = {};
    if (!form.name.trim()) errs.name = 'Name is required.';
    if (!form.email.trim()) errs.email = 'Email is required.';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Invalid email format.';
    if (!form.role.trim()) errs.role = 'Role is required.';
    if (!form.org.trim()) errs.org = 'Organization is required.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.id]: e.target.value });
    setErrors({ ...errors, [e.target.id]: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await createUser({
        name: form.name,
        email: form.email,
        role: form.role,
        organization: form.org,
      });
      toast({
        title: 'User invited',
        description: 'The invitation has been sent successfully.',
      });
      setOpen(false);
      setForm({ name: '', email: '', role: '', org: '' });
      setErrors({});
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err?.response?.data?.message || 'Failed to invite user.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Invite User</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invite User</DialogTitle>
          <DialogDescription>
            Enter the user's details to send an invitation.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Name</Label>
            <div className="col-span-3 flex flex-col">
              <Input id="name" value={form.name} onChange={handleChange} disabled={loading} />
              {errors.name && <span className="text-xs text-red-500 mt-1">{errors.name}</span>}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">Email</Label>
            <div className="col-span-3 flex flex-col">
              <Input id="email" type="email" value={form.email} onChange={handleChange} disabled={loading} />
              {errors.email && <span className="text-xs text-red-500 mt-1">{errors.email}</span>}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right">Role</Label>
            <div className="col-span-3 flex flex-col">
              <Input id="role" value={form.role} onChange={handleChange} disabled={loading} />
              {errors.role && <span className="text-xs text-red-500 mt-1">{errors.role}</span>}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="org" className="text-right">Organization</Label>
            <div className="col-span-3 flex flex-col">
              <Input id="org" value={form.org} onChange={handleChange} disabled={loading} />
              {errors.org && <span className="text-xs text-red-500 mt-1">{errors.org}</span>}
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>{loading ? 'Sending...' : 'Send Invitation'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InviteUserModal;
