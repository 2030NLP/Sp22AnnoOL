
// 基本信息 变量
const APP_NAME = "Sp22-Anno";
const APP_VERSION = "22-0405-01";
const PROJ_DESC = "SpaCE2022";
const PROJ_PREFIX = "Sp22";

// 开发环境 和 生产环境 的 控制变量
const DEVELOPING = location?.hostname=="2030nlp.github.io" ? 0 : 1;
if (DEVELOPING) {
  console.log("DEVELOPING");
} else {
  console.log("PRODUCTION");
};
const DEVELOPING_LOCAL = 0;
const API_BASE_DEV_LOCAL = "http://127.0.0.1:5000";
const DEV_HOSTS = ["http://192.168.124.3:8888", "http://10.1.22.96:8888"];
const API_BASE_DEV = DEV_HOSTS[0];
const API_BASE_PROD = "https://sp22.nlpsun.cn";
const API_BASE = DEVELOPING ? API_BASE_DEV : API_BASE_PROD;

// 引入依赖的模块

import {
  reactive,
  // readonly,
  // ref,
  // toRef,
  toRefs,
  computed,
  onMounted,
  // onUpdated,
  createApp as Vue_createApp,
  watch,
} from './modules_lib/vue_3.2.31_.esm-browser.prod.min.js';

// import { timeString, foolCopy } from './util.mjs.js';
import BaseSaver from './modules/BaseSaver.mjs.js';
import TheReader from './modules/TheReader.mjs.js';
import AlertBox from './modules/AlertBox.mjs.js';
import TokenSelector from './modules/TokenSelector.mjs.js';
import StepControl from './modules/StepControl.mjs.js';
import BackEnd from './modules/BackEnd.mjs.js';
import BackEndUsage from './modules/BackEndUsage.mjs.js';
import IoControl from './modules/IoControl.mjs.js';

import axios from './modules_lib/axios_0.26.1_.mjs.js';
import ClipboardJS from './modules_lib/clipboard_2.0.10_.mjs.js';
import __Wrap_of_store__ from './modules_lib/store_2.0.9_.legacy.min.mjs.js';
import __Wrap_of_lodash__ from './modules_lib/lodash_4.17.21_.min.mjs.js';


// 语料信息映射
const fildId_to_info = { "A01": { "genre": "中小学语文课本", "file": "人教版_课标教材初中语文原始语料.txt", "用户显示名称": "初中语文课本" }, "A02":{ "genre":"中小学语文课本", "file": "人教版_课标教材高中语文原始语料.txt", "用户显示名称": "高中语文课本" }, "A03":{ "genre":"中小学语文课本", "file": "人教版_课标教材小学语文原始语料.txt", "用户显示名称": "小学语文课本" }, "A04":{ "genre":"中小学语文课本", "file": "人教版_全日制普通高中语文原始语料.txt", "用户显示名称": "高中语文课本" }, "A05":{ "genre":"中小学语文课本", "file": "人教版_义务教育教材_3年_初中语文原始语料.txt", "用户显示名称": "初中语文课本" }, "A06":{ "genre":"中小学语文课本", "file": "人教版_义务教育教材_6年_小学语文原始语料.txt", "用户显示名称": "小学语文课本" }, "B01": { "genre": "体育训练人体动作", "file": "shentiyundongxunlian.txt", "用户显示名称": "身体运动训练" }, "B02":{ "genre":"体育训练人体动作", "file": "tushouxunlian.txt", "用户显示名称": "儿童徒手训练" }, "B03":{ "genre":"体育训练人体动作", "file": "yujia.txt", "用户显示名称": "瑜伽" }, "B04":{ "genre":"体育训练人体动作", "file": "qingshaoniantushou.txt", "用户显示名称": "青少年徒手训练" }, "B05":{ "genre":"体育训练人体动作", "file": "lashen131.txt", "用户显示名称": "儿童拉伸训练" }, "B06":{ "genre":"体育训练人体动作", "file": "lashen130.txt", "用户显示名称": "青少年拉伸训练" }, "C01": { "genre": "人民日报", "file": "rmrb_2020-2021.txt", "用户显示名称": "人民日报" }, "D01": { "genre": "文学", "file": "似水流年_王小波.txt", "用户显示名称": "人民日报" }, "D02": { "genre": "文学", "file": "洗澡_杨绛.txt", "用户显示名称": "文学" }, "D03":{ "genre":"文学", "file": "天狗.txt", "用户显示名称": "文学" }, "D04":{ "genre":"文学", "file": "北京北京.txt", "用户显示名称": "文学" }, "D05":{ "genre":"文学", "file": "草房子.txt", "用户显示名称": "文学" }, "D06":{ "genre":"文学", "file": "兄弟.txt", "用户显示名称": "文学" }, "E01":{ "genre":"地理百科全书", "file": "geography.txt", "用户显示名称": "地理百科全书" }, "F01":{ "genre":"交通事故判决书", "file": "上海_交通判决书.txt", "用户显示名称": "交通事故判决书" }, "F02":{ "genre":"交通事故判决书", "file": "北京_交通判决书.txt", "用户显示名称": "交通事故判决书" }, "G01":{ "genre":"语言学论文例句", "file": "wenxian.txt", "用户显示名称": "语言学论文例句" }};


