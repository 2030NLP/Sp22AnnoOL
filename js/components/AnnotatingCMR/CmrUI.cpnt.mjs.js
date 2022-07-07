import {
  reactive, computed, onMounted, h,
  provide, inject,
  // Transition,
  Teleport,
  v,
  div, span, btn, watch
} from './VueShadow.mjs.js';
import { CMR, BS } from './Shadow.mjs.js';

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

import {
  ctrlComponent,
  EditorDefault,
  EditorBool,
  EditorSingleObjectSelector,
  EditorMultiObjectsSelector,
  EditorSingleLabelSelector,
  FactoryOfEditorSingleSpan,
  EditorSingleSpan,
  EditorSingleBrokenSpan,
  EditorMultiBrokenSpan,
} from './CmrEditors.mjs.js';


Array.prototype.last = function() {return this[this.length-1]};
const average = list => list.length ? (list.reduce(((aa, bb)=>aa+bb), 0) / list.length) : Infinity;


import CmrDisplay from './CmrDisplay.cpnt.mjs.js';






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







// 🔯🔯🔯🔯🔯🔯
// 单个字段
const __PropertyItemOld = {
  props: ['slot', 'data'],
  emits: ['set-property', 'clear-selector', 'new'],
  component: {
    EditorDefault,
    EditorBool,
    EditorSingleObjectSelector,
    EditorMultiObjectsSelector,
    EditorSingleLabelSelector,
    FactoryOfEditorSingleSpan,
    EditorSingleSpan,
    EditorSingleBrokenSpan,
    EditorMultiBrokenSpan,
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
  props: ['slot', 'data', 'triggerForSave'],
  emits: ['set-property', 'clear-selector', 'new'],
  component: {
    EditorDefault,
    EditorBool,
    EditorSingleObjectSelector,
    EditorMultiObjectsSelector,
    EditorSingleLabelSelector,
    FactoryOfEditorSingleSpan,
    EditorSingleSpan,
    EditorSingleBrokenSpan,
    EditorMultiBrokenSpan,
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
          'triggerForSave': props?.['triggerForSave'],
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
      'triggerForSave': 1,
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

    const onSaveProperties = () => {
      localData.triggerForSave += 1;
      // console.log("triggerForSave sent");
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

          btn({
            'class': "btn-sm px-1 py-0 text-muted hstack gap-1",
            onClick: ()=>{
              onSaveProperties();
            },
            'disabled': false,
          }, [/*bi("save2"), */"保存"], "--outline-secondary"),
  
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
          'triggerForSave': localData.triggerForSave,
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

      // 工具
      div({'class': "btn-toolbar __hstack gap-1 justify-content-start"}, [
        div({'class': "btn-group btn-group-sm"}, [
          lightBtn(bi("sort-down-alt"), "按原文排序", "按照文本中出现的顺序排序", {
            onClick: ()=>{
              ctx.emit("sort-objects");
            },
            'class': "btn-light",
          }),
          lightBtn(bi("sort-numeric-down"), "按创建顺序排序", "按创建顺序排序", {
            onClick: ()=>{
              ctx.emit("sort-objects-by-id");
            },
            'class': "btn-light",
          }),
          lightBtn(bi("sort-alpha-down"), "按类型排序", "按照类型排序", {
            onClick: ()=>{
              ctx.emit("sort-objects-by-type");
            },
            'class': "btn-light",
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

      // 陈列盒子
      div({
        'class': "__ratio __ratio-21x9 border rounded overflow-auto",
        'style': "min-height: 1.5em; max-height: 20em;"
      }, div({'class': "p-1"}, [
        div({'class': "d-inline-flex flex-wrap gap-1"}, props['objectWraps']?.length ? [
          ...(props['objectWraps']??[])
            .map((objWrap, idx) => btn({
              'key': `${idx}-${objWrap?.data?._id??objWrap?.data?.id}`,
              'class': [
                "d-flex flex-wrap gap-1 flew-row",
                "btn-sm",
                {"opacity-50": objWrap?.data?.type=="文本"&&!objWrap['show']},
              ],
              // 'title': JSON.stringify(objWrap?.data, null, 2),
              onClick: ()=>{
                let x = objWrap['show']
                  ?(ctx.emit("hide-object-wrap", objWrap))
                  :(ctx.emit("show-object-wrap", objWrap));
              },
            }, [
              span({'class': ["opacity-75 text-blue"]}, objWrap?.data?._id??objWrap?.data?.id),
              // span({'class': "text-muted pe-2"}, objWrap?.data?._id??objWrap?.data?.id??"_"),
              objWrap?.['typeDef']?.['icon-bi']?.length ? [
                span({'class': ["opacity-75 text-blue", "px-2"]}, bi(objWrap?.['typeDef']?.['icon-bi'])),
              ] : null,
              objectFace(objWrap.data, reactiveCMR),
            ], objWrap['show']?"outline-primary":"light")),
        ] : [span({class:"px-2"}, muted("暂无内容"))]),
      ])),

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
            'disabled': type.addDisabled,
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
        }, "暂存", "primary"),
        btn({
          'class': "btn-sm",
          onClick: ()=>{ctx.emit('ok');},
          'title': "保存并提交，记为「完成」状态。",
        }, "完成", "success"),
        btn({
          'class': "btn-sm",
          onClick: ()=>{ctx.emit('reset');},
          'title': "重置为上次保存时的状态。",
        }, "重置", "warning"),
        btn({
          'class': "btn-sm",
          onClick: ()=>{ctx.emit('clean');},
        }, "清空", "danger"),
        // btn({
        //   'class': "btn-sm",
        //   onClick: ()=>{ctx.emit('debug');},
        // }, "DEBUG", "outline-secondary"),
      ]),
      div({
        'class': "hstack gap-2 justify-content-end flex-wrap",
      }, [
        btn({
          'class': "btn-sm",
          onClick: ()=>{ctx.emit('go-prev');},
          'title': "⚠️ 警告：请先保存！！！",
        }, "上一条", "outline-secondary"),
        btn({
          'class': "btn-sm",
          onClick: ()=>{ctx.emit('go-next');},
          'title': "⚠️ 警告：请先保存！！！",
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

    const objIdxes = (obj) => {
      let idxes = [];
      const slots = reactiveCMR?.typeDict?.[obj?.type]?.slots??[];
      const fn_map = {
        "MB_SPANS": (list)=>{return list.map(it=>it.idxeses).flat(Infinity);},
      };
      for (let slot of slots) {
        if (slot.name in obj && obj?.[slot.name]?.value!=null) {
          if (obj?.[slot.name]?.type in fn_map) {
            let new_idxes = fn_map[obj?.[slot.name]?.type](obj?.[slot.name]?.value)??[];
            idxes = [...idxes, ...new_idxes];
          };
          if (slot.name=="SPE_obj" && obj.type=="propSet_E") {
            const spe_obj = reactiveCMR.get(obj?.SPE_obj?.value);
            if (spe_obj) {
              let new_idxes = spe_obj?.E?.value?.[0]?.idxeses?.[0]??[];
              idxes = [...idxes, ...new_idxes];
            };
          };
        };
      };
      return idxes;
    };

    const 按原文顺序排序函数 = (aa, bb) => {
      const iiaa = objIdxes(aa);
      const iibb = objIdxes(bb);
      if (!iiaa.length && !iibb.length) {return true;};
      if (!iiaa.length) {return true;};
      if (!iibb.length) {return false;};
      return iiaa[0]==iibb[0] ? (average(iiaa)-average(iibb)) : (iiaa[0]-iibb[0]);
    };

    const 所有对象面板 = () => h(AllObjectsPanel, {
      'objectWraps': v(objectWraps),
      'types': reactiveCMR.types,
      'onSortObjectsById': ()=>{
        reactiveCMR.sortObjectsById();
      },
      'onSortObjectsByType': ()=>{
        reactiveCMR.objects.sort(按原文顺序排序函数);
        reactiveCMR.sortObjectsByType();
      },
      'onSortObjects': ()=>{
        reactiveCMR.sortObjectsByType();
        reactiveCMR.objects.sort(按原文顺序排序函数);
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
      最终按钮区(),
      单个对象面板列表(),
      // 结果预览面板(),
      重置确认框(),
      清空确认框(),

    ]);
  },
};
// 整个组件 结束