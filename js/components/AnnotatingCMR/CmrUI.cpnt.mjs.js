import {
  reactive, computed, onMounted, h,
  provide, inject,
  // Transition,
  Teleport,
  v,
  div, span, btn, watch
} from './VueShadow.mjs.js';
import { CMR, BS } from './Shadow.mjs.js';

import CmrDisplay from './CmrDisplay.cpnt.mjs.js';

Array.prototype.last = function() {return this[this.length-1]};

const ha = (children, href, title, targetBlank) => {
  targetBlank = targetBlank?(!!targetBlank):true;
  return h("a", {
    'href': href??"#",
    'title': title??"",
    'target': targetBlank?'_blank':undefined,
  }, children);
};
const space = " ";
const textNone = text => span({'class': "d-none"}, text);
const muted = text => span({'class': "text-muted"}, text);
const text = (text, attr) => span(attr, text);
const opacity100 = text => span({'class': "opacity-100"}, text);
const opacity75 = text => span({'class': "opacity-75"}, text);
const opacity50 = text => span({'class': "opacity-50"}, text);
const opacity25 = text => span({'class': "opacity-25"}, text);

// .text-pink {color: var(--bs-pink);}
// .text-indigo {color: var(--bs-indigo);}
// .text-purple {color: var(--bs-purple);}
// .text-orange {color: var(--bs-orange);}
// .text-teal {color: var(--bs-teal);}
const textPink = text => span({'class': "text-pink"}, text);
const textIndigo = text => span({'class': "text-indigo"}, text);
const textPurple = text => span({'class': "text-purple"}, text);
const textOrange = text => span({'class': "text-orange"}, text);
const textTeal = text => span({'class': "text-teal"}, text);

const textPrimary = text => span({'class': "text-primary"}, text);
const textSecondary = text => span({'class': "text-secondary"}, text);
const textSuccess = text => span({'class': "text-success"}, text);
const textDanger = text => span({'class': "text-danger"}, text);
const textWarning = text => span({'class': "text-warning"}, text);
const textInfo = text => span({'class': "text-info"}, text);
const textLight = text => span({'class': "text-light"}, text);
const textDark = text => span({'class': "text-dark"}, text);

const labelSpan = (children, attr) => {
  if (attr==null) {attr={};};
  attr.class = ["d-inline-flex border rounded px-1 py-0 flex-wrap gap-1 align-items-center", attr.class];
  return div(attr, children);
};

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

const spansJoin = (spans, joint) => {
  let result = [];
  let xx = false;
  for (let span of spans??[]) {
    if (xx) {result.push(joint)};
    result.push(span);
    xx = true;
  };
  return span({}, result);
};


const modal = (attrs, children, to, disabled) => h(Teleport, {
  'to': to??"body",
  'disabled': disabled??false,
}, h(BS.Modal, attrs, children));

const confirmModal = (dataWrap, showName, text, onConfirm, onHide) => modal({
  'show': dataWrap[showName],
  'needconfirm': true,
  'onConfirm': ()=>{(onConfirm??(()=>{}))();dataWrap[showName]=false;},
  'onHide': ()=>{(onHide??(()=>{}))();dataWrap[showName]=false;},
}, {
  default: div({}, text),
}, "body");




const 设计 = `

`;




const faceFn单个原文片段 = (boy) => {
  const text = boy?.value?.text ?? "";
  const idxes = boy?.value?.idxes ?? [];
  return text.length ? [textNone("“"), opacity75(text), textNone("”")] : idxes.length ? opacity75(JSON.stringify(idxes)) : opacity75(textDanger("<null>"));
};
const faceFn单个不连续原文片段 = (boy) => {
  const texts = boy?.value?.texts??[];
  const textSpans = texts.map(it=>opacity75(it));
  const sss = spansJoin(textSpans, muted(" "));

  const idxeses = boy?.value?.idxeses ?? [];
  return texts.length ? span({}, [textNone("“"), sss, textNone("”")]) : idxeses.length ? opacity75(JSON.stringify(idxeses)) : opacity75(textDanger("<null>"));
};
const faceFn单个不连续原文片段无引号 = (boy) => {
  const texts = boy?.value?.texts??[];
  const textSpans = texts.map((it, idx)=>text(it, {'title': boy?.value?.idxeses?.[idx]}));
  const sss = spansJoin(textSpans, muted(" "));

  const idxeses = boy?.value?.idxeses ?? [];
  return texts.length ? sss : idxeses.length ? opacity75(JSON.stringify(idxeses)) : opacity75(textDanger("<null>"));
};

const faceFn多个不连续原文片段 = (boy, reactiveCMR, joint) => {
  // console.log(boy);
  const spans = boy?.value??[];
  const spanSpans = spans.map(it=>faceFn单个不连续原文片段无引号({value: it}));
  const sss = spansJoin(spanSpans, muted(joint??" + "));
  return spans?.length ? sss : opacity75(textDanger("<null>"));
};

const faceFn单个标签 = (boy) => {
  return boy?.value?.face?.length?textIndigo(boy?.value?.face):textDanger("???");
};

