import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { StackAuthGuard } from "../modules/auth/stack-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";

@Controller("admin")
@UseGuards(StackAuthGuard, RolesGuard)
export class AdminController {
  @Get("stats")
  @Roles("admin", "superadmin")
  async stats(@Req() req) {
    // req.user set by JwtAuthGuard -> NeonAuthStrategy.validate()
    // fetch admin data
    return { ok: true, user: req.user };
  }
}
