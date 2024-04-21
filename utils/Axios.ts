import Axios, { type AxiosRequestConfig } from "axios";

const url = import.meta.env.VITE_API_URL as string;
const client = Axios.create({ baseURL: url });

function buildOptions(options: AxiosRequestConfig = {}) {
  options.headers ||= {};
  return options;
}

async function fetch<T = any>(
  url: string,
  params: AxiosRequestConfig = {}
): Promise<{ _DATA_: T }> {
  try {
    let useFormData = false;
    const _params: AxiosRequestConfig = {};

    params.headers = params.headers || {};
    if (Store.session.session.id) {
      params.headers.authorization = `Bearer ${Store.session.session.id}`;
    }

    params.data ||= {};
    Object.keys(params.data).forEach((key) => {
      if (!Array.isArray(params.data[key])) return;
      const hasFiles: boolean[] = params.data[key].map(
        (file: File) => file instanceof File
      );

      if (hasFiles.length && hasFiles.includes(true)) {
        useFormData = true;
      }
    });

    if (useFormData) {
      params.headers["Content-Type"] = "multipart/form-data";
      const formData = new FormData();

      for (const key of Object.keys(params.data)) {
        const isArray = Array.isArray(params.data[key]);
        let isFiles = false;
        if (isArray) {
          const hasFiles: boolean[] = params.data[key].map(
            (file: File) => file instanceof File
          );

          isFiles = hasFiles.length !== 0 && !hasFiles.includes(false);
        }

        if (isFiles) {
          for (const file of params.data[key]) formData.append(key, file);
        } else formData.append(key, params.data[key]);
      }

      params.data = formData;
    }

    _params.method = params.method || "post";
    _params.data = params.data;
    _params.headers = params.headers;

    const response = await client(url, _params);

    function decrypter(obj?: { [key: string]: any }) {
      function _decrypter(datas: any) {
        if (!datas) {
          // ne rien faire
        } else if (Array.isArray(datas)) {
          for (let i = 0; i < datas.length; i++) {
            datas[i] = _decrypter(datas[i]);
          }
        } else if (
          Object.prototype.toString.call(datas) === "[object Object]"
        ) {
          if ("_RSA_ENCODED_" in datas) {
            datas = Forge.decrypter(datas._RSA_ENCODED_);
          } else {
            for (const key in datas) {
              datas[key] = _decrypter(datas[key]);
            }
          }
        }

        return datas;
      }

      return _decrypter(obj);
    }

    let data = response.data;
    if (data) data = decrypter(response.data);

    return data;
  } catch (error: any) {
    console.log(error.data);
    throw error;
  }

  // const result = await client(url, buildOptions(params));
  // return result.data as T;
}

export default { fetch, client, url };
