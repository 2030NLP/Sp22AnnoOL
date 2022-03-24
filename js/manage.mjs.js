
// 引入依赖的模块

import {
  reactive,
  // readonly,
  // ref,
  // toRef,
  toRefs,
  // computed,
  onMounted,
  // onUpdated,
  createApp as Vue_createApp,
  watch,
} from './modules_lib/vue_3.2.31_.esm-browser.prod.min.js';

import { timeString, dateString, foolCopy, uuid, errorHappened } from './util.mjs.js';
import BaseSaver from './modules/BaseSaver.mjs.js';
import TheReader from './modules/TheReader.mjs.js';
import AlertBox from './modules/AlertBox.mjs.js';
import ModalBox from './modules/ModalBox.mjs.js';
import BackEnd from './modules/BackEnd.mjs.js';
// import BackEndUsage from './modules/BackEndUsage.mjs.js';
// import IoControl from './modules/IoControl.mjs.js';

import axios from './modules_lib/axios_0.26.1_.mjs.js';
import ClipboardJS from './modules_lib/clipboard_2.0.10_.mjs.js';
import __Wrap_of_store__ from './modules_lib/store_2.0.9_.legacy.min.mjs.js';  //
import __Wrap_of_lodash__ from './modules_lib/lodash_4.17.21_.min.mjs.js';     // 这两个包引入之后，直接全局能用，不用做任何处理。


// 基本信息 变量
const APP_NAME = "Sp22-Anno-Manager";
const APP_VERSION = "22-0323-00";

// 开发环境 和 生产环境 的 控制变量
const DEVELOPING = 1;
const API_BASE_DEV_LOCAL = "http://127.0.0.1:5000";
const API_BASE_DEV = "http://192.168.124.28:8888";  //"http://10.1.25.237:8888";
const API_BASE_PROD = "https://sp22.nlpsun.cn";
const API_BASE = DEVELOPING ? API_BASE_DEV_LOCAL : API_BASE_PROD;


