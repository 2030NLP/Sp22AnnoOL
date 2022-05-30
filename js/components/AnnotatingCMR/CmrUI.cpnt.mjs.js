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
    return () => div({'class': "border m-2 p-1"}, [
      JSON.stringify(props['ctrl']),
      h("br"),
      btn({
        'class': "btn-sm",
        'onClick': ()=>{
          ctx.emit("confirm");
          // console.log("confirm");
        },
      }, "确定", "outline-secondary"),
      btn({
        'class': "btn-sm",
        'onClick': ()=>{
          ctx.emit("cancel");
          // console.log("cancel");
        },
      }, "取消", "outline-secondary"),
      h("br"),
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



    return () => div({'class': "border p-2"}, [
      `${props['slot']?.name??"无名字段"}`,
      h("br"),

      //
      localData.currentStage == stages['①呈现数据内容']
      ? [
        dataFace(newDataWrap['data']),
        btn({
          'class': "btn-sm",
          'onClick': ()=>{onGoToEdit()},
          'disabled': (props['slot']?.ctrls?.length??0)<1,
        }, "编辑", "outline-secondary"),
      ]

      //
      : localData.currentStage == stages['②选择操作方式']
      ? [
        "请选择操作方式",
        ...(props['slot']?.ctrls??[]).map((ctrl, idx)=>btn({
          'class': "btn-sm",
          'onClick': ()=>{
            localData.ctrlIdx = idx;
            localData.currentStage = stages['③进行编辑操作'];
          },
        }, `${fixCtrl(ctrl)?.['type']}`, "outline-secondary")),
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
  emits: ['save-object', 'delete-object', 'close-object'],
  component: {
    PropertyItem,
  },
  setup(props, ctx) {

    const localData = reactive({});

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

    return () => div({'class': "border p-2"}, [
      `${props?.typeDef?.name??"未知类型"}`,

      objectFace(localObjectShadow.data),

      v(slots).map((slot, idx) => h(PropertyItem, {
        'key': idx,
        "data": getSlotData(slot),
        "slot": slot,
        "onSetProperty": (xx)=>{onSetProperty(xx);},
      })),

      btn({
        'class': "btn-sm",
        'onClick': ()=>{
          ctx.emit("save-object", localObjectShadow.data);
        },
        'disabled': false,
      }, "保存", "outline-secondary"),

      btn({
        'class': "btn-sm",
        'onClick': ()=>{},
        'disabled': false,
      }, "取消", "outline-secondary"),

      btn({
        'class': "btn-sm",
        'onClick': ()=>{},
        'disabled': false,
      }, "关闭", "outline-secondary"),

    ]);
  },
};

const ObjectPanelList = {
  props: ['objects'],
  emits: [],
  component: {
    ObjectPanel,
  },
  setup(props, ctx) {
    return () => div({
      'class': "vstack gap-2",
    }, props['objects'].map((obj, idx) => h(ObjectPanel, {
      "key": idx,
      "data": obj['data'],
      "typeDef": obj['typeDef'],
      "onSaveObject": (obj)=>{
        console.log(obj);
      },
    })));
  },
};


const AllObjectsPanel = {
  props: ['objects'],
  emits: [],
  component: {},
  setup(props, ctx) {
    return () => div({'class': "vstack gap-2 my-1"}, [
      div({'class': "h6 mt-3 mb-1"}, ["所有标注对象"]),

      // 陈列盒子
      div({
        'class': "__ratio __ratio-21x9 border rounded",
        'style': "min-height: 1.5em; max-height: 5em;"
      }, div({'class': "p-1 overflow-auto"}, [
        div({'class': "d-flex flex-wrap gap-1"}, [
          ...(props['objects']??[])
            .filter(it=>it["_type"]!=TpSpan)
            .map((obj, idx) => btn({'key': idx, 'class': "btn-sm", 'title': JSON.stringify(obj, null, 2)}, [
              // obj._type,
              objectFace(obj),
            ], "light")),
        ]),
      ])),

      // 工具
      div({'class': "btn-toolbar __hstack gap-1"}, [
        div({'class': "btn-group btn-group-sm"}, [
          lightBtn(bi("sort-down-alt"), "排序", "按照文本中出现的顺序排序", {
            'onClick': ()=>{
              // sortObjects();
            },
          }),
          lightBtn(bi("bar-chart-steps"), "预分析", null, {
            'onClick': ()=>{
              // analysisEntities();
              // analysisEvents();
              // sortObjects();
            },
          }),
          lightBtn(bi("plus-circle"), "新增", null, {
            'onClick': ()=>{
            },
          }),
          lightBtn(bi("bug"), "debug", null, {
            'onClick': ()=>{
              console.log(props['objects']);
            },
          }),
        ]),
      ]),

    ]);
  },
};





export default {
  props: [],
  emits: [],
  component: {
    AllObjectsPanel,
    ObjectPanelList,
  },
  setup(props, ctx) {
    return () => div({'class': "--border --p-2 my-1"}, [
      div({'class': ""}, [
        "请按照 ",
        ha("CSpaceBank 标注规范"),
        " 进行标注。"]),
      h(AllObjectsPanel, null, []),
      h(ObjectPanelList, {
        'objects': [
          {
            "typeDef": {"name": "时间（相对于事件）", "slots": [
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
            "typeDef": {"name": "时间（相对于事件）", "slots": [
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
      }),
    ]);
  },
};