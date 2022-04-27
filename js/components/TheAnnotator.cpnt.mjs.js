import {  reactive, conputed, onMounted, h  } from '../modules_lib/vue_3.2.31_.esm-browser.prod.min.js';
import ModalContent from './ModalContent.cpnt.mjs.js';

export default {
  props: ["step", "engine"],
  emits: ["yy", "xx"],
  component: {
  },
  setup(props, ctx) {


    const mode = computed(()=>props.step?.mode);
    const configs = computed(()=>props.step?.props);

    const isWeb = computed(()=>(props.engine??"").toLowerCase() == "web");


    const modeMap = {
      "default": null,
      "finalResult": "finalResult",
      "selectValue": "selectValue",
      "interlude": "interlude",
      "add": "add",
      "modify": "modify",
      "delete": "delete",
      "multiSpans": "multiSpans",
      "choose": "choose",
      "text": "text",
      "root": "root",
    };

    const mode() = {};




    const localData = reactive({
    });
    onMounted(()=>{
    });




    const someBtn = (btnSettings, clickFn, defaultText) => {
      return btnSettings ? h("botton", {
        'type': "button",
        'class': ["btn btn-sm my-1 me-1", `btn-${btnSettings?.style??"outline-primary"}`],
        'onClick': ()=>{clickFn(btnSettings?.go)};
      }, [
        btnSettings?.text ?? defaultText,
      ]) : null;
    };

    const div = (attrs, children) => {
      return h("div", attrs, children);
    };

    const getReplacedToken = (idx) => {
      //
    };



    return () => [
      h("div", { 'class': "row", 'data-mode': mode.value, }, [
        configs.value?.instruction ? h("div", { 'class': "col col-12 my-1", }, [
          h("div", { }, [ configs.value?.instruction, ]),
        ]) : null,

        h("div", { 'class': "col col-12 my-1", }, [
          someBtn(configs.value?.addBtn, (go)=>{ctx.emit('add-to-list')}, "add to list"),
          someBtn(configs.value?.clearBtn, (go)=>{ctx.emit('clear-list')}, "clear list"),
        ]),

        configs.value?.listTitle ? h("div", { 'class': "col col-12 my-1", }, [
          h("div", { }, [ configs.value?.listTitle, ]),
        ]) : null,

        ['multiSpans'].includes(mode.value) ? h("div", { 'class': "col col-12 my-1", }, [
          div({ 'class': "card" }, [
            div({ 'class': "card-body" }, (configs.value?.data?.tokenarrays??[]).map(tokenarray => h(
              "span", { 'class': "badge rounded-pill bg-light text-dark m-1" },
              tokenarray.map(tokenIdx => h(
                "span", {},
                [getReplacedToken(tokenIdx)],
              )),
            ))),
          ]),
        ]) : null,

        (configs.value?.lengthTip && ((configs.value?.data?.tokenarrays?.length??0)<2)) ? h("div", { 'class': "col col-12 my-1", }, [
          h("div", { }, [ configs.value?.lengthTip, ]),
        ]) : null,

        configs.value?.optionBtns ? h("div", { 'class': "col col-12 my-1", }, [
          ...configs.value?.optionBtns.map(btn => someBtn(btn, ()=>{ctx.emit('option', btn)})),
        ]) : null,

        // h("div", { 'class': "col col-12 my-1", }, [
        // ]),

        h("div", { 'class': "col col-12 my-1", }, [
          someBtn(configs.value?.okBtn, (go)=>{ctx.emit('ok', go)}, "完成"),
          someBtn(configs.value?.startBtn, (go)=>{ctx.emit('start', go)}, "开始"),
          someBtn(configs.value?.resetBtn, (go)=>{ctx.emit('reset', go)}, "重置"),
          someBtn(configs.value?.cancelBtn, (go)=>{ctx.emit('cancel', go)}, "取消"),
          isWeb.value ? null : someBtn(configs.value?.nextBtn, (go)=>{ctx.emit('next', go)}, "下一条"),
        ]),

        isWeb.value ? h("div", { 'class': "col col-12 my-1", }, [

          false : someBtn({
            style: "success",
            text: "保存",
          }, ()=>{ctx.emit('web-save')}, "保存") : null,

          false : someBtn({
            style: "success",
            text: "不保存并前往下一条",
          }, ()=>{ctx.emit('web-next')}, "不保存并前往下一条") : null,

          someBtn({
            style: "success",
            text: "保存并继续",
          }, ()=>{ctx.emit('web-save-and-next')}, "保存并继续"),

        ]) : null,

        h("div", { 'class': "col col-12 my-1", }, [
        ]),

        h("div", { 'class': "col col-12 my-1", }, [
        ]),

        h("div", { 'class': "col col-12 my-1", }, [
        ]),


      ]),
    ];




  },
};


