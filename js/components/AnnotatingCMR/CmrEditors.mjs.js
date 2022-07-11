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

import {
  faceFn单个原文片段,
  faceFn单个不连续原文片段,
  faceFn单个不连续原文片段无引号,
  faceFn多个不连续原文片段,
  faceFn单个标签,
  faceFn单个对象,
  faceFn多个对象,
  ctrlTypeFaceFnMap,
  dataFace,
  faceFnObj空间实体,
  faceFnObj事件,
  faceFnObj论元角色关系,
  faceFnObj角色引用,
  faceFnSpan介词,
  faceFnSpan方位词,
  faceFn实体,
  faceFnObj位置特征,
  faceFnObj方向特征,
  faceFnObj朝向特征,
  faceFnObj形状特征,
  faceFnObj距离特征,
  faceFnObj时间特征,
  faceFnObj特征命题,
  faceFnObj共指关系,
  objectTypeFaceFnMap,
  faceFnObj事件角色,
  defaultObjectFace,
  objectFace,
} from './CmrFaces.mjs.js';

// Array.prototype.last = function() {return this[this.length-1]};
const last_of = (array) => {return array[array.length-1]};


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
export const ctrlComponent = (ctrl) => {
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
export const EditorDefault = {
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
export const EditorBool = {
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
export const EditorSingleObjectSelector = {
  props: ['ctrl', 'triggerForSave'],
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

    watch(()=>props?.['triggerForSave'], ()=>{
      if (localData['selected']>=0 || props.oldValue) {
        ctx.emit("confirm", {type: props?.ctrl?.type??"", value: localData['selected']});
      };
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
export const EditorMultiObjectsSelector = {
  props: ['ctrl', 'oldValue', 'triggerForSave'],
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

    watch(()=>props?.['triggerForSave'], ()=>{
      if (localData['selectedList']?.length || props.oldValue) {
        ctx.emit("confirm", {type: props?.ctrl?.type??"", value: localData['selectedList']});
      };
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
export const EditorSingleLabelSelector = {
  props: ['ctrl', 'oldValue', 'triggerForSave'],
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

    watch(()=>props?.['triggerForSave'], ()=>{
      if (localData['label']?.face?.length && (localData['label']?.domain==props?.['ctrl']?.['config']?.['set']??"")) {
        ctx.emit("confirm", {type: props?.ctrl?.type??"", value: localData['label']});
      };
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
export const FactoryOfEditorSingleSpan = (canAppend) => {
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
export const EditorSingleSpan = FactoryOfEditorSingleSpan(false);
// 单个原文片段控件 结束

// 🆓🆓🆓🆓🆓🆓
// 单个不连续的原文片段控件
// 不论是否可追加，文本都是记录在 texts 数组 字段
export const EditorSingleBrokenSpan = {
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
              localData['span']['value']['texts']?.push(idxesToText(last_of(localData['span']['value']['idxeses']), tokens));
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
              localData['span']['value']['texts'] = [idxesToText(last_of(localData['span']['value']['idxeses']), tokens)];
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
export const EditorMultiBrokenSpan = {
  props: ['ctrl', 'oldValue', 'triggerForSave'],
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

    watch(()=>props?.['triggerForSave'], ()=>{
      if (localData?.spans?.value?.length || props.oldValue) {
        ctx.emit("confirm", JSON.parse(JSON.stringify(localData['spans'])));
      };
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







export default {
};
