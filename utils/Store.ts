import position from "~/store/position";

class Store {
  get position() {
    return position();
  }
}

const store = new Store();

export default store;
