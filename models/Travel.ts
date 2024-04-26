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
    awaitTime: number;
  }[];
  from: { lat: number; lng: number; name?: string };
  to: { lat: number; lng: number; name?: string };
}

export interface ITravel2 {
  points: {
    departure: { lat: number; lng: number; name?: string; place: string };
    destination: { lat: number; lng: number; name?: string; place: string };
  };
  distance: number;
  duration: number;
  price: { amount: number; currency: string };
}
