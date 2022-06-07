import {
  reactive, computed, onMounted, h,
  // Transition,
  Teleport,
  v,
  div, span, btn
} from './VueShadow.mjs.js';
import { CMR, BS } from './Shadow.mjs.js';

const ha = (children, href, title, targetBlank) => {
  targetBlank = targetBlank?(!!targetBlank):true;
  return h("a", {
    'href': href??"#",
    'title': title??"",
    'target': targetBlank?'_blank':undefined,
  }, children);
};
const muted = text => span({'class': "text-muted"}, text);
const lightBtn = (icon, text, title, attrs) => {
  attrs = attrs ?? {};
  attrs['class']=["btn-sm", attrs.class];
  attrs['title']=title??text;
  // return btn({'class': "btn-sm", title: title??text}, [icon, icon?" ":null, muted(text)], "outline-secondary");
  return btn(attrs, [icon, icon?" ":null, muted(text)], "----light");
};
const bi = (name) => {
  return h("i", {'class': ["bi", `bi-${name??'square'}`]});
};  // https://icons.getbootstrap.com/
const ti = (name) => {
  return h("i", {'class': ["ti", `ti-${name??'square'}`]});
};  // https://tabler-icons.io
const vr = () => h("div", {'class': "vr"});


export default {
  props: ['annotation'],
  emits: [],
  component: {},
  setup(props, ctx) {
    console.log("CmrDisplay");
    console.log(props);
    return () => div(null, [JSON.stringify(props?.['annotation'])]);
  },
};

