export class AgentInputDto {
  question: string;
  tenantId?: string;
  userName?: string;
  userRole?: string;
  userId?: string; // Added for context and usage tracking
  jwt?: string;    // Added for context and usage tracking
  // Add more fields as needed for context
}
