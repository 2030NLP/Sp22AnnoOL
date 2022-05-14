import {  reactive, computed, onMounted, h  } from '../modules_lib/vue_3.2.31_.esm-browser.prod.min.js';
import BsBadge from './bs/BsBadge.cpnt.mjs.js';

export default {
  props: ["step", "engine", "tokenSelector", "stepCtrl", "tokens", "selection", "alertBox", "modifiedText"],
  emits: ["web-next", "web-save", "web-save-and-next", "ok", "start", "clean", "cancel", "reset", "next", "add-to-list", "clear-selection", "option"],
  component: {
    BsBadge,
  },
  setup(props, ctx) {

    const div = (attrs, children) => {
      return h("div", attrs, children);
    };

    const span = (attrs, children) => {
      return h("span", attrs, children);
    };

    const someBtn = (btnSettings, clickFn, defaultText, disabled) => {
      return btnSettings ? h("button", {
        'type': "button",
        'class': ["btn btn-sm my-1 me-1", `btn-${btnSettings?.style??"outline-primary"}`],
        'onClick': ()=>{
          clickFn(btnSettings?.go);
          // console.log(selection_length.value);
          // console.log([btnSettings, clickFn, defaultText, disabled]);
        },
        'disabled': disabled??false,
      }, [
        btnSettings?.text ?? defaultText,
      ]) : null;
    };

    const someKeyText = (key) => {
      return step_props.value?.[key] ? div({ 'class': "col col-12 my-1", }, [
        div({ }, [ step_props.value?.[key], ]),
      ]) : null;
    };

    const someKeyString = (key) => {
      return step_props.value?.strings?.[key] ? div({ 'class': "col col-12 my-1", }, [
        div({ }, [ step_props.value?.strings?.[key], ]),
      ]) : null;
    };

    const modeMap = {
      "default": null,
      "finalResult": "finalResult",
      "selectValue": "selectValue",
      "interlude": "interlude",
      "multiSpans": "multiSpans",
      "add": "add",
      "modify": "modify",
      "delete": "delete",
      "choose": "choose",
      "text": "text",
      "root": "root",
    };

    const tokenSelector = props.tokenSelector;
    const alertBox = props.alertBox;
    const stepCtrl = props.stepCtrl;

    const mode = computed(()=>props.step?.mode);
    const modeMatch = (...list) => {
      return list.map(it => modeMap[it]).includes(modeMap[mode.value])
    };

    const selection_length = computed(()=>(props.selection?.array?.length??0));

    const step_props = computed(()=>props.step?.props);

    const isWeb = computed(()=>(props.engine??"").toLowerCase() == "web");

    const idxesToText = (idxes)=>{
      if (!props.tokens?.length) {
        return JSON.stringify(idxes);
      };
      return idxes.map(idx => props.tokens[idx]?.to?.word ?? props.tokens[idx]?.word ?? `[无效索引${idx}]`).join("");
    };

    const clearSelector = () => {tokenSelector.clear(props.tokens)};





    const webButtonsDiv = () => [
      // 网络版预设按钮
      // finalResult 模式
      // 现在只提供一个 保存并继续 的按钮
      div({ 'class': "col col-12 my-1", }, [

        // false ? someBtn({
        //   style: "success",
        //   text: "不保存并前往下一条",
        // }, ()=>{ctx.emit('web-next')}, "不保存并前往下一条") : null,

        // false ? someBtn({
        //   style: "success",
        //   text: "保存",
        // }, ()=>{ctx.emit('web-save')}, "保存") : null,

        // 保存并前往下一条 ⛔️

        someBtn({
          style: "success",
          text: "保存并继续",
        }, ()=>{ctx.emit('web-save-and-next')}, "保存并继续"),
      ]),
    ][0];

    const generalButtonsDiv = (fnObj, disableObj) => {
      const fnDict = {
        ok: (go)=>{ctx.emit('ok', go)},
        start: (go)=>{ctx.emit('start', go)},
        // clean: (go)=>{ctx.emit('clean', go)},
        cancel: (go)=>{ctx.emit('cancel', go)},
        reset: (go)=>{ctx.emit('reset', go)},
        next: (go)=>{ctx.emit('next', go)},
      };
      const disableDict = {
        ok: ()=>false,
        start: ()=>false,
        // clean: ()=>false,
        cancel: ()=>false,
        reset: ()=>false,
        next: ()=>false,
      };

      if (fnObj==null) {fnObj={}};
      Object.assign(fnDict, fnObj);

      if (disableObj==null) {disableObj={}};
      Object.assign(disableDict, disableObj);

      return div({ 'class': "col col-12 my-1", }, [
        someBtn(step_props.value?.okBtn, fnDict['ok'], "完成", disableDict['ok']()),
        someBtn(step_props.value?.startBtn, fnDict['start'], "开始", disableDict['start']()),
        // someBtn(step_props.value?.cleanBtn, fnDict['clean'], "清除", disableDict['clean']()),
        someBtn(step_props.value?.cancelBtn, fnDict['cancel'], "取消", disableDict['cancel']()),
        someBtn(step_props.value?.resetBtn, fnDict['reset'], "重置", disableDict['reset']()),
        isWeb.value ? null : someBtn(step_props.value?.nextBtn, fnDict['next'], "下一条", disableDict['next']()),  // 仅限离线版
      ]);
    };





    const editModeSection = () => [
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

    const commentModeSection = () => [
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

    const multiSpansModeSection = () => [
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


    const theSpaCE2022_Task2_ModeSection = () => {
      // 目前包括两种 actualMode:
      //   doubleSpans, spanWithComment
      // 各种指导语写在 step_props.value?.strings 对象里，通过 someKeyString 函数调用
      //   chooseInstruction, selectInstruction

      // data 里有 items 数组，存放各个子 data
      // 需要 StepControl.mjs.js 相应配合???不用了，直接输出多个 data 到 annotations 里

      const ensureOptionItem = (optIdx) => {
        if (!('items' in step_props.value.data)) {
          step_props.value.data.items=[];
        };
        if (!step_props.value.data.items[optIdx]) {
          step_props.value.data.items[optIdx]={};
        };
      };
      const ensureSlot = (optIdx, slotIdx) => {
        ensureOptionItem(optIdx);
        if (!('slots' in step_props.value.data.items[optIdx])) {
          step_props.value.data.items[optIdx].slots=[];
        };
        if (!step_props.value.data.items[optIdx].slots[slotIdx]) {
          step_props.value.data.items[optIdx].slots[slotIdx]={};
        };
      };
      const getOptionItem = (optIdx) => {
        return step_props.value?.data?.items?.[optIdx];
      };
      const touchOptionItem = (optIdx) => {
        ensureOptionItem(optIdx);
        return getOptionItem(optIdx);
      };
      const getSlot = (optIdx, slotIdx) => {
        return step_props.value?.data?.items?.[optIdx]?.slots?.[slotIdx];
      };
      const touchSlot = (optIdx, slotIdx) => {
        ensureSlot(optIdx, slotIdx);
        return getSlot(optIdx, slotIdx);
      };
      // const setSlot = (optIdx, slotIdx, data) => {
      //   ensureSlot(optIdx, slotIdx);
      //   step_props.value.data.items[optIdx].slots[slotIdx] = data;
      // };
      const 已填 = (optIdx, slotIdx) => {
        return null != getSlot(optIdx, slotIdx)?.tokenarray;
      };

      const dealWithData = (data) => {
        if (!stepCtrl?.ewp?.example?.annotations?.length) {
          stepCtrl.ewp.example.annotations = [];
        };
        let idx = stepCtrl.ewp.example.annotations.length;
        data.idx = idx;
        data.mode = data.displayMode;

        stepCtrl.ewp.example.annotations.push(JSON.parse(JSON.stringify(data)));
        return data;
      };

      const processDataList = () => {
        let dataList = [];
        for (let optIdx in step_props.value?.data?.items??[]) {
          let item = step_props.value?.data?.items?.[optIdx];
          if (!!item && item.shouldTake) {
            let data = step_props.value?.options?.[optIdx]?.data;
            for (let slot of item.slots??[]) {
              if (slot?.withText?.length && 'withText' in data) {
                data.withText = slot.withText;
              };
              if (slot?.tokenarray?.length && 'tokenarrays' in data) {
                data.tokenarrays.push(slot.tokenarray);
              };
              if (slot?.tokenarray?.length && 'on' in data) {
                data.on = slot.tokenarray;
              };
            };
            dataList.push(data);
          };
        };
        return dataList;
      };

      const canSubmit = () => {
        const items = step_props.value?.data?.items?.filter?.(it=>it?.shouldTake)??[];
        const jj1 = items.length>0;
        let jj2 = true;
        outter:
        for (let item of items) {
          const slots = item?.slots?.filter?.(it=>it)??[];
          if ((slots?.length??0)<2) {jj2 = false; break outter;};
          for (let slot of slots??[]) {
            if ('tokenarray' in slot && !slot.tokenarray?.length) {jj2 = false; break outter;};
            if ('withText' in slot && !slot.withText?.length) {jj2 = false; break outter;};
          };
        };
        return jj1 && jj2;
      };

      const checkBeforeSubmit = () => {
        let checkResult = true;
        const items = step_props.value?.data?.items?.filter?.(it=>it?.shouldTake)??[];
        let hasReplacedToken = false;
        let hasHighlightedToken = false;
        let hasIntersection = false;
        // outter:
        for (let item of items) {
          const slots = item?.slots?.filter?.(it=>it)??[];
          let tokenarrays = [];
          for (let slot of slots??[]) {
            if ('tokenarray' in slot && slot.tokenarray?.length) {
              tokenarrays.push(slot.tokenarray);
              if (tokenarrays.length>1) {
                let aa = tokenarrays.at(-1);
                let bb = tokenarrays.at(-2);
                if (_.intersection(aa, bb).length>0) {
                  hasIntersection = true;
                };
              };
              for (let tokenIdx of slot.tokenarray) {
                let token = props.tokens[tokenIdx];
                if (!!token?.to?.word?.length) {
                  hasReplacedToken = true;
                };
                let isAutoSpatial = token?.autoSpatial&&["f", "s", "dv"].includes?.(token?.pos);
                const list = ["快速", "迅速", "急速", "缓慢", "慢速", "低速", "快快", "慢慢", "缓缓", "到处", "处处", "四处", "随处", "一起", "一齐", "单独", "独自", "健步", "缓步", "大步", "小步", "单向", "双向", "当场", "就近", "当面", "正面", "中途", "顺路", "向", "到", "往", "自", "朝", "在", "距", "经", "从", "由", "沿", "沿着", "朝着", "向着", "对着", "顺着", "通过"];
                const inList = (token) => {
                  let word = token?.to?.word ?? token?.word;
                  return list.includes(word);
                };
                let isInList = inList(token)&&["p", "d"].includes?.(token?.pos);
                let isAutoEntity = token?.autoEntity&&["n", "ns", "nr"].includes?.(token?.pos);
                if (isInList||isAutoSpatial) {
                  hasHighlightedToken = true;
                }
              };
            };
          };
        };
        if (!hasHighlightedToken) {
          alertBox.pushAlert('选中的范围内没有出现高亮词，请检查', 'warning', 5000);
          checkResult=false;
          // return checkResult;
        };
        if (!hasReplacedToken) {
          alertBox.pushAlert('似乎没有覆盖造成异常的关键片段，最好再检查一下', 'warning', 5000);
        };
        // if (hasIntersection) {
        //   alertBox.pushAlert('某条标注中的两个文本片段存在交集，请确认无误再保存', 'warning', 5000);
        // };
        return checkResult;
      };

      return [
        // 总指导语
        someKeyString("instruction"),

        // options 列出了每个选项的情况
        // option.actualMode  -- 实际模式
        // option.data  -- 最后要保存的数据形式
        //   根据 option.data.displayMode 来决定提供什么样的数据格式
        // option.slots  -- 显示时罗列的槽位信息
        //   slot.type   -- select 在文中选择文本片段, solid-text 固定的文本, input-text 输入文本
        //   slot.value  -- 目前仅是 solid-text 的 文本内容
        div({ 'class': "col col-12 my-1", }, [
          div({}, step_props.value?.options?.map?.((option, optIdx)=>{

            const onInputFn = option.actualMode == "spanWithComment" ? (optIdx, slotIdx, event)=>{
              touchSlot(optIdx, slotIdx).withText=event.target.value;
            } : ()=>{};

            return div({'class': "--d-inline-block"}, div({
              'class': "input-group input-group-sm my-1",
              'key': optIdx,
            }, [
              span({'class': "input-group-text"}, h("input", {
                'class': "form-check-input mt-0",
                'type': "checkbox",
                'checked': touchOptionItem(optIdx)?.shouldTake,
                'onChange': (event)=>{
                  // console.log(event.target.checked);
                  let shouldTake = event.target.checked;
                  touchOptionItem(optIdx).shouldTake = shouldTake;
                },
              })),
              ...option?.slots?.map?.((slot, slotIdx)=>{
                if (slot.type=="solid-text") {
                  return span({'class': "input-group-text", 'key': slotIdx}, [slot.value]);
                };
                if (slot.type=="select") {
                  if (!已填(optIdx, slotIdx)||!touchOptionItem(optIdx).shouldTake) {
                    // 还没填写时
                    // 1、如果还没选文本，则显示「💬」，鼠标移上去的时候显示「 selectInstruction “请在文中选择文本” 」
                    // 2、如果选择了文本，则显示「⤵️」，鼠标移上去的时候显示「 insertInstruction “将选中的文本填入此处” 」
                    return div({
                      'class': ["form-control d-inline-block text-center", {
                        "disabled bg-gray-200": !touchOptionItem(optIdx).shouldTake,
                        "cursor-pointer": touchOptionItem(optIdx).shouldTake&&selection_length.value,
                      }], 'key': slotIdx,
                      'title': step_props.value?.strings?.[selection_length.value?'insertInstruction':null],
                      'disabled': !touchOptionItem(optIdx).shouldTake,
                    }, touchOptionItem(optIdx).shouldTake ? h(BsBadge, {
                      'class': ["rounded-pill m-1", {
                        "cursor-help": !selection_length.value,
                      }],
                      'title': step_props.value?.strings?.[selection_length.value?'insertInstruction':'selectInstruction'],
                      'onClick': (event)=>{
                        if (!selection_length.value) {return;};
                        touchSlot(optIdx, slotIdx).tokenarray = props.selection.array;
                        clearSelector();
                      },
                    }, [selection_length.value?"填入 ⤵️":"💬"]) : null);
                  };
                  if (已填(optIdx, slotIdx)&&touchOptionItem(optIdx).shouldTake) {
                    let text = idxesToText(getSlot(optIdx, slotIdx)?.tokenarray??[]);
                    return div({'class': "form-control d-inline-block text-center text-break", 'key': slotIdx}, [h(BsBadge, {
                      'class': "rounded-pill m-1 text-wrap text-break",
                      'canRemove': true,
                      'onRemove': (event)=>{
                        touchSlot(optIdx, slotIdx).tokenarray = null;
                      },
                    }, [
                      text, selection_length.value ? h("span", {
                        class: ["bagde-close-btn", "ms-2", "cursor-pointer", "text-muted"],
                        onClick: ()=>{
                          touchSlot(optIdx, slotIdx).tokenarray = [...touchSlot(optIdx, slotIdx).tokenarray, ...props.selection.array];
                          clearSelector();
                        },
                      }, ["➕"]) : null,
                    ])]);
                  };
                };
                if (slot.type=="input-text") {return h("textarea", {
                  'class': "form-control form-control-sm text-center",
                  'disabled': !touchOptionItem(optIdx).shouldTake,
                  'row': "1",
                  // 'type': "text",
                  'key': slotIdx,
                  'onInput': (event)=>{onInputFn(optIdx, slotIdx, event)},
                  // 'placeholder': step_props.value?.instruction,
                })}
              }),


            ]));
          })),
        ]),

        // 通用结束按钮区
        generalButtonsDiv({
          'ok': async(go)=>{
            const checkResult = checkBeforeSubmit();
            if (!checkResult) {return;};
            // await stepCtrl.handle_SpaCE2022_Task2(step_props.value?.okBtn?.go, step_props.value?.data);
            const dataList = processDataList();
            for (let data of dataList) {
              dealWithData(data);
            };
            clearSelector();
            await stepCtrl.goRefStep(go);
          },
          'reset': ()=>{
            step_props.value.data.items=[];
            clearSelector();
          },
          'cancel': ()=>{
            stepCtrl.cancelStep(step_props.value?.cancelBtn?.go);
            clearSelector();
          },
        }, {
          'ok': ()=>!canSubmit(),
          'cancel': ()=>false,
        }),

      ];
    };





    return () => div({ 'class': "row", 'data-mode': mode.value, }, [
      ...(modeMatch("add", "modify", "delete") ? editModeSection() : []),
      ...(modeMatch("choose", "text") ? commentModeSection() : []),
      ...(modeMatch("multiSpans") ? multiSpansModeSection() : []),
      ...(modeMatch("SpaCE2022_Task2") ? theSpaCE2022_Task2_ModeSection() : []),

      // 指导语
      // finalResult 模式
      // selectValue 模式
      // interlude 模式 且 showResults 👎
      // root 模式 👎
      modeMatch("finalResult", "selectValue", "root") ? someKeyText("instruction") : null,
      modeMatch("interlude") /*&& step_props.value?.showResults*/ ? someKeyText("instruction") : null,

      // 选项按钮组
      // selectValue 模式
      // interlude 模式 👎
      modeMatch("selectValue", "interlude") &&
      step_props.value?.optionBtns ? div({ 'class': "col col-12 my-1", }, [
        ...step_props.value?.optionBtns.map(btn => someBtn(btn, ()=>{
          ctx.emit('option', btn);
          stepCtrl.goRefStep(btn.go, btn.data);
        })),
      ]) : null,


      // 一些通用的功能按钮，起初只考虑了离线版，所以和网络版可能有点冲突
      // 完成按钮 ok       | selectValue | interlude 👎 | multiSpans | add | modify | delete | choose | text
      // 开始按钮 start    | root 👎
      // 清除按钮 clean ⛔️ |                            | multiSpans
      // 取消按钮 cancel   | finalResult |              | multiSpans | add | modify | delete | choose | text
      // 重置按钮 reset    | selectValue | interlude 👎 | finalResult
      // 下一条按钮 next   | finalResult ⛔️
      modeMatch("finalResult", "selectValue", "interlude", "root") ? generalButtonsDiv({
        'cancel': ()=>{stepCtrl.cancelStep(step_props.value?.cancelBtn?.go)},
        'start': ()=>{stepCtrl.cancelStep(step_props.value?.startBtn?.go)},
        'reset': ()=>{stepCtrl.resetStep(step_props.value?.resetBtn?.go)},
        'next': ()=>{stepCtrl.nextStep(step_props.value?.nextBtn?.go)},
        'ok': ()=>{stepCtrl.goRefStep(step_props.value?.okBtn?.go)},
      }) : null,


      // 网络版预设按钮
      // finalResult 模式
      // 现在只提供一个 保存并继续 的按钮
      modeMatch("finalResult") && isWeb.value ? webButtonsDiv() : null,

      // 备用
      // div({ 'class': "col col-12 my-1", }, []),
    ]);


  },
};


