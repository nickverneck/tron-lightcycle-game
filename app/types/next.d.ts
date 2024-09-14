import { Server as HTTPServer } from 'http';
import { Socket } from 'net';
import { Server as IOServer } from 'socket.io';

declare module 'next' {
  interface NextApiResponseServerIO extends NextApiResponse {
    socket: Socket & {
      server: HTTPServer & {
        io: IOServer;
      };
    };
  }
}