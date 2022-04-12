import {  h  } from '../modules_lib/vue_3.2.31_.esm-browser.prod.min.js';

const ModalContent = {
  props: ["box", "needconfirm", "closetext", "confirmtext", "confirmstyle"],
  emits: ["confirm"],
  setup(props, ctx) {
    // console.log(props);
    const onConfirm = () => {
      ctx.emit('confirm', props.box);
    };
    return { onConfirm };
  },
  render() {
    return h(
      'div', {'class': "modal-content"},
      [
        this.$slots.header ? h('div', {'class': "modal-header"}, this.$slots.header()) : null,
        h('div', {'class': "modal-body"}, this.$slots.default()),
        h('div', {'class': "modal-footer"}, [
          this.$slots.footer ? this.$slots.footer() : null,
          this?.['needconfirm'] ? h('button', {
            'class': ["btn btn-sm", `btn-${this?.['confirmstyle']??"primary"}`],
            'onClick': ()=>{this.onConfirm()},
          }, [
            `${this?.['confirmtext']??"确定"}`,
          ]) : null,
          h('button', {
            'class': "btn btn-sm btn-secondary",
            'onClick': ()=>{this.box.hide()},
          }, [
            `${this?.['closetext']??this?.['confirmtext']?"取消":"关闭"}`,
          ]),
          h('button', {
            'class': "btn btn-sm btn-secondary",
            'style': this.box.data.history.length>1 ? "" : {'display': 'none'},
            'onClick': ()=>{this.box.hideTotal()},
          }, [
            `关闭全部 (${this.box.data.history.length})`,
          ]),
        ]),
      ]
    );
  },
};

export default ModalContent;

