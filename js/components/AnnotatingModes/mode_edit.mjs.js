
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
    const editModeSection = [
      // add 模式
      // modify 模式
      // delete 模式

      // selectInstruction 选取指导语
      !selection_length.value ? someKeyText("selectInstruction") : null,

      // selected 已选指导语 + 已选片段(限1个token) | selectedTitle + selection
      selection_length.value&&step_props.value?.selectedTitle ? div({ 'class': "col col-12 my-1", }, [
        div({ }, [
          step_props.value?.selectedTitle,  // 类似于“选中的文本是”
          "“",
          idxesToText([props.selection?.array?.[0]]),  // 只能选一个 token 所以是 [0]
          "”",
        ]),
      ]) : null,

      // add 模式 专属内容
      ...(modeMatch("add") && selection_length.value ? [

        // 选边指导语
        // 类似于“选择左边还是右边”
        someKeyText("sideInstruction"),

        // 选框区
        div({ 'class': "col col-12 my-1", }, [
          h("select", {
            'class': "form-select form-select-sm",
            'onChange': (event)=>{step_props.value.data.side=event.target.value;},
          }, [
            step_props.value?.options?.map?.((option, index) => h('option', {
              'key': index,
              'value': option.value,
            }, [option.text])),
          ]),
        ]),

        // 添加内容指导语
        // 类似于“要添加的文本是”
        someKeyText("addInstruction"),

        // 文本区
        div({ 'class': "col col-12 my-1", }, [
          h("input", {
            'class': "form-control form-control-sm",
            'type': "text",
            'onInput': (event)=>{step_props.value.data.target=event.target.value;},
            'placeholder': step_props.value?.addInstruction,
          }),
        ]),
      ] : []),

      // modify 模式 专属内容
      ...(modeMatch("modify") && selection_length.value ? [
        // 指导语
        // 类似于“修改后的文本是”
        someKeyText("instruction"),

        // 文本区
        div({ 'class': "col col-12 my-1", }, [
          h("input", {
            'class': "form-control form-control-sm",
            'type': "text",
            'onInput': (event)=>{step_props.value.data.target=event.target.value;},
            'placeholder': step_props.value?.instruction,
          }),
        ]),
      ] : []),

      // 通用结束按钮区
      generalButtonsDiv({
        'ok': ()=>{stepCtrl.handleWord(step_props.value?.okBtn?.go, step_props.value?.data)},
        'cancel': ()=>{stepCtrl.cancelStep(step_props.value?.cancelBtn?.go)},
      }, {
        'ok': ()=> (!selection_length.value)||(modeMatch("add", "modify") && !step_props.value?.data?.target?.length),
        'cancel': ()=>false,
      }),

    ];
    return editModeSection;
  };
};

export default genModeSection;

