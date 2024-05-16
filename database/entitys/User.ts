import { Entity, Column, BeforeInsert, BeforeUpdate } from "typeorm";
import { Base } from "./Base";
import { Injectable } from "@nestjs/common";

@Injectable()
@Entity()
export class User extends Base {
  @Column({ type: "varchar" })
  phonenumber: string;

  @Column({ type: "jsonb", default: {} })
  details: {
    name: string;
    photo: string;
  };
}
