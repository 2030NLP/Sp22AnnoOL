import {
  reactive, computed, onMounted, h,
  v,
  div, span, btn
} from './VueShadow.mjs.js';
import { CMR } from './Shadow.mjs.js';

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



const 设计 = `

`;



const ctrlTypeFaceFnMap = {
  '单个原文片段': (boy)=>{},
  '单个标签': (boy)=>{},
  '单个对象': (boy)=>{},
  '多个原文片段': (boy)=>{},
  '多个标签': (boy)=>{},
  '多个对象': (boyList, joint)=>{
    const dogs = boyList.map(boy=>ctrlTypeFaceFnMap['单个对象'](boy));
    let girls = [];
    let first = true;
    for (let dog of dogs) {
      if (!first) {girls.push(joint)};
      if (first) {first = false};
      girls.push(dog);
    };
    return girls;
  },
  '布尔值': (boy)=>JSON.stringify(boy),
  '数值': (boy)=>JSON.stringify(boy),
};

const dataFace = (cat) => {
  if (cat.type in ctrlTypeFaceFnMap) {
    return ctrlTypeFaceFnMap[cat.type](cat);
  };
  return JSON.stringify(cat);
};

const objectTypeFaceFnMap = {
  '': (boy)=>JSON.stringify(boy),
};

const objectFace = (object) => {
  if (object.type in objectTypeFaceFnMap) {
    return objectTypeFaceFnMap[object.type](object);
  };
  return JSON.stringify(object);
};








const editorDefault = {
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



const PropertyItem = {
  props: ['slot', 'data'],
  emits: ['set-property'],
  component: {
    editorDefault,
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
      'data': JSON.parse(JSON.stringify(props?.['data']??{})),
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
    const onConfirm = (slotSettings, data) => {
      // console.log([slotSettings, data]);
      newDataWrap['data'][slotSettings?.['name']??"未知字段"] = data;
      localData.currentStage = stages['①呈现数据内容'];
      ctx.emit('set-property', newDataWrap['data']);
    };
    const onCancel = () => {
      localData.currentStage = stages['①呈现数据内容'];
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

    const ctrlComponent = (ctrl) => {
      ctrl = fixCtrl(ctrl);
      const ctrlComponentMap = {
        '单个原文片段': editorDefault,
        '单个标签': editorDefault,
        '单个对象': editorDefault,
        '多个原文片段': editorDefault,
        '多个标签': editorDefault,
        '多个对象': editorDefault,
        '布尔值': editorDefault,
        '数值': editorDefault,
      };
      if (ctrl['type'] in ctrlComponentMap) {
        return ctrlComponentMap[ctrl['type']];
      };
      return editorDefault;
    };


    const currentCtrl = computed(()=>(
      fixCtrl(
        (props['slot']?.ctrls??[])[localData.ctrlIdx]
      )
    ));



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
            'onClick': ()=>{},
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
          'onConfirm': (data)=>{onConfirm(props['slot'], data);},
          'onCancel': ()=>{onCancel();},
        }),
      ]

      //
      : null,
    ]);
  },
};


