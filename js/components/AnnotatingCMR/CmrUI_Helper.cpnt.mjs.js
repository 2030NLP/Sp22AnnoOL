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


// 🔯🔯🔯🔯🔯🔯
// 整个组件
export default {
  props: ['tokenSelector', 'selection', 'stepCtrl', 'alertBox', 'example', 'step', 'stepProps', 'go-prev', 'go-next'],
  emits: ['save', 'reset'],
  component: {
  },
  setup(props, ctx) {

    const 主体 = () => div({'class': ""}, [
      // "参考内容",
    ])

    return () => div({'class': "--border --p-2 my-1 vstack gap-2"}, [
      主体(),
    ]);
  },
};
// 整个组件 结束