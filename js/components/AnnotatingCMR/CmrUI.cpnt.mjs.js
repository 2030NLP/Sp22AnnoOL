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

const ha = (children, href, title, targetBlank) => {
  targetBlank = targetBlank?(!!targetBlank):true;
  return h("a", {
    'href': href??"#",
    'title': title??"",
    'target': targetBlank?'_blank':undefined,
  }, children);
};
const muted = text => span({'class': "text-muted"}, text);
const textPrimary = text => span({'class': "text-primary"}, text);
const textSecondary = text => span({'class': "text-secondary"}, text);
const textSuccess = text => span({'class': "text-success"}, text);
const textDanger = text => span({'class': "text-danger"}, text);
const textWarning = text => span({'class': "text-warning"}, text);
const textInfo = text => span({'class': "text-info"}, text);
const textLight = text => span({'class': "text-light"}, text);
const textDark = text => span({'class': "text-dark"}, text);
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
  return result;
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
  return text.length ? [textPrimary("“"), muted(text), textPrimary("”")] : idxes.length ? muted(JSON.stringify(idxes)) : muted("【请在文中选取】");
};
const faceFn单个不连续原文片段 = (boy) => {
  const texts = boy?.value?.texts??[];
  const textSpans = texts.map(it=>muted(it));
  const sss = spansJoin(textSpans, textPrimary("+"));

  const idxeses = boy?.value?.idxeses ?? [];
  return texts.length ? span({}, [textPrimary("“"), sss, textPrimary("”")]) : idxeses.length ? muted(JSON.stringify(idxeses)) : muted("【请在文中选取】");
};

const faceFn单个标签 = (boy) => {
  return boy?.value?.face?.length?textInfo(boy?.value?.face):textDanger("???");
};

const ctrlTypeFaceFnMap = {
  '原文片段': (boy)=>faceFn单个原文片段(boy),
  '单个原文片段': (boy)=>faceFn单个原文片段(boy),
  '不连续原文片段': (boy)=>faceFn单个不连续原文片段(boy),
  '单个不连续原文片段': (boy)=>faceFn单个不连续原文片段(boy),
  '单个标签': (boy)=>faceFn单个标签(boy),
  '单个对象': (boy)=>span({}, JSON.stringify(boy)),
  '多个原文片段': (boy)=>span({}, JSON.stringify(boy)),
  '多个标签': (boy)=>span({}, JSON.stringify(boy)),
  '多个对象': (boyListWrap, joint)=>{
    const dogs = (boyListWrap?.value??[]).map(boy=>ctrlTypeFaceFnMap['单个对象'](boy));
    let girls = [];
    let first = true;
    for (let dog of dogs) {
      if (!first) {girls.push(joint)};
      if (first) {first = false};
      girls.push(dog);
    };
    return girls;
  },
  '布尔值': (boy)=>(boy?.value?(span({'class': "text-success"}, "true")):(span({'class': "text-danger"}, "false"))),
  '数值': (boy)=>span({'class': "text-primary"}, boy?.value),
};

const dataFace = (cat, joint) => {
  if (cat?.type in ctrlTypeFaceFnMap) {
    return ctrlTypeFaceFnMap[cat?.type](cat, joint);
  };
  return JSON.stringify(cat);
};

const objectTypeFaceFnMap = {
  '': (boy)=>JSON.stringify(boy),
  '文本': (boy)=>dataFace(boy?.['内容']),
};

