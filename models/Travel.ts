import type { IPoint } from "./Map";

export type TravelStep =
  | "define_route"
  | "search_driver"
  | "await_driver"
  | "on_the_way"
  | "cancel";

export interface ITravel {
  id: string;
  price: { amount: number; currency: string };
  step: TravelStep;
  departure: IPoint;
  destination: IPoint;
  distance: number;
  duration: number;
}
