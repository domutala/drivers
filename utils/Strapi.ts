import Axios, { type AxiosRequestConfig } from "axios";

const config = useRuntimeConfig();
const url = config.public.cmsUrl as string; //"http://192.168.1.103:1337"; // "https://cms.stream.domutala.com";
const client = Axios.create({ baseURL: url });

function buildOptions(options: AxiosRequestConfig = {}) {
  options.headers ||= {};
  return options;
}

function fix(json: any): any {
  if (json === null || json === undefined) {
    return null;
  }
  let res: any = {};
  if (Array.isArray(json)) {
    return json.map((i) => fix(i));
  }
  const keys = Object.keys(json);
  keys.forEach((entry: string) => {
    if (entry == "attributes") {
      Object.assign(res, fix(json[entry]));
    } else if (entry == "data") {
      res = fix(json[entry]);
    } else if (
      typeof json[entry] === "object" ||
      typeof json[entry] === "function"
    ) {
      res[entry] = fix(json[entry]);
    } else if (Array.isArray(json[entry])) {
      res[entry] = fix(json[entry]);
    } else {
      res[entry] = json[entry];
    }
  });

  return res;
}

async function fetch<T = any>(url: string, options?: AxiosRequestConfig) {
  const result = await client(url, buildOptions(options));
  return fix(result.data) as T;
}

function buildMediaUrl(_url: string, type: "image" | "video") {
  return `${url}/api/file/${type}?${type}=${_url.replace(/\/uploads\//, "")}`;
}

export default { fetch, client, fix, url, buildMediaUrl };
