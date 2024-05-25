import { Entity, Column, BeforeInsert, BeforeUpdate } from "typeorm";
import { Base } from "./Base";
import { Injectable } from "@nestjs/common";

@Injectable()
@Entity()
export class Travel extends Base {
  @Column({ type: "text", default: "define_route" })
  step:
    | "define_route"
    | "search_driver"
    | "await_driver"
    | "on_the_way"
    | "cancel";

  @Column({ type: "jsonb" })
  departure: { lat: number; lng: number; place: string; name?: string };

  @Column({ type: "jsonb" })
  destination: { lat: number; lng: number; place: string; name?: string };

  @Column({ type: "float" })
  distance: number;

  @Column({ type: "float" })
  duration: number;

  @Column({ type: "jsonb" })
  price: { amount: number; currency: string };

  /**@deprecated */
  @Column({ type: "jsonb", default: [] })
  accepts: {
    id: string;
    price: number;
    distance: string;
    time: string;
    accepted?: boolean;
    date: Date;
    position: { lat: number; lng: number };
  }[];

  // /** user id */
  // @Column({ type: "text" })
  // traveller: string;
}
