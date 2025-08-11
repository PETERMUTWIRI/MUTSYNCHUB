import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@Controller("user")
@UseGuards(JwtAuthGuard)
export class UserController {
  @Get("dashboard")
  async dashboard(@Req() req) {
    const userId = req.user.id;
    // Prisma query, ensure scoping to userId
    // Example:
    // const data = await this.prisma.someModel.findMany({ where: { ownerId: userId } });
    return { data: [], userId };
  }
}