const RootComponent = {
  setup() {

    // 备用的窗口，作为 "ioC.onImport(win.document)" 的参数
    const win = reactive(window);

    const lo = _;

    // 语料信息映射 函数
    const fileInfo = (originId) => {
      const fileId = originId.split("-")[0];
      return fildId_to_info[fileId];
    };

    // 初始化 文件保存 模块
    const theSaver = new BaseSaver();

    // 初始化 提示框 模块
    const alertData = reactive({
      lastIdx: 1,
      alerts: [],
    });
    const alertBox = new AlertBox(alertData);
    const alertBox_pushAlert = (ctt, typ, tot, other) => alertBox.pushAlert(ctt, typ, tot, other);
    const alertBox_removeAlert = (idx) => alertBox.removeAlert(idx);

    // 初始化 文件读取 模块
    const theReader = new TheReader(alertBox_pushAlert);


    // 初始化 剪贴板 插件
    // const theClipboardRef = ref(null);
    onMounted(() => {
      let theClipboard = new ClipboardJS(".btn-copy-selection");
      theClipboard.on('success', function (e) {
        // console.info('Action:', [e.action, e.text, e.trigger]);
        alertBox_pushAlert(`成功拷贝文本【${e.text}】`, "success");
        e.clearSelection();
      });
      theClipboard.on('error', function (e) {
        // console.info('Action:', [e.action, e.trigger]);
        alertBox_pushAlert(`拷贝失败！`, "danger");
      });
    });


    // 初始化 文本片段选择 模块
    const selection = reactive({
      isSelecting: false,
      start: null,
      end: null,
      end: null,
      array: [],
      again: false,
      hasDown: false,
    });
    const tokenSelector = new TokenSelector(selection);


    // 初始化 标注工具当下正在标注的语料 数据
    const exampleWrap = reactive({
      example: {},
    });

    const dfWrap = reactive({
      dataItems: [],
    });

    // 初始化 应用 数据
    const appData = reactive({
      fileWrapWrap: {
        fileWrap: {},
      },
      fileError: false,
      dataWrap: {
        dataItems: [],
      },
      tasks: [],  // 清单页面里的任务按钮，例子：[{id:"666",skipped:true},{id:"888",dropped:true},{id:"222",valid:true},{id:"333"},{id:"111"}],
      ctrl: {
        currentWorker: "",
        currentWorkerId: "",
        currentWorkerSecret: "",
        currentWorkerTarget: 600,
        currentWorkerTaskType: "",
        currentWorkerTaskCount: null,
        //
        currentPage: "setup",
        //
        haveStore: false,
        //
        doneNum: 0,
        totalNum: 1,
        donePct: "10%",
        //
        currentIdx: 0,
        targetIdx: 0,
        showOrigin: false,
        //
      },
      newThings: {
        theUser: {},
        topic: "",
        lastEID: null,
        //
        tasksShowValid: true,
        tasksShowDropped: true,
        tasksShowUndone: true,
        //
        navbar_collapse_show: false,
      },
    });

    // 启动时 加载缓存的 应用信息 及 用户信息
    onMounted(() => {
      let storedVersion = store.get(`${APP_NAME}:version`);
      if (storedVersion == APP_VERSION) {
        appData.ctrl.haveStore = true;
        alertBox_pushAlert(`ver. ${APP_VERSION}`, "info", 300);
      } else {
        alertBox_pushAlert(`版本已更新到 ${APP_VERSION}`, "success", 1000);
        store.set(`${APP_NAME}:version`, APP_VERSION);
      };
      let stored = store.get(`${APP_NAME}:it`);
      appData.ctrl.currentWorker = stored?.worker;
      appData.ctrl.currentWorkerId = stored?.workerId;
      appData.ctrl.currentWorkerSecret = stored?.secret;
      appData.ctrl.currentWorkerTarget = stored?.target;
      appData.ctrl.currentWorkerTaskType = stored?.taskType;
      appData.ctrl.currentWorkerTaskCount = stored?.taskCount;
      appData.newThings.lastEID = store.get(`${APP_NAME}:lastEID`);
      appData.newThings.theUser = store.get(`${APP_NAME}:theUser`);
    });




    const toogleShowOrigin = () => {
      appData.ctrl.showOrigin = !appData.ctrl.showOrigin;
      // console.debug(appData.ctrl.showOrigin);
    };





    const rootStep = reactive({});
    const currentStep = reactive({});
    const stepsDict = reactive({});
    const stepsDictWrap = reactive({
      version: "00",
    });

    const theBackEnd = new BackEnd(appData.ctrl.currentWorkerSecret, `${API_BASE}/api/`, alertBox_pushAlert);

    watch(()=>appData.ctrl.currentWorkerSecret, () => {
      theBackEnd.token = appData.ctrl.currentWorkerSecret;
    });

    const appPack = {
      reactive_data: appData,
      reactive_exam_wrap: exampleWrap,
      reactive_df_wrap: dfWrap,

      tokenSelector: tokenSelector,

      reactive_rootStep: rootStep,
      reactive_currentStep: currentStep,
      reactive_stepsDict: stepsDict,
      reactive_stepsDictWrap: stepsDictWrap,

      theBackEnd: theBackEnd,
      pushAlertFn: alertBox_pushAlert,
      removeAlertFn: alertBox_removeAlert,
      appName: APP_NAME,
      appVersion: APP_VERSION,
      projDesc: PROJ_DESC,
      projPrefix: PROJ_PREFIX,
      storeTool: store,
      lodash: lo,

      reader: theReader,
    };

    // 初始化 标注步骤 控制器
    const stepCtrl = new StepControl(appPack);
    appPack.stepCtrl = stepCtrl;


    // 一个 axios 实例，方便在控制台调试
    const anAxios = axios.create({
      headers: {'Cache-Cotrol': 'no-cache'},
    });



    const ll0 = ['t0', '第0期', '清洗', '0', 'clean', 'check'];
    const ll1 = ['t1', '第1期', '正确性', '1'];
    const ll2 = ['t2', '第2期', '同义性', '2'];
    const ll3 = ['t3', '第3期', '归因', '3', 'reason'];
    const ll4 = ['t4', '第4期', '精标', '4', 'detail'];

    // 处理 topic 历史遗留混乱 用于 Task task.topic
    const topic_regulation = (topic) => {
      if (ll0.includes(topic)) {
        return '清洗';
      };
      if (ll1.includes(topic)) {
        return '第1期';
      };
      if (ll2.includes(topic)) {
        return '第2期';
      };
      if (ll3.includes(topic)) {
        return '归因';
      };
      if (ll4.includes(topic)) {
        return '精标';
      };
      return topic;
    }


    // 更新 schema
    const updateSchema = async () => {
      let wrap;
      try {
        let response = await anAxios.request({
          url: "schema/steps.schema.json",
          method: 'get',
        });
        wrap = (response.data);
        let taskType = appData.ctrl.currentWorkerTaskType;
        let shouldUsing = topic_regulation(taskType);
        if (shouldUsing?.length) {
          wrap.using = shouldUsing;
          wrap.version = wrap?.versions?.[shouldUsing];
        };
        if (shouldUsing==null || wrap.using==null || wrap.version==null) {
          throw new Error("无效的 规范 或 版本号！");
        };
      } catch (error) {
        alertBox_pushAlert(`获取 schema 时出错！（${error}）`, "danger", 5000, error);
        throw error;
        return;
        // return;
      };
      // console.debug(wrap);
      let got = stepCtrl.touchSchema(wrap);
      if (got) {
        alertBox_pushAlert(`当前 schema（规范：${wrap.using}，版本：${wrap.version}）`, "info", 2000);
      };
    };

    // onMounted(async () => {
    //   await updateSchema();
    // });

    appPack.updateSchemaFn = updateSchema;


    // 初始化 离线版 的 主要逻辑
    const ioC = new IoControl(appPack);

    // 离线版 使用 离线版相应函数
    // stepCtrl.updateProgress = () => { ioC.updateProgress(); };
    // stepCtrl.saveStore = () => { ioC.saveStore(); };
    // stepCtrl.saveExample = () => { ioC.saveExample(); };

    // appPack.ioControl = ioC;

    // 初始化 网络版 的 主要逻辑
    const bEU = new BackEndUsage(appPack);

    // 网络版 使用 网络版相应函数
    stepCtrl.updateProgress = () => { bEU.updateProgress(); };
    stepCtrl.saveStore = () => { bEU.saveStore(); };


    // onMounted(async () => {
    //   if (appData?.ctrl?.currentWorkerSecret?.length) {
    //     await bEU.begin();
    //   };
    // });


    // 一些便捷函数，免得前端代码写得太长
    const getReplacedToken = (idx) => {
      let tokenList = exampleWrap.example.material.tokenList;
      return tokenSelector.getReplacedToken(idx, tokenList);
      // return tokenList[idx]?.replaced ? tokenList[idx]?.to?.word : tokenList[idx].word;
    };
    const getOriginToken = (idx) => {
      let tokenList = exampleWrap.example.material.tokenList;
      return tokenSelector.getOriginToken(idx, tokenList);
      // return tokenList[idx].word;
    };
    const getTokenList = () => exampleWrap?.example?.material?.tokenList;


    const modifiedText = computed(() => {
      let tokenList = getTokenList();
      let txt = tokenList.map(token => selection.array.includes(token.idx)?"⚛":(token?.to?.word??token.word)).join("");
      let textFragsPre = txt.split(/⚛+/g);
      let textFrags = {
        sideL: textFragsPre[0],
        sideM: currentStep?.props?.data?.withText,  //||"【???】",
        sideR: textFragsPre[1]??"",
      };
      return textFrags;
    });


    const shouldShowNotice = () => (topic_regulation(appData?.ctrl?.currentWorkerTaskType)=='清洗' || appData?.ctrl?.currentWorker=='admin');
    const shouldBeAdmin = () => (appData?.ctrl?.currentWorker=='admin');


    const isChecker = () => (appData?.newThings?.theUser?.role??[]).includes('checker')
    ||(appData?.newThings?.theUser?.role??[]).includes('manager')
    ||(appData?.newThings?.theUser?.role??[]).includes('admin');

    return {
      //
      win,
      lo,
      //
      fileInfo,
      //
      ...toRefs(exampleWrap),
      ...toRefs(appData),
      dfWrap,
      //
      alertData,
      alertBox,
      //
      selection,
      tokenSelector,
      //
      theSaver,
      //
      // theApi,
      theBackEnd,
      //
      toogleShowOrigin,
      //
      rootStep,
      currentStep,
      stepsDict,
      stepsDictWrap,
      //
      anAxios,
      updateSchema,
      //
      stepCtrl,
      ioC,
      bEU,
      //
      //
      getReplacedToken,
      getOriginToken,
      getTokenList,
      modifiedText,
      //
      shouldShowNotice,
      shouldBeAdmin,
      //
      topic_regulation,
      //
      isChecker,
      //
    };
  },
};


const the_app = Vue_createApp(RootComponent);
const app = the_app.mount('#bodywrap');
window.app = app;
// the_app.config.globalProperties.$axios = axios;  // 用 app.theBackEnd 就可以调试了。

export default app;


