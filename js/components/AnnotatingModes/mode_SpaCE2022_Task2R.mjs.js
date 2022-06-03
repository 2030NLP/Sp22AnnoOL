
const genModeSection = (__pack) => {

  let {
    div, span, h,
    BsBadge,
    generalButtonsDiv,
    someKeyString, someKeyText,
    idxesToText,
    clearSelector,
    step_props, stepCtrl, alertBox,
    selection_length,
    props, ctx,
    __LODASH,
  } = __pack;

  const idxesToTokens = (idxes) => {
    idxes = idxes??[];
    if (!props.tokens?.length) {
      return [];
    };
    return idxes.map(idx => props.tokens[idx]?.to ?? props.tokens[idx] ?? {});
  };

  return () => {

    const ha = (children, href, title, targetBlank) => {
      targetBlank = targetBlank?(!!targetBlank):true;
      return h("a", {
        'href': href??"#",
        'title': title??"",
        'target': targetBlank?'_blank':undefined,
      }, children);
    };
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
    const getOptionItem = (optIdx) => {
      return step_props.value?.data?.items?.[optIdx];
    };
    const touchOptionItem = (optIdx) => {
      ensureOptionItem(optIdx);
      return getOptionItem(optIdx);
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
    const getSlot = (optIdx, slotIdx) => {
      return step_props.value?.data?.items?.[optIdx]?.slots?.[slotIdx];
    };
    const touchSlot = (optIdx, slotIdx) => {
      ensureSlot(optIdx, slotIdx);
      return getSlot(optIdx, slotIdx);
    };
    const setSlot = (optIdx, slotIdx, value) => {
      ensureSlot(optIdx, slotIdx);
      step_props.value.data.items[optIdx].slots[slotIdx] = value;
    };

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
              data.names.push(slot.name);
            };
            if (slot?.tokenarray?.length && 'on' in data) {
              data.on = slot.tokenarray;
              data.name = slot.name;
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
        if ((slots?.length??0)<(item.minimal??0)) {jj2 = false; break outter;};
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
      const 针对性处理标记清单 = [];
      // outter:
      for (let item of items) {
        const slots = item?.slots?.filter?.(it=>it)??[];
        let tokenarrays = [];
        for (let slot of slots??[]) {
          if ('tokenarray' in slot && slot.tokenarray?.length) {
            tokenarrays.push(slot.tokenarray);
            // 存在交集的情况，现在不管了
            if (tokenarrays.length>1) {
              let aa = tokenarrays.at(-1);
              let bb = tokenarrays.at(-2);
              if (__LODASH.intersection(aa, bb).length>0) {
                hasIntersection = true;
              };
            };
            // 检查没有高亮词或没覆盖key的情况
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
        if (item?.针对性处理?.includes?.("语义冲突数量限制")) {
          if (tokenarrays.length < 4) {
            针对性处理标记清单.push("语义冲突片段少于4");
          };
          if (tokenarrays.length == 5) {
            针对性处理标记清单.push("语义冲突片段等于5");
          };
        };
        if (item?.针对性处理?.includes?.("检查P是否为纯方位词")) {
          console.log(slots);
          let names = slots.map(slot=>slot.name);
          for (let ii in names) {
            let name = names[ii];
            if (['P', 'P1', 'P2'].includes(name)) {
              let poses = Array.from(new Set(idxesToTokens(slots[ii].tokenarray).map(it=>it.pos)));
              if (poses.length==1&&["f"].includes(poses[0])) {
                针对性处理标记清单.push("P为纯方位词");
              };
            };
          };
          //
        };
        if (item?.针对性处理?.includes?.("P, E 词类检查")) {
          console.log(slots);
          let names = slots.map(slot=>slot.name);
          for (let ii in names) {
            let name = names[ii];
            if (['P', 'P1', 'P2'].includes(name)) {
              for (let token of idxesToTokens(slots[ii].tokenarray)) {
                if (["v", "--dv"].includes(token?.pos)) {
                  针对性处理标记清单.push("P含动词");
                };
              };
            };
            if (['E', 'E1', 'E2'].includes(name)) {
              for (let token of idxesToTokens(slots[ii].tokenarray)) {
                if (["f", "--f"].includes(token?.pos)) {
                  针对性处理标记清单.push("E含方位词");
                };
              };
            };
          };
          //
        };
      };
      if (!hasHighlightedToken) {
        alertBox.pushAlert('选中的范围内没有出现高亮词，请检查', 'warning', 5000);
        checkResult=false;
      };
      if (!hasReplacedToken) {
        alertBox.pushAlert('似乎没有覆盖造成异常的关键片段，最好再检查一下', 'warning', 5000);
      };
      if (针对性处理标记清单.includes("语义冲突片段少于4")) {
        alertBox.pushAlert('语义冲突类选中的文本片段数量不足，请检查', 'warning', 5000);
        checkResult=false;
      };
      if (针对性处理标记清单.includes("语义冲突片段等于5")) {
        alertBox.pushAlert('语义冲突类选中的文本片段数量不太正常，请确认操作无误再保存', 'warning', 5000);
      };
      if (针对性处理标记清单.includes("P为纯方位词")) {
        alertBox.pushAlert('P 只含方位词，不太符合规范，请确认操作无误再保存', 'warning', 5000);
      };
      if (针对性处理标记清单.includes("P含动词")) {
        alertBox.pushAlert('P 含有动词，是不是和 E 填反了？建议检查一下，确认操作无误再保存', 'warning', 5000);
      };
      if (针对性处理标记清单.includes("E含方位词")) {
        alertBox.pushAlert('E 含有方位词，是不是和 P 填反了？建议检查一下，确认操作无误再保存', 'warning', 5000);
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
      // option.minimal  -- 最少填几个槽
      // option.针对性处理  -- 针对性处理记号数组
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
                touchOptionItem(optIdx).minimal = shouldTake ? option.minimal??0 : undefined;
                touchOptionItem(optIdx).针对性处理 = shouldTake ? option.针对性处理??[] : undefined;
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
                  return div(
                    {
                      'class': ["form-control d-inline-block text-center", {
                        "disabled bg-gray-200": !touchOptionItem(optIdx).shouldTake,
                        "cursor-pointer": touchOptionItem(optIdx).shouldTake&&selection_length.value,
                      }],'key': slotIdx,
                      'title': step_props.value?.strings?.[selection_length.value?'insertInstruction':null],
                      'disabled': !touchOptionItem(optIdx).shouldTake,
                    },
                    touchOptionItem(optIdx).shouldTake
                      ? h(BsBadge, {
                        'class': ["rounded-pill m-1 text-wrap text-break", "lh-base", {
                          "cursor-help": !selection_length.value,
                        }],
                        'title': step_props.value?.strings?.[selection_length.value?'insertInstruction':'selectInstruction'],
                        'onClick': (event)=>{
                          if (!selection_length.value) {return;};
                          touchSlot(optIdx, slotIdx).tokenarray = props.selection.array;
                          touchSlot(optIdx, slotIdx).name = slot.placeholder;
                          clearSelector();
                        },
                      }, [
                        selection_length.value
                          ? `填入${ slot.placeholder ? ' '+slot.placeholder : ""} ⤵️`
                          : `💬${ slot.placeholder ? ' '+slot.placeholder : ""}`
                      ])
                      : span({'class': "text-muted"}, `${slot.placeholder??""}`)
                  );
                };
                if (已填(optIdx, slotIdx)&&touchOptionItem(optIdx).shouldTake) {
                  let text = idxesToText(getSlot(optIdx, slotIdx)?.tokenarray??[]);
                  return div({'class': "form-control d-inline-block text-center text-break", 'key': slotIdx}, [h(BsBadge, {
                    'class': ["rounded-pill m-1 text-wrap text-break", "lh-base"],
                    'canRemove': true,
                    'onRemove': (event)=>{
                      touchSlot(optIdx, slotIdx).tokenarray = null;
                      setSlot(optIdx, slotIdx, null);
                    },
                  }, [
                    slot.placeholder ? span({
                      'class': "text-muted me-2",
                    }, `${slot.placeholder??""}`) : null,
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

      //
      div({'class': "text-muted small"}, [
        h("p", null, ["标注前，请仔细阅读 ", ha("最新标注规范", "https://2030nlp.github.io/Sp22AnnoOL/task2_guide.html"), " 以及 ", ha("常见问题解答FAQ", "https://2030nlp.github.io/Sp22AnnoOL/task2_complement.html"), " 。"]),
        h("p", null, ["要点提示："]),
        h("p", null, ["① 不要求 S-P-E 可以拼成一句通顺的话，重点是说清楚 S（什么）、P（在哪里）和 E（干什么）。尤其注意 ", span({'class': "fw-bold"}, "P 是 Place，E 是 Event，填写时切勿颠倒"), "（如“挂在墙上”应填写“P: 在墙上，E: 挂”）。"]),
        h("p", null, ["② S 空间实体是被 P、E 直接描述了空间信息的实体，而不一定是主语和施事，如“小明把课本放到桌上”中，如果 P 和 E 分别是“到桌上”和“放”，那么 S 应该是“课本”而不是“小明”。“小明”虽然和“放”也有关联，但他的空间信息没有被表达。"]),
        h("p", null, ["③ P 应该描述完整的空间方位信息，通常 ", span({'class': "fw-bold"}, "不应该"), " 只有一个方位词。常见的表达形式请看 ", ha("此处", "https://2030nlp.github.io/Sp22AnnoOL/task2_guide_main.html#212-空间实体的方位-p"), " 。"]),
        h("p", null, ["④ 语言单位充当 S 的优先级为：专有名词 > 普通名词 > 代词。比如如果某条语料中 P、E 语法上直接关联的成分是代词“他”，并且“他”指代了出现在上下文的专有名词“小明”，那么此时 S 处应填“小明”而不应填“他”。只有“他”在该条语料中没有具体指代，才可以直接填写“他”。"]),
        h("p", null, ["⑤ 若遇到较难判断的情况，首先请看 ", ha("几种特殊现象的处理方式", "https://2030nlp.github.io/Sp22AnnoOL/task2_complement_main.html#5-几种特殊现象的处理方式"), " ，若仍难以判断，请在群中提问讨论，谢谢。"]),
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
};

export default genModeSection;

