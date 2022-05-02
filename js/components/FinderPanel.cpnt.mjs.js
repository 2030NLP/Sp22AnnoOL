import {
  reactive,
  computed,
  onMounted,
  h,
} from '../modules_lib/vue_3.2.31_.esm-browser.prod.min.js';
// import Xx from './Xx.cpnt.mjs.js';

export default {
  props: ["db", "functions", "show"],
  emits: ["happy", 'cool'],
  component: {
    // Xx,
  },
  setup(props, ctx) {

    const symbols = {
      any: "【Any】",
    };
    const symbolValues = {
      [symbols.any]: "【Any】",
    };

    const methodOptions = [
      {value: "all", text: "all: 全都选了此标签"},
      {value: "most", text: "most: 多数选了此标签"},
      {value: "exist", text: "exist: 有人选了此标签"},
    ];

    const localData = reactive({
      selectedFromToken: symbolValues[symbols.any],
      selectedToToken: symbolValues[symbols.any],
      selectedMethod: symbolValues[symbols.any],
      selectedLabelText: symbolValues[symbols.any],
      selectedTopic: symbolValues[symbols.any],
      fromTokens: [],
      toTokens: [],
      labelTexts: [],
      topics: [],
    });

    const the = reactive({
      list: [],
      overview: {},
    });

    const theDB = props.db;
    const theFN = props.functions;

    onMounted(()=>{});

    const 重建索引 = () => {
      let fromSet = new Set();
      let toSet = new Set();
      for (let entry of theDB.entries) {
        entry.fromTokens = [];
        entry.toTokens = [];
        for (let wordInfo of (entry?.info?.wordInfos??[])) {
          fromSet.add(wordInfo[1]);
          toSet.add(wordInfo[2]);
          entry.fromTokens.push(wordInfo[1]);
          entry.toTokens.push(wordInfo[2]);
        };
      };
      localData.fromTokens = Array.from(fromSet).sort();
      localData.toTokens = Array.from(toSet).sort();

      let labelTextSet = new Set();
      let topicSet = new Set();
      for (let anno of theDB.annos) {
        let labelText = `${anno.topic}→${theFN.annoLabelText(anno, theDB.lo)}`;
        topicSet.add(anno.topic);
        labelTextSet.add(labelText);
        anno.labelText = labelText;
        let entry = theDB.entryDict[anno.entry];
        if (entry) {
          if (!entry.labelTexts) {
            entry.labelTexts = [];
          };
          // if (!entry.labelTexts.includes(labelText)) {
            entry.labelTexts.push(labelText);
            entry.labelTexts.sort();
          // };
        };
      };
      localData.topics = Array.from(topicSet).sort();
      localData.labelTexts = Array.from(labelTextSet).sort();

    };

    const 检索 = () => {
      the.list = theDB.entries.filter(it=>{
        let jj1 = localData.selectedFromToken==symbolValues[symbols.any] || it.fromTokens.includes(localData.selectedFromToken);
        let jj2 = localData.selectedToToken==symbolValues[symbols.any] || it.toTokens.includes(localData.selectedToToken);
        return jj1 && jj2;
      });
      let counted = theDB.lo.countBy(the.list, it=>(it.labelTexts??[]).filter(it=>localData.selectedTopic==symbolValues[symbols.any]||it.includes(localData.selectedTopic))?.map?.(lt=>lt?.split?.("→")?.[1]));
      let sorted = theDB.lo.sortBy(theDB.lo.toPairs(counted), it=>-it[1]);
      the.overview = theDB.lo.fromPairs(sorted);
      console.log(localData);
    };

    return () => [
      h("div", { 'class': ["container", (props.show) ? null : "d-none"], }, [
        h("div", { 'class': "row align-items-center my-2" }, [
          h("div", { 'class': "col col-12", }, [
            h("p", { 'class': "text-danger" }, ["开发中，谨慎使用！！！"] ),
          ]),
          h("div", { 'class': "col col-12", }, [
            h("p", { 'class': "", }, ["提示：初次使用或数据发生变化时，需要手动重建索引。"]),
            h("p", { 'class': "", }, ["提示：检索结果只涉及已下载到本地的数据。"]),
          ]),
          h("div", { 'class': "col col-12", }, [
            h("button", {
              'type': "button",
              'class': "btn btn-sm btn-outline-primary my-1 me-2",
              'title': "重建索引",
              'onClick': ()=>{重建索引();},
            }, ["重建索引"]),
            h("div", { 'class': "d-inline-block my-1 me-2 align-middle", }, [
              h("div", { 'class': "input-group input-group-sm", }, [
                h("label", { 'class': "input-group-text", }, ["原词"]),
                h("select", {
                  'class': "form-select form-select-sm",
                  'onChange': (event) => {
                    localData.selectedFromToken = event?.target?.value;
                  },
                }, [
                  h("option", {
                    'value': symbols.any,
                    'selected': true,
                  }, [symbolValues[symbols.any]]),
                  ...localData.fromTokens.map(token=>h("option", {
                    'value': token,
                  }, [token])),
                ]),
              ]),
            ]),
            h("div", { 'class': "d-inline-block my-1 me-2 align-middle", }, [
              h("div", { 'class': "input-group input-group-sm", }, [
                h("label", { 'class': "input-group-text", }, ["替换词"]),
                h("select", {
                  'class': "form-select form-select-sm",
                  'onChange': (event) => {
                    localData.selectedToToken = event?.target?.value;
                  },
                }, [
                  h("option", {
                    'value': symbols.any,
                    'selected': true,
                  }, [symbolValues[symbols.any]]),
                  ...localData.toTokens.map(token=>h("option", {
                    'value': token,
                  }, [token])),
                ]),
              ]),
            ]),
            h("br"),
            h("div", { 'class': "d-inline-block my-1 me-2 align-middle", }, [
              h("div", { 'class': "input-group input-group-sm", }, [
                h("label", { 'class': "input-group-text", }, ["标签所属任务"]),
                h("select", {
                  'class': "form-select form-select-sm",
                  'onChange': (event) => {
                    localData.selectedTopic = event?.target?.value;
                  },
                }, [
                  h("option", {
                    'value': symbols.any,
                    'selected': true,
                  }, [symbolValues[symbols.any]]),
                  ...localData.topics.map(topic=>h("option", {
                    'value': topic,
                  }, [topic])),
                ]),
              ]),
            ]),
            h("br"),
            h("div", { 'class': "d-inline-block my-1 me-2 align-middle", }, [
              h("div", { 'class': "input-group input-group-sm", }, [
                h("label", { 'class': "input-group-text", }, ["标签"]),
                h("select", {
                  'class': "form-select form-select-sm",
                  'onChange': (event) => {
                    localData.selectedLabelText = event?.target?.value;
                  },
                }, [
                  h("option", {
                    'value': symbols.any,
                    'selected': true,
                  }, [symbolValues[symbols.any]]),
                  ...localData.labelTexts.map(labelText=>h("option", {
                    'value': labelText,
                  }, [labelText])),
                ]),
              ]),
            ]),
            h("br"),
            h("div", { 'class': "d-inline-block my-1 me-2 align-middle", }, [
              h("div", { 'class': "input-group input-group-sm", }, [
                h("label", { 'class': "input-group-text", }, ["标签判断标准"]),
                h("select", {
                  'class': "form-select form-select-sm",
                  'onChange': (event) => {
                    localData.selectedMethod = event?.target?.value;
                  },
                }, [
                  h("option", {
                    'value': symbols.any,
                    'selected': true,
                  }, [symbolValues[symbols.any]]),
                  ...methodOptions.map(option=>h("option", {
                    'value': option.value,
                  }, [option.text])),
                ]),
              ]),
            ]),
            h("button", {
              'type': "button",
              'class': "btn btn-sm btn-outline-dark my-1 me-2",
              'title': "检索",
              'onClick': ()=>{检索();},
            }, ["检索"]),
          ]),
          h("div", { 'class': "col col-12", }, [
            h("p", { 'class': "pre-wrap", }, [`${JSON.stringify(the.overview, null, 2)}`]),
          ]),
          h("div", { 'class': "col col-12", }, [
            h("p", { 'class': "", }, [`${the.list.length}`]),
          ]),
        ]),

        // h("div", { 'class': "row align-items-center my-2", }, [
        //   h("div", { 'class': "col col-12 my-2", }, []),
        //   h("div", { 'class': "col col-12 my-2", }, []),
        // ]),
        // h("div", { 'class': "row align-items-center my-2", }, [
        //   h("div", { 'class': "col col-12 my-2", }, []),
        //   h("div", { 'class': "col col-12 my-2", }, []),
        // ]),
        // h("div", { 'class': "row align-items-center my-2", }, [
        //   h("div", { 'class': "col col-12 my-2", }, []),
        //   h("div", { 'class': "col col-12 my-2", }, []),
        // ]),
      ])
    ];

  },
};

