import {  h  } from '../modules_lib/vue_3.2.31_.esm-browser.prod.min.js';

const FunctionalArea = {
  props: ["step"],
  emits: ["tkn-down", "tkn-enter", "tkn-out", "tkn-up"],
  setup(props, ctx) {
    return {  };
  },
  render() {
    return h('div', {'class': "row"}, [
        h('div', {'class': "col col-12 my-1"}, []),
      ],
    );
  },
};

export default FunctionalArea;

