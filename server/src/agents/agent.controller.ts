import { Controller, Post, Body } from '@nestjs/common';
import { AgentInputDto } from './dto/agent-input.dto';
import { AgentRunnerService } from './agent-runner.service';

@Controller('agent')
export class AgentController {
  constructor(private readonly agentRunner: AgentRunnerService) {}

  @Post('ask')
  async askAgent(@Body() input: AgentInputDto) {
    return this.agentRunner.handleQuestion(input);
  }
}