const objectFace = (object) => {
  if (object.type in objectTypeFaceFnMap) {
    return objectTypeFaceFnMap[object.type](object);
  };
  return JSON.stringify(object?.data??object);
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
    '单个标签': EditorSingleLabelSelector,
    '单个对象': EditorSingleObjectSelector,
    '多个原文片段': EditorDefault,
    '多个标签': EditorDefault,
    '多个对象': EditorDefault,
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
            'onClick': ()=>{
              localData.ctrlIdx = idx;
              localData.currentStage = stages['③进行编辑操作'];
            },
          }, `${fixCtrl(ctrl)?.['type']}`, "light")),
        ]),
      ]),
      btn({
        'onClick': ()=>{
          ctx.emit("confirm", {'data': "data"});
          // console.log("confirm");
        },
        'title': "确定",
      }, bi("check2"), "primary"),
      btn({
        'onClick': ()=>{
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
            'onClick': ()=>{
              ctx.emit("confirm", {type: props?.ctrl?.type??"", value: true});
              // console.log("confirm");
            },
            'title': "true",
          }, [bi("check"), " ", "true"], "outline-success"),
          btn({
            'class': "btn-sm px-1 py-0",
            'onClick': ()=>{
              ctx.emit("confirm", {type: props?.ctrl?.type??"", value: false});
              // console.log("confirm");
            },
            'title': "false",
          }, [bi("x"), " ", "false"], "outline-danger"),
        ]),
      ]),
      btn({
        'onClick': ()=>{
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
  emits: ['confirm', 'cancel'],
  component: {},
  setup(props, ctx) {
    const reactiveCMR = inject('reactiveCMR', ()=>({}));
    const objects = computed(()=>{
      let those = [];
      let filters = props?.['ctrl']?.['config']?.['filter']??[];
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
      }, objectFace(obj)))),
      btn({
        'onClick': ()=>{
          ctx.emit("confirm", {type: props?.ctrl?.type??"", value: localData['selected']});
          // console.log("confirm");
        },
        'title': "确定",
      }, bi("check2"), "primary"),
      btn({
        'onClick': ()=>{
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
// 单个标签控件
const EditorSingleLabelSelector = {
  props: ['ctrl'],
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
        'face': "",
        'domain': props?.['ctrl']?.['config']?.['set']??"",
      },
    });
    return () => div({'class': "input-group input-group-sm"}, [
      h("select", {
        'class': "form-select form-select-sm text-center",
        'value': localData.label.face,
        onChange: (event)=>{
          localData.label.face = event?.target?.value;
        },
      }, v(labels).map((label, idx) => h("option", {
        'key': `${idx}`,
        'value': label.face??"???",
      }, label.face))),
      btn({
        'onClick': ()=>{
          ctx.emit("confirm", {type: props?.ctrl?.type??"", value: localData['label']});
          // console.log("confirm");
        },
        'title': "确定",
      }, bi("check2"), "primary"),
      btn({
        'onClick': ()=>{
          ctx.emit("cancel");
          // console.log("cancel");
        },
        'title': "取消",
      }, bi("arrow-90deg-left"), "outline-secondary"),
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
      const idxesToTokens = (idxes) => {
        idxes = idxes??[];
        if (!tokens?.length) {
          return [];
        };
        return idxes.map(idx => tokens[idx]?.to ?? tokens[idx] ?? {});
      };
      const idxesToText = (idxes) => {
        let _tokens = idxesToTokens(idxes);
        let result = _tokens.map(it => it.word).join("");
        return result;
      };
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
        const texts = idxeses.map(it=>idxesToText(it));
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
              'onClick': ()=>{
                localData['span']['value']['idxes'] = [...localData['span']['value']['idxes'], ...selection?.array];
                ctx.emit("clear-selector");
                localData['span']['value']['text'] = `${localData['span']['value']['text']}+${idxesToText(localData['span']['value']['idxes'])}`;
              },
              'title': "将选中的文本追加到此处已有的文本之后",
            }, [bi("plus-lg"), " ", "追加"], "outline-primary") : null,
            btn({
              'class': [
                "btn-sm px-1 py-0",
                {"d-none": (!selection?.array?.length)},
              ],
              'onClick': ()=>{
                localData['span']['value']['idxes'] = selection?.array;
                ctx.emit("clear-selector");
                localData['span']['value']['text'] = idxesToText(localData['span']['value']['idxes']);
              },
              'title': localData?.['span']?.['value']?.['text']?.length ? "用选中的文本覆盖此处的文本" : "将选中的文本填入此处",
            }, [bi("box-arrow-in-down-right"), " ", localData?.['span']?.['value']?.['text']?.length ? "覆盖" : "填入"], "outline-danger"),
          ]),
        ]),
        btn({
          'onClick': ()=>{
            ctx.emit("confirm", JSON.parse(JSON.stringify(localData['span'])));
            // console.log("confirm");
          },
          'title': "确定",
        }, bi("check2"), "outline-secondary"),
        btn({
          'onClick': ()=>{
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
    const idxesToTokens = (idxes) => {
      idxes = idxes??[];
      if (!tokens?.length) {
        return [];
      };
      return idxes.map(idx => tokens[idx]?.to ?? tokens[idx] ?? {});
    };
    const idxesToText = (idxes) => {
      let _tokens = idxesToTokens(idxes);
      let result = _tokens.map(it => it.word).join("");
      return result;
    };
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
            'onClick': ()=>{
              localData['span']['value']['idxeses']?.push(selection?.array);
              ctx.emit("clear-selector");
              localData['span']['value']['texts']?.push(idxesToText(localData['span']['value']['idxeses']?.at(-1)));
            },
            'title': "将选中的文本追加到此处已有的文本之后",
          }, [bi("plus-lg"), " ", "追加"], "outline-primary"),
          btn({
            'class': [
              "btn-sm px-1 py-0",
              {"d-none": (!selection?.array?.length)},
            ],
            'onClick': ()=>{
              localData['span']['value']['idxeses'] = [selection?.array];
              ctx.emit("clear-selector");
              localData['span']['value']['texts'] = [idxesToText(localData['span']['value']['idxeses']?.at(-1))];
            },
            'title': localData?.['span']?.['value']?.['texts']?.length ? "用选中的文本覆盖此处的文本" : "将选中的文本填入此处",
          }, [bi("box-arrow-in-down-right"), " ", localData?.['span']?.['value']?.['texts']?.length ? "覆盖" : "填入"], "outline-danger"),
        ]),
      ]),
      btn({
        'onClick': ()=>{
          ctx.emit("confirm", JSON.parse(JSON.stringify(localData['span'])));
          // console.log("confirm");
        },
        'title': "确定",
      }, bi("check2"), "primary"),
      btn({
        'onClick': ()=>{
          ctx.emit("cancel");
          // console.log("cancel");
        },
        'title': "取消",
      }, bi("arrow-90deg-left"), "outline-secondary"),
    ]);
  },
};
// 单个不连续的原文片段控件 结束













































