import { Column, Entity } from "typeorm";
import { Base } from "./Base";
import { User } from "./User";

@Entity({ name: "session" })
export class Session extends Base {
  @Column({ type: "varchar" })
  publicKey: string;

  @Column({ type: "timestamp", nullable: true })
  lastUseAt: Date;

  @Column({ type: "varchar", default: "inited", nullable: true })
  state: "inited" | "valid" | "expired" | "closed";

  @Column({ type: "varchar", nullable: true })
  status: "valid" | "tobevalidate" | "expired" | "closed";

  @Column({ type: "text", array: true, nullable: true })
  validationCode: string[];

  @Column({ type: "varchar", nullable: true })
  user?: string;

  _user?: User;
}
