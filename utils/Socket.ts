import { io } from "socket.io-client";

function decrypter(obj?: { [key: string]: any }) {
  function _decrypter(datas: any) {
    if (!datas) {
      // ne rien faire
    } else if (Array.isArray(datas)) {
      for (let i = 0; i < datas.length; i++) {
        datas[i] = _decrypter(datas[i]);
      }
    } else if (Object.prototype.toString.call(datas) === "[object Object]") {
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

const Socket = {
  socket: io(import.meta.env.VITE_API_URL),
  connect() {
    return new Promise<void>((resolve, reject) => {
      if (this.socket.connected) return resolve();

      this.socket.connect();
      this.socket.on("connect", function () {
        resolve();
      });
    });
  },
  emit<T = any>(event: string, data: { [key: string]: any } = {}) {
    if (Store.session.session.id) {
      this.socket.io.opts.extraHeaders ||= {};
      this.socket.io.opts.extraHeaders.authorization = `Bearer ${Store.session.session.id}`;
    }

    return new Promise<T>((resolve, reject) => {
      this.socket.emit(event, data, (response: any) => {
        response = decrypter(response);
        resolve(response);
      });
    });
  },
};

export default Socket;
