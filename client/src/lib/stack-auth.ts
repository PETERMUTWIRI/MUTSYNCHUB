import { StackAuth } from '@stack-auth/react';

const projectId = import.meta.env.VITE_STACK_PROJECT_ID!;
const clientKey = import.meta.env.VITE_STACK_PUBLISHABLE_CLIENT_KEY!;

export const stackAuth = new StackAuth({
  projectId: projectId,
  publishableKey: clientKey,
});
