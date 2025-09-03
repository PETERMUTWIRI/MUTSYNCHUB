import React, { useEffect, useState } from 'react';
import { useToast } from '../../../hooks/use-toast';
import { getUsers, updateUser, deleteUser } from '../../../api/admin';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import InviteUserModal from './InviteUserModal';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { DatePicker } from '../../../components/ui/datepicker';
import { Checkbox } from '../../../components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';

const UserTable: React.FC = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const usersPerPage = 10;
  const [editModal, setEditModal] = useState<{ open: boolean; user: any | null }>({ open: false, user: null });
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; user: any | null }>({ open: false, user: null });
  const [editForm, setEditForm] = useState<any>({});
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getUsers();
        setUsers(response.data);
        setFilteredUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    let filtered = users;

    if (search) {
      const lowercasedSearch = search.toLowerCase();
      filtered = filtered.filter((user) =>
        user.email.toLowerCase().includes(lowercasedSearch) ||
        (user.firstName && user.firstName.toLowerCase().includes(lowercasedSearch)) ||
        (user.lastName && user.lastName.toLowerCase().includes(lowercasedSearch))
      );
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((user) => user.status === statusFilter);
    }

    if (dateFilter) {
      filtered = filtered.filter((user) =>
        new Date(user.createdAt).toLocaleDateString() === dateFilter.toLocaleDateString()
      );
    }

    setFilteredUsers(filtered);
    setPage(1);
  }, [search, users, roleFilter, statusFilter, dateFilter]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const paginatedUsers = filteredUsers.slice(
    (page - 1) * usersPerPage,
    page * usersPerPage
  );

  return (
    <div className="flex-1 min-h-[500px] flex flex-col rounded-2xl shadow-2xl bg-gradient-to-br from-cyan-900 to-blue-950 mt-2">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-lg font-bold text-gray-200">User Management</h2>
      <InviteUserModal />
    </div>
    <div className="flex justify-between items-center mb-4">
      <Input
        placeholder="Search users..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />
      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" disabled={selectedUsers.length === 0}>
              Bulk Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Assign Role</DropdownMenuItem>
            <DropdownMenuItem>Delete</DropdownMenuItem>
            <DropdownMenuItem>Activate</DropdownMenuItem>
            <DropdownMenuItem>Deactivate</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Select onValueChange={(value) => setRoleFilter(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
            <SelectItem value="USER">User</SelectItem>
            <SelectItem value="MANAGER">Manager</SelectItem>
            <SelectItem value="READONLY">Read-Only</SelectItem>
          </SelectContent>
        </Select>
        <Select onValueChange={(value) => setStatusFilter(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="INACTIVE">Inactive</SelectItem>
            <SelectItem value="SUSPENDED">Suspended</SelectItem>
          </SelectContent>
        </Select>
        <DatePicker
          date={dateFilter}
          onDateChange={setDateFilter}
          placeholder="Filter by join date"
        />
      </div>
    </div>
    <div className="flex-1 overflow-y-auto bg-gradient-to-br from-cyan-800 to-blue-900 rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Checkbox
                checked={selectedUsers.length === paginatedUsers.length && paginatedUsers.length > 0}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedUsers(paginatedUsers.map((user) => user.id));
                  } else {
                    setSelectedUsers([]);
                  }
                }}
              />
            </TableHead>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Joined Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedUsers.length > 0 ? (
            paginatedUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedUsers.includes(user.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedUsers([...selectedUsers, user.id]);
                      } else {
                        setSelectedUsers(selectedUsers.filter((id) => id !== user.id));
                      }
                    }}
                  />
                </TableCell>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.firstName} {user.lastName}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>{user.status}</TableCell>
                <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" onClick={() => {
                    setEditModal({ open: true, user });
                    setEditForm({
                      firstName: user.firstName || '',
                      lastName: user.lastName || '',
                      email: user.email || '',
                      role: user.role || '',
                      status: user.status || '',
                    });
                    setEditError(null);
                  }}>Edit</Button>
                  <Button variant="ghost" size="sm" className="text-red-500" onClick={() => {
                    setDeleteModal({ open: true, user });
                    setDeleteError(null);
                  }}>Delete</Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="text-center">
                No users found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
    <div className="flex justify-end items-center mt-4">
      <Button
        onClick={() => handlePageChange(page - 1)}
        disabled={page === 1}
        variant="outline"
      >
        Previous
      </Button>
      <span className="mx-4 text-gray-200">
        Page {page} of {Math.ceil(filteredUsers.length / usersPerPage)}
      </span>
      <Button
        onClick={() => handlePageChange(page + 1)}
        disabled={page * usersPerPage >= filteredUsers.length}
        variant="outline"
      >
        Next
      </Button>
    </div>
    {/* Edit User Modal */}
    {editModal.open && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-[#232347] rounded-xl p-8 w-full max-w-md shadow-2xl">
          <h3 className="text-xl font-bold mb-4 text-white">Edit User</h3>
          <form onSubmit={async (e) => {
            e.preventDefault();
            setEditLoading(true);
            setEditError(null);
            try {
              await updateUser(editModal.user.id, editForm);
              setEditModal({ open: false, user: null });
              // Refresh users
              const response = await getUsers();
              setUsers(response.data);
              setFilteredUsers(response.data);
              toast({ title: 'User updated', description: 'User details updated successfully.' });
            } catch (err: any) {
              setEditError(err?.response?.data?.message || 'Failed to update user.');
              toast({ title: 'Update failed', description: err?.response?.data?.message || 'Failed to update user.' });
            } finally {
              setEditLoading(false);
            }
          }} className="grid gap-4">
            <input
              className="rounded px-2 py-1 bg-[#232347] text-gray-200 border border-[#282A36]"
              placeholder="First Name"
              value={editForm.firstName}
              onChange={e => setEditForm({ ...editForm, firstName: e.target.value })}
              disabled={editLoading}
            />
            <input
              className="rounded px-2 py-1 bg-[#232347] text-gray-200 border border-[#282A36]"
              placeholder="Last Name"
              value={editForm.lastName}
              onChange={e => setEditForm({ ...editForm, lastName: e.target.value })}
              disabled={editLoading}
            />
            <input
              className="rounded px-2 py-1 bg-[#232347] text-gray-200 border border-[#282A36]"
              placeholder="Email"
              value={editForm.email}
              onChange={e => setEditForm({ ...editForm, email: e.target.value })}
              disabled={editLoading}
            />
            <select
              className="rounded px-2 py-1 bg-[#232347] text-gray-200 border border-[#282A36]"
              value={editForm.role}
              onChange={e => setEditForm({ ...editForm, role: e.target.value })}
              disabled={editLoading}
            >
              <option value="ADMIN">Admin</option>
              <option value="USER">User</option>
              <option value="MANAGER">Manager</option>
              <option value="READONLY">Read-Only</option>
            </select>
            <select
              className="rounded px-2 py-1 bg-[#232347] text-gray-200 border border-[#282A36]"
              value={editForm.status}
              onChange={e => setEditForm({ ...editForm, status: e.target.value })}
              disabled={editLoading}
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
            {editError && <span className="text-xs text-red-500">{editError}</span>}
            <div className="flex gap-2 mt-2">
              <Button type="submit" disabled={editLoading}>{editLoading ? 'Saving...' : 'Save'}</Button>
              <Button variant="outline" onClick={() => setEditModal({ open: false, user: null })}>Cancel</Button>
            </div>
          </form>
        </div>
      </div>
    )}
    {/* Delete User Modal */}
    {deleteModal.open && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-[#232347] rounded-xl p-8 w-full max-w-md shadow-2xl">
          <h3 className="text-xl font-bold mb-4 text-white">Delete User</h3>
          <p className="mb-4 text-gray-300">Are you sure you want to delete user <span className="font-bold">{deleteModal.user.email}</span>?</p>
          {deleteError && <span className="text-xs text-red-500 mb-2">{deleteError}</span>}
          <div className="flex gap-2 mt-2">
            <Button
              variant="destructive"
              disabled={deleteLoading}
              onClick={async () => {
                setDeleteLoading(true);
                setDeleteError(null);
                try {
                  await deleteUser(deleteModal.user.id);
                  setDeleteModal({ open: false, user: null });
                  // Refresh users
                  const response = await getUsers();
                  setUsers(response.data);
                  setFilteredUsers(response.data);
                  toast({ title: 'User deleted', description: 'User deleted successfully.' });
                } catch (err: any) {
                  setDeleteError(err?.response?.data?.message || 'Failed to delete user.');
                  toast({ title: 'Delete failed', description: err?.response?.data?.message || 'Failed to delete user.' });
                } finally {
                  setDeleteLoading(false);
                }
              }}
            >{deleteLoading ? 'Deleting...' : 'Delete'}</Button>
            <Button variant="outline" onClick={() => setDeleteModal({ open: false, user: null })}>Cancel</Button>
          </div>
        </div>
      </div>
    )}
  </div>
  );
}
export default UserTable;