const RootComponent = {
  setup() {

    const win = reactive(window);
    const lo = _;

    const MODAL_THEMES = {
      'default': null,
      'upload-entries': 'upload-entries',
      'user-set-quitted': 'user-set-quitted',
      'user-unset-quitted': 'user-unset-quitted',
    };

    // 初始化 提示框 模块
    const modalData = reactive({
      show: false,
      theme: 'default',
      kwargs: {},
    });
    const modalBox = new ModalBox(modalData);
    const modalBox_show = () => modalBox.show();
    const modalBox_hide = () => modalBox.hide();
    const modalBox_toggle = () => modalBox.toggle();
    const modalBox_open = (theme, kwargs) => {
      modalData.theme = theme;
      modalData.kwargs = kwargs;
      modalBox_show();
    };

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
    onMounted(() => {
      let theClipboard = new ClipboardJS(".btn-copy-token");
      theClipboard.on('success', function (e) {
        // console.info('Action:', [e.action, e.text, e.trigger]);
        alertBox_pushAlert(`已拷贝`, "success");
        e.clearSelection();
      });
      theClipboard.on('error', function (e) {
        // console.info('Action:', [e.action, e.trigger]);
        alertBox_pushAlert(`拷贝失败！`, "danger");
      });
    });

    const topic2using = (topic) => {
      const map = {
        'check': '清洗',
        't0': '清洗',
        't1': '第1期',
        't2': '第2期',
        't3': '第3期',
        'detail': '精标',
        '清洗': '清洗',
        '第1期': '第1期',
        '第2期': '第2期',
        '第3期': '第3期',
        '精标': '精标',
      };
      if (!(topic in map)) {
        return null;
      }
      return map[topic];
    };

    const TABS = {
      "userInfo": "userInfo",
      "userProgress": "userProgress",
      "overview": "overview",
      "entryAndTask": "entryAndTask",
    };

    const ctrl = reactive({
      currentUser: {
        name: "",
        token: "",
      },
      haveStore: false,
      tab: TABS['overview'],
      lastTime: "never",
    });

    const theBackEnd = new BackEnd(ctrl.currentUser.token, `${API_BASE}/api/`, alertBox_pushAlert);

    watch(() => ctrl?.currentUser?.token, () => {
      theBackEnd.token = ctrl?.currentUser?.token;
    });

    const theDB = reactive({
      users: [],
      entries: [],
      tasks: [],
      annos: [],
      userDict: {},
      entryDict: {},
      taskDict: {},
      annoDict: {},
    });

    const saveBasic = () => {
      store.set(`${APP_NAME}:version`, APP_VERSION);
      store.set(`${APP_NAME}:currentUser`, ctrl.currentUser);
      store.set(`${APP_NAME}:tab`, ctrl.tab);
      store.set(`${APP_NAME}:lastTime`, ctrl.lastTime);
    };

    const goTab = (tb) => {
      ctrl.tab = TABS[tb]??TABS['overview'];
      saveBasic();
    };

    const saveDB = () => {
      store.set(`${APP_NAME}:DB`, theDB);
    };

    onMounted(() => {
      let storedVersion = store.get(`${APP_NAME}:version`);
      if (storedVersion == APP_VERSION) {
        ctrl.haveStore = true;  // 没什么用
      };
      let storedUser = store.get(`${APP_NAME}:currentUser`);
      if (storedUser != null) {
        ctrl.currentUser = storedUser;
      };
      let storedTime = store.get(`${APP_NAME}:lastTime`);
      if (storedTime != null) {
        ctrl.lastTime = storedTime;
      };
      let storedDB = store.get(`${APP_NAME}:DB`);
      if (storedDB != null) {
        Object.assign(theDB, storedDB);
      };
      goTab(store.get(`${APP_NAME}:tab`));
    });

    const begin = () => {
      saveBasic();
    };

    // const User = class User {
    //   constructor(core, db) {
    //     this.core = core;
    //     this.db = db;
    //   }
    // }

    const userCurrTasks = user => user.allTasks.filter(task => topic2using(task.topic)==topic2using(user.currTask));
    const userCurrDoneTasks = user => user.doneTasks.filter(task => topic2using(task.topic)==topic2using(user.currTask));
    const userProgress = user => {
      let cDoneLen = userCurrDoneTasks(user).length;
      let cDueLen = userCurrTasks(user).length;
      let bg = Math.max(cDoneLen, cDueLen);
      let mn = Math.min(cDoneLen, cDueLen);
      let pct = `${mn/bg*100}%`;
      let done = cDoneLen >= cDueLen;
      return {
        done,
        pct,
        bg,
        mn
      };
    };

    const extendDB = () => {
        for (let task of theDB.tasks) {
          task.submitters = theDB.annos.filter(anno => anno.task==task.id).map(anno => anno.user);
          task.enough = task.to?.length??0 <= task.submitters?.length??0;
        };

        for (let user of theDB.users) {
          user.allTasks = theDB.tasks.filter(task => task.to.includes(user.id));
          user.allAnnos = theDB.annos.filter(anno => anno.user==user.id);
          user.doneTasks = theDB.tasks.filter(task => task.submitters.includes(user.id));
        };
    };

    const sync = async () => {
      let aidx = alertBox_pushAlert('正在同步，请稍等……', 'info', 9999999);
      let time = new Date();
      try {
        let usersResp = await app.theBackEnd.getUsersAll();
        if (errorHappened(usersResp?.data?.err)) {
          throw new Error(usersResp?.data?.err, {cause: usersResp?.data?.err});
          return;
        };
        let tasksResp = await app.theBackEnd.getTasksAll();
        if (errorHappened(tasksResp?.data?.err)) {
          throw new Error(tasksResp?.data?.err, {cause: tasksResp?.data?.err});
          return;
        };
        let annosResp = await app.theBackEnd.getAnnosAll();
        if (errorHappened(annosResp?.data?.err)) {
          throw new Error(annosResp?.data?.err, {cause: annosResp?.data?.err});
          return;
        };

        theDB.users = usersResp?.data?.data;
        theDB.tasks = tasksResp?.data?.data;
        theDB.annos = annosResp?.data?.data;

        extendDB();

        saveDB();

        alertBox_removeAlert(aidx);
        ctrl.lastTime = time.toLocaleString();

        saveBasic();

        alertBox_pushAlert(`数据库已更新至最新状态(${ctrl.lastTime})`, 'success', 5000);

        return theDB;

      } catch (error) {
        if (aidx!=undefined)
        alertBox_removeAlert(aidx);
        alertBox_pushAlert(`【发生错误】${error}`, 'danger', null, error);
        return;
      };
      alertBox_removeAlert(aidx);
    };

    const setAsQuitted = async (user) => {
      if (user.quitted) {
        alertBox_pushAlert(`${user.name} 本来就被记为“已退出”了`, 'warning', 5000);
        return;
      };
      let newUser = foolCopy(user);
      newUser.quitted = true;
      try {
        let resp = await theBackEnd.updateUser(newUser);
        if (!resp.data.succeed) {
          alertBox_pushAlert(`${user.name} 更新失败【${resp.data.err}】`, 'danger', 5000, resp);
          return;
        };
        Object.assign(user, resp.data.data);
        saveDB();
        alertBox_pushAlert(`${user.name} 更新成功`, 'success');
        modalBox_hide();
      } catch(error) {
        alertBox_pushAlert(`${user.name} 更新时出错【${error}】`, 'danger', 5000, error);
      }
    };

    const setNotQuitted = async (user) => {
      if (!user.quitted) {
        alertBox_pushAlert(`${user.name} 没有被记为“已退出”`, 'warning', 5000);
        return;
      };
      let newUser = foolCopy(user);
      newUser.quitted = null;
      try {
        let resp = await theBackEnd.updateUser(newUser);
        if (!resp.data.succeed) {
          alertBox_pushAlert(`${user.name} 更新失败【${resp.data.err}】`, 'danger', 5000, resp);
          return;
        };
        Object.assign(user, resp.data.data);
        saveDB();
        alertBox_pushAlert(`${user.name} 更新成功`, 'success');
        modalBox_hide();
      } catch(error) {
        alertBox_pushAlert(`${user.name} 更新时出错【${error}】`, 'danger', 5000, error);
      }
    };

    const FileControl = class FileControl {
      constructor(pack) {
        this.appName = pack.appName;
        this.appVersion = pack.appVersion;
        this.projDesc = pack.projDesc;
        this.projPrefix = pack.projPrefix;

        this.data = pack.reactive_data;

        this.reader = pack.reader;
        this.storeTool = pack.storeTool;
      }
    };





    return {
      win,
      lo,
      store,
      //
      timeString,
      dateString,
      uuid,
      errorHappened,
      //
      topic2using,
      userCurrTasks,
      userCurrDoneTasks,
      userProgress,
      //
      TABS,
      MODAL_THEMES,
      //
      modalBox_open,
      //
      theBackEnd,
      modalBox,
      alertBox,
      ctrl,
      theDB,
      //
      goTab,
      begin,
      sync,
      //
      saveBasic,
      saveDB,
      //
      setAsQuitted,
      setNotQuitted,
      //
    };
  },
};

const the_app = Vue_createApp(RootComponent);
const app = the_app.mount('#bodywrap');
window.app = app;
// the_app.config.globalProperties.$axios = axios;  // 用 app.theBackEnd 就可以调试了。

export default app;
