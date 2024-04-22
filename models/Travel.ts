export interface ITravel {
  id: string;
  distance: number;
  time: number;
  price: number;
  step:
    | "define_route"
    | "search_driver"
    | "await_driver"
    | "on_the_way"
    | "cancel";

  accepts: {
    price: number;
    id: string;
    distance: number;
    time: number;
    position: { lat: number; lng: number };
    accepted: boolean;
  }[];
  from: { lat: number; lng: number };
  to: { lat: number; lng: number };
}
