
const genModeSection = (__pack) => {

  let {
    h, div, span,
    BsBadge,
    props, ctx,
    someBtn,
    someKeyText,

    stepCtrl,

    selection_length,
    step_props,

    idxesToText,
    clearSelector,

    generalButtonsDiv,
  } = __pack;

  return () => {
    const multiSpansModeSection = [
      // 指导语
      someKeyText("instruction"),

      // 按钮
      // 增加到列表
      // 清除选区
      div({ 'class': "col col-12 my-1", }, [
        someBtn(step_props.value?.addBtn, (go)=>{
          ctx.emit('add-to-list', go);
          step_props.value?.data?.tokenarrays?.push?.(props.selection?.array);
          clearSelector();
        }, "add to list", selection_length.value<1),
        someBtn(step_props.value?.clearBtn, (go)=>{
          ctx.emit('clear-selection', go);
          clearSelector();
        }, "clear selection"),
      ]),

      // 已选列表的标题
      someKeyText("listTitle"),

      // 已选列表
      div({ 'class': "col col-12 my-1", }, [
        div({ 'class': "card" }, [
          div({ 'class': "card-body" }, (step_props.value?.data?.tokenarrays??[]).map((tokenIdxArray, idx) => h(
            BsBadge, {
              'class': "rounded-pill m-1",
              'key': "idx",
              'canRemove': true,
              'onRemove': ()=>{stepCtrl.deleteFromTokenarrays(props.step, idx)},
            },
            tokenIdxArray.map(tokenIdx => h(
              "span", {},
              [idxesToText([tokenIdx])],
            )),
          ))),
        ]),
      ]),

      // 选择数量提示 | 至少选2个片段
      (step_props.value?.data?.tokenarrays?.length??0)<2 ? someKeyText("lengthTip") : null,

      // 通用结束按钮区
      generalButtonsDiv({
        'ok': ()=>{
          stepCtrl.handleMultiSpans(step_props.value?.okBtn?.go, step_props.value?.data);
          clearSelector();
        },
        'cancel': ()=>{
          stepCtrl.cancelStep(step_props.value?.cancelBtn?.go);
          clearSelector();
        },
      }, {
        'ok': ()=>(step_props.value?.data?.tokenarrays?.length<2),
        'cancel': ()=>false,
      }),

    ];
    return multiSpansModeSection;
  };
};

export default genModeSection;