const faceFn单个对象 = (boy, reactiveCMR) => {
  const obj = reactiveCMR.get(boy);
  const that = (obj!=null) ? div({
    'class': "d-inline-block small border rounded px-1 py-0 align-middle text-wrap",
  }, objectFace(obj, reactiveCMR)) : div({
    'class': "d-inline-block small border border-danger text-danger rounded px-1 py-0 align-middle text-wrap",
  }, opacity75("<id不存在>"));
  return that;
};
const faceFn多个对象 = (boyListWrap, reactiveCMR, joint) => {
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

const ctrlTypeFaceFnMap = {
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

const dataFace = (cat, reactiveCMR, joint) => {
  if (cat?.type in ctrlTypeFaceFnMap) {
    return ctrlTypeFaceFnMap[cat?.type](cat, reactiveCMR, joint);
  };
  return text(JSON.stringify(cat));
};






const faceFnObj空间实体 = (boy, reactiveCMR) => {
  const syb = textPrimary(boy['是否是虚拟的']?.value ? "$" : "#");
  const textObjs = (boy['原文片段']?.value??[]).map(id=>reactiveCMR.get(id)).filter(it=>it!=null);
  const texts = textObjs.map(it=>faceFn单个不连续原文片段无引号(it?.['内容']));
  const sss = spansJoin(texts, textPrimary("="));
  // console.log({textObjs, texts, sss});
  return span({}, [syb, sss, syb]);
};

const faceFnObj事件 = (boy, reactiveCMR) => {
  const syb = textSuccess("%");
  const textObjs = [boy['原文片段']?.value].map(id=>reactiveCMR.get(id)).filter(it=>it!=null);
  const texts = textObjs.map(it=>faceFn单个不连续原文片段无引号(it?.['内容']));
  const sss = spansJoin(texts, textPrimary("="));
  // console.log({textObjs, texts, sss});
  return span({}, [syb, sss, syb]);
};

const faceFnObj论元角色关系 = (boy, reactiveCMR) => {
  const masterText = objectFace(reactiveCMR.get(boy?.['事件']?.value), reactiveCMR);
  const keyText = faceFn单个标签(boy?.['角色'], reactiveCMR);
  const valueText = objectFace(reactiveCMR.get(boy?.['值']?.value), reactiveCMR);
  return span({}, [masterText, space, textPrimary("["), keyText, textPrimary(":"), space, valueText, textPrimary("]")]);
};

const faceFnObj角色引用 = (boy, reactiveCMR) => {
  const masterText = objectFace(reactiveCMR.get(boy?.['事件']?.value), reactiveCMR);
  const keyText = faceFn单个标签(boy?.['角色'], reactiveCMR);
  return span({}, [masterText, textPrimary("."), keyText]);
};

const faceFnSpan介词 = (girl, reactiveCMR) => {
  return girl!=null ? [
    textPrimary("<"),
    objectFace(reactiveCMR.get(girl), reactiveCMR),
    textPrimary(">"),
  ] : null;
};

const faceFnSpan方位词 = (girl, reactiveCMR) => {
  return girl!=null ? [
    textPrimary("##"),
    objectFace(reactiveCMR.get(girl), reactiveCMR),
  ] : null;
};

const faceFn实体 = (girl, reactiveCMR) => {
  const dogs = girl??[];
  if (!dogs.length) {return null};
  const sons = dogs.map(it=>{
    const big = reactiveCMR.get(it);
    return big!=null ? objectFace(big, reactiveCMR) : null;
  });
  const 实体Text = spansJoin(sons, textPrimary(" + "));
  return 实体Text;
};

const faceFnObj位置特征 = (boy, reactiveCMR) => {
  const 实体Text = faceFn实体(boy?.['参照实体']?.value, reactiveCMR);
  const 介词Text = faceFnSpan介词(boy?.['介词']?.value, reactiveCMR);
  const 方位词Text = faceFnSpan方位词(boy?.['方位词']?.value, reactiveCMR);
  return span({}, [介词Text, 实体Text, 方位词Text]);
};

const faceFnObj方向特征 = (boy, reactiveCMR) => {
  const 实体Text = faceFn实体(boy?.['参照实体']?.value, reactiveCMR);
  const 介词Text = faceFnSpan介词(boy?.['介词']?.value, reactiveCMR);
  const 方位词Text = objectFace(reactiveCMR.get(boy?.['方位词']?.value), reactiveCMR);
  return span({}, [实体Text, 介词Text, 方位词Text]);
};

const faceFnObj朝向特征 = (boy, reactiveCMR) => {
  const 实体Text = faceFn实体(boy?.['参照实体']?.value, reactiveCMR);
  const 介词Text = faceFnSpan介词(boy?.['介词']?.value, reactiveCMR);
  const 方位词Text = objectFace(reactiveCMR.get(boy?.['方位词']?.value), reactiveCMR);
  return span({}, [介词Text, 实体Text, 方位词Text]);
};

const faceFnObj形状特征 = (boy, reactiveCMR) => {
  const 形状Text = objectFace(reactiveCMR.get(boy?.['形状文本']?.value), reactiveCMR);
  return span({}, [形状Text]);
};

const faceFnObj距离特征 = (boy, reactiveCMR) => {
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

const faceFnObj时间特征 = (boy, reactiveCMR) => {
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

const faceFnObj特征命题 = (boy, reactiveCMR) => {
  return span({}, []);
};

const faceFnObj共指关系 = (object, reactiveCMR) => {
  let frags = [];
  if ("R" in object && object?.["R"]?.value!=null) {
    frags.push(labelSpan([muted("同指片段"), dataFace(object["R"], reactiveCMR, " = ")], {
      'class': "border-0",
    }));
  };
  return labelSpan(frags, {'class': "gap-2 border-0"});
};

const objectTypeFaceFnMap = {
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
  'propSet_S': (boy, reactiveCMR)=>faceFnObj共指关系(boy, reactiveCMR),
  // '特征命题': (boy, reactiveCMR)=>faceFnObj特征命题(boy, reactiveCMR),
};

const defaultObjectFace = (object, reactiveCMR) => {
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

const objectFace = (object, reactiveCMR) => {
  if (object?.type in objectTypeFaceFnMap) {
    return objectTypeFaceFnMap[object.type](object, reactiveCMR);
  };
  return defaultObjectFace(object, reactiveCMR);
};









const 原文顺序依据 = (object, reactiveCMR) => {
  const values = Object.values(object??{});
  const ooFn = (id) => {
    let oooo = reactiveCMR.get(id);
    return 原文顺序依据(oooo, reactiveCMR);
  };
  const map = {
    "原文片段": (it)=>+(it?.value?.idxes?.[0]??-Infinity),
    "单个原文片段": (it)=>+(it?.value?.idxes?.[0]??-Infinity),
    "不连续原文片段": (it)=>+(it?.value?.idxeses?.[0]?.[0]??-Infinity),
    "单个不连续原文片段": (it)=>+(it?.value?.idxeses?.[0]?.[0]??-Infinity),
    "MB_SPANS": (it)=>+(it?.value?.[0]?.idxeses?.[0]?.[0]??-Infinity),
    "单个对象": (it)=>ooFn(it?.value),
    "多个对象": (it)=>ooFn(it?.value?.[0]),
  };
  for (let vv of values) {
    if (vv?.type in map) {
      const hahah = map[vv?.type](vv);
      if (hahah!=null) {
        return hahah;
      };
    };
  };
  return Infinity;
};








const idxesToTokens = (idxes, allTokens) => {
  idxes = idxes??[];
  if (!allTokens?.length) {
    return [];
  };
  return idxes.map(idx => allTokens[idx]?.to ?? allTokens[idx] ?? {});
};
const idxesToText = (idxes, allTokens) => {
  let _tokens = idxesToTokens(idxes, allTokens);
  let result = _tokens.map(it => it.word).join("");
  return result;
};


const fixCtrl = (ctrl) => {
  if (typeof(ctrl)=="string") {
    ctrl = {
      'type': ctrl,
    };
  };
  // console.log(ctrl);
  return ctrl;
};
// 挑选相应的控件组件
const ctrlComponent = (ctrl) => {
  ctrl = fixCtrl(ctrl);
  // console.log(['props', props]);
  // console.log(['ctrl', ctrl]);
  const ctrlComponentMap = {
    '原文片段': EditorSingleSpan,
    '单个原文片段': EditorSingleSpan,
    '不连续原文片段': EditorSingleBrokenSpan,
    '单个不连续原文片段': EditorSingleBrokenSpan,
    '多个不连续原文片段': EditorMultiBrokenSpan,
    'MB_SPANS': EditorMultiBrokenSpan,
    '单个标签': EditorSingleLabelSelector,
    '单个对象': EditorSingleObjectSelector,
    '多个原文片段': EditorDefault,
    '多个标签': EditorDefault,
    '多个对象': EditorMultiObjectsSelector,
    '布尔值': EditorBool,
    '数值': EditorDefault,
  };
  if (ctrl['type'] in ctrlComponentMap) {
    return ctrlComponentMap[ctrl['type']];
  };
  return EditorDefault;
};
// 挑选相应的控件组件 结束





// 🆓🆓🆓🆓🆓🆓
// 缺省控件
const EditorDefault = {
  props: ['ctrl'],
  emits: ['confirm', 'cancel'],
  component: {},
  setup(props, ctx) {
    return () => div({'class': "input-group input-group-sm"}, [
      div({'class': "form-control d-inline-block text-center"}, [
        div({'class': "mb-1 text-center text-muted"}, JSON.stringify(props['ctrl'])),
        div({'class': "d-flex flex-wrap gap-1 justify-content-evenly"}, [
          (props['slot']?.ctrls??[]).map((ctrl, idx)=>btn({
            'class': "btn-sm px-1 py-0",
            onClick: ()=>{
              localData.ctrlIdx = idx;
              localData.currentStage = stages['③进行编辑操作'];
            },
          }, `${fixCtrl(ctrl)?.['type']}`, "light")),
        ]),
      ]),
      btn({
        onClick: ()=>{
          ctx.emit("confirm", {'data': "data"});
          // console.log("confirm");
        },
        'title': "确定",
      }, /*bi("check2")*/"存", "danger"),
      btn({
        onClick: ()=>{
          ctx.emit("cancel");
          // console.log("cancel");
        },
        'title': "取消",
      }, bi("arrow-90deg-left"), "outline-secondary"),
    ]);
  },
};
// 缺省控件 结束



// 🆓🆓🆓🆓🆓🆓
// 布尔值控件
const EditorBool = {
  props: ['ctrl'],
  emits: ['confirm', 'cancel'],
  component: {},
  setup(props, ctx) {
    return () => div({'class': "input-group input-group-sm"}, [
      div({'class': "form-control d-inline-block text-center"}, [
        div({'class': "d-flex flex-wrap gap-1 justify-content-evenly"}, [
          btn({
            'class': "btn-sm px-1 py-0",
            onClick: ()=>{
              ctx.emit("confirm", {type: props?.ctrl?.type??"", value: true});
              // console.log("confirm");
            },
            'title': "true",
          }, [bi("check"), " ", "true"], "outline-success"),
          btn({
            'class': "btn-sm px-1 py-0",
            onClick: ()=>{
              ctx.emit("confirm", {type: props?.ctrl?.type??"", value: false});
              // console.log("confirm");
            },
            'title': "false",
          }, [bi("x"), " ", "false"], "outline-danger"),
        ]),
      ]),
      btn({
        onClick: ()=>{
          ctx.emit("cancel");
          // console.log("cancel");
        },
        'title': "取消",
      }, bi("arrow-90deg-left"), "outline-secondary"),
    ]);
  },
};
// 布尔值控件 结束



// 🆓🆓🆓🆓🆓🆓
// 单个对象控件
const EditorSingleObjectSelector = {
  props: ['ctrl'],
  emits: ['confirm', 'cancel', 'new'],
  component: {},
  setup(props, ctx) {
    const reactiveCMR = inject('reactiveCMR', ()=>({}));
    const objects = computed(()=>{
      let those = [];
      let filters = props?.['ctrl']?.['config']?.['filter']??[{}];
      let allObjects = reactiveCMR?.objects??[];
      for (let 模子 of filters) {
        const keys = Object.keys(模子);
        const boys = allObjects.filter(it=>keys.every(key=>模子[key]==it[key])&&!those.includes(it));
        those = [...those, ...boys];
      };
      return those;
    });
    const localData = reactive({
      'selected': -1,
    });
    return () => div({'class': "input-group input-group-sm"}, [
      h("select", {
        'class': "form-select form-select-sm text-center",
        'value': localData.selected,
        onChange: (event)=>{
          localData.selected = event?.target?.value;
        },
      }, v(objects).map((obj, idx) => h("option", {
        'key': `${idx}`,
        'value': obj._id??obj.id??-1,
      }, objectFace(obj, reactiveCMR)))),
      btn({
        onClick: ()=>{
          ctx.emit("confirm", {type: props?.ctrl?.type??"", value: localData['selected']});
          // console.log("confirm");
        },
        'title': "确定",
      }, /*bi("check2")*/"存", "danger"),
      btn({
        'class': ["xx", {'d-none': props?.['ctrl']?.['config']?.['filter']?.length!=1}],
        onClick: ()=>{
          const 模子s = props?.['ctrl']?.['config']?.['filter'];
          if (模子s.length==1) {
            ctx.emit("new", 模子s[0]?.['type']);
            return;
          };
          ctx.emit("new");
          // console.log("new");
        },
        'title': "新建",
      }, bi("plus-circle"), "info"),
      btn({
        onClick: ()=>{
          ctx.emit("cancel");
          // console.log("cancel");
        },
        'title': "取消",
      }, bi("arrow-90deg-left"), "outline-secondary"),
    ]);
  },
};
// 单个对象控件 结束



// 🆓🆓🆓🆓🆓🆓
// 多个对象控件
const EditorMultiObjectsSelector = {
  props: ['ctrl', 'oldValue'],
  emits: ['confirm', 'cancel', 'new'],
  component: {},
  setup(props, ctx) {
    const reactiveCMR = inject('reactiveCMR', ()=>({}));
    const objects = computed(()=>{
      const list = localData.selectedList??[];
      let those = [];
      let filters = props?.['ctrl']?.['config']?.['filter']??[{}];
      let allObjects = reactiveCMR?.objects??[];
      for (let 模子 of filters) {
        const keys = Object.keys(模子);
        const boys = allObjects.filter(it=>keys.every(key=>模子[key]==it[key])&&!those.includes(it));
        those = [...those, ...boys];
      };
      those = those.filter(it=>!list.map(it=>+it).includes(it._id??it.id));
      return those;
    });
    const localData = reactive({
      'selectedList': props?.oldValue??[],
      'selected': "-1",
    });
    return () => div({
      'class': "vstack gap-1 p-1 border rounded text-center w-100 bg-white",
    },[
      div({'class': "d-inline-block text-center"}, [
        div({'class': "d-flex flex-wrap gap-1 justify-content-evenly"}, [
          localData.selectedList.map(objId=>span({
            'class': "small border rounded px-1 py-0",
            'key': objId,
          }, [
            span({
              'class': "align-middle",
            }, objectFace(reactiveCMR.get(objId), reactiveCMR)),
            btn({
              'class': "btn-sm m-0 ms-1 p-0",
              onClick: ()=>{
                localData.selectedList=localData.selectedList.filter(it=>it!=objId);
              },
              'title': "删除",
            }, [bi("x-lg")], "no-style"),
          ])),
        ]),
      ]),
      div({'class': "input-group input-group-sm"}, [
        h("select", {
          'class': "form-select form-select-sm text-center",
          'value': localData.selected,
          onChange: (event)=>{
            localData.selected = event?.target?.value;
          },
        }, v(objects).map((obj, idx) => h("option", {
          'key': `${idx}`,
          'value': obj._id??obj.id??-1,
        }, objectFace(obj, reactiveCMR)))),
        btn({
          onClick: ()=>{
            if (+localData.selected<0) {return};
            if (localData.selectedList.includes(`${localData.selected}`)) {return};
            localData.selectedList.push(`${localData.selected}`);
          },
          'title': "添加",
        }, bi("plus-lg"), "outline-primary"),
        btn({
          onClick: ()=>{
            ctx.emit("confirm", {type: props?.ctrl?.type??"", value: localData['selectedList']});
            // console.log("confirm");
          },
          'title': "确定",
        }, /*bi("check2")*/"存", "danger"),
        btn({
          'class': ["xx", {'d-none': props?.['ctrl']?.['config']?.['filter']?.length!=1}],
          onClick: ()=>{
            const 模子s = props?.['ctrl']?.['config']?.['filter'];
            if (模子s.length==1) {
              ctx.emit("new", 模子s[0]?.['type']);
              return;
            };
            ctx.emit("new");
            // console.log("new");
          },
          'title': "新建",
        }, bi("plus-circle"), "info"),
        btn({
          onClick: ()=>{
            ctx.emit("cancel");
            // console.log("cancel");
          },
          'title': "取消",
        }, bi("arrow-90deg-left"), "outline-secondary"),
      ])]);
  },
};
// 多个对象控件 结束



// 🆓🆓🆓🆓🆓🆓
// 单个标签控件
const EditorSingleLabelSelector = {
  props: ['ctrl', 'oldValue'],
  emits: ['confirm', 'cancel'],
  component: {},
  setup(props, ctx) {
    const reactiveCMR = inject('reactiveCMR', ()=>({}));
    const labels = computed(()=>{
      let domain = props?.['ctrl']?.['config']?.['set']??"";
      let allLabels = reactiveCMR?.labels??[];
      const boys = allLabels.filter(it=>it.domain==domain);
      return boys;
    });
    const localData = reactive({
      'label': {
        'face': props?.['oldValue']?.['face']??"",
        'domain': props?.['ctrl']?.['config']?.['set']??"",
      },
    });
    return () => div({'class': "input-group input-group-sm"}, [
      btn({
        onClick: ()=>{ctx.emit("copy");},
        'disabled': false,
        'title': "复制"
      }, "拷", "outline-secondary"),
      btn({
        onClick: ()=>{ctx.emit("paste");},
        'disabled': false,
        'title': "粘贴"
      }, "贴", "outline-secondary"),
      h("select", {
        'class': "form-select form-select-sm text-center",
        'value': localData.label.face,
        onChange: (event)=>{
          localData.label.face = event?.target?.value;
        },
      }, [
        ...v(labels).map((label, idx) => h("option", {
          'key': `${idx}`,
          'value': label.face??"???",
        }, label.face)),
        h("option", {
          'key': `--none`,
          'value': "",
        }, "【请选择】"),
      ]),
      btn({
        onClick: ()=>{
          ctx.emit("confirm", {type: props?.ctrl?.type??"", value: localData['label']});
          // console.log("confirm");
        },
        'title': "确定",
      }, /*bi("check2")*/"存", "danger"),
      btn({
        onClick: ()=>{ctx.emit("delete");},
        'disabled': false,
        'title': "删除"
      }, "删", "outline-secondary"),
      // btn({
      //   onClick: ()=>{
      //     ctx.emit("cancel");
      //     // console.log("cancel");
      //   },
      //   'title': "取消",
      // }, bi("arrow-90deg-left"), "outline-secondary"),
    ]);
  },
};
// 单个标签控件 结束



// 🆓🆓🆓🆓🆓🆓
// 单个原文片段控件 工厂
const FactoryOfEditorSingleSpan = (canAppend) => {
  const _canAppend = !!canAppend;
  return {
    props: ['ctrl', 'oldValue'],
    emits: ['confirm', 'cancel', 'clear-selector'],
    component: {},
    setup(props, ctx) {
      console.log(props);
      // const tokenSelector = inject('tokenSelector');
      const selection = inject('selection')??[];
      const tokens = inject('tokens')??[];
      // const idxesToTokens = (idxes) => {
      //   idxes = idxes??[];
      //   if (!tokens?.length) {
      //     return [];
      //   };
      //   return idxes.map(idx => tokens[idx]?.to ?? tokens[idx] ?? {});
      // };
      // const idxesToText = (idxes) => {
      //   let _tokens = idxesToTokens(idxes);
      //   let result = _tokens.map(it => it.word).join("");
      //   return result;
      // };
      const idxesToBlocks = (idxes) => {
        let blocks = [];
        let tmp = [];
        let last = -999;
        for (let idx of idxes) {
          if (idx != last+1) {
            blocks.push(tmp);
            tmp = [];
          };
          tmp.push(idx);
          last = idx;
        };
        blocks.push(tmp);
        blocks = blocks.filter(it=>it.length);
        return blocks;
      };
      const localData = reactive({
        'span': {
          'type': props?.ctrl?.type,
          'value': {
            'text': props?.oldValue?.text,
            'idxes': props?.oldValue?.idxes,
          },
        },
      });
      const 特别的face = computed(() => {
        const idxeses = idxesToBlocks(localData?.['span']?.['value']?.['idxes']);
        const texts = idxeses.map(it=>idxesToText(it, tokens));
        const 老大 = {
          'value': {
            'texts': texts,
            'idxeses': idxeses,
          },
        };
        return faceFn单个不连续原文片段(老大);
      });
      return () => div({'class': "input-group input-group-sm"}, [
        div({'class': "form-control d-inline-block text-center"}, [
          div({
            'class': "d-flex flex-wrap gap-1 justify-content-evenly"
          }, [
            localData?.['span']?.['value']?.['text']?.length
              ? [
                v(特别的face),
                !selection?.array?.length ? muted("...") : null,
              ]
              : !selection?.array?.length ? muted("【请在文中选取】") : null,
              _canAppend ? btn({
              'class': [
                "btn-sm px-1 py-0",
                {"d-none": (!selection?.array?.length || !localData?.['span']?.['value']?.['text']?.length)},
              ],
              onClick: ()=>{
                localData['span']['value']['idxes'] = [...localData['span']['value']['idxes'], ...selection?.array];
                ctx.emit("clear-selector");
                localData['span']['value']['text'] = `${localData['span']['value']['text']}+${idxesToText(localData['span']['value']['idxes'], tokens)}`;
              },
              'title': "将选中的文本追加到此处已有的文本之后",
            }, [bi("plus-lg"), " ", "追加"], "outline-primary") : null,
            btn({
              'class': [
                "btn-sm px-1 py-0",
                {"d-none": (!selection?.array?.length)},
              ],
              onClick: ()=>{
                localData['span']['value']['idxes'] = selection?.array;
                ctx.emit("clear-selector");
                localData['span']['value']['text'] = idxesToText(localData['span']['value']['idxes'], tokens);
              },
              'title': localData?.['span']?.['value']?.['text']?.length ? "用选中的文本覆盖此处的文本" : "将选中的文本填入此处",
            }, [bi("box-arrow-in-down-right"), " ", localData?.['span']?.['value']?.['text']?.length ? "覆盖" : "填入"], "outline-danger"),
          ]),
        ]),
        btn({
          onClick: ()=>{
            ctx.emit("confirm", JSON.parse(JSON.stringify(localData['span'])));
            // console.log("confirm");
          },
          'title': "确定",
        }, bi("check2"), "outline-secondary"),
        btn({
          onClick: ()=>{
            ctx.emit("cancel");
            // console.log("cancel");
          },
          'title': "取消",
        }, bi("arrow-90deg-left"), "outline-secondary"),
      ]);
    },
  };
};
// 单个原文片段控件 工厂 结束

// 单个原文片段控件
// 不论是否可追加，文本都是记录在 text 字段
const EditorSingleSpan = FactoryOfEditorSingleSpan(false);
// 单个原文片段控件 结束

// 🆓🆓🆓🆓🆓🆓
// 单个不连续的原文片段控件
// 不论是否可追加，文本都是记录在 texts 数组 字段
const EditorSingleBrokenSpan = {
  props: ['ctrl', 'oldValue'],
  emits: ['confirm', 'cancel', 'clear-selector'],
  component: {},
  setup(props, ctx) {
    console.log(props);
    // const tokenSelector = inject('tokenSelector');
    const selection = inject('selection')??[];
    const tokens = inject('tokens')??[];
    // const idxesToTokens = (idxes) => {
    //   idxes = idxes??[];
    //   if (!tokens?.length) {
    //     return [];
    //   };
    //   return idxes.map(idx => tokens[idx]?.to ?? tokens[idx] ?? {});
    // };
    // const idxesToText = (idxes) => {
    //   let _tokens = idxesToTokens(idxes);
    //   let result = _tokens.map(it => it.word).join("");
    //   return result;
    // };
    const localData = reactive({
      'span': {
        'type': props?.ctrl?.type,
        'value': {
          'texts': props?.oldValue?.texts??[],
          'idxeses': props?.oldValue?.idxeses??[],
        },
      },
    });
    return () => div({'class': "input-group input-group-sm"}, [
      div({'class': "form-control d-inline-block text-center"}, [
        div({
          'class': "d-flex flex-wrap gap-1 justify-content-evenly"
        }, [
          localData?.['span']?.['value']?.['texts']?.length
            ? [
              faceFn单个不连续原文片段(localData?.['span']),
              !selection?.array?.length ? muted("...") : null,
            ]
            : !selection?.array?.length ? muted("【请在文中选取】") : null,
            btn({
            'class': [
              "btn-sm px-1 py-0",
              {"d-none": (!selection?.array?.length || !localData?.['span']?.['value']?.['texts']?.length)},
            ],
            onClick: ()=>{
              localData['span']['value']['idxeses']?.push(selection?.array);
              ctx.emit("clear-selector");
              localData['span']['value']['texts']?.push(idxesToText(localData['span']['value']['idxeses']?.last(), tokens));
            },
            'title': "将选中的文本追加到此处已有的文本之后",
          }, [bi("plus-lg"), " ", "追加"], "outline-primary"),
          btn({
            'class': [
              "btn-sm px-1 py-0",
              {"d-none": (!selection?.array?.length)},
            ],
            onClick: ()=>{
              localData['span']['value']['idxeses'] = [selection?.array];
              ctx.emit("clear-selector");
              localData['span']['value']['texts'] = [idxesToText(localData['span']['value']['idxeses']?.last(), tokens)];
            },
            'title': localData?.['span']?.['value']?.['texts']?.length ? "用选中的文本覆盖此处的文本" : "将选中的文本填入此处",
          }, [bi("box-arrow-in-down-right"), " ", localData?.['span']?.['value']?.['texts']?.length ? "覆盖" : "填入"], "outline-danger"),
        ]),
      ]),
      btn({
        onClick: ()=>{
          ctx.emit("confirm", JSON.parse(JSON.stringify(localData['span'])));
          // console.log("confirm");
        },
        'title': "确定",
      }, /*bi("check2")*/"存", "danger"),
      btn({
        onClick: ()=>{
          ctx.emit("cancel");
          // console.log("cancel");
        },
        'title': "取消",
      }, bi("arrow-90deg-left"), "outline-secondary"),
    ]);
  },
};
// 单个不连续的原文片段控件 结束




// 🆓🆓🆓🆓🆓🆓
// 多个不连续的原文片段控件
// 不论是否可追加，文本都是记录在 texts 数组 字段
const EditorMultiBrokenSpan = {
  props: ['ctrl', 'oldValue'],
  emits: ['confirm', 'cancel', 'clear-selector', 'copy', 'paste', 'delete'],
  component: {},
  setup(props, ctx) {
    // console.log(props);
    // const tokenSelector = inject('tokenSelector');
    const selection = inject('selection')??[];
    const tokens = inject('tokens')??[];

    const localData = reactive({
      'spans': {
        'type': props?.ctrl?.type,
        'value': props?.oldValue??[],
        // [{
        //   'texts': props?.oldValue?.texts??[],
        //   'idxeses': props?.oldValue?.idxeses??[],
        // }],
      },
    });
    return () => div({'class': "input-group input-group-sm"}, [
      btn({
        onClick: ()=>{ctx.emit("copy", localData?.spans);},
        'disabled': false,
        'title': "复制"
      }, "拷", "outline-secondary"),
      btn({
        onClick: ()=>{ctx.emit("paste");},
        'disabled': false,
        'title': "粘贴"
      }, "贴", "outline-secondary"),
      div({'class': "form-control d-inline-block text-center"}, [
        div({
          'class': "d-flex flex-wrap gap-1 justify-content-evenly"
        }, [
          localData?.['spans']?.['value']?.length
            ? localData?.['spans']?.['value'].map((span, spanIdx)=>labelSpan([
              faceFn单个不连续原文片段无引号({value: span}),
              // !selection?.array?.length ? muted("...") : null,
              btn({
                'class': [
                  "btn-sm p-0",
                  {"d-none": (!selection?.array?.length)},
                ],
                'title': "将选中的文本片段追加到此处已有的文本之后",
                onClick: ()=>{
                  localData?.['spans']?.['value']?.[spanIdx]?.['idxeses'].push(selection?.array);
                  localData?.['spans']?.['value']?.[spanIdx]?.['texts'].push(`${idxesToText(selection?.array, tokens)}`);
                  ctx.emit("clear-selector");
                },
              }, [muted(bi("plus-circle"))]),
              btn({
                'class': [
                  "btn-sm p-0",
                ],
                'title': "删除此文本片段",
                onClick: ()=>{
                  localData?.['spans']?.['value'].splice(spanIdx, 1);
                },
              }, [muted(bi("x-circle"))],)
            ], {'key': `${spanIdx}-${span?.texts?.[0]}`, 'class': "justify-content-evenly"}))
            : !selection?.array?.length ? muted("【请在文中选取】") : null,
          btn({
            'class': [
              "btn-sm px-1 py-0",
              {"d-none": (!selection?.array?.length)},
            ],
            onClick: ()=>{
              localData['spans']['value']?.push({
                'texts': [`${idxesToText(selection?.array, tokens)}`],
                'idxeses': [selection?.array],
              });
              ctx.emit("clear-selector");
            },
            'title': "将选中的文本片段填入此处",
          }, [bi("box-arrow-in-down-right"), " ", "填入"], "outline-danger"),
        ]),
      ]),
      btn({
        onClick: ()=>{
          ctx.emit("confirm", JSON.parse(JSON.stringify(localData['spans'])));
          // console.log("confirm");
        },
        'title': "确定",
      }, /*bi("check2")*/"存", "danger"),
      btn({
        onClick: ()=>{ctx.emit("delete");},
        'disabled': false,
        'title': "删除"
      }, "删", "outline-secondary"),
      // btn({
      //   onClick: ()=>{
      //     ctx.emit("cancel");
      //     // console.log("cancel");
      //   },
      //   'title': "取消",
      // }, bi("arrow-90deg-left"), "outline-secondary"),
    ]);
  },
};
// 多个不连续的原文片段控件 结束










































// 🔯🔯🔯🔯🔯🔯
// 单个字段
const __PropertyItemOld = {
  props: ['slot', 'data'],
  emits: ['set-property', 'clear-selector', 'new'],
  component: {
    EditorDefault,
    EditorBool,
  },
  setup(props, ctx) {
    const reactiveCMR = inject('reactiveCMR', ()=>({}));
    const clipboard = inject('clipboard', ()=>({}));
    const stages = {
      '①呈现数据内容': "①呈现数据内容",
      '②选择操作方式': "②选择操作方式",
      '③进行编辑操作': "③进行编辑操作",
    };
    const localData = reactive({
      currentStage: stages['①呈现数据内容'],
      ctrlIdx: 0,
    });

    const newDataWrap = reactive({
      'data': JSON.parse(JSON.stringify(props?.['data'])),
    });

    watch(()=>props?.['data'], ()=>{
      newDataWrap['data'] = JSON.parse(JSON.stringify(props?.['data']));
    });

    const onGoToEdit = () => {
      const len = props['slot']?.ctrls?.length??0;
      // console.log(len);
      if (len>1) {
        localData.currentStage = stages['②选择操作方式'];
        return;
      };
      if (len==1) {
        localData.ctrlIdx = 0;
        localData.currentStage = stages['③进行编辑操作'];
        return;
      };
      return;
    };
    const onDelete = () => {
      ctx.emit('delete-property');
    };
    const onConfirm = (value) => {
      let key = props['slot']?.['name']??props['slot']?.['nameFace']??"未知字段";
      newDataWrap['data'] = value;
      localData.currentStage = stages['①呈现数据内容'];
      ctx.emit('set-property', {[key]: newDataWrap['data']});
    };
    const onCancel = () => {
      localData.currentStage = stages['①呈现数据内容'];
    };
    const onClearSelector = () => {
      ctx.emit("clear-selector");
    };
    const onNew = (type) => {
      ctx.emit("new", type);
    };
    const onCopy = () => {
      ctx.emit("copy", newDataWrap['data']);
    };
    const onPaste = () => {
      ctx.emit("paste", clipboard);
      console.log(["paste", clipboard]);
      if (newDataWrap['data']?.type!=clipboard['data']?.type) {return;};
      onConfirm(clipboard['data']);
    };


    const currentCtrl = computed(()=>(
      fixCtrl(
        (props['slot']?.ctrls??[])[localData.ctrlIdx]
      )
    ));


    // 单个字段 渲染
    return () => div({'class': "--border p-0 hstack gap-1 align-items-center justify-content-around"}, [
      div({
        'class': [
          "w-25",
          "text-center small",
          "text-muted",
        ],
      }, [
        span(null, `${props['slot']?.nameFace??props['slot']?.name??"无名字段"}`),
      ]),

      //
      localData.currentStage == stages['①呈现数据内容']
      ? [
        div({'class': "input-group input-group-sm"}, [
          btn({
            onClick: ()=>{onCopy()},
            'disabled': false,
            'title': "复制"
          }, "拷", "outline-secondary"),
          btn({
            onClick: ()=>{onPaste()},
            'disabled': false,
            'title': "粘贴"
          }, "贴", "outline-secondary"),
          div({'class': "form-control d-inline-block text-center "}, [
            span({'class': "align-middle"}, dataFace(newDataWrap['data'], reactiveCMR)),
          ]),
          props['slot']?.deletable||true ? btn({
            onClick: ()=>{onDelete()},
            'title': "删除"
          }, bi("trash3"), "outline-secondary") : null,
          btn({
            onClick: ()=>{onGoToEdit()},
            'disabled': (props['slot']?.ctrls?.length??0)<1,
            'title': "编辑"
          }, bi("pencil"), "outline-secondary"),
        ]),
      ]

      //
      : localData.currentStage == stages['②选择操作方式']
      ? [
        div({'class': "input-group input-group-sm"}, [
          div({'class': "form-control d-inline-block text-center"}, [
            div({'class': "mb-1 text-center text-muted"}, "请选择操作方式"),
            div({'class': "d-flex flex-wrap gap-1 justify-content-evenly"}, [
              (props['slot']?.ctrls??[]).map((ctrl, idx)=>btn({
                'class': "btn-sm px-1 py-0",
                onClick: ()=>{
                  localData.ctrlIdx = idx;
                  localData.currentStage = stages['③进行编辑操作'];
                },
              }, `${fixCtrl(ctrl)?.['type']}`, "light")),
            ]),
          ]),
        ]),
      ]

      //
      : localData.currentStage == stages['③进行编辑操作']
      ? [
        h(ctrlComponent(v(currentCtrl)), {
          'ctrl': v(currentCtrl),
          'oldValue': (newDataWrap?.['data']?.['type']==v(currentCtrl)?.['type']) ? newDataWrap?.['data']?.['value'] : null,
          'onConfirm': (value)=>{onConfirm(value);},
          'onCancel': ()=>{onCancel();},
          'onNew': (type)=>{onNew(type);},
          'onClearSelector': ()=>{onClearSelector();},
        }),
      ]

      //
      : null,
    ]);
    // 单个字段 渲染 结束
  },
};
// 单个字段 结束



// 🔯🔯🔯🔯🔯🔯
// 单个字段
const PropertyItem = {
  props: ['slot', 'data'],
  emits: ['set-property', 'clear-selector', 'new'],
  component: {
    EditorDefault,
    EditorBool,
  },
  setup(props, ctx) {
    const reactiveCMR = inject('reactiveCMR', ()=>({}));
    const clipboard = inject('clipboard', ()=>({}));
    const stages = {
      '①呈现数据内容': "①呈现数据内容",
      '②选择操作方式': "②选择操作方式",
      '③进行编辑操作': "③进行编辑操作",
    };
    const localData = reactive({
      currentStage: stages['①呈现数据内容'],
      ctrlIdx: 0,
    });

    const newDataWrap = reactive({
      'data': JSON.parse(JSON.stringify(props?.['data'])),
    });

    watch(()=>props?.['data'], ()=>{
      newDataWrap['data'] = JSON.parse(JSON.stringify(props?.['data']));
    });

    onMounted(()=>{
      if (props?.['data']?.['value']!=null) {return;};
      onGoToEdit();
    });

    const onGoToEdit = () => {
      const len = props['slot']?.ctrls?.length??0;
      // console.log(len);
      if (len>1) {
        localData.currentStage = stages['②选择操作方式'];
        return;
      };
      if (len==1) {
        localData.ctrlIdx = 0;
        localData.currentStage = stages['③进行编辑操作'];
        return;
      };
      return;
    };
    const onDelete = () => {
      ctx.emit('delete-property');
    };
    const onConfirm = (value) => {
      let key = props['slot']?.['name']??props['slot']?.['nameFace']??"未知字段";
      newDataWrap['data'] = value;
      localData.currentStage = stages['①呈现数据内容'];
      ctx.emit('set-property', {[key]: newDataWrap['data']});
    };
    const onCancel = () => {
      localData.currentStage = stages['①呈现数据内容'];
    };
    const onClearSelector = () => {
      ctx.emit("clear-selector");
    };
    const onNew = (type) => {
      ctx.emit("new", type);
    };
    const onCopy = (data) => {
      ctx.emit("copy", data??newDataWrap['data']);
      console.log(["copy", data??newDataWrap['data']]);
    };
    const onPaste = () => {
      ctx.emit("paste", clipboard);
      console.log(["paste", clipboard]);
      if (newDataWrap['data']?.type!=clipboard['data']?.type) {return;};
      onConfirm(clipboard['data']);
    };


    const currentCtrl = computed(()=>(
      fixCtrl(
        (props['slot']?.ctrls??[])[localData.ctrlIdx]
      )
    ));


    // 单个字段 渲染
    return () => div({'class': "--border p-0 hstack gap-1 align-items-center justify-content-around"}, [
      div({
        'class': [
          "w-25",
          "text-center small",
          "text-muted",
        ],
      }, [
        span({
          'title': props['slot']?.desc,
        }, `${props['slot']?.nameFace??props['slot']?.name??"无名字段"}`),
      ]),

      //
      localData.currentStage == stages['①呈现数据内容']
      ? [
        div({'class': "input-group input-group-sm"}, [
          btn({
            onClick: ()=>{onCopy()},
            'disabled': false,
            'title': "复制"
          }, "拷", "outline-secondary"),
          btn({
            onClick: ()=>{onPaste()},
            'disabled': false,
            'title': "粘贴"
          }, "贴", "outline-secondary"),
          div({'class': "form-control d-inline-block text-center "}, [
            span({'class': "align-middle"}, dataFace(newDataWrap['data'], reactiveCMR, v(currentCtrl)?.config?.joint)),
          ]),
          btn({
            onClick: ()=>{onGoToEdit()},
            'disabled': (props['slot']?.ctrls?.length??0)<1,
            'title': "编辑"
          }, "改", "outline-secondary"),
          props['slot']?.deletable||true ? btn({
            onClick: ()=>{onDelete()},
            'title': "删除"
          }, "删", "outline-secondary") : null,
        ]),
      ]

      //
      : localData.currentStage == stages['②选择操作方式']
      ? [
        div({'class': "input-group input-group-sm"}, [
          div({'class': "form-control d-inline-block text-center"}, [
            div({'class': "mb-1 text-center text-muted"}, "请选择操作方式"),
            div({'class': "d-flex flex-wrap gap-1 justify-content-evenly"}, [
              (props['slot']?.ctrls??[]).map((ctrl, idx)=>btn({
                'class': "btn-sm px-1 py-0",
                onClick: ()=>{
                  localData.ctrlIdx = idx;
                  localData.currentStage = stages['③进行编辑操作'];
                },
              }, `${fixCtrl(ctrl)?.['type']}`, "light")),
            ]),
          ]),
        ]),
      ]

      //
      : localData.currentStage == stages['③进行编辑操作']
      ? [
        h(ctrlComponent(v(currentCtrl)), {
          'ctrl': v(currentCtrl),
          'oldValue': (newDataWrap?.['data']?.['type']==v(currentCtrl)?.['type']) ? newDataWrap?.['data']?.['value'] : null,
          'onConfirm': (value)=>{onConfirm(value);},
          'onCancel': ()=>{onCancel();},
          'onNew': (type)=>{onNew(type);},
          'onClearSelector': ()=>{onClearSelector();},
          'onCopy': (data)=>{onCopy(data);},
          'onPaste': ()=>{onPaste();},
          'onDelete': ()=>{onDelete();},
        }),
      ]

      //
      : null,
    ]);
    // 单个字段 渲染 结束
  },
};
// 单个字段 结束









// 🔯🔯🔯🔯🔯🔯
// 单个对象的编辑窗口
const ObjectPanel = {
  props: ['data', 'typeDef'],
  emits: ['new', 'copy-property', 'save-object', 'clone-object', 'reset-object', 'delete-object', 'close-object', 'clear-selector'],
  component: {
    PropertyItem,
  },
  setup(props, ctx) {

    const reactiveCMR = inject('reactiveCMR', ()=>({}));

    const onClearSelector = () => {
      ctx.emit("clear-selector");
    };

    const localObjectShadow = reactive({
      'data': JSON.parse(JSON.stringify(props?.['data']??{})),
    });

    const localData = reactive({
      'fieldToAdd': "",
      'showResetConfirmModal': false,
      'showDeleteConfirmModal': false,
      'collapse': false,
    });

    const slots = computed(() => (props?.typeDef?.slots??[]));

    const slotDict = computed(() => {
      let dict = {};
      for (let slot of v(slots)) {
        if (slot.name) {
          dict[slot.name] = slot;
        }
      };
      return dict;
    });

    const fields = computed(() => {
      // let v_slotDict = v(slotDict);
      // let kkvvs = Object.entries(localObjectShadow.data);

      let result = [];
      for (let slot of v(slots)) {
        if ((slot.name && slot.name in localObjectShadow.data) || slot.gap) {
          result.push(slot);
        }
      };
      return result;


      // let that = kkvvs
      //   .filter(kkvv => kkvv[0] in v_slotDict)
      //   .map(kkvv => {
      //     let [kk, vv] = kkvv;
      //     return v_slotDict[kk];
      //   });
      // // console.log(that);
      // return that;
    });

    const moreFields = computed(() => {
      let that = [];
      for (let slot of v(slots)) {
        if (!slot.gap && slot.name && !(slot.name in localObjectShadow.data)) {
          that.push(slot);
        };
      };
      return that;
    });

    const onSetProperty = (xx) => {
      Object.assign(localObjectShadow.data, xx);
      ctx.emit("save-object", localObjectShadow.data);
    };
    const onDeleteProperty = (fieldName) => {
      localObjectShadow.data[fieldName] = undefined;
      delete localObjectShadow.data[fieldName];
      ctx.emit("save-object", localObjectShadow.data);
    };
    const onNew = (type) => {
      ctx.emit("new", type);
    };

    const addField = (fieldName) => {
      if (!fieldName.length) {return;};
      if (fieldName in localObjectShadow.data) {return;};
      let _default = v(slotDict)?.[fieldName]?.default ?? v(slotDict)?.[fieldName]?.init ?? null;
      Object.assign(localObjectShadow.data, {
        [fieldName]: _default,
      });
      if (_default==null) {return;};
      ctx.emit("save-object", localObjectShadow.data);
    };

    const 标题栏 = () => {
      return div({
        'class': [
          "text-center small",
          "hstack gap-1 px-2 py-1 justify-content-between",
          "text-muted --bg-opacity-75 --bg-secondary border-bottom --border-secondary",
        ],
      }, [

        // 类型标题
        div({
          'class': "hstack gap-2",
          'title': JSON.stringify(props?.data),
        }, [
          props?.typeDef?.['icon-bi'] ? bi(props?.typeDef?.['icon-bi']) : null,
          span({
            'class': "--user-select-none",
            // 'title': JSON.stringify(props.typeDef),
          }, `${props?.typeDef?.nameFace??props?.typeDef?.name??"未知类型"}`),
          span({
            'class': "--user-select-none",
            'title': JSON.stringify(props?.data),
          }, `[${props?.data?._id??props?.data?.id}]`),
        ]),

        // 按钮区
        div({
          'class': "hstack gap-2",
        }, [

          // btn({
          //   'class': "btn-sm px-1 py-0 text-muted hstack gap-1",
          //   onClick: ()=>{
          //     ctx.emit("save-object", localObjectShadow.data);
          //   },
          //   'disabled': false,
          // }, [bi("save2"), "保存"], "--outline-secondary"),
  
          btn({
            'class': "btn-sm px-1 py-0 text-muted hstack gap-1",
            onClick: ()=>{
              ctx.emit("clone-object", localObjectShadow.data);
            },
            'disabled': false,
            'title': "克隆",
          }, [/*bi("back"), */"克隆"], "--outline-secondary"),
  
          // btn({
          //   'class': "btn-sm px-1 py-0 text-muted hstack gap-1",
          //   onClick: ()=>{
          //     localData.showResetConfirmModal=true;
          //   },
          //   'disabled': false,
          // }, [bi("arrow-repeat"), "重置"], "--outline-secondary"),

          // 删除按钮
          btn({
            'class': "btn-sm px-1 py-0 text-muted hstack gap-1",
            onClick: ()=>{
              localData.showDeleteConfirmModal=true;
            },
            'disabled': false,
            'title': "删除",
          }, [/*bi("trash3"), */"删除"], "--outline-secondary"),

          // 分割线
          vr(),

          // 收起按钮
          btn({
            'class': ["btn-sm px-1 py-0", {"d-none": localData.collapse}],
            onClick: ()=>{
              localData.collapse=true;
            },
            'title': "收起",
          }, bi("arrows-collapse"), "--outline-danger"),

          // 展开按钮
          btn({
            'class': ["btn-sm px-1 py-0", {"d-none": !localData.collapse}],
            onClick: ()=>{
              localData.collapse=false;
            },
            'title': "展开",
          }, bi("arrows-expand"), "--outline-danger"),

          // 关闭按钮
          btn({
            'class': "btn-sm px-1 py-0",
            onClick: ()=>{
              ctx.emit("close-object", localObjectShadow.data);
            },
            'title': "关闭",
          }, bi("x-lg"), "--outline-danger"),
        ]),


      ]);
    };

    const 数据呈现 = () => {
      return div({
        'class': "mx-2 mt-1 mb-2",
      }, [
        div({
          'class': "py-1 px-2 rounded --border text-center bg-white --bg-opacity-25",
          // 'title': JSON.stringify(props?.data),
        }, [
          objectFace(localObjectShadow.data, reactiveCMR),
        ]),
      ]);
    };

    const onCopyProperty = (data) => {
      ctx.emit("copy-property", data);
    };

    const 字段列表 = () => {
      return div({
        'class': "vstack gap-1 px-2 py-2"
      }, [

        // 已有字段
        v(fields).map((field, idx) => field.gap ? div({
          'class': "my-2 border-top w-25",
        }) : h(PropertyItem, {
          'key': `${idx}-${field?.name}`,
          'data': localObjectShadow?.data?.[field?.name],
          'slot': field,
          'onSetProperty': (xx)=>{onSetProperty(xx);},
          'onDeleteProperty': ()=>{onDeleteProperty(field?.name??"");},
          'onClearSelector': ()=>{onClearSelector();},
          'onNew': (type)=>{onNew(type);},
          'onCopy': (data)=>{onCopyProperty(data);},
        })),

        v(moreFields).length ? div({
          'class': "my-2",
        }) : null,

        // 添加字段
        v(moreFields).length ? div({'class': "--border p-0 hstack gap-1 align-items-center justify-content-around"}, [
          div({
            'class': [
              "w-25",
              "text-center small",
              "text-muted",
            ],
          }, "添加字段"),

          div({'class': "input-group input-group-sm"}, [
            h("select", {
              'class': "form-select text-center bg-light",
              onChange: (event)=>{
                localData.fieldToAdd = event?.target?.value;
              },
              'value': localData.fieldToAdd,
            }, [
              h("option", {
                'value': localData.fieldToAdd,
              }, "<请选择>"),
              ...v(moreFields).map(field=>h("option", {
                'value': field.name,
              }, [field.nameFace??field.name])),
            ]),
            btn({
              onClick: ()=>{
                addField(localData.fieldToAdd);
              },
              'title': "执行添加",
            }, bi("plus-lg"), "outline-secondary"),
          ]),
        ]) : null,
      ]);
    };

    // const 总体操作 = () => {
    //   return div({
    //     'class': "hstack gap-2 p-2 justify-content-end",
    //   }, [
    //   ]);
    // };

    const 重置确认框 = () => confirmModal(
      localData,
      "showResetConfirmModal",
      "确定要重置此对象吗？将会恢复到上次保存的状态。",
      ()=>{
        ctx.emit("reset-object", localObjectShadow.data);
        localObjectShadow.data = JSON.parse(JSON.stringify(props?.['data']??{}));
      },
    );

    const 删除确认框 = () => confirmModal(
      localData,
      "showDeleteConfirmModal",
      "确定要删除此对象吗？",
      ()=>{
        ctx.emit("delete-object", localObjectShadow.data);
      },
    );

    return () => div({
      'class': "card bg-light border gap-1 overflow-auto shadow-sm",
      // 'style': "box-shadow: rgba(0, 0, 0, 0.075) 0px 0px 0px 1px inset, rgba(0, 0, 0, 0.075) 0px 1px 4px 0px;",
    }, [
      标题栏(),
      数据呈现(),
      localData.collapse ? null : 字段列表(),
      重置确认框(),
      删除确认框(),
    ]);
  },
};
// 单个对象的编辑窗口 结束

// 🔯🔯🔯🔯🔯🔯
// 众多对象编辑窗口的列表
const ObjectPanelList = {
  props: ['objectWraps'],
  emits: ['new-object', 'save-object', 'clone-object', 'reset-object', 'delete-object', 'hide-object-wrap', 'clear-selector'],
  component: {
    ObjectPanel,
  },
  setup(props, ctx) {

    const onClearSelector = () => {
      ctx.emit("clear-selector");
    };

    const clipboard = reactive({data: {}});
    provide('clipboard', clipboard);

    const shouldShow = computed(()=>{
      return props?.['objectWraps']?.filter?.(it=>it?.show)?.length;
    });
    return () => div({
      'class': ["vstack gap-3", {"d-none": !v(shouldShow)}],
    }, [
      div({'class': "h6 mt-3 mb-1"}, ["正在标注"]),
      props['objectWraps'].map((objWrap, idx) => objWrap?.['show'] ? h(ObjectPanel, {
        'key': objWrap?.data?._id??objWrap?.data?.id,
        'data': objWrap['data'],
        'typeDef': objWrap['typeDef'],
        'onNew': (type)=>{
          ctx.emit("new-object", type);
        },
        'onSaveObject': (object)=>{
          ctx.emit("save-object", object);
        },
        'onCloneObject': (object)=>{
          ctx.emit("clone-object", object);
        },
        'onResetObject': (object)=>{
          ctx.emit("reset-object", object);
        },
        'onDeleteObject': (object)=>{
          ctx.emit("delete-object", object);
        },
        'onCloseObject': ()=>{
          ctx.emit("hide-object-wrap", objWrap);
        },
        'onClearSelector': ()=>{
          onClearSelector();
        },
        'onCopyProperty': (data)=>{
          if (data==null) {return;};
          clipboard.data = data;
          //
        },
      }) : null),
    ]);
  },
};
// 众多对象编辑窗口的列表 结束

// 🔯🔯🔯🔯🔯🔯
// 所有对象陈列盒子
const AllObjectsPanel = {
  props: ['objectWraps', 'types'],
  emits: ['sort-objects', 'sort-objects-by-id', 'sort-objects-by-type', 'analyze-objects', 'add-object', 'do-debug', 'show-object-wrap', 'hide-object-wrap'],
  component: {},
  setup(props, ctx) {
    const reactiveCMR = inject('reactiveCMR', ()=>({}));
    const localData = reactive({
      'typeNameToAdd': {},
      'showAddObjectControl': false,
    });
    return () => div({'class': "vstack gap-2 my-1"}, [
      // div({'class': "h6 mt-3 mb-1"}, ["全部"]),

      // 陈列盒子
      div({
        'class': "__ratio __ratio-21x9 border rounded overflow-auto",
        'style': "min-height: 1.5em; max-height: 20em;"
      }, div({'class': "p-1"}, [
        div({'class': "d-flex flex-wrap gap-1"}, props['objectWraps']?.length ? [
          ...(props['objectWraps']??[])
            .map((objWrap, idx) => btn({
              'key': `${idx}-${objWrap?.data?._id??objWrap?.data?.id}`,
              'class': ["btn-sm", {"opacity-50": objWrap?.data?.type=="文本"&&!objWrap['show']}],
              // 'title': JSON.stringify(objWrap?.data, null, 2),
              onClick: ()=>{
                let x = objWrap['show']
                  ?(ctx.emit("hide-object-wrap", objWrap))
                  :(ctx.emit("show-object-wrap", objWrap));
              },
            }, [
              muted(objWrap?.data?._id??objWrap?.data?.id),
              // span({'class': "text-muted pe-2"}, objWrap?.data?._id??objWrap?.data?.id??"_"),
              objWrap?.['typeDef']?.['icon-bi']?.length ? [
                span({'class': "px-2"}, bi(objWrap?.['typeDef']?.['icon-bi'])),
              ] : null,
              objectFace(objWrap.data, reactiveCMR),
            ], objWrap['show']?"outline-primary":"light")),
        ] : [span({class:"px-2"}, muted("暂无内容"))]),
      ])),

      // 工具
      div({'class': "btn-toolbar __hstack gap-1 justify-content-start"}, [
        div({'class': "btn-group btn-group-sm"}, [
          lightBtn(bi("sort-down-alt"), "按原文排序", "按照文本中出现的顺序排序", {
            onClick: ()=>{
              ctx.emit("sort-objects");
            },
          }),
          lightBtn(bi("sort-numeric-down"), "按创建顺序排序", "按创建顺序排序", {
            onClick: ()=>{
              ctx.emit("sort-objects-by-id");
            },
          }),
          lightBtn(bi("sort-alpha-down"), "按类型排序", "按照类型排序", {
            onClick: ()=>{
              ctx.emit("sort-objects-by-type");
            },
          }),
          // lightBtn(bi("bar-chart-steps"), "预分析", null, {
          //   onClick: ()=>{
          //     ctx.emit("analyze-objects");
          //   },
          // }),
          // lightBtn(bi("plus-circle"), "新增", null, {
          //   onClick: ()=>{
          //     localData.showAddObjectControl = !localData.showAddObjectControl;
          //   },
          // }),
          // lightBtn(bi("bug"), "debug", null, {
          //   onClick: ()=>{
          //     ctx.emit("do-debug");
          //     console.log(props['objectWraps']);
          //   },
          // }),
        ]),
      ]),

      // // 新增操作区
      // div({'class': ["hstack gap-1", {
      //   // "d-none": !localData.showAddObjectControl
      // }]}, [
      //   div({'class': "input-group input-group-sm"}, [
      //     h("label", {'class': "input-group-text"}, "新增"),
      //     h("select", {
      //       'class': "form-select text-center",
      //       onChange: (event)=>{
      //         localData.typeNameToAdd = event?.target?.value;
      //       },
      //       'value': localData.typeNameToAdd,
      //     }, [
      //       ...(props?.types??[]).map(type=>h("option", {
      //         'value': type.name,
      //       }, [type.nameFace??type.name])),
      //     ]),
      //     btn({
      //       onClick: ()=>{
      //         ctx.emit("add-object", localData.typeNameToAdd);
      //         localData.showAddObjectControl = false;
      //       },
      //       'title': "执行添加",
      //     }, bi("plus-lg"), "outline-secondary"),
      //   ]),
      // ]),

      // 新增操作区
      div({'class': ["d-flex flex-wrap gap-2", {
        // "d-none": !localData.showAddObjectControl
      }]}, [
        ...(props?.types??[]).map(type=>btn(
          {
            onClick: ()=>{
              ctx.emit("add-object", type.name);
            },
            'class': "btn-sm",
            'title': `新增一项 ${type.nameFace??type.name??"无名类型"} 的标注`,
          },
          [`新增 ${type.nameFace??type.name??"无名类型"}`],
          "light",
        )),
      ]),

    ]);
  },
};
// 所有对象陈列盒子 结束

// 🔯🔯🔯🔯🔯🔯
// 标注结果盒子
const ResultPanel = {
  props: ['annotation'],
  emits: ['update'],
  component: {
    CmrDisplay,
  },
  setup(props, ctx) {
    const reactiveCMR = inject('reactiveCMR', ()=>({}));
    return () => div({'class': "vstack gap-2 my-1"}, [
      div({'class': "hstack mt-3 mb-1 gap-2"}, [
        div({'class': "h6 m-0"}, ["预览"]),
        lightBtn(bi("arrow-repeat"), "刷新", null, {
          // 'class': "mt-3 mb-1",
          onClick: ()=>{
            ctx.emit('update');
          },
        }),
      ]),
      // 陈列盒子
      div({
        'class': "__ratio __ratio-21x9 border rounded overflow-auto",
        'style': "min-height: 1.5em; max-height: 12em;"
      }, div({'class': "p-1"}, div({
        'class': "d-flex flex-wrap gap-1"
      }, h(CmrDisplay, {
        'class': "w-100",
        'annotation': props?.['annotation'],
      }))))
    ]);
  },
};
// 标注结果盒子 结束

// 🔯🔯🔯🔯🔯🔯
// 开始操作按钮组
const StartButtonGroup = {
  props: [],
  emits: ['save-to-cloud', 'reset-from-cloud'],
  component: {},
  setup(props, ctx) {
    return () => div({
      'class': "hstack gap-2 my-3 justify-content-start",
    }, [
      btn({
        'class': "btn-sm",
        onClick: ()=>{ctx.emit('reset-from-cloud');},
        'title': "重置为云端保存时的状态。",
      }, "从云端读取", "warning"),
      btn({
        'class': "btn-sm",
        onClick: ()=>{ctx.emit('save-to-cloud');},
        'title': "将未完成的标注暂时保存到云端，并记录这条标注处于「未完成」的状态。",
      }, "保存到云端", "primary"),
    ]);
  }
};
// 开始操作按钮组 结束

// 🔯🔯🔯🔯🔯🔯
// 最终操作按钮组
const FinalButtonGroup = {
  props: [],
  emits: ['save', 'ok', 'reset', 'clean', 'debug', 'go-prev', 'go-next'],
  component: {},
  setup(props, ctx) {
    return () => div({
      'class': "hstack gap-2 my-3 justify-content-between flex-wrap",
    }, [
      div({
        'class': "hstack gap-2 justify-content-end flex-wrap",
      }, [
        btn({
          'class': "btn-sm",
          onClick: ()=>{ctx.emit('save');},
          'title': "将未完成的标注暂时保存到云端，并记录这条标注处于「未完成」的状态。",
        }, "暂时保存", "primary"),
        btn({
          'class': "btn-sm",
          onClick: ()=>{ctx.emit('ok');},
          'title': "保存并提交，记为「完成」状态。",
        }, "完成并保存", "success"),
        btn({
          'class': "btn-sm",
          onClick: ()=>{ctx.emit('reset');},
          'title': "重置为上次保存时的状态。",
        }, "重置", "warning"),
        btn({
          'class': "btn-sm",
          onClick: ()=>{ctx.emit('clean');},
        }, "清空", "danger"),
        btn({
          'class': "btn-sm",
          onClick: ()=>{ctx.emit('debug');},
        }, "DEBUG", "outline-secondary"),
      ]),
      div({
        'class': "hstack gap-2 justify-content-end flex-wrap",
      }, [
        btn({
          'class': "btn-sm",
          onClick: ()=>{ctx.emit('go-prev');},
          'title': "不会保存",
        }, "上一条", "outline-secondary"),
        btn({
          'class': "btn-sm",
          onClick: ()=>{ctx.emit('go-next');},
          'title': "不会保存",
        }, "下一条", "outline-secondary"),
      ]),
    ]);
  }
};
// 最终操作按钮组 结束

// 🔯🔯🔯🔯🔯🔯
// 整个组件
export default {
  props: ['tokenSelector', 'selection', 'stepCtrl', 'alertBox', 'example', 'step', 'stepProps', 'go-prev', 'go-next'],
  emits: ['save', 'reset'],
  component: {
    AllObjectsPanel,
    ObjectPanelList,
    ResultPanel,
    StartButtonGroup,
    FinalButtonGroup,
  },
  setup(props, ctx) {
    const onClearSelector = () => {
      props?.tokenSelector?.clear?.(props?.example?.material?.tokenList);
    };
    const tokens = computed(()=>props?.example?.material?.tokenList??[]);
    const reactiveCMR = reactive(new CMR);
    provide('reactiveCMR', reactiveCMR);
    provide('tokenSelector', props.tokenSelector);
    provide('selection', props.selection);
    provide('tokens', props?.example?.material?.tokenList??[]);
    const init = () => {
      reactiveCMR.initDefinition(props?.['stepProps']?.['definition']);
      const existedObjects =
        props?.['example']?.['annotations']
          ?.filter?.(it=>it.mode==props?.step?.mode)
          ?.[0]?.['data']?.['objects']??[];
      reactiveCMR.initData({'objects': existedObjects});
    };

    const makeOutputData = () => {
      const data = {
        'objects': JSON.parse(JSON.stringify(reactiveCMR.objects)),
      };
      return data;
    };

    const 最终按钮区 = () => h(FinalButtonGroup, {
      'onDebug': ()=>{
        console.log(reactiveCMR);
      },
      'onSave': ()=>{
        const data = {
          'needCompletion': true,
          'completed': false,
          'data': makeOutputData(),
        };
        ctx.emit('save', data);
      },
      'onOk': ()=>{
        const data = {
          'needCompletion': true,
          'completed': true,
          'data': makeOutputData(),
        };
        ctx.emit('save', data);
      },
      'onReset': ()=>{
        localData.showResetConfirmModal=true;
      },
      'onClean': ()=>{
        localData.showCleanConfirmModal=true;
      },
      'onGoPrev': ()=>{
        ctx.emit('go-prev');
      },
      'onGoNext': ()=>{
        ctx.emit('go-next');
      },
    });

    const 重置确认框 = () => confirmModal(
      localData,
      "showResetConfirmModal",
      "确定要重置所有标注数据吗？将会恢复到上次保存的状态。",
      ()=>{
        ctx.emit("reset-data", {});
        init();
        // reactiveCMR.reset();
      },
    );

    const 清空确认框 = () => confirmModal(
      localData,
      "showCleanConfirmModal",
      "确定要清空所有标注数据吗？该操作无法撤销。",
      ()=>{
        ctx.emit("clean-data", {});
        // init();
        reactiveCMR.reset();
      },
    );

    const localData = reactive({
      'showDict': {},
      'showList': [],
      'showResetConfirmModal': false,
      'showCleanConfirmModal': false,
      'displayData': {},
    });

    const updateDisplay = () => {
      localData['displayData'] = makeOutputData();
    };

    const objectWraps = computed(()=>{
      const that = reactiveCMR.objects.map(obj=>({
        '_id': obj['_id'],
        'data': obj,
        'typeDef': reactiveCMR.typeOf(obj),
        'show': localData['showList'].includes(obj['_id']),
      }));
      return that;
    });

    const objectsToShow = computed(()=>{
      const nodes = localData['showList'].map(id=>{
        let obj = reactiveCMR.objectDict[id];
        if (obj!=null) {
          const that = {
            '_id': id,
            'data': obj,
            'typeDef': reactiveCMR.typeOf(obj),
            'show': true,
          };
          return that;
        };
      });
      return nodes.reverse()??null;
    });

    onMounted(()=>{
      // console.log(props);
      init();
      updateDisplay();
    });

    const onSaveObject = (object) => {
      reactiveCMR.updateObject(object);
    };
    const onDeleteObject = (object) => {
      reactiveCMR.deleteObject(object);
    };

    const show = (id) => {
      localData['showDict'][id]=true;
      if (!localData['showList'].includes(id)) {
        localData['showList'].push(id);
      };
    };

    const hide = (id) => {
      localData['showDict'][id]=false;
      if (localData['showList'].includes(id)) {
        localData['showList'] = localData['showList'].filter(it=>it!=id);
      };
    };


    const 自动填入 = (obj) => {
      if (!props.selection?.array?.length) {return};
      const type = reactiveCMR.typeDict[obj.type];
      if (type==null) {return};

      if (type.name=="文本") {
        obj['内容'] = {
          'type': "单个不连续原文片段",
          'value': {
            'idxeses': JSON.parse(JSON.stringify([props.selection?.array])),
            'texts': JSON.parse(JSON.stringify([idxesToText(props.selection?.array, v(tokens))])),
          },
        };
        onClearSelector();
      };

      const 需要文本的字段设定 = type?.slots?.find?.(slot=>
        slot?.ctrls?.find?.(it=>
          it?.config?.filter?.find?.(dd=>dd?.type=="文本")
        )
      );

      if (需要文本的字段设定==null) {return;};

      const 文本Object = reactiveCMR.makeNewObjectWithType("文本");
      文本Object['内容'] = {
        'type': "单个不连续原文片段",
        'value': {
          'idxeses': JSON.parse(JSON.stringify([props.selection?.array])),
          'texts': JSON.parse(JSON.stringify([idxesToText(props.selection?.array, v(tokens))])),
        },
      };
      onClearSelector();

      const 需要文本的控件类型 = 需要文本的字段设定?.ctrls?.find?.(it=>
        it?.config?.filter?.find?.(dd=>dd?.type=="文本")
      )?.type;

      const 需要文本的字段名 = 需要文本的字段设定?.name;

      if (需要文本的控件类型=="多个对象") {
        obj[需要文本的字段名] = {
          'type': 需要文本的控件类型,
          'value': [`${文本Object._id}`],
        };
      };

      if (需要文本的控件类型=="单个对象") {
        obj[需要文本的字段名] = {
          'type': 需要文本的控件类型,
          'value': `${文本Object._id}`,
        };
      };


      // if (obj==null) {obj={}};
      // const keys = Object.keys(obj);
      // keys.find(key=>obj[key]);
    };


    const 所有对象面板 = () => h(AllObjectsPanel, {
      'objectWraps': v(objectWraps),
      'types': reactiveCMR.types,
      'onSortObjectsById': ()=>{
        reactiveCMR.sortObjectsById();
      },
      'onSortObjectsByType': ()=>{
        reactiveCMR.sortObjectsByType();
      },
      'onSortObjects': ()=>{
        reactiveCMR.sortObjectsByType();
        const fn = it => 原文顺序依据(it, reactiveCMR);
        reactiveCMR.objects.sort((aa,bb)=>fn(aa)-fn(bb));
      },
      'onHideObjectWrap': (objWrap)=>{
        hide(objWrap['_id']);
      },
      'onShowObjectWrap': (objWrap)=>{
        show(objWrap['_id']);
      },
      'onAddObject': (typeName)=>{
        if (!typeName?.length) {return;};
        const newObject = reactiveCMR.makeNewObjectWithType(typeName);
        自动填入(newObject);
        show(newObject._id);
      },
    }, []);

    const 单个对象面板列表 = () => h(ObjectPanelList, {
      'objectWraps': v(objectsToShow),
      'onNewObject': (type)=>{
        const newObject = reactiveCMR.makeNewObjectWithType(type);
        show(newObject?._id);
      },
      'onCloneObject': (object)=>{
        const newObject = reactiveCMR.cloneObject(object);
        show(newObject._id);
      },
      'onDeleteObject': (object)=>{onDeleteObject(object);},
      'onSaveObject': (object)=>{onSaveObject(object);},
      'onHideObjectWrap': (objWrap)=>{
        hide(objWrap['_id']);
      },
      'onClearSelector': ()=>{
        onClearSelector();
      },
    });

    const 结果预览面板 = () => h(ResultPanel, {
      'annotation': localData['displayData'],
      'onUpdate': ()=>{updateDisplay();},
    });

    return () => div({'class': "--border --p-2 my-1 vstack gap-2"}, [
      // div({'class': ""}, [
      //   "请按照 ",
      //   ha("CSpaceBank 标注规范"),
      //   " 进行标注。",
      // ]),

      // h(StartButtonGroup),
      所有对象面板(),
      单个对象面板列表(),
      最终按钮区(),
      // 结果预览面板(),
      重置确认框(),
      清空确认框(),

    ]);
  },
};
// 整个组件 结束