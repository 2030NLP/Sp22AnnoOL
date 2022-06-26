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



const labelSpan = (children, attr) => {
  if (attr==null) {attr={};};
  attr.class = ["d-inline-flex border rounded px-1 py-0 flex-wrap gap-1 align-items-center", attr.class];
  return div(attr, children);
};



export default {
  props: ['annotation'],
  emits: [],
  component: {},
  setup(props, ctx) {
    // console.log("CmrDisplay");
    // console.log(props);
    return () => div({'class':"text-wrap text-break"}, [JSON.stringify(props?.['annotation'])]);
  },
};

