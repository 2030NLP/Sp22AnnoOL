import {
  reactive, computed, onMounted, h,
  provide, inject,
  // Transition,
  Teleport,
  v,
  div, span, btn, watch
} from './VueShadow.mjs.js';
import { BS } from './Shadow.mjs.js';

import {
  ha,
  space,
  text,
  textNone,
  muted,

  opacity100,
  opacity75,
  opacity50,
  opacity25,

  textPink,
  textIndigo,
  textPurple,
  textOrange,
  textTeal,

  textPrimary,
  textSecondary,
  textSuccess,
  textDanger,
  textWarning,
  textInfo,
  textLight,
  textDark,

  labelSpan,
  lightBtn,
  bi,
  ti,
  vr,
  spansJoin,
  modal,
  confirmModal,
} from './BsVueUtils.mjs.js';

Array.prototype.last = function() {return this[this.length-1]};


export const faceFn单个原文片段 = (boy) => {
  const text = boy?.value?.text ?? "";
  const idxes = boy?.value?.idxes ?? [];
  return text.length ? [textNone("“"), opacity75(text), textNone("”")] : idxes.length ? opacity75(JSON.stringify(idxes)) : opacity75(textDanger("<null>"));
};
export const faceFn单个不连续原文片段 = (boy) => {
  const texts = boy?.value?.texts??[];
  const textSpans = texts.map(it=>opacity75(it));
  const sss = spansJoin(textSpans, muted(" "));

  const idxeses = boy?.value?.idxeses ?? [];
  return texts.length ? span({}, [textNone("“"), sss, textNone("”")]) : idxeses.length ? opacity75(JSON.stringify(idxeses)) : opacity75(textDanger("<null>"));
};
export const faceFn单个不连续原文片段无引号 = (boy) => {
  const texts = boy?.value?.texts??[];
  const textSpans = texts.map((it, idx)=>text(it, {'title': boy?.value?.idxeses?.[idx]}));
  const sss = spansJoin(textSpans, muted(" "));

  const idxeses = boy?.value?.idxeses ?? [];
  return texts.length ? sss : idxeses.length ? opacity75(JSON.stringify(idxeses)) : opacity75(textDanger("<null>"));
};

export const faceFn多个不连续原文片段 = (boy, reactiveCMR, joint) => {
  // console.log(boy);
  const spans = boy?.value??[];
  const spanSpans = spans.map(it=>faceFn单个不连续原文片段无引号({value: it}));
  const sss = spansJoin(spanSpans, muted(joint??" + "));
  return spans?.length ? sss : opacity75(textDanger("<null>"));
};

export const faceFn单个标签 = (boy) => {
  return boy?.value?.face?.length?textIndigo(boy?.value?.face):textDanger("???");
};

export const faceFn单个对象 = (boy, reactiveCMR) => {
  const obj = reactiveCMR.get(boy);
  const that = (obj!=null) ? div({
    'class': "d-inline-block small border rounded px-1 py-0 align-middle text-wrap",
  }, objectFace(obj, reactiveCMR)) : div({
    'class': "d-inline-block small border border-danger text-danger rounded px-1 py-0 align-middle text-wrap",
  }, opacity75("<id不存在>"));
  return that;
};
export const faceFn多个对象 = (boyListWrap, reactiveCMR, joint) => {
  // if (joint==null) {joint=textPrimary(" + ")};
  const dogs = (boyListWrap?.value??[]).map(boy=>faceFn单个对象(boy, reactiveCMR));
  let girls = [];
  let first = true;
  for (let dog of dogs) {
    if (!first) {girls.push(joint)};
    if (first) {first = false};
    girls.push(dog);
  };
  const box = div({
    'class': "d-flex flex-wrap gap-1 justify-content-evenly",
  }, girls);
  return box;
};

export const ctrlTypeFaceFnMap = {
  '原文片段': (boy)=>faceFn单个原文片段(boy),
  '单个原文片段': (boy)=>faceFn单个原文片段(boy),
  '不连续原文片段': (boy)=>faceFn单个不连续原文片段(boy),
  '单个不连续原文片段': (boy)=>faceFn单个不连续原文片段(boy),
  '多个不连续原文片段': (boy, reactiveCMR, joint)=>faceFn多个不连续原文片段(boy, reactiveCMR, joint),
  'MB_SPANS': (boy, reactiveCMR, joint)=>faceFn多个不连续原文片段(boy, reactiveCMR, joint),
  '单个标签': (boy)=>faceFn单个标签(boy),
  '单个对象': (boy, reactiveCMR)=>faceFn单个对象(boy?.value, reactiveCMR),
  '多个原文片段': (boy)=>text(JSON.stringify(boy)),
  '多个标签': (boy)=>text(JSON.stringify(boy)),
  '多个对象': (boyListWrap, reactiveCMR, joint)=>faceFn多个对象(boyListWrap, reactiveCMR, joint),
  '布尔值': (boy)=>(boy?.value?(textIndigo("true")):(textIndigo("false"))),
  '数值': (boy)=>textPrimary(boy?.value),
};

