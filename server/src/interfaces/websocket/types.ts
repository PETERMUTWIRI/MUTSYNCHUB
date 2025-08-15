// Extend the Socket.IO types to include our custom properties
import { StackAuthUser } from '../../common/interfaces/stack-auth.interface';

declare module 'socket.io' {
  interface Handshake {
    user?: StackAuthUser;
  }
}

export interface WsClient {
  id: string;
  orgId: string;
  userId: string;
  connectionTime: Date;
  stackAuthToken?: string;
}
