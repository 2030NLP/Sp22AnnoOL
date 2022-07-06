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


Array.prototype.last = function() {return this[this.length-1]};
const average = list => list.length ? (list.reduce(((aa, bb)=>aa+bb), 0) / list.length) : Infinity;



export default {
  props: ['annotation', 'tokens', 'definition'],
  emits: [],
  component: {},
  setup(props, ctx) {

    const localData = reactive({
      'viewMode': "清单模式",
      'roleMap': {},
      'highlighted_idxes': [],
      'annotated_idxes': [],
      'highlighted_obj_id': -1,
    });

    const reactiveCMR = reactive(new CMR);

    const objects = computed(()=>props?.annotation?.data?.objects?.sort?.(按原文顺序排序函数));

    const allIdxes = computed(() => v(objects).map(obj=>objIdxes(obj)).flat(Infinity));

    const init = () => {
      reactiveCMR.initDefinition(props?.['definition']);
      const existedObjects = v(objects);
      reactiveCMR.initData({'objects': existedObjects});
    };
    onMounted(()=>{
      init();
      localData.annotated_idxes = v(allIdxes);
    });
    watch(()=>props?.annotation, ()=>{
      init();
      localData.annotated_idxes = v(allIdxes);
    });


    const completionText = computed(()=>{
      const txt = props?.annotation?.needCompletion ? (
        props?.annotation?.completed ?
          span({
            'class': [
              "d-inline-block border rounded py-0 px-1 small fw-normal text-muted",
              {"d-none": !props?.annotation?.needCompletion},
            ],
          }, "已完成的标注") :
          span({
            'class': [
              "d-inline-block border rounded py-0 px-1 small fw-bold text-primary",
              {"d-none": !props?.annotation?.needCompletion},
            ],
          }, "未完成的标注")
      ) :
      span({
        'class': [
          "d-inline-block border rounded py-0 px-1 small fw-bold text-secondary",
          {"d-none": !props?.annotation?.needCompletion},
        ],
      }, "无需检查完成与否");
      return txt;
    });




    const tokenUnits = computed(() => {
      const tokens = props?.tokens??[];
      const units = tokens.map((token, idx)=>({
        idx: idx,
        word: token?.to?.word ?? token?.word,
        role: localData?.roleMap?.[idx],
        annotated: localData?.annotated_idxes?.includes?.(idx),
        highlighted: localData?.highlighted_idxes?.includes?.(idx),
      }));
      return units;
    });

    const 文本区 = computed(()=>{
      return div({
        'class': "cmr-display-text mb-2",
      }, v(tokenUnits).map(
        unit=>span({
          'key': `idx-${unit.idx}`,
          'title': unit.idx,
          'class': [
            `role-${unit.role}`,
            {"annotated": unit.annotated},
            {"highlighted": unit.highlighted},
          ],
        }, unit.word)
      ));
    });

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

    const objectFaceLine = (obj) => {
      const that = btn({
        'class': "btn-sm",
        onClick: ()=>{
          if (localData?.highlighted_obj_id==(obj?._id??obj?.id)) {
            localData.highlighted_obj_id=-1;
            localData.highlighted_idxes=[];
          } else {
            localData.highlighted_obj_id=obj?._id??obj?.id;
            localData.highlighted_idxes=objIdxes(obj);
          };
          console.log(JSON.stringify(obj));
          console.log([objIdxes(obj), average(objIdxes(obj))]);
        },
      }, [
        muted(obj?._id??obj?.id),
        objectFace(obj, reactiveCMR),
      ], "light");
      return that;
    };

    const 清单模式面板 = computed(() => {
      return reactiveCMR.objects.map((obj, idx)=>div({
        'class': "me-2 my-1 d-inline-block",
        'key': idx,
      }, [objectFaceLine(obj)]));
    });

    const onSortObjects = () => {
      reactiveCMR.sortObjectsByType();
      reactiveCMR.objects.sort(按原文顺序排序函数);
    };
    const onSortObjectsById = () => {
      reactiveCMR.sortObjectsById();
    };
    const onSortObjectsByType = () => {
      reactiveCMR.objects.sort(按原文顺序排序函数);
      reactiveCMR.sortObjectsByType();
    };
    const 排序按钮组 = computed(() => {
      const btns = [
        btn({
          'class': "btn-sm py-0 px-1 text-muted",
          onClick: ()=>{onSortObjects()},
        }, ["按原文排序"], "light"),
        btn({
          'class': "btn-sm py-0 px-1 text-muted",
          onClick: ()=>{onSortObjectsById()},
        }, ["按创建顺序排序"], "light"),
        btn({
          'class': "btn-sm py-0 px-1 text-muted",
          onClick: ()=>{onSortObjectsByType()},
        }, ["按类型排序"], "light"),
      ];
      return div({'class': "d-inline-flex gap-1 mx-2"}, btns);
    });

    return () => div({'class': "cmr-display text-wrap text-break"}, [
      div({'class': ["mb-2"]}, [
        v(completionText),
        v(排序按钮组),
      ]),
      v(文本区),
      div({'class': ["my-1", {"d-none": localData?.viewMode!="清单模式"}]}, [
        v(清单模式面板),
      ]),
    ]);
  },
};