export const dataFace = (cat, reactiveCMR, joint) => {
  if (cat?.type in ctrlTypeFaceFnMap) {
    return ctrlTypeFaceFnMap[cat?.type](cat, reactiveCMR, joint);
  };
  return text(JSON.stringify(cat));
};






export const faceFnObj空间实体 = (boy, reactiveCMR) => {
  const syb = textPrimary(boy['是否是虚拟的']?.value ? "$" : "#");
  const textObjs = (boy['原文片段']?.value??[]).map(id=>reactiveCMR.get(id)).filter(it=>it!=null);
  const texts = textObjs.map(it=>faceFn单个不连续原文片段无引号(it?.['内容']));
  const sss = spansJoin(texts, textPrimary("="));
  // console.log({textObjs, texts, sss});
  return span({}, [syb, sss, syb]);
};

export const faceFnObj事件 = (boy, reactiveCMR) => {
  const syb = textSuccess("%");
  const textObjs = [boy['原文片段']?.value].map(id=>reactiveCMR.get(id)).filter(it=>it!=null);
  const texts = textObjs.map(it=>faceFn单个不连续原文片段无引号(it?.['内容']));
  const sss = spansJoin(texts, textPrimary("="));
  // console.log({textObjs, texts, sss});
  return span({}, [syb, sss, syb]);
};

export const faceFnObj论元角色关系 = (boy, reactiveCMR) => {
  const masterText = objectFace(reactiveCMR.get(boy?.['事件']?.value), reactiveCMR);
  const keyText = faceFn单个标签(boy?.['角色'], reactiveCMR);
  const valueText = objectFace(reactiveCMR.get(boy?.['值']?.value), reactiveCMR);
  return span({}, [masterText, space, textPrimary("["), keyText, textPrimary(":"), space, valueText, textPrimary("]")]);
};

export const faceFnObj角色引用 = (boy, reactiveCMR) => {
  const masterText = objectFace(reactiveCMR.get(boy?.['事件']?.value), reactiveCMR);
  const keyText = faceFn单个标签(boy?.['角色'], reactiveCMR);
  return span({}, [masterText, textPrimary("."), keyText]);
};

export const faceFnSpan介词 = (girl, reactiveCMR) => {
  return girl!=null ? [
    textPrimary("<"),
    objectFace(reactiveCMR.get(girl), reactiveCMR),
    textPrimary(">"),
  ] : null;
};

export const faceFnSpan方位词 = (girl, reactiveCMR) => {
  return girl!=null ? [
    textPrimary("##"),
    objectFace(reactiveCMR.get(girl), reactiveCMR),
  ] : null;
};

export const faceFn实体 = (girl, reactiveCMR) => {
  const dogs = girl??[];
  if (!dogs.length) {return null};
  const sons = dogs.map(it=>{
    const big = reactiveCMR.get(it);
    return big!=null ? objectFace(big, reactiveCMR) : null;
  });
  const 实体Text = spansJoin(sons, textPrimary(" + "));
  return 实体Text;
};

export const faceFnObj位置特征 = (boy, reactiveCMR) => {
  const 实体Text = faceFn实体(boy?.['参照实体']?.value, reactiveCMR);
  const 介词Text = faceFnSpan介词(boy?.['介词']?.value, reactiveCMR);
  const 方位词Text = faceFnSpan方位词(boy?.['方位词']?.value, reactiveCMR);
  return span({}, [介词Text, 实体Text, 方位词Text]);
};

export const faceFnObj方向特征 = (boy, reactiveCMR) => {
  const 实体Text = faceFn实体(boy?.['参照实体']?.value, reactiveCMR);
  const 介词Text = faceFnSpan介词(boy?.['介词']?.value, reactiveCMR);
  const 方位词Text = objectFace(reactiveCMR.get(boy?.['方位词']?.value), reactiveCMR);
  return span({}, [实体Text, 介词Text, 方位词Text]);
};

export const faceFnObj朝向特征 = (boy, reactiveCMR) => {
  const 实体Text = faceFn实体(boy?.['参照实体']?.value, reactiveCMR);
  const 介词Text = faceFnSpan介词(boy?.['介词']?.value, reactiveCMR);
  const 方位词Text = objectFace(reactiveCMR.get(boy?.['方位词']?.value), reactiveCMR);
  return span({}, [介词Text, 实体Text, 方位词Text]);
};

export const faceFnObj形状特征 = (boy, reactiveCMR) => {
  const 形状Text = objectFace(reactiveCMR.get(boy?.['形状文本']?.value), reactiveCMR);
  return span({}, [形状Text]);
};

export const faceFnObj距离特征 = (boy, reactiveCMR) => {
  const 实体Text = faceFn实体(boy?.['参照实体']?.value, reactiveCMR);
  const 实体TextWrap = 实体Text==null ? null : text([textPrimary("("), 实体Text, textPrimary(")")]);
  let 距离描述Text;
  if (boy?.['距离描述']?.type=="单个对象") {
    const 距离描述Obj = reactiveCMR.get(boy?.['距离描述']?.value);
    距离描述Text = 距离描述Obj==null ? null : objectFace(距离描述Obj, reactiveCMR);
  };
  if (boy?.['距离描述']?.type=="单个标签") {
    距离描述Text = faceFn单个标签(boy?.['距离描述'], reactiveCMR);
  };
  const 距离描述TextWrap = 距离描述Text==null ? null : text([textIndigo(": "), 距离描述Text]);
  return span({}, ["距离", 实体TextWrap, 距离描述TextWrap]);
};

