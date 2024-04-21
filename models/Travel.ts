export interface ITravel {
  id: string;
  distance: number;
  time: number;
  price: number;
  step:
    | "define_route"
    | "driver_search"
    | "await_driver"
    | "on_the_way"
    | "cancel";

  accepts: { price: number; id: string; distance: number; time: number }[];
  from: { lat: number; lng: number };
  to: { lat: number; lng: number };
}
