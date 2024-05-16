import app from "~/store/app";
import session from "~/store/session";
import position from "~/store/position";

class Store {
  get app() {
    return app();
  }
  get session() {
    return session();
  }
  get position() {
    return position();
  }
}

const store = new Store();
export default store;
