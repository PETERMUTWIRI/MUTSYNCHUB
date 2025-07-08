import api from '../lib/api';


export const login = async (email: string, password: string) => {
  return api.post('/api/auth/login', { email, password });
};

export const register = async (data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  organizationName: string;
  subdomain: string;
}) => {
  return api.post('/api/auth/register', data);
};
