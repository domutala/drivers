import { Column, Entity } from "typeorm";
import { Base } from "./Base";

@Entity({ name: "fyle" })
export class Fyle extends Base {
  @Column({ type: "varchar", array: true, default: "{}" })
  access: string[];

  @Column({ type: 'varchar' })
  type: string;
}
