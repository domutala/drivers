import position from "~/store/position";
import app from "~/store/app";
import session from "~/store/session";
import travel from "~/store/travel";
import traveller from "~/store/traveller";
import driver from "~/store/driver";

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

  get traveller() {
    return traveller();
  }

  get driver() {
    return driver();
  }
}

const store = new Store();

export default store;
