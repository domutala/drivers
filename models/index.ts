export interface ISession {
  id: string;
  keys: { public?: string; private?: string };
  status: "tobevalidate" | "expired" | "closed";
  apiPublicKey: string;
  user: IUser;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUser {
  id: string;
  details: {
    name: string;
  };
  preferences: {
    mode: null | "dark" | "light";
    lang: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
