import { Module } from '@nestjs/common';
import { AgentController } from './agent.controller';
import { AgentRunnerService } from './agent-runner.service';
import { AnalyticsAgentService } from './analytics-agent.service';
import { GlobalSupportAgentService } from './global-support-agent.service';
import { LlmService } from './llm.service';
import { ClassifierService } from './classifier.service';
import { PlansController } from '../config/plans.controller';
import { TenantContextService } from '../common/services/tenant-context.service';

@Module({
  controllers: [AgentController, PlansController],
  providers: [
    AgentRunnerService,
    AnalyticsAgentService,
    GlobalSupportAgentService,
    LlmService,
    ClassifierService,
    TenantContextService,
  ],
})
export class AgentsModule {}
