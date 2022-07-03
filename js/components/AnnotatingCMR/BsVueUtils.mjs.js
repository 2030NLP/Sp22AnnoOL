import {
  reactive, computed, onMounted, h,
  provide, inject,
  // Transition,
  Teleport,
  v,
  div, span, btn, watch
} from './VueShadow.mjs.js';
import { BS } from './Shadow.mjs.js';


export const ha = (children, href, title, targetBlank) => {
  targetBlank = targetBlank?(!!targetBlank):true;
  return h("a", {
    'href': href??"#",
    'title': title??"",
    'target': targetBlank?'_blank':undefined,
  }, children);
};
export const space = " ";
export const text = (text, attr) => span(attr, text);

export const textPreClass = (preClass, text, attr) => {
  if (attr==null) {attr={};};
  attr.class = [preClass, attr.class];
  return span(attr, text);
};

export const textNone = (text, attr) => textPreClass("d-none", text, attr);
export const muted = (text, attr) => textPreClass("text-muted", text, attr);

export const opacity100 = (text, attr) => textPreClass("opacity-100", text, attr);
export const opacity75 = (text, attr) => textPreClass("opacity-75", text, attr);
export const opacity50 = (text, attr) => textPreClass("opacity-50", text, attr);
export const opacity25 = (text, attr) => textPreClass("opacity-25", text, attr);

// .text-pink {color: var(--bs-pink);}
// .text-indigo {color: var(--bs-indigo);}
// .text-purple {color: var(--bs-purple);}
// .text-orange {color: var(--bs-orange);}
// .text-teal {color: var(--bs-teal);}
export const textPink = (text, attr) => textPreClass("text-pink", text, attr);
export const textIndigo = (text, attr) => textPreClass("text-indigo", text, attr);
export const textPurple = (text, attr) => textPreClass("text-purple", text, attr);
export const textOrange = (text, attr) => textPreClass("text-orange", text, attr);
export const textTeal = (text, attr) => textPreClass("text-teal", text, attr);
// export const textCyan = (text, attr) => textPreClass("text-cyan", text, attr);

export const textPrimary = (text, attr) => textPreClass("text-primary", text, attr);
export const textSecondary = (text, attr) => textPreClass("text-secondary", text, attr);
export const textSuccess = (text, attr) => textPreClass("text-success", text, attr);
export const textDanger = (text, attr) => textPreClass("text-danger", text, attr);
export const textWarning = (text, attr) => textPreClass("text-warning", text, attr);
export const textInfo = (text, attr) => textPreClass("text-info", text, attr);
export const textLight = (text, attr) => textPreClass("text-light", text, attr);
export const textDark = (text, attr) => textPreClass("text-dark", text, attr);

export const labelSpan = (children, attr) => {
  if (attr==null) {attr={};};
  attr.class = ["d-inline-flex border rounded px-1 py-0 flex-wrap gap-1 align-items-center", attr.class];
  return div(attr, children);
};

export const lightBtn = (icon, text, title, attrs) => {
  attrs = attrs ?? {};
  attrs['class']=["btn-sm", attrs.class];
  attrs['title']=title??text;
  // return btn({'class': "btn-sm", title: title??text}, [icon, icon?" ":null, muted(text)], "outline-secondary");
  return btn(attrs, [icon, icon?" ":null, muted(text)], "----light");
};
export const bi = (name) => {
  return h("i", {'class': ["bi", `bi-${name??'square'}`]});
};  // https://icons.getbootstrap.com/
export const ti = (name) => {
  return h("i", {'class': ["ti", `ti-${name??'square'}`]});
};  // https://tabler-icons.io
export const vr = () => h("div", {'class': "vr"});

export const spansJoin = (spans, joint) => {
  let result = [];
  let xx = false;
  for (let span of spans??[]) {
    if (xx) {result.push(joint)};
    result.push(span);
    xx = true;
  };
  return span({}, result);
};


export const modal = (attrs, children, to, disabled) => h(Teleport, {
  'to': to??"body",
  'disabled': disabled??false,
}, h(BS.Modal, attrs, children));

export const confirmModal = (dataWrap, showName, text, onConfirm, onHide) => modal({
  'show': dataWrap[showName],
  'needconfirm': true,
  'onConfirm': ()=>{(onConfirm??(()=>{}))();dataWrap[showName]=false;},
  'onHide': ()=>{(onHide??(()=>{}))();dataWrap[showName]=false;},
}, {
  default: div({}, text),
}, "body");

export default {
};