const ObjectPanel = {
  props: ['data', 'typeDef'],
  emits: ['save-object', 'clone-object', 'reset-object', 'delete-object', 'close-object'],
  component: {
    PropertyItem,
  },
  setup(props, ctx) {

    const localObjectShadow = reactive({
      'data': JSON.parse(JSON.stringify(props?.['data']??{})),
    });

    const getSlotData = (slot) => {
      let slotName = slot.name??"__";
      let value = props['data']?.[slotName]??null;
      return value;
    };

    const slots = computed(() => (props?.typeDef?.slots??[]));

    const onSetProperty = (xx) => {
      Object.assign(localObjectShadow.data, xx);
    };

    return () => div({
      'class': "card bg-light border gap-1 overflow-auto shadow-sm",
      // 'style': "box-shadow: rgba(0, 0, 0, 0.075) 0px 0px 0px 1px inset, rgba(0, 0, 0, 0.075) 0px 1px 4px 0px;",
    }, [
      div({
        'class': [
          "text-center small",
          "hstack gap-1 px-2 py-1 justify-content-between",
          "text-muted --bg-opacity-75 --bg-secondary border-bottom --border-secondary",
        ],
      }, [
        div({'class': "hstack gap-2"}, [
          props?.typeDef?.['icon-bi'] ? bi(props?.typeDef?.['icon-bi']) : null,
          span({'class': "--user-select-none"}, `${props?.typeDef?.name??"未知类型"}`),
        ]),
        btn({
          'class': "btn-sm px-1 py-0",
          'onClick': ()=>{
            ctx.emit("close-object", localObjectShadow.data);
          },
        }, bi("x-lg"), "--outline-danger"),
      ]),
      div({
        'class': "mx-2 my-1",
      }, [
        div({'class': "py-1 px-2 rounded --border text-center bg-white --bg-opacity-25"}, [
          objectFace(localObjectShadow.data),
        ]),
      ]),

      div({
        'class': "vstack gap-1 px-2 py-1"
      }, [
        v(slots).map((slot, idx) => h(PropertyItem, {
          'key': idx,
          'data': getSlotData(slot),
          'slot': slot,
          'onSetProperty': (xx)=>{onSetProperty(xx);},
        })),
        div({'class': "--border p-0 hstack gap-1 align-items-center justify-content-around"}, [
          div({
            'class': [
              "w-25",
              "text-center small",
              "text-muted",
            ],
          }, "添加字段"),

          div({'class': "input-group input-group-sm"}, [
            h("select", {'class': "form-select text-center"}, [
              h("option"),
            ]),
            btn({
              'onClick': ()=>{},
              'title': "执行添加",
            }, bi("plus-lg"), "outline-secondary"),
          ]),

        ]),
      ]),


      div({
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
            ctx.emit("reset-object", localObjectShadow.data);
            localObjectShadow.data = JSON.parse(JSON.stringify(props?.['data']??{}));
          },
          'disabled': false,
        }, [bi("arrow-repeat"), "重置"], "--outline-secondary"),

        btn({
          'class': "btn-sm px-1 py-0 text-muted hstack gap-1",
          'onClick': ()=>{
            ctx.emit("delete-object", localObjectShadow.data);
          },
          'disabled': false,
        }, [bi("trash3"), "删除"], "--outline-secondary"),
      ]),
    ]);
  },
};

const ObjectPanelList = {
  props: ['objectWraps'],
  emits: ['save-object', 'clone-object', 'reset-object', 'delete-object', 'hide-object-wrap'],
  component: {
    ObjectPanel,
  },
  setup(props, ctx) {
    return () => div({
      'class': "vstack gap-3",
    }, [
      div({'class': "h6 mt-3 mb-1"}, ["正在标注的对象"]),
      props['objectWraps'].map((objWrap, idx) => objWrap?.['show'] ? h(ObjectPanel, {
        'key': idx,
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
      }) : null),
    ]);
  },
};


const AllObjectsPanel = {
  props: ['objectWraps'],
  emits: ['sort-objects', 'analyze-objects', 'add-object', 'do-debug', 'show-object-wrap'],
  component: {},
  setup(props, ctx) {
    return () => div({'class': "vstack gap-2 my-1"}, [
      div({'class': "h6 mt-3 mb-1"}, ["所有标注对象"]),

      // 陈列盒子
      div({
        'class': "__ratio __ratio-21x9 border rounded overflow-auto",
        'style': "min-height: 1.5em; max-height: 5em;"
      }, div({'class': "p-1 overflow-auto"}, [
        div({'class': "d-flex flex-wrap gap-1"}, [
          ...(props['objectWraps']??[])
            .map((objWrap, idx) => btn({
              'key': idx,
              'class': "btn-sm",
              'title': JSON.stringify(objWrap, null, 2),
              'onClick': ()=>{
                ctx.emit("show-object-wrap", objWrap);
              },
            }, [
              // objWrap._type,
              objectFace(objWrap),
            ], "light")),
        ]),
      ])),

      // 工具
      div({'class': "btn-toolbar __hstack gap-1"}, [
        div({'class': "btn-group btn-group-sm"}, [
          lightBtn(bi("sort-down-alt"), "排序", "按照文本中出现的顺序排序", {
            'onClick': ()=>{
              ctx.emit("sort-objects");
            },
          }),
          lightBtn(bi("bar-chart-steps"), "预分析", null, {
            'onClick': ()=>{
              ctx.emit("analyze-objects");
            },
          }),
          lightBtn(bi("plus-circle"), "新增", null, {
            'onClick': ()=>{
              ctx.emit("add-object");
            },
          }),
          lightBtn(bi("bug"), "debug", null, {
            'onClick': ()=>{
              ctx.emit("do-debug");
              console.log(props['objectWraps']);
            },
          }),
        ]),
      ]),

    ]);
  },
};


