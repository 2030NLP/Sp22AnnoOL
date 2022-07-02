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



export default {
  props: ['annotation', 'tokens'],
  emits: [],
  component: {},
  setup(props, ctx) {
    const reactiveCMR = reactive(new CMR);
    const objects = computed(()=>props?.annotation?.data?.objects);
    const init = () => {
      reactiveCMR.initDefinition(props?.['stepProps']?.['definition']);
      const existedObjects = v(objects);
      reactiveCMR.initData({'objects': existedObjects});
    };

    onMounted(()=>{init()});


    const completionText = computed(()=>{
      const txt = props?.annotation?.needCompletion ? (
        props?.annotation?.completed ? ("已完成的标注") : ("未完成的标注")
      ) : ("无需检查完成与否");
      return txt;
    });


    return () => div({'class':"text-wrap text-break"}, [
      h("p", {'class': [{"d-none": !props?.annotation?.needCompletion}]}, [
        v(completionText), "：",
      ]),
      v(objects).map((obj, idx)=>div({
        'key': idx,
      }, [objectFace(obj, reactiveCMR)])),
    ]);
  },
};

