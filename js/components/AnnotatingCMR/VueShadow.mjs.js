import {
  reactive,
  readonly,
  ref,
  toRef,
  toRefs,
  computed,
  onMounted,
  onUpdated,
  createApp as Vue_createApp,
  watch,
  h,
} from '../../modules_lib/vue_3.2.31_.esm-browser.prod.min.js';

//

const v = x => x.value;

//

const div = (attrs, children) => {
  return h("div", attrs, children);
};

const span = (attrs, children) => {
  return h("span", attrs, children);
};

const btn = (attrs, children, btnStyle, type) => {
  attrs = attrs ?? {};
  attrs['class'] = ["btn", `btn-${btnStyle??"--"}`, attrs.class];
  attrs['type'] = type ?? "button";
  return h("button", attrs, children);
};

//

export {
  reactive,
  readonly,
  ref,
  toRef,
  toRefs,
  computed,
  onMounted,
  onUpdated,
  Vue_createApp,
  watch,
  h,

  v,
  div,
  span,
  btn,
};