const ResultPanel = {
  props: [],
  emits: [],
  component: {},
  setup(props, ctx) {
    return () => div({'class': "vstack gap-2 my-1"}, [
      div({'class': "h6 mt-3 mb-1"}, ["标注结果预览"]),
    ]);
  },
};


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


const FinalButtonGroup = {
  props: [],
  emits: ['save', 'ok', 'reset', 'clean'],
  component: {},
  setup(props, ctx) {
    return () => div({
      'class': "hstack gap-2 my-3 justify-content-end",
    }, [
      btn({
        'class': "btn-sm",
        'onClick': ()=>{ctx.emit('save');},
        'title': "将未完成的标注暂时保存到云端，并记录这条标注处于「未完成」的状态。",
      }, "保存", "primary"),
      btn({
        'class': "btn-sm",
        'onClick': ()=>{ctx.emit('ok');},
        'title': "保存并提交，记为「完成」状态。",
      }, "完成", "success"),
      btn({
        'class': "btn-sm",
        'onClick': ()=>{ctx.emit('reset');},
        'title': "重置为上次保存时的状态。",
      }, "重置", "warning"),
      btn({
        'class': "btn-sm",
        'onClick': ()=>{ctx.emit('clean');},
      }, "清空", "danger"),
    ]);
  }
};



export default {
  props: ['tokenSelector', 'selection', 'stepCtrl', 'alertBox', 'step', 'stepProps'],
  emits: ['save', 'reset'],
  component: {
    AllObjectsPanel,
    ObjectPanelList,
    ResultPanel,
    StartButtonGroup,
    FinalButtonGroup,
  },
  setup(props, ctx) {
    const reactiveCMR = reactive(new CMR);
    const init = () => {
      reactiveCMR.initDefinition(props?.['stepProps']?.['definition']);
      reactiveCMR.initData(props?.['stepProps']?.['data']);
    };

    const localData = {
      'objectWraps': [
        {
          "typeDef": {"name": "时间（相对于事件）", "icon-bi": "clock", "slots": [
            {"name": "参照事件", "ctrls": [
              {"type": "单个对象", "config": {
                "filter": {
                  "$or": [{"type": "事件"}, {"type": "合集", "成员类型": "事件"}]
                }}},
              "多个对象"
            ], "required": true},
            {"name": "类型",
              "ctrls": [{"type": "单个标签", "config": {"set": "时间限定符"}}],
              "default": {"set": "时间限定符", "spec": "时间"}, "required": true},
            {"name": "线索文本", "ctrls": ["原文片段"]}
          ]},
        },
        {
          "typeDef": {"name": "时间（相对于事件）", "icon-bi": "clock", "slots": [
            {"name": "参照事件", "ctrls": [
              {"type": "单个对象", "config": {
                "filter": {
                  "$or": [{"type": "事件"}, {"type": "合集", "成员类型": "事件"}]
                }}},
              "多个对象"
            ], "required": true},
            {"name": "类型",
              "ctrls": [{"type": "单个标签", "config": {"set": "时间限定符"}}],
              "default": {"set": "时间限定符", "spec": "时间"}, "required": true},
            {"name": "线索文本", "ctrls": ["原文片段"]}
          ]},
        },
      ],
    };


    return () => div({'class': "--border --p-2 my-1 vstack gap-2"}, [
      div({'class': ""}, [
        "请按照 ",
        ha("CSpaceBank 标注规范"),
        " 进行标注。"]),

      // h(StartButtonGroup),

      h(AllObjectsPanel, {
        'objectWraps': localData.objectWraps,
        'onShowObjectWrap': (objWrap)=>{objWrap['show']=true;},
      }, []),

      h(ObjectPanelList, {
        'objectWraps': localData.objectWraps,
        'onHideObjectWrap': (objWrap)=>{objWrap['show']=false;},
      }),

      h(ResultPanel),

      h(FinalButtonGroup, {
        'onSave': ()=>{},
        'onOk': ()=>{
          props?.stepCtrl?.goRefStep?.(props?.stepProps?.go);
        },
        'onReset': ()=>{
          init();
        },
        'onClean': ()=>{},
      }),



    ]);
  },
};