import { h } from '../../modules_lib/vue_3.2.31_.esm-browser.prod.min.js';

export default {
  props: ["bgStyle", "textStyle", "canRemove", "canClose"],
  emits: ["close"],
  setup(props, ctx) {
    const node = () => h("span", {
      class: [
        "badge",
        "text-wrap",
        "text-break",
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
      }, ["✖️"]) : null,
    ]);
    // console.log("---");
    // console.log(node());
    // console.log("---");
    return node;
  },
};
