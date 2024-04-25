import { Session } from "database/entitys/Session";
import { User } from "database/entitys/User";
import { Server, Socket } from "socket.io";
import { IncomingMessage } from "http";

interface SessionRequest extends Session {
  _user?: User;
  position: { lat: number; lng: number };
}

type Newable<T> = new (...args: any[]) => T;

export declare global {
  namespace Express {
    interface Request {
      module: { name: string; function: (params: any) => any };
      session: SessionRequest;
    }
  }
}

declare module "http" {
  interface IncomingMessage {
    session: SessionRequest;
  }
}
