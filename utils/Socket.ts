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

function encrypter(obj?: { [key: string]: any }) {
  const publicKey = Store.session.session.apiPublicKey;

  const _encrypter = (datas: any) => {
    if (!datas) {
      // ne rien faire
    } else if (Array.isArray(datas)) {
      for (let i = 0; i < datas.length; i++) {
        datas[i] = _encrypter(datas[i]);
      }
    } else if (Object.prototype.toString.call(datas) === "[object Object]") {
      if ("_RSA_ENCODED_" in datas) {
        if (publicKey) {
          datas._RSA_ENCODED_ = Forge.encrypter(datas._RSA_ENCODED_, "api");
        } else {
          datas._RSA_ENCODED_ = null;
        }
      } else {
        for (const key in datas) {
          datas[key] = _encrypter(datas[key]);
        }
      }
    }

    return datas;
  };

  return _encrypter(obj);
}

const Socket = {
  socket: io(import.meta.env.VITE_API_URL, { autoConnect: false }),
  connect(reconnect = false) {
    return new Promise<void>((resolve, reject) => {
      // if (reconnect) this.socket = io(import.meta.env.VITE_API_URL);
      // if (this.socket.connected) return resolve();

      if (Store.session.session.id) {
        this.socket.io.opts.extraHeaders ||= {};
        this.socket.io.opts.extraHeaders.authorization = `Bearer ${Store.session.session.id}`;
      }

      this.socket.connect();
      resolve();
      // this.socket.on("connect", function () {
      //   resolve();
      // });
    });
  },
  emit<T = any>(
    event: string,
    data: { [key: string]: any } = {},
    options: { timeout?: number | "NO_TIMEOUT" } = {}
  ) {
    if (Store.session.session.id) {
      this.socket.io.opts.extraHeaders ||= {};
      this.socket.io.opts.extraHeaders.authorization = `Bearer ${Store.session.session.id}`;
    }

    return new Promise<T>((resolve, reject) => {
      const timeout = options.timeout || 10000;
      let isTimeout = false;
      let isREsponse = false;

      function onResponse(data: any) {
        if (isTimeout) {
          console.error(`${event}: __TIMEOUT__`);
          return reject("__TIMEOUT__");
        }
        if (data === "__ERROR__") return reject(data);

        isREsponse = true;
        data = decrypter(data);

        resolve(data);
      }

      data = encrypter(data);
      this.socket.emit(event, data, onResponse);

      if (timeout !== "NO_TIMEOUT") {
        setTimeout(() => {
          if (isREsponse) return;

          isTimeout = true;
          onResponse("__ERROR__");
        }, timeout);
      }
    });
  },
};

export default Socket;
