import React, { useEffect, useState } from 'react';
import { getUsers } from '../../../api/admin';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getUsers();
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div
      className="col-span-1 md:col-span-5 rounded-2xl shadow-xl flex flex-col"
      style={{
        background: '#1A1A2E',
        padding: 32,
        minHeight: 340,
      }}
    >
      <div className="text-lg font-bold text-gray-200 mb-2">
        User Management
      </div>
      <input
        className="w-full rounded-lg bg-[#232347] px-4 py-3 text-gray-100 placeholder:text-gray-400 mb-4 focus:outline-none"
        placeholder="Search or add users..."
      />
      <div
        className="flex-1 overflow-y-auto bg-[#232347] rounded-lg p-4 text-gray-300 mb-4"
        style={{ minHeight: 120 }}
      >
        <ul>
          {users.map((user) => (
            <li key={user.id} className="text-gray-400">
              {user.email} - {user.role}
            </li>
          ))}
        </ul>
      </div>
      <a
        href="#"
        className="text-sm text-[var(--accent-amber,#FFA500)] hover:underline font-semibold mt-auto"
      >
        Manage All Users
      </a>
    </div>
  );
};

export default UserManagement;
