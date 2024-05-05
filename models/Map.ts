interface IMapRoute {
  geojson: {
    type: string;
    features: {
      type: string;
      properties: any;
      geometry: [number, number][];
    }[];
  };
  meta: {
    coordinates: [number, number][];
    distance: number;
    duration: number;
    price: { amount: number; traveller: 0, driver: 0, currency: string };
    bounds: [[number, number], [number, number]];
  };
}
