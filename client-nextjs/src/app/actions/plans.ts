'use server';

export type PlanFeature = {
  name: string;
  description: string;
  limit?: number;
  allowedFrequencies?: string[];
};

export type Plan = {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  features: PlanFeature[];
};

const PLAN_UUIDS = {
  free: '088c6a32-7840-4188-bc1a-bdc0c6bee723',
  pro: 'e4bee2d2-028b-48e0-9673-8fff0b3c5cf4',
  enterprise: '95e7e49f-da3f-4a6f-ac97-ff081353d55f',
} as const;

export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Basic access for individuals and small teams.',
    price: 0,
    currency: 'KSH',
    features: [
      { name: 'Agent Queries', description: 'Monthly queries to the agent', limit: 15 },
      { name: 'Scheduling', description: 'Number of scheduled reports', limit: 2, allowedFrequencies: ['weekly'] },
      { name: 'Analytics', description: 'Basic analytics dashboard' },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For growing teams and businesses.',
    price: 3000,
    currency: 'KSH',
    features: [
      { name: 'Agent Queries', description: 'Monthly queries to the agent', limit: 500 },
      { name: 'Scheduling', description: 'Number of scheduled reports', limit: 20, allowedFrequencies: ['daily', 'weekly'] },
      { name: 'Analytics', description: 'Advanced analytics dashboard' },
      { name: 'Priority Support', description: 'Faster support response' },
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Custom solutions for large organizations.',
    price: 10000,
    currency: 'KSH',
    features: [
      { name: 'Agent Queries', description: 'Monthly queries to the agent', limit: 5000 },
      { name: 'Scheduling', description: 'Number of scheduled reports', limit: 100, allowedFrequencies: ['hourly', 'daily', 'weekly', 'monthly', 'custom'] },
      { name: 'Analytics', description: 'Full analytics suite' },
      { name: 'Priority Support', description: '24/7 support' },
      { name: 'Custom Integrations', description: 'Integrate with your stack' },
    ],
  },
];

export async function getPlans() {
  return PLANS;
}

export async function getPlanUuid(planId: string): string {
  return PLAN_UUIDS[planId as keyof typeof PLAN_UUIDS] ?? planId;
}
