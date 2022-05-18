import {  reactive, computed, onMounted, h  } from './VueShadow.mjs.js';
import BsBadge from './bs/BsBadge.cpnt.mjs.js';
import gen_editModeSection from './AnnotatingModes/mode_edit.mjs.js';
import gen_commentModeSection from './AnnotatingModes/mode_comment.mjs.js';
import gen_multiSpansModeSection from './AnnotatingModes/mode_multiSpans.mjs.js';
import gen_SpaCE2022_Task2_ModeSection from './AnnotatingModes/mode_SpaCE2022_Task2.mjs.js';
import gen_CSpaceBank_ModeSection from './AnnotatingModes/mode_CSpaceBank.mjs.js';

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
      "SpaCE2022_Task2": "SpaCE2022_Task2",
      "CSpaceBank": "CSpaceBank",
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
      idxes = idxes??[];
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





    const __pack = {
      reactive, computed, onMounted, h,
      BsBadge,
      props, ctx,

      div,
      span,
      someBtn,
      someKeyText,
      someKeyString,
      modeMap,

      tokenSelector,
      alertBox,
      stepCtrl,

      mode,
      modeMatch,

      selection_length,
      step_props,
      isWeb,

      idxesToText,
      clearSelector,

      webButtonsDiv,
      generalButtonsDiv,

      __LODASH: _,
    };



    const editModeSection = gen_editModeSection(__pack);
    const commentModeSection = gen_commentModeSection(__pack);
    const multiSpansModeSection = gen_multiSpansModeSection(__pack);

    const theSpaCE2022_Task2_ModeSection = gen_SpaCE2022_Task2_ModeSection(__pack);
    const theCSpaceBank_ModeSection = gen_CSpaceBank_ModeSection(__pack);

    return () => div({ 'class': "row", 'data-mode': mode.value, }, [
      ...(modeMatch("add", "modify", "delete") ? editModeSection() : []),
      ...(modeMatch("choose", "text") ? commentModeSection() : []),
      ...(modeMatch("multiSpans") ? multiSpansModeSection() : []),
      ...(modeMatch("SpaCE2022_Task2") ? theSpaCE2022_Task2_ModeSection() : []),
      ...(modeMatch("CSpaceBank") ? theCSpaceBank_ModeSection() : []),

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


