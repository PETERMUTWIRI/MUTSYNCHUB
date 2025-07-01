import { Injectable } from '@nestjs/common';
import { AgentInputDto } from './dto/agent-input.dto';
import { LlmService } from './llm.service';

@Injectable()
export class GlobalSupportAgentService {
  constructor(private readonly llm: LlmService) {}

  async answer(input: AgentInputDto) {
    const systemPrompt = `You are a helpful assistant for a data analytics SaaS platform.\nYou answer general platform-related questions such as onboarding, pricing, integrations, and support.\nYou do not access or mention tenant-specific data. If the user asks about analytics, respond: You need to be logged in to access your analytics data.`;
    const context = { systemPrompt };
    const response = await this.llm.callLLM(input.question, context);
    return { role: 'assistant', message: response };
  }
}
