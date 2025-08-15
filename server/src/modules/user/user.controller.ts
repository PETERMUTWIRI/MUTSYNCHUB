
import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req, Request } from '@nestjs/common';
import { UserService } from './user.service';
import { StackAuthGuard } from '../auth/stack-auth.guard';

// Replace enums with string literals since they're no longer Prisma enums
type UserRole = 'USER' | 'ADMIN' | 'SUPER_ADMIN';
type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

@Controller('users')
@UseGuards(StackAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}
  // Stack sync endpoint
  @Get('sync')
  async syncUser(@Request() req) {
    const user = await this.userService.findOrCreateFromSupabase(req.user);
    return { user };
  }

  @Get(':id')
  async getUser(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @Post()
  async createUser(
    @Body() data: { email: string; password: string; firstName?: string; lastName?: string; orgId: string; role?: UserRole },
    @Req() req
  ) {
    const userId = req.user?.id;
    const orgId = req.user?.orgId || data.orgId;
    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'];
    return this.userService.create({ ...data, userId, orgId, ipAddress, userAgent });
  }

  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() data: { firstName?: string; lastName?: string; status?: UserStatus; role?: UserRole },
    @Req() req
  ) {
    const userId = req.user?.id;
    const orgId = req.user?.orgId;
    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'];
    return this.userService.update(id, { ...data, userId, orgId, ipAddress, userAgent });
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string, @Req() req) {
    const userId = req.user?.id;
    const orgId = req.user?.orgId;
    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'];
    return this.userService.delete(id, { userId, orgId, ipAddress, userAgent });
  }
}
