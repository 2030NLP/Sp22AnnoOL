import {
  reactive,
  computed,
  h,
  v,
  div,
  span,
  btn,
} from './VueShadow.mjs.js';

export default {
  props: ["oldReview", "canEdit"],
  emits: ['submit-review', 'update-anno'],
  setup(props, ctx) {
    const localData = reactive({
      reviewing: false,
    });
    const new_review = reactive({
      comment: props?.oldReview?.comment??"",
      accept: props?.oldReview?.accept??null,
    });

    const old_review = computed(()=>props?.oldReview);

    const submitReview = () => {
      ctx.emit('submit-review', new_review);
      localData.reviewing=false;
    };
    const reviewPass = () => {
      new_review.accept=true;
      submitReview();
    };
    const reviewReject = () => {
      new_review.accept=false;
      submitReview();
    };

    const 审核结果 = () => span({
      'class': [
        "badge text-wrap my-1 me-2 d-inline-flex gap-1",
        v(old_review)?.checked ? 'bg-warning bg-opacity-25 text-dark'
        : v(old_review)?.revised ? 'bg-info bg-opacity-25 text-dark'
        : v(old_review)?.accept===true ? 'bg-success text-light'
        : v(old_review)?.accept===false ? 'bg-danger text-light'
        : 'bg-light text-muted',
      ]
    }, [
      v(old_review)?.reviewer ? span({}, v(old_review)?.reviewer?.name??`审核员${v(old_review)?.reviewer?.id}`) : null,
      span({}, [v(old_review)?.accept===true ? '审核通过' : v(old_review)?.accept===false ? '审核不通过' : '无审核结论']),
      v(old_review)?.comment ? span({}, `（${v(old_review)?.comment}）`) : null,
      v(old_review)?.revised ? span({}, `${v(old_review)?.reviser?.name??('修订员'+v(old_review)?.reviser?.id)} 有所修订`) : null,
      v(old_review)?.checked ? span({}, `等待复审`) : null,
      props?.canEdit ? span({
        'class': "cursor-pointer",
        onClick: ()=>{
          localData.reviewing=true;
        },
      }, `[修改]`) : null,
    ]);

    const 审核控件 = () => div({}, [
      div({'class': ["small text-muted"]}, ["请注意：此页面不支持多人同时操作，填写意见的时候请确保没有其他人在同时操作，否则可能覆盖其他人的工作。"]),

      h('input', {
        'type': "text",
        'class': "border rounded p-1 my-1 me-2 align-middle",
        'placeholder': "填写批示/评论/备注",
        'value': new_review.comment,
        'onInput': event => {
          new_review.comment = event?.target?.value;
        },
      }),

      h('button', {
          'type': "button",
          'class': ["btn btn-sm my-1 me-2", `btn${new_review.accept===true?'':'-outline'}-success`],
          onClick: reviewPass,
        },
        [`通过`],
      ),
      h('button', {
          'type': "button",
          'class': ["btn btn-sm my-1 me-2", `btn${new_review.accept===false?'':'-outline'}-danger`],
          onClick: reviewReject,
        },
        [`否决`],
      ),
      h('button', {
          'type': "button",
          'class': ["btn btn-sm my-1 me-2", `btn-outline-dark`],
          onClick: ()=>{localData.reviewing=false},
        },
        [`取消`],
      ),
    ]);

    return () => {
      return div({}, [
        localData.reviewing ? 审核控件() : 审核结果(),
      ]);
    };
  },
};