// 🔯🔯🔯🔯🔯🔯
// 单个字段
const PropertyItem = {
  props: ['slot', 'data'],
  emits: ['set-property', 'clear-selector'],
  component: {
    EditorDefault,
    EditorBool,
  },
  setup(props, ctx) {
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
      let key = props['slot']?.['name']??"未知字段";
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
        span(null, `${props['slot']?.name??"无名字段"}`),
      ]),

      //
      localData.currentStage == stages['①呈现数据内容']
      ? [
        div({'class': "input-group input-group-sm"}, [
          div({'class': "form-control d-inline-block text-center"}, [
            span({'class': "align-middle"}, dataFace(newDataWrap['data'])),
          ]),
          true ? btn({
            'onClick': ()=>{onDelete()},
            'title': "删除"
          }, bi("trash3"), "outline-secondary") : null,
          btn({
            'onClick': ()=>{onGoToEdit()},
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
                'onClick': ()=>{
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
          'oldValue': newDataWrap?.['data']?.['value'],
          'onConfirm': (value)=>{onConfirm(value);},
          'onCancel': ()=>{onCancel();},
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
// 单个对象的编辑窗口
const ObjectPanel = {
  props: ['data', 'typeDef'],
  emits: ['save-object', 'clone-object', 'reset-object', 'delete-object', 'close-object', 'clear-selector'],
  component: {
    PropertyItem,
  },
  setup(props, ctx) {

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
      let v_slotDict = v(slotDict);
      let kkvvs = Object.entries(localObjectShadow.data);
      let that = kkvvs.filter(kkvv => kkvv[0] in v_slotDict).map(kkvv => {
        let [kk, vv] = kkvv;
        return v_slotDict[kk];
      });
      // console.log(that);
      return that;
    });

    const moreFields = computed(() => {
      let that = [];
      for (let slot of v(slots)) {
        if (slot.name && !(slot.name in localObjectShadow.data)) {
          that.push(slot);
        };
      };
      return that;
    });

    const onSetProperty = (xx) => {
      Object.assign(localObjectShadow.data, xx);
    };
    const onDeleteProperty = (fieldName) => {
      localObjectShadow.data[fieldName] = undefined;
      delete localObjectShadow.data[fieldName];
    };

    const addField = (fieldName) => {
      if (!fieldName.length) {return;};
      if (fieldName in localObjectShadow.data) {return;};
      Object.assign(localObjectShadow.data, {
        [fieldName]: slotDict?.[fieldName]?.default ?? slotDict?.[fieldName]?.init ?? null,
      });
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
        div({'class': "hstack gap-2"}, [
          props?.typeDef?.['icon-bi'] ? bi(props?.typeDef?.['icon-bi']) : null,
          span({'class': "--user-select-none"}, `${props?.typeDef?.name??"未知类型"}`),
        ]),

        // 关闭按钮
        btn({
          'class': "btn-sm px-1 py-0",
          'onClick': ()=>{
            ctx.emit("close-object", localObjectShadow.data);
          },
        }, bi("x-lg"), "--outline-danger"),
      ]);
    };

    const 数据呈现 = () => {
      return div({
        'class': "mx-2 my-1",
      }, [
        div({'class': "py-1 px-2 rounded --border text-center bg-white --bg-opacity-25"}, [
          objectFace(localObjectShadow.data),
        ]),
      ]);
    };

    const 字段列表 = () => {
      return div({
        'class': "vstack gap-1 px-2 py-1"
      }, [

        // 已有字段
        v(fields).map((field, idx) => h(PropertyItem, {
          'key': idx,
          'data': localObjectShadow?.data?.[field?.name],
          'slot': field,
          'onSetProperty': (xx)=>{onSetProperty(xx);},
          'onDeleteProperty': ()=>{onDeleteProperty(field?.name??"");},
          'onClearSelector': ()=>{onClearSelector();},
        })),

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
              'class': "form-select text-center",
              'onChange': (event)=>{
                localData.fieldToAdd = event?.target?.value;
              },
              'value': localData.fieldToAdd,
            }, [
              h("option", {
                'value': localData.fieldToAdd,
              }, "<请选择>"),
              ...v(moreFields).map(field=>h("option", {
                'value': field.name,
              }, [field.name])),
            ]),
            btn({
              'onClick': ()=>{
                addField(localData.fieldToAdd);
              },
              'title': "执行添加",
            }, bi("plus-lg"), "outline-secondary"),
          ]),
        ]) : null,
      ]);
    };

    const 总体操作 = () => {
      return div({
        'class': "hstack gap-2 p-2 justify-content-end",
      }, [

        btn({
          'class': "btn-sm px-1 py-0 text-muted hstack gap-1",
          'onClick': ()=>{
            ctx.emit("save-object", localObjectShadow.data);
          },
          'disabled': false,
        }, [bi("save2"), "保存"], "--outline-secondary"),

        btn({
          'class': "btn-sm px-1 py-0 text-muted hstack gap-1",
          'onClick': ()=>{
            ctx.emit("clone-object", localObjectShadow.data);
          },
          'disabled': false,
        }, [bi("back"), "克隆"], "--outline-secondary"),

        btn({
          'class': "btn-sm px-1 py-0 text-muted hstack gap-1",
          'onClick': ()=>{
            localData.showResetConfirmModal=true;
          },
          'disabled': false,
        }, [bi("arrow-repeat"), "重置"], "--outline-secondary"),

        btn({
          'class': "btn-sm px-1 py-0 text-muted hstack gap-1",
          'onClick': ()=>{
            localData.showDeleteConfirmModal=true;
          },
          'disabled': false,
        }, [bi("trash3"), "删除"], "--outline-secondary"),
      ]);
    };

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
      字段列表(),
      总体操作(),
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
  emits: ['save-object', 'clone-object', 'reset-object', 'delete-object', 'hide-object-wrap', 'clear-selector'],
  component: {
    ObjectPanel,
  },
  setup(props, ctx) {

    const onClearSelector = () => {
      ctx.emit("clear-selector");
    };

    const shouldShow = computed(()=>{
      return props?.['objectWraps']?.filter?.(it=>it?.show)?.length;
    });
    return () => div({
      'class': ["vstack gap-3", {"d-none": !v(shouldShow)}],
    }, [
      div({'class': "h6 mt-3 mb-1"}, ["正在标注的对象"]),
      props['objectWraps'].map((objWrap, idx) => objWrap?.['show'] ? h(ObjectPanel, {
        'key': objWrap?.data?._id??objWrap?.data?.id,
        'data': objWrap['data'],
        'typeDef': objWrap['typeDef'],
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
      }) : null),
    ]);
  },
};
// 众多对象编辑窗口的列表 结束

