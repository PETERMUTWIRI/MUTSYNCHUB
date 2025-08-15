import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { EnrichedUserProfile } from '../../../types/user.types';

export const CurrentUser = createParamDecorator(
  (data: keyof EnrichedUserProfile | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as EnrichedUserProfile;

    return data ? user?.[data] : user;
  },
);
