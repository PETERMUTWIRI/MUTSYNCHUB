import { Controller, Get } from '@nestjs/common';
import { PLANS } from './plans.config';

@Controller('api/plans')
export class PlansController {
  @Get()
  getPlans() {
    return PLANS;
  }
}
