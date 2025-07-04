import { Controller, Post, Get, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AnalyticsScheduleService } from './analytics-schedule.service';
import { PrismaService } from '../../infrastructure/persistence/prisma/prisma.service';
import { CreateScheduleDto, UpdateScheduleDto } from './dto/analytics-schedule.dto';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TenantContextService } from '../../common/services/tenant-context.service';
import { AnalyticsAgentService } from '../../agents/analytics-agent.service';

@ApiTags('analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(
    private readonly analyticsScheduleService: AnalyticsScheduleService,
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService, // Inject tenant context
    private readonly analyticsAgent: AnalyticsAgentService, // Inject analytics agent
  ) {}

  @Post('schedule')
  @ApiOperation({ summary: 'Create a new analytics schedule' })
  @ApiResponse({ status: 201, description: 'Schedule created successfully' })
  async createSchedule(@Body() data: CreateScheduleDto) {
    // Frequency limits are enforced in the service
    return this.analyticsScheduleService.createSchedule({
      frequency: data.frequency,
      interval: data.interval,
    });
  }

  @Get('schedule/:orgId')
  @ApiOperation({ summary: 'Get all analytics schedules for an organization' })
  async getSchedules(@Param('orgId') orgId: string) {
    return this.analyticsScheduleService.getSchedules(orgId);
  }

  @Put('schedule/:id')
  @ApiOperation({ summary: 'Update an analytics schedule' })
  async updateSchedule(
    @Param('id') id: string,
    @Body() data: UpdateScheduleDto
  ) {
    return this.analyticsScheduleService.updateSchedule(id, data);
  }

  @Delete('schedule/:id')
  @ApiOperation({ summary: 'Delete an analytics schedule' })
  async deleteSchedule(@Param('id') id: string) {
    return this.analyticsScheduleService.deleteSchedule(id);
  }

  @Post('query')
  @ApiOperation({ summary: 'Process natural language analytics query' })
  @ApiResponse({ status: 200, description: 'Query processed successfully' })
  async processQuery(@Body() queryDto: AnalyticsQueryDto) {
    // Only fetch from stored reports, do not invoke agent or run new analytics
    const orgId = this.tenantContext.getTenantId() || queryDto.orgId;
    // Optionally filter by datasetId or query string
    const where: any = { orgId, type: 'query' };
    if (queryDto.datasetId) where['config'] = { path: ['datasetId'], equals: queryDto.datasetId };
    if (queryDto.query) where['description'] = { contains: queryDto.query };
    const reports = await this.prisma.analyticsReport.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return { reports };
  }

  @Get('query/history/:orgId')
  @ApiOperation({ summary: 'Get history of analytics queries' })
  async getQueryHistory(@Param('orgId') orgId: string) {
    return this.prisma.analyticsReport.findMany({
      where: { 
        orgId,
        type: 'query',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  @Get('supported-options')
  async getSupportedOptions() {
    // If you want to keep this endpoint, fetch options directly from the database or config
    // Example: return supported industries/types from config or a static list
    return {
      industries: ['retail', 'finance', 'healthcare', 'manufacturing'],
      types: ['automated_eda', 'forecasting', 'full_analysis', 'comprehensive']
    };
  }
}