// 🔯🔯🔯🔯🔯🔯
// 所有对象陈列盒子
const AllObjectsPanel = {
  props: ['objectWraps', 'typeNames'],
  emits: ['sort-objects', 'analyze-objects', 'add-object', 'do-debug', 'show-object-wrap', 'hide-object-wrap'],
  component: {},
  setup(props, ctx) {
    const localData = reactive({
      'typeNameToAdd': {},
      'showAddObjectControl': false,
    });
    return () => div({'class': "vstack gap-2 my-1"}, [
      div({'class': "h6 mt-3 mb-1"}, ["所有标注对象"]),

      // 陈列盒子
      div({
        'class': "__ratio __ratio-21x9 border rounded overflow-auto",
        'style': "min-height: 1.5em; max-height: 12em;"
      }, div({'class': "p-1"}, [
        div({'class': "d-flex flex-wrap gap-1"}, [
          ...(props['objectWraps']??[])
            .map((objWrap, idx) => btn({
              'key': objWrap?.data?._id??objWrap?.data?.id,
              'class': ["btn-sm"],
              'title': JSON.stringify(objWrap, null, 2),
              'onClick': ()=>{
                let x = objWrap['show']
                  ?(ctx.emit("hide-object-wrap", objWrap))
                  :(ctx.emit("show-object-wrap", objWrap));
              },
            }, [
              // span({'class': "text-muted pe-2"}, objWrap?.data?._id??objWrap?.data?.id??"_"),
              objWrap?.['typeDef']?.['icon-bi']?.length ? [
                span({'class': "pe-2"}, bi(objWrap?.['typeDef']?.['icon-bi'])),
              ] : null,
              objectFace(objWrap.data),
            ], objWrap['show']?"outline-primary":"light")),
        ]),
      ])),

      // 工具
      div({'class': "btn-toolbar __hstack gap-1 justify-content-end"}, [
        div({'class': "btn-group btn-group-sm"}, [
          // lightBtn(bi("sort-down-alt"), "排序", "按照文本中出现的顺序排序", {
          //   'onClick': ()=>{
          //     ctx.emit("sort-objects");
          //   },
          // }),
          // lightBtn(bi("bar-chart-steps"), "预分析", null, {
          //   'onClick': ()=>{
          //     ctx.emit("analyze-objects");
          //   },
          // }),
          lightBtn(bi("plus-circle"), "新增", null, {
            'onClick': ()=>{
              localData.showAddObjectControl = !localData.showAddObjectControl;
            },
          }),
          // lightBtn(bi("bug"), "debug", null, {
          //   'onClick': ()=>{
          //     ctx.emit("do-debug");
          //     console.log(props['objectWraps']);
          //   },
          // }),
        ]),
      ]),

      // 新增操作区
      div({'class': ["hstack gap-1", {"d-none": !localData.showAddObjectControl}]}, [
        div({'class': "input-group input-group-sm"}, [
          h("select", {
            'class': "form-select text-center",
            'onChange': (event)=>{
              localData.typeNameToAdd = event?.target?.value;
            },
            'value': localData.typeNameToAdd,
          }, [
            ...(props?.typeNames??[]).map(typeName=>h("option", {
              'value': typeName,
            }, [typeName])),
          ]),
          btn({
            'onClick': ()=>{
              ctx.emit("add-object", localData.typeNameToAdd);
              localData.showAddObjectControl = false;
            },
            'title': "执行添加",
          }, bi("plus-lg"), "outline-secondary"),
        ]),
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
        div({'class': "h6 m-0"}, ["标注结果预览"]),
        lightBtn(bi("arrow-repeat"), "刷新", null, {
          // 'class': "mt-3 mb-1",
          'onClick': ()=>{
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
      }, h(CmrDisplay, {'annotation': props?.['annotation']}))))
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
        'onClick': ()=>{ctx.emit('reset-from-cloud');},
        'title': "重置为云端保存时的状态。",
      }, "从云端读取", "warning"),
      btn({
        'class': "btn-sm",
        'onClick': ()=>{ctx.emit('save-to-cloud');},
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
          'onClick': ()=>{ctx.emit('save');},
          'title': "将未完成的标注暂时保存到云端，并记录这条标注处于「未完成」的状态。",
        }, "暂时保存", "primary"),
        btn({
          'class': "btn-sm",
          'onClick': ()=>{ctx.emit('ok');},
          'title': "保存并提交，记为「完成」状态。",
        }, "完成并保存", "success"),
        btn({
          'class': "btn-sm",
          'onClick': ()=>{ctx.emit('reset');},
          'title': "重置为上次保存时的状态。",
        }, "重置", "warning"),
        btn({
          'class': "btn-sm",
          'onClick': ()=>{ctx.emit('clean');},
        }, "清空", "danger"),
        btn({
          'class': "btn-sm",
          'onClick': ()=>{ctx.emit('debug');},
        }, "DEBUG", "outline-secondary"),
      ]),
      div({
        'class': "hstack gap-2 justify-content-end flex-wrap",
      }, [
        btn({
          'class': "btn-sm",
          'onClick': ()=>{ctx.emit('go-prev');},
          'title': "不会保存",
        }, "上一条", "outline-secondary"),
        btn({
          'class': "btn-sm",
          'onClick': ()=>{ctx.emit('go-next');},
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
      return nodes??null;
    });

    const typeNames = computed(()=>{
      return reactiveCMR.types.map(it=>it.name);
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

    const 所有对象面板 = () => h(AllObjectsPanel, {
      'objectWraps': v(objectWraps),
      'typeNames': v(typeNames),
      'onHideObjectWrap': (objWrap)=>{
        hide(objWrap['_id']);
      },
      'onShowObjectWrap': (objWrap)=>{
        show(objWrap['_id']);
      },
      'onAddObject': (typeName)=>{
        const newObject = reactiveCMR.makeNewObjectWithType(typeName);
        show(newObject._id);
      },
    }, []);

    const 单个对象面板列表 = () => h(ObjectPanelList, {
      'objectWraps': v(objectsToShow),
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
      div({'class': ""}, [
        "请按照 ",
        ha("CSpaceBank 标注规范"),
        " 进行标注。",
      ]),

      // h(StartButtonGroup),
      所有对象面板(),
      单个对象面板列表(),
      结果预览面板(),
      最终按钮区(),
      重置确认框(),
      清空确认框(),

    ]);
  },
};
// 整个组件 结束