
const genModeSection = (__pack) => {

  let {
    h, div, span,
    BsBadge,
    props, ctx,
    someKeyText,
    stepCtrl,
    modeMatch,
    selection_length,
    step_props,
    idxesToText,
    generalButtonsDiv,
  } = __pack;

  return () => {
    const commentModeSection = [
      // choose 模式
      // text 模式

      // selectInstruction 选取指导语
      !selection_length.value ? someKeyText("selectInstruction") : null,

      // selected 已选指导语 + 已选片段(不限token数) | selectedTitle + selection
      modeMatch("choose", "text")&&
      selection_length.value&&step_props.value?.selectedTitle ? div({ 'class': "col col-12 my-1", }, [
        div({ }, [
          step_props.value?.selectedTitle,  // 类似于“选中的文本是”
          "“",
          idxesToText(props.selection?.array),  // 可以和上面 editModeSection 代码合并
          "”",
        ]),
      ]) : null,

      // choose || text 模式 专属内容
      ...( (selection_length.value || step_props.value?.canSkipSelection) ? [
        // 指导语
        // 类似于“要附加的说明性文本是”
        someKeyText("instruction"),

        // 选框区
        modeMatch("choose") ? div({ 'class': "col col-12 my-1", }, [
          h("select", {
            'class': "form-select form-select-sm",
            'onChange': (event)=>{step_props.value.data.withText=event.target.value;},
          }, [
            step_props.value?.options?.map?.((option) => h('option', {
              'key': index,
              'value': option,
            }, [option])),
          ]),
        ]) : null,

        // 文本区
        modeMatch("text") ? div({ 'class': "col col-12 my-1", }, [
          h("input", {
            'class': "form-control form-control-sm",
            'type': "text",
            'onInput': (event)=>{step_props.value.data.withText=event.target.value;},
            'placeholder': step_props.value?.instruction,
          }),
        ]) : null,

      ] : []),

      // 通用结束按钮区
      generalButtonsDiv({
        'ok': ()=>{stepCtrl.handleChooseOrText(step_props.value?.okBtn?.go, step_props.value?.data)},
        'cancel': ()=>{stepCtrl.cancelStep(step_props.value?.cancelBtn?.go)},
      }, {
        'ok': ()=>
          (!step_props.value?.canSkipSelection&&!selection_length.value)||
          (!step_props.value?.canSkipText&&!step_props.value?.data?.withText?.length),
        'cancel': ()=>false,
      }),

      // 针对修改错字的专门处理
      ...(
      selection_length.value&&
      modeMatch("text")&&
      props.step?.ref=="handleErrorString" ? [
        // 220330：对于修改字符错误的情形，添加区域显示修改后的完整的文本
        div({ 'class': "col col-12 my-1", }, [
          div({ }, [ "修改后的完整文本为：" ]),
        ]),
        div({ 'class': "col col-12 my-1", }, [
          div({ 'class': "text-muted small" }, [
            h("span", {}, [ props.modifiedText.sideL ]),
            h("span", { 'class': "text-danger fw-bold" }, [ props.modifiedText.sideM ]),
            h("span", {}, [ props.modifiedText.sideR ]),
          ]),
        ]),
      ] : []),
    ];
    return commentModeSection;
  };
};

export default genModeSection;