export const faceFnObj时间特征 = (boy, reactiveCMR) => {
  const 没有界定 = boy?.['界定']?.value==null;
  const 没有时间文本 = boy?.['时间文本']?.value==null;
  const 都有 = (!没有界定)&&(!没有时间文本);
  const 界定text = 没有界定 ? null : [textPrimary("."), faceFn单个标签(boy?.['界定'], reactiveCMR)];
  const 事件Text = 没有界定 ? null : (faceFn实体(boy?.['参照事件']?.value, reactiveCMR)??textIndigo("事件"));
  const 时间文本Text = objectFace(reactiveCMR.get(boy?.['时间文本']?.value), reactiveCMR);
  const 事件与界定Wrap = [事件Text, 界定text];
  const 连接符 = 都有 ? (textPrimary(" + ")) : null;
  return span({}, [事件与界定Wrap, 连接符, 时间文本Text]);
};

export const faceFnObj特征命题 = (boy, reactiveCMR) => {
  return span({}, []);
};

export const faceFnObj共指关系 = (object, reactiveCMR) => {
  let frags = [];
  if ("R" in object && object?.["R"]?.value!=null) {
    frags.push(labelSpan([opacity75(muted("同指片段")), dataFace(object["R"], reactiveCMR, " = ")], {
      'class': "border-0",
    }));
  };
  return labelSpan(frags, {'class': "gap-2 border-0"});
};

export const faceFnObj事件角色 = (object, reactiveCMR) => {
  let frags = [];
  const slots = reactiveCMR?.typeDict?.[object?.type]?.slots??[];
  for (let slot of slots) {
    if (slot.name == "SPE_obj" && object?.[slot.name]?.value!=null) {
      let speObj = reactiveCMR.get(object?.[slot.name]?.value);
      frags.push(labelSpan([opacity75(muted("事件谓词")), dataFace(speObj?.E, reactiveCMR)], {
        'class': "border-0",
      }));
    };
    if (slot.name != "SPE_obj" && slot.name in object && object?.[slot.name]?.value!=null) {
      frags.push(labelSpan([opacity75(muted(slot.nameFace??slot.name)), dataFace(object[slot.name], reactiveCMR)], {
        'class': "border-0",
      }));
    };
  };
  return labelSpan(frags, {'class': "gap-2 border-0"});
};

export const objectTypeFaceFnMap = {
  '文本': (boy)=>dataFace(boy?.['内容']),
  '空间实体': (boy, reactiveCMR)=>faceFnObj空间实体(boy, reactiveCMR),
  '事件': (boy, reactiveCMR)=>faceFnObj事件(boy, reactiveCMR),
  '论元角色关系': (boy, reactiveCMR)=>faceFnObj论元角色关系(boy, reactiveCMR),
  '角色引用': (boy, reactiveCMR)=>faceFnObj角色引用(boy, reactiveCMR),
  '位置特征': (boy, reactiveCMR)=>faceFnObj位置特征(boy, reactiveCMR),
  '方向特征': (boy, reactiveCMR)=>faceFnObj方向特征(boy, reactiveCMR),
  '朝向特征': (boy, reactiveCMR)=>faceFnObj朝向特征(boy, reactiveCMR),
  '形状特征': (boy, reactiveCMR)=>faceFnObj形状特征(boy, reactiveCMR),
  '距离特征': (boy, reactiveCMR)=>faceFnObj距离特征(boy, reactiveCMR),
  '时间特征': (boy, reactiveCMR)=>faceFnObj时间特征(boy, reactiveCMR),

  'propSet_E': (boy, reactiveCMR)=>faceFnObj事件角色(boy, reactiveCMR),
  'propSet_S': (boy, reactiveCMR)=>faceFnObj共指关系(boy, reactiveCMR),
  // '特征命题': (boy, reactiveCMR)=>faceFnObj特征命题(boy, reactiveCMR),
};

export const defaultObjectFace = (object, reactiveCMR) => {
  let frags = [];
  const slots = reactiveCMR?.typeDict?.[object?.type]?.slots??[];
  for (let slot of slots) {
    if (slot.name in object && object?.[slot.name]?.value!=null) {
      frags.push(labelSpan([opacity75(muted(slot.nameFace??slot.name)), dataFace(object[slot.name], reactiveCMR)], {
        'class': "border-0",
      }));
    };
  };
  return labelSpan(frags, {'class': "gap-2 border-0"});
};

export const objectFace = (object, reactiveCMR) => {
  if (object?.type in objectTypeFaceFnMap) {
    return objectTypeFaceFnMap[object.type](object, reactiveCMR);
  };
  return defaultObjectFace(object, reactiveCMR);
};



export default {
};
