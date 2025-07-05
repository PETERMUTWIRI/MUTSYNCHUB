// This file maps plan string IDs to their UUIDs in the database.
export const PLAN_UUIDS = {
  free: '088c6a32-7840-4188-bc1a-bdc0c6bee723',
  pro: 'e4bee2d2-028b-48e0-9673-8fff0b3c5cf4',
  enterprise: '95e7e49f-da3f-4a6f-ac97-ff081353d55f',
};

export type PlanStringId = keyof typeof PLAN_UUIDS;

export function getPlanUuid(planId: string): string {
  return PLAN_UUIDS[planId as PlanStringId] || planId;
}
