import { Injectable } from '@nestjs/common';
import { AgentInputDto } from './dto/agent-input.dto';
import { LlmService } from './llm.service';

@Injectable()
export class ClassifierService {
  constructor(private readonly llm: LlmService) {}

  async classify(question: string, input: AgentInputDto): Promise<'analytics' | 'global_support'> {
    const systemPrompt = `You are a smart intent classifier for a multi-tenant analytics SaaS platform.\nRespond ONLY with one of: analytics, global_support.\nUse analytics if the question involves reports, forecasts, data sync, performance, or metrics.\nUse global_support for pricing, onboarding, or general platform questions.`;
    const context = { systemPrompt };
    const result = await this.llm.callLLM(question, context);
    if (result.toLowerCase().includes('analytics')) return 'analytics';
    return 'global_support';
  }
}
