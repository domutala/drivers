import Axios from "axios";
import { writeFileSync } from "fs";

const mapbox = {
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
  async capture(params: {
    departure: { lat: number; lng: number };
    destination: { lat: number; lng: number };
    geojson: any
  }) {
    let url = `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/`

    url += `geojson(${JSON.stringify(params.geojson)})`

    url += `,pin-s+ff0000(${params.departure.lng},${params.departure.lat})`
    url += `,pin-s+44ff00(${params.destination.lng},${params.destination.lat})`

    url += '/auto/640x480'

    url += `?access_token=${process.env.API_MAPBOX_ACCESS_TOKEN}&padding=50`

    writeFileSync('heyyy', url)

    try {
      const response = await Axios.get(url);
      return response.data as Buffer;
    } catch (error) {
      console.log(error);

      throw error
    }
  },
};

export default mapbox
