import {  h  } from '../modules_lib/vue_3.2.31_.esm-browser.prod.min.js';

const ModalContent = {
  props: ["box", "needconfirm", "closetext", "confirmtext", "confirmstyle"],
  emits: ["confirm"],
  setup(props, ctx) {
    // console.log(props);
    const onConfirm = () => {
      ctx.emit('confirm', props.box);
    };
    return () => [
      h('div', {'class': "modal-content"},
        [
          ctx.slots.header ? h('div', {'class': "modal-header"}, ctx.slots.header()) : null,
          h('div', {'class': "modal-body"}, ctx.slots.default()),
          h('div', {'class': "modal-footer"}, [
            ctx.slots.footer ? ctx.slots.footer() : null,
            props?.['needconfirm'] ? h('button', {
              'class': ["btn btn-sm", `btn-${props?.['confirmstyle']??"primary"}`],
              'onClick': ()=>{onConfirm()},
            }, [
              `${props?.['confirmtext']??"确定"}`,
            ]) : null,
            h('button', {
              'class': "btn btn-sm btn-secondary",
              'onClick': ()=>{props.box.hide()},
            }, [
              `${props?.['closetext']??props?.['confirmtext']?"取消":"关闭"}`,
            ]),
            h('button', {
              'class': "btn btn-sm btn-secondary",
              'style': props.box.data.history.length>1 ? "" : {'display': 'none'},
              'onClick': ()=>{props.box.hideTotal()},
            }, [
              `关闭全部 (${props.box.data.history.length})`,
            ]),
          ]),
        ],
      ),
    ];
  },
};

export default ModalContent;

