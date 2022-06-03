import { h, Transition } from '../../modules_lib/vue_3.2.31_.esm-browser.prod.min.js';

export default {
  props: ["needconfirm", "closetext", "confirmtext", "confirmstyle", "lg", "show"],
  emits: ["confirm", "hide"],
  setup(props, ctx) {

    const onConfirm = () => {
      ctx.emit('confirm');
    };
    const onHide = () => {
      ctx.emit('hide');
    };

    return () => h('div',
      {
        'class': "modal-wrap",
        'style': "display: block;",
        'ref': "modal_wrap",
      },
      h('div',
        {
          'class': ["modal", {"d-none": !props.show, "show": props.show}],
        },
        h('div',
          {
            'class': [
              "modal-dialog",
              props.lg ? "modal-lg" : null,
              "modal-dialog-centered",
              "modal-dialog-scrollable",
            ],
          },
          h('div', {'class': "modal-content"},
            [
              ctx.slots.header
                ? h('div', {'class': "modal-header"}, ctx.slots.header())
                : null,
              h('div', {'class': "modal-body"}, ctx.slots.default()),
              h('div', {'class': "modal-footer"}, [
                ctx.slots.footer ? ctx.slots.footer() : null,

                props?.['needconfirm']
                  ? h('button', {
                    'class': ["btn btn-sm", `btn-${props?.['confirmstyle']??"primary"}`],
                    'onClick': ()=>{onConfirm()},
                  }, [
                    `${props?.['confirmtext']??"确定"}`,
                  ])
                  : null,

                h('button', {
                  'class': "btn btn-sm btn-secondary",
                  'onClick': ()=>{onHide()},
                }, [
                  `${props?.['closetext']??(props?.['needconfirm']||props?.['confirmtext']?"取消":"关闭")}`,
                ]),

              ]),
            ],
          ),
        )

      ),
    );
  },
};
