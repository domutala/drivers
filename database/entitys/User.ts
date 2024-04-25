import { Entity, Column, BeforeInsert, BeforeUpdate } from "typeorm";
import { Base } from "./Base";
import { Injectable } from "@nestjs/common";

@Injectable()
@Entity()
export class User extends Base {
  /**
   * Liste des mots de passe. Le dernier de la liste
   * est le mot de passe actuel
   * */
  @Column({ type: "text", array: true, default: "{}" })
  passwords: (string | string[])[];

  /** id d'un employé */
  @Column({ type: "varchar" })
  username: string;

  @Column({ type: "text", array: true, default: "{}" })
  accounts: string[];

  @Column({ type: "text", array: true, default: "{}" })
  creditCards: string[];
}
