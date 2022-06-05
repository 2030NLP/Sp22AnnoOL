import { h } from '../../modules_lib/vue_3.2.31_.esm-browser.prod.min.js';
import BsBadge from '../bs/BsBadge.cpnt.mjs.js';

// <results-display
//   class="col col-12 col-lg-12"
//   :each-class="'rounded-pill my-1 me-2'"
//   :annotations="example.annotations"
//   :tokens="example?.material?.tokenList"
//   :show-sub="false"
//   :show-index="false"
//   :show-title-detail="false"
//   :can-close="false"
//   :wrap="true"
//   @close="(annot)=>{win.console.log(annot)}"
// ></results-display>

export default {
  props: ["eachClass", "tokens", "annotations", "showSub", "showIndex", "showTitleDetail", "canClose", "wrap"],
  emits: ["close"],
  component: {
    BsBadge,
  },
  setup(props, ctx) {

    const idxesToText = (idxes)=>{
      if (!props.tokens?.length) {
        return JSON.stringify(idxes);
      };
      return idxes.map(idx => props.tokens[idx]?.to?.word ?? props.tokens[idx]?.word ?? `[无效索引${idx}]`).join("");
    };

    const makeChildren = (annot) => {

      const displayDesc = (annot)=>{
        return ([
          ( annot.desc ? h("span", { class: "mx-1 fw-normal", title: `${annot.label}` }, [`${annot.desc}`]) :
            annot.label ? h("span", { class: "mx-1 fw-normal" }, [`${annot.label}`]) :
            null),
        ]);
      };

      const displayIdxArray = (annot)=>{
        const name = (ii) => {
          if (annot?.names?.length) {
            return h("span", { class: "mx-1 fw-normal text-muted" }, annot?.names?.[ii]);
          };
          return null;
        };
        return ([
          ...(annot.tokenarrays ? annot.tokenarrays.map(
            (idxes, ii) => h("span", { class: "mx-1" }, [name(ii), /*"“",*/ idxesToText(idxes), " ", /*"”"*/])
          ) : annot.ons ? annot.ons.map(
            (idxes, ii) => h("span", { class: "mx-1" }, [name(ii), /*"“",*/ idxesToText(idxes), " ", /*"”"*/])
          ) : []),
        ]);
      };

      const displayWithText = (annot)=>{
        return ([
          (annot.withText ? h("span", { class: "mx-1 fw-normal" }, [annot.withText]) : null),
        ]);
      };

      const displayDefault = (annot)=>{
        return ([
          ...displayIdxArray(annot),
          ...displayDesc(annot),
          ...displayWithText(annot),
        ]);
      };

      const displayMultiSpans = (annot)=>{
        return ([
          ...displayIdxArray(annot),
          ...displayDesc(annot),
          ...displayWithText(annot),
        ]);
      };

      const displayComment = (annot)=>{
        return ([
          (annot.on ? h("span", { class: "mx-1" }, ["“", idxesToText(annot.on), "”"]) : null),
          ...displayDesc(annot),
          ...displayWithText(annot),
        ]);
      };

      const childrenToSolve = (annot)=>{
        return annot.toSolve!=null ? [
          "以解决", h("span", { class: "mx-1" }, [
            "【", makeChildren(props.annotations[annot.toSolve]), "】",
          ]), "的问题",
        ] : [];
      };

      const displayAdd = (annot)=>{
        return ([
          "将", h("span", { class: "mx-1" }, ["“", idxesToText(annot.on), "”"]),
          "增改为", h("span", { class: "mx-1" }, [
            "“", 
            `${annot.side}`=='0' ? annot.target : null,
            idxesToText(annot.on),
            `${annot.side}`=='1' ? annot.target : null,
            "”",
          ]),
          ...childrenToSolve(annot),
        ]);
      };

      const displayModify = (annot)=>{
        return ([
          "将", h("span", { class: "mx-1" }, ["“", idxesToText(annot.on), "”"]),
          "改为", h("span", { class: "mx-1" }, ["“", annot.target, "”"]),
          ...childrenToSolve(annot),
        ]);
      };

      const displayDelete = (annot)=>{
        return ([
          "删除", h("s", { class: "mx-1" }, ["“", idxesToText(annot.on), "”"]),
          ...childrenToSolve(annot),
        ]);
      };

      const displayXx = (annot)=>{};

      const displayFnDict = {
        'selectValue': displayDesc,
        'multiSpans': displayMultiSpans,
        'choose': displayComment,
        'text': displayComment,
        'add': displayAdd,
        'modify': displayModify,
        'delete': displayDelete,
      };

      const happy = ((annot.mode in displayFnDict) ? displayFnDict[annot.mode](annot) : displayDefault(annot));

      return h("span", { }, [
        ((props.showIndex && annot.idx!=null) ? h("span", { class: "mx-1 text-muted" }, [`${annot.idx}`]) : null),
        ...happy,
      ]);
    };

    const makeDisplay = (annot, idx) => {
      if (annot.mode=="CSpaceBank") {return theCSpaceBankResultDisplay(annot, idx);};
      return [
        !annot.hidden ? h(BsBadge, {
          class: [props.eachClass, {'d-none': annot.hidden}, "lh-base"],
          key: annot.idx,
          title: props.showTitleDetail ? JSON.stringify(annot) : null,
          'data-mode': annot.mode,
          'data-label': annot.label,
          'closeIcon': "删",
          canClose: props.canClose,
          onClose: props.canClose ? (()=>{
            annot._idx_to_delete = idx;
            ctx.emit("close", annot);
          }) : (()=>{}),
        }, makeChildren(annot)) : null,
        !annot.hidden&&props.wrap ? h("br") : null,
      ];
    };

    const theCSpaceBankResultDisplay = (annot, idx) => {
      const result = h('div', {'class': [
        "border", "rounded",
        "overflow-auto",
        "p-2", "my-2",
      ]}, [JSON.stringify([annot, idx])]);
      return result;
    };

    return () => h("div", { },
      props.annotations?.map?.(
        (annot, idx)=>makeDisplay(annot, idx) ?? []
      ).flat()
    );

  },
};
