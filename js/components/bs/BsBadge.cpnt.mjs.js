import { h } from '../../modules_lib/vue_3.2.31_.esm-browser.prod.min.js';

export default {
  props: ["bgStyle", "textStyle", "canRemove", "canClose"],
  emits: ["close"],
  setup(props, ctx) {
    return () => h("span", {
      class: [
        "badge",
        `bg-${props.bgStyle??"light"}`,
        `text-${props.textStyle??"dark"}`,
      ],
    }, [
      ctx?.slots?.default?.(),
      (props.canRemove || props.canClose) ? h("span", {
        class: ["bagde-close-btn", "ms-2", "cursor-pointer", "text-muted"],
        onClick: ()=>{
          ctx.emit("close");
          ctx.emit("remove");
        },
      }, ["X"]) : null,
    ]);
  },
};
