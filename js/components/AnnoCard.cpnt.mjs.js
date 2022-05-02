import {  reactive, h  } from '../modules_lib/vue_3.2.31_.esm-browser.prod.min.js';
import ResultsDisplay from './Annotator/ResultsDisplay.cpnt.mjs.js';

const AnnoCard = {
  props: ["db", "anno", "reviewer"],
  emits: ['open-modal', 'submit-review', 'update-anno', /*'update:modelValue'*/],
  setup(props, ctx) {
    const ctrl = reactive({
      reviewing: false,
      comment: props?.anno?.content?.review?.comment??"",
      accept: props?.anno?.content?.review?.accept??null,
    });
    const onOpenModal = () => {
      ctx.emit('open-modal', ['anno-detail', props.anno]);
    };
    const submitReview = () => {
      ctx.emit('submit-review', [props.anno, ctrl]);
      // ctx.emit('submit-review', [props.anno, JSON.parse(JSON.stringify(ctrl))]);
      ctrl.reviewing=false;
      // ctrl.comment="";
      // ctrl.accept=null;
    };
    const reviewPass = () => {
      ctrl.accept=true;
      submitReview();
    };
    const reviewReject = () => {
      ctrl.accept=false;
      submitReview();
    };
    const updateAnno = () => {
      ctx.emit('update-anno', props.anno);
    };
    const db = props.db;
    return { db, ctrl, onOpenModal, reviewPass, reviewReject, submitReview, updateAnno };
  },
  render() {
    // console.log(this);
    if (!this.anno || !this?.anno?.id?.length) {
      return h('div', {}, ["没有找到这条标注"]);
    };
    return h(
      'div', {
        'class': "border rounded p-1 mx-1 my-1",
      },
      [
        h('button', {
            'type': "button",
            'class': "btn btn-sm btn-light my-1 me-2",
            'onClick': this.onOpenModal,
            'title': JSON.stringify(this.anno),
          },
          [`${this.db?.userDict?.[this.anno?.user]?.name} 的标注 #${this.anno?.id}`],
        ),
        !this.ctrl.reviewing ? h('button', {
            'type': "button",
            'class': "btn btn-sm btn-outline-primary my-1 me-2",
            'onClick': async()=>{
              await this.updateAnno();
              this.ctrl.reviewing=true;
            },
          },
          [`审批`],
        ) : null,
        h('button', {
            'type': "button",
            'class': "btn btn-sm btn-light my-1 me-2",
            'onClick': this.updateAnno,
            'title': `刷新`,
          },
          [`🔄`],
        ),
        h('div', {},
          this.ctrl.reviewing ? [

            h('input', {
                'type': "text",
                'class': "border rounded p-1 my-1 me-2 align-middle",
                'placeholder': "填写批示/评论/备注",
                'value': this.ctrl.comment,
                'onInput': event => {
                  this.ctrl.comment = event?.target?.value;
                },
              },
            ),

            h('button', {
                'type': "button",
                'class': ["btn btn-sm my-1 me-2", `btn${this.ctrl.accept===true?'':'-outline'}-success`],
                'onClick': this.reviewPass,
              },
              [`通过`],
            ),
            h('button', {
                'type': "button",
                'class': ["btn btn-sm my-1 me-2", `btn${this.ctrl.accept===false?'':'-outline'}-danger`],
                'onClick': this.reviewReject,
              },
              [`否决`],
            ),

            // h('br'),

            // h('button', {
            //     'type': "button",
            //     'class': ["btn btn-sm my-1 me-2", `btn-outline-primary`],
            //     'onClick': this.submitReview,
            //   },
            //   [`提交`],
            // ),

            h('button', {
                'type': "button",
                'class': ["btn btn-sm my-1 me-2", `btn-outline-dark`],
                'onClick': ()=>{this.ctrl.reviewing=false},
              },
              [`取消`],
            ),
          ] : this.anno?.content?.review?.accept!=null ? [
            h('span', {
                'title': JSON.stringify(this.anno?.content?.review),
                'class': ["badge text-wrap my-1 me-2",
                  this.anno?.content?.review?.accept?
                  ('bg-light border border-success text-success'):
                  (this.anno?.content?.review?.checked?
                    'bg-danger border border-danger text-light':
                    'bg-light border border-danger text-danger')
                ],
              },
              [
                this.anno?.content?.review?.reviewer?.name??"",
                this.anno?.content?.review?.accept?'审批通过':'审批不通过',' ',
                this.anno?.content?.review?.comment?`「${this.anno?.content?.review?.comment}」`:null,' ',
                this.anno?.content?.review?.accept?null:this.anno?.content?.review?.checked?`标注者已处理`:'标注者尚未处理',
              ],
            ),
          ] : [
            h('span', {
                'class': "badge bg-light text-dark text-wrap my-1 me-2",
              },
              [`暂无批示`],
            ),
          ],
        ),
        // h('div', {},
        //   (this.anno?.content?.annotations??[]).map(annot=>h(
        //     'span', {
        //       'class': "badge bg-light text-dark text-wrap my-1 me-2",
        //     },
        //     [JSON.stringify(annot)],
        //   )),
        // ),
        h(ResultsDisplay, {
          class: "results-display",
          eachClass: "my-1 me-2",
          annotations: this.anno?.content?.annotations,
          tokens: this.db?.entryDict?.[this.anno?.entry]?.content?.material?.tokenList,
          showSub: true,
          showIndex: true,
          showTitleDetail: true,
          canClose: false,
          // onClose: (annot)=>{console.log(annot)},
        }),
      ]
    );
  },
};

export default AnnoCard;

