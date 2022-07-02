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
export const textNone = text => span({'class': "d-none"}, text);
export const muted = text => span({'class': "text-muted"}, text);

export const opacity100 = text => span({'class': "opacity-100"}, text);
export const opacity75 = text => span({'class': "opacity-75"}, text);
export const opacity50 = text => span({'class': "opacity-50"}, text);
export const opacity25 = text => span({'class': "opacity-25"}, text);

// .text-pink {color: var(--bs-pink);}
// .text-indigo {color: var(--bs-indigo);}
// .text-purple {color: var(--bs-purple);}
// .text-orange {color: var(--bs-orange);}
// .text-teal {color: var(--bs-teal);}
export const textPink = text => span({'class': "text-pink"}, text);
export const textIndigo = text => span({'class': "text-indigo"}, text);
export const textPurple = text => span({'class': "text-purple"}, text);
export const textOrange = text => span({'class': "text-orange"}, text);
export const textTeal = text => span({'class': "text-teal"}, text);

export const textPrimary = text => span({'class': "text-primary"}, text);
export const textSecondary = text => span({'class': "text-secondary"}, text);
export const textSuccess = text => span({'class': "text-success"}, text);
export const textDanger = text => span({'class': "text-danger"}, text);
export const textWarning = text => span({'class': "text-warning"}, text);
export const textInfo = text => span({'class': "text-info"}, text);
export const textLight = text => span({'class': "text-light"}, text);
export const textDark = text => span({'class': "text-dark"}, text);

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
