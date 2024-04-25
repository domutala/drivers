import { Column, Entity } from "typeorm";
import { Base } from "./Base";

@Entity({ name: "session" })
export class Session extends Base {
  @Column({ type: "varchar" })
  publicKey: string;

  @Column({ type: "timestamp", nullable: true })
  lastUseAt: Date;

  @Column({ type: "varchar", nullable: true })
  state?: "expired" | "closed";

  @Column({ type: "varchar", nullable: true })
  user?: string;
}
