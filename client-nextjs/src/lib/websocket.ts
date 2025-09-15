import { io } from "socket.io-client";
const socket = io(`${process.env.NEXT_PUBLIC_ORIGIN}/analytics`);
export const DataGateway = {
  async broadcastToOrg(orgId: string, event: string, payload: any) {
    socket.emit("broadcast", { orgId, event, payload });
  },
};
