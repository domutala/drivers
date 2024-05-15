import app from "~/store/app";

class Store {
  get app() {
    return app();
  }
}

const store = new Store();
export default store;
