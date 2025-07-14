import React from 'react';

const UserManagementPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto py-12">
      <h1 className="text-4xl font-bold text-white mb-8">User Management</h1>
      {/* The UserTable component will be rendered here by the router */}
    </div>
  );
};

export default UserManagementPage;
