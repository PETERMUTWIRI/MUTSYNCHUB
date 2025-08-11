import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";

@Controller("admin")
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  @Get("stats")
  @Roles("admin", "superadmin")
  async stats(@Req() req) {
    // req.user set by JwtAuthGuard -> NeonAuthStrategy.validate()
    // fetch admin data
    return { ok: true, user: req.user };
  }
}
