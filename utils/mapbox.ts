import Axios from "axios";

export default {
  async route(params: {
    departure: { lat: number; lng: number };
    destination: { lat: number; lng: number };
  }) {
    const coords = `${params.departure.lng},${params.departure.lat};${params.destination.lng},${params.destination.lat}`;

    const response = await Axios.get(
      `https://api.mapbox.com/directions/v5/mapbox/driving/${coords}`,
      {
        params: {
          alternatives: true,
          access_token: process.env.API_MAPBOX_ACCESS_TOKEN,
          geometries: "geojson",
          language: "fr",
          overview: "full",
          steps: true,
          // depart_at=2024-04-24T01%3A55
        },
      },
    );

    const data = response.data;
    if (data.code.toLowerCase() !== "ok") throw data.message;

    return data;
  },
};
