import { h } from '../../modules_lib/vue_3.2.31_.esm-browser.prod.min.js';
import BsBadge from '../bs/BsBadge.cpnt.mjs.js';

// <result-display
//   :each-class="my-1"
//   :tokens=""
//   :annotations=""
//   :shoe-sub="false"
//   :shoe-title="false"
// ></result-display>

export default {
  props: ["eachClass", "tokens", "annotations", "showSub", "showTitle"],
  emits: ["close"],
  component: {
    BsBadge,
  },
  setup(props, ctx) {
    const annots = props.annotations;

    const idxesToText = (idxes)=>{
      if (!props.tokens?.length) {
        return JSON.stringify(idxes);
      };
      return idxes.map(idx => props.tokens[idx]?.to?.word ?? props.tokens[idx]?.word ?? `[字符${idx}]`).join("");
    };

    const makeChildren = (annot) => {

      const displayDefault = (annot)=>{
        return h("span", {}, [
          (`${annot.idx}` ? h("span", { class: "mx-1" }, [`${annot.idx}`]) : null),
          (annot.on ? h("span", { class: "mx-1" }, [idxesToText(annot.on)]) : null),
          ...(annot.ons ? annot.ons.map(
            idxes => h("span", { class: "mx-1" }, [idxesToText(idxes)])
          ) : []),
          ...(annot.tokenarrays ? annot.tokenarrays.map(
            idxes => h("span", { class: "mx-1" }, [idxesToText(idxes)])
          ) : []),
          (annot.desc ? h("span", { class: "mx-1" }, [`${annot.desc}`]) : null),
          (annot.label ? h("span", { class: "mx-1" }, [`${annot.label}`]) : null),
          (annot.withText ? h("span", { class: "mx-1" }, [annot.withText]) : null),
        ]);
      };

      const displayXx = (annot)=>{};

      const displayFnDict = {
        // 'selectValue': (annot)=>{},
        // 'multiSpans': (annot)=>{},
        // 'choose': (annot)=>{},
        // 'text': (annot)=>{},
        // 'add': (annot)=>{},
        // 'modify': (annot)=>{},
        // 'delete': (annot)=>{},
      };
      if (!(annot.mode in displayFnDict)) {
        return displayDefault(annot);
      };
      return displayFnDict[annot.mode](annot);
    };

    return () => h("div", { }, annots.map(annot=>h("span", {
      class: props.eachClass,
      key: annot.idx,
      'data-mode': annot.mode,
      'data-label': annot.label,
    }, h(BsBadge, {
      title: props.showTitle ? JSON.stringify(annot) : null,
    }, makeChildren(annot)))));
  },
};
