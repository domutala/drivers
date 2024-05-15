export default {
  sleep(time = 500) {
    return new Promise((resolve, reject) => {
      setTimeout(() => resolve(true), time);
    });
  },
};
