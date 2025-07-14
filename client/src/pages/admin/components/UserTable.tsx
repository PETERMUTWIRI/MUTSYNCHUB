import React, { useEffect, useState } from 'react';
import { getUsers } from '../../../api/admin';
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
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const usersPerPage = 10;

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
    <div
      className="col-span-1 md:col-span-5 rounded-2xl shadow-xl flex flex-col"
      style={{
        background: '#1A1A2E',
        padding: 32,
      }}
    >
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
      <div className="flex-1 overflow-y-auto bg-[#232347] rounded-lg">
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
                    <Button variant="ghost" size="sm">Edit</Button>
                    <Button variant="ghost" size="sm" className="text-red-500">Delete</Button>
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
    </div>
  );
};

export default UserTable;
