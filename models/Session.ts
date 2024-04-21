export interface ISession {
  id: string;
  keys: { public?: string; private?: string };
  apiPublicKey: string;
  user: any;
  createdAt: Date;
  updatedAt: Date;
}
