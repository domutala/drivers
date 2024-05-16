export default {
  sleep(time = 500) {
    return new Promise((resolve, reject) => {
      setTimeout(() => resolve(true), time);
    });
  },

  share(text: string, title?: string, mimetype?: string) {
    // const share = navigator.share as (
    //   text: string,
    //   title?: string,
    //   mimetype?: string
    // ) => void;
    // share(text, title, mimetype);
  },
};
