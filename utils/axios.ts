import { HttpService } from "@nestjs/axios";
import { AxiosRequestConfig } from "axios";
import { catchError, map } from "rxjs";

export default {
  req(instance: HttpService, config: AxiosRequestConfig) {
    return new Promise<any>((resolve, reject) => {
      instance
        .request(config)
        .pipe(
          map((res) => {
            console.log(res.data);

            resolve(res.data);
          }),
        )
        .pipe(
          catchError((error) => {
            console.log(error);
            throw reject(error);
          }),
        );
    });
  },
};
