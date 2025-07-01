export type PlanFeature = {
  name: string;
  description: string;
  limit?: number;
};

export type Plan = {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  features: PlanFeature[];
};

export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Basic access for individuals and small teams.',
    price: 0,
    currency: 'USD',
    features: [
      { name: 'Agent Queries', description: 'Monthly queries to the agent', limit: 15 },
      { name: 'Scheduling', description: 'Number of scheduled reports', limit: 2 },
      { name: 'Analytics', description: 'Basic analytics dashboard' },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For growing teams and businesses.',
    price: 29,
    currency: 'USD',
    features: [
      { name: 'Agent Queries', description: 'Monthly queries to the agent', limit: 500 },
      { name: 'Scheduling', description: 'Number of scheduled reports', limit: 20 },
      { name: 'Analytics', description: 'Advanced analytics dashboard' },
      { name: 'Priority Support', description: 'Faster support response' },
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Custom solutions for large organizations.',
    price: 99,
    currency: 'USD',
    features: [
      { name: 'Agent Queries', description: 'Monthly queries to the agent', limit: 5000 },
      { name: 'Scheduling', description: 'Number of scheduled reports', limit: 100 },
      { name: 'Analytics', description: 'Full analytics suite' },
      { name: 'Priority Support', description: '24/7 support' },
      { name: 'Custom Integrations', description: 'Integrate with your stack' },
    ],
  },
];
