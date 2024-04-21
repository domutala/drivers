import position from "~/store/position";
import app from "~/store/app";
import session from "~/store/session";
import travel from "~/store/travel";

class Store {
  get position() {
    return position();
  }

  get app() {
    return app();
  }

  get session() {
    return session();
  }

  get travel() {
    return travel();
  }
}

const store = new Store();

export default store;
