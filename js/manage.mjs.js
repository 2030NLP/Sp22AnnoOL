
// 基本信息 变量
const APP_NAME = "Sp22-Anno-Manager";
const APP_VERSION = "22-0408-05";

// 开发环境 和 生产环境 的 控制变量
const DEVELOPING = location?.hostname=="2030nlp.github.io" ? 0 : 1;
if (DEVELOPING) {
  console.log("DEVELOPING");
} else {
  console.log("PRODUCTION");
};
const API_BASE_DEV_LOCAL = "http://127.0.0.1:5000";
const DEV_HOSTS = ["http://192.168.124.3:8888", "http://192.168.1.100:8888"];
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
  h,
} from './modules_lib/vue_3.2.31_.esm-browser.prod.min.js';

import { timeString, dateString, foolCopy, uuid, errorHappened } from './util.mjs.js';
import BaseSaver from './modules/BaseSaver.mjs.js';
import TheReader from './modules/TheReader.mjs.js';
import AlertBox from './modules/AlertBox.mjs.js';
import ModalBox from './modules/ModalBox.mjs.js';
import BackEnd from './modules/BackEnd.mjs.js';
import FileControl from './modules/FileControl.mjs.js';
// import BackEndUsage from './modules/BackEndUsage.mjs.js';
// import IoControl from './modules/IoControl.mjs.js';

import axios from './modules_lib/axios_0.26.1_.mjs.js';
import ClipboardJS from './modules_lib/clipboard_2.0.10_.mjs.js';
// import __Wrap_of_store__ from './modules_lib/store_2.0.9_.legacy.min.mjs.js';  //
import __Wrap_of_froage__ from './modules_lib/localforage_1.10.0_.min.mjs.js';  //
import __Wrap_of_lodash__ from './modules_lib/lodash_4.17.21_.min.mjs.js';     // 这两个包引入之后，直接全局能用，不用做任何处理。

import assign_tasks from './assign_tasks_new.mjs.js';


const RootComponent = {
  setup() {

    const win = reactive(window);
    const lo = _;

    const MODAL_THEMES = {
      'default': null,
      'confirm': 'confirm',
      'upload-entries': 'upload-entries',
      'user-set-quitted': 'user-set-quitted',
      'user-unset-quitted': 'user-unset-quitted',
      'user-progress': 'user-progress',
      'user-edit': 'user-edit',
      'user-detail': 'user-detail',
      'entry-detail': 'entry-detail',
      'task-detail': 'task-detail',
      'anno-detail': 'anno-detail',
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

    // 初始化 文件保存 模块
    const theSaver = new BaseSaver();


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

    // 处理 topic 历史遗留混乱 用于 User user.currTask
    const topic_to_tag = (topic) => {
      if (ll0.includes(topic)) {
        return 't0';
      };
      if (ll1.includes(topic)) {
        return 't1';
      };
      if (ll2.includes(topic)) {
        return 't2';
      };
      if (ll3.includes(topic)) {
        return 't3';
      };
      if (ll4.includes(topic)) {
        return 't4';
      };
      return topic;
    }

    // 处理 topic 历史遗留混乱 用于 find()
    const topic_tags = (topic) => {
      if (ll0.includes(topic)) {
        return ll0;
      };
      if (ll1.includes(topic)) {
        return ll1;
      };
      if (ll2.includes(topic)) {
        return ll2;
      };
      if (ll3.includes(topic)) {
        return ll3;
      };
      if (ll4.includes(topic)) {
        return ll4;
      };
      return [topic];
    }




    const TABS = {
      "userInfo": "userInfo",
      "userProgress": "userProgress",
      "overview": "overview",
      "entryAndTask": "entryAndTask",
      "taskAssign": "taskAssign",
    };

    const ctrl = reactive({
      currentUser: {
        name: "",
        token: "",
      },
      showOnlyMyMembers: false,
      haveStore: false,
      haveCache: false,
      started: false,

      tab: TABS['overview'],
      lastTime: "never",
      lastTimeDict: {},
      entryIdBoxText: "",
      taskIdBoxText: "",
      annoIdBoxText: "",
      userIdBoxText: "",
      entryIdBoxList: [],
      taskIdBoxList: [],
      annoIdBoxList: [],
      userIdBoxList: [],
    });

    const theDB = reactive({
      users: [],
      entries: [],
      tasks: [],
      annos: [],
      //
      userDict: {},
      entryDict: {},
      taskDict: {},
      annoDict: {},
      //
      topics: [],
      topicTaskDict: {},
      //
      labels: [],
      labelAnnoDict: {},
      //
      inf_user_all_tasks: {},
      inf_user_all_annos: {},
      inf_entry_all_tasks: {},
      inf_entry_all_tasks: {},
      //
      inf_user_task_anno: {},
      //
    });

    const theBackEnd = new BackEnd(ctrl.currentUser.token, `${API_BASE}/api/`, alertBox_pushAlert);

    watch(() => ctrl?.currentUser?.token, () => {
      theBackEnd.token = ctrl?.currentUser?.token;
    });

    const workerState = reactive({
      working: false,
      works: [],
      alert_idx: null,
    });

    const theWorker = new Worker("js/workers/manageWorker.worker.js");

    const pushWork = async (work) => {
      workerState.works.push(work);
      await theWorker.checkNext();
    };

    theWorker.checkNext = async () => {
      if (!workerState.working) {
        let nextWork = workerState.works.shift();
        if (nextWork) {
          workerState.working=true;
          if (workerState.alert_idx!=null){
            alertBox_removeAlert(workerState.alert_idx);
          };
          let aidx = alertBox_pushAlert('辅助线程 工作中……', 'info', 9999999);
          workerState.alert_idx = aidx;
          await theWorker.postMessage(foolCopy(nextWork));
        } else {
          alertBox_removeAlert(workerState.alert_idx);
          alertBox_pushAlert(`辅助线程 队列已完成`, "success");
        };
      } else {
        if (workerState.alert_idx!=null){
          alertBox_removeAlert(workerState.alert_idx);
          let aidx = alertBox_pushAlert('辅助线程 工作中……', 'info', 9999999);
          workerState.alert_idx = aidx;
        };
      };
    };

    watch(()=>workerState.working, async()=>{
      if(!workerState.working){await theWorker.checkNext();};
    });

    theWorker.onmessage = async (message) => {
      // console.log(message);
      const pack = message.data;
      const actions = {
        'working': ()=>{
          workerState.working=true;
        },
        // 'done': ()=>{
        //   workerState.working=false;
        //   await theWorker.checkNext();
        // },
        'updateDB': async()=>{
          workerState.working=true;
          console.log("main got:", foolCopy(pack.data));
          await Object.assign(theDB, pack.data);

          await theDB.entries.forEach(entry=>{theDB.entryDict[entry.id] = entry;});
          await theDB.tasks.forEach(task=>{theDB.taskDict[task.id] = task;});
          await theDB.annos.forEach(anno=>{theDB.annoDict[anno.id] = anno;});
          await theDB.users.forEach(user=>{theDB.userDict[user.id] = user;});

          await setMe();

          workerState.working=false;
          // await theWorker.checkNext();
        },
        'alert': ()=>{alertBox_pushAlert(...pack.data)},
      };
      if (pack.command in actions) {
        await actions[pack.command]();
      } else {
        alertBox_pushAlert(`辅助线程 传来未知消息【${pack}】`, "warning", null, pack);
      };
    };
    theWorker.onerror = async (error) => {
      alertBox_pushAlert(`辅助线程 发生错误【${error}】`, "danger", null, error);
    };
    theWorker.onmessageerror = async (messageerror) => {
      alertBox_pushAlert(`辅助线程 发生消息错误【${messageerror}】`, "danger", null, messageerror);
    };

    onMounted(async()=>{
      // console.time('theWorker.postMessage');
      theWorker.postMessage({
        'command': "alert",
        'data': ["辅助线程 连接成功", "success", 1000],
      });
      // console.timeEnd('theWorker.postMessage');
    });




    const extendTasks = async () => {
      // require tasks, annos
      pushWork({
        'command': "extendTasks",
        'data': (theDB),
      });
    };

    const extendAnnos = async () => {
      // require annos, tasks
      pushWork({
        'command': "extendAnnos",
        'data': (theDB),
      });
    };

    const extendUsers = async () => {
      // require users, tasks, annos
      // require extendTasks
      pushWork({
        'command': "extendUsers",
        'data': (theDB),
      });
    };

    const extendEntries = async () => {
      // require entries, tasks, annos
      pushWork({
        'command': "extendEntries",
        'data': (theDB),
      });
    };












    const tasks_sta = (tasks=[]) => {
      let not_deleted = tasks.filter(task => !task.deleted);
      let assigned = not_deleted.filter(task => task.to?.length);
      let submitted = assigned.filter(task => task.submitters?.length>0);
      let working = submitted.filter(task => task.submitters?.length<task.to?.length);
      let done = submitted.filter(task => task.submitters?.length>=task.to?.length);
      return {
        total_num: tasks.length,
        deleted_num: tasks.length - not_deleted.length,
        assigned_num: assigned.length,
        working_num: working.length,
        done_num: done.length,
      }
    };

    const tasks_computed = computed(() => ({
      total: tasks_sta(theDB.tasks),
      by_topic: Object.entries(theDB.topicTaskDict).map(pr => [pr[0], tasks_sta(pr[1])]),
    }));





    const search = () => {
      let entryIdBoxList = ctrl.entryIdBoxText.match(/\d+/g) ?? [];
      ctrl.entryIdBoxList = entryIdBoxList.filter(it=>it in theDB.entryDict);
      let taskIdBoxList = ctrl.taskIdBoxText.match(/\d+/g) ?? [];
      ctrl.taskIdBoxList = taskIdBoxList.filter(it=>it in theDB.taskDict);
      let annoIdBoxList = ctrl.annoIdBoxText.match(/\d+/g) ?? [];
      ctrl.annoIdBoxList = annoIdBoxList.filter(it=>it in theDB.annoDict);
      let userIdBoxList = ctrl.userIdBoxText.match(/\d+/g) ?? [];
      ctrl.userIdBoxList = userIdBoxList.filter(it=>it in theDB.userDict);
    };






    const setMe = async () => {
      if (theDB.users.length) {
        let me = theDB.users.find(it=>it.token==ctrl.currentUser.token);
        if (me) {
          ctrl.currentUser = me;
          await localforage.setItem(`${APP_NAME}:currentUser`, foolCopy(ctrl.currentUser));
        };
      };
    };



    const saveBasic = async () => {
      await localforage.setItem(`${APP_NAME}:version`, APP_VERSION);
      await localforage.setItem(`${APP_NAME}:currentUser`, foolCopy(ctrl.currentUser));
      await localforage.setItem(`${APP_NAME}:tab`, foolCopy(ctrl.tab));
      await localforage.setItem(`${APP_NAME}:lastTime`, foolCopy(ctrl.lastTime));
      await localforage.setItem(`${APP_NAME}:lastTimeDict`, foolCopy(ctrl.lastTimeDict));
      await localforage.setItem(`${APP_NAME}:assignData_settings`, foolCopy(assignData.settings));
    };
    const loadBasic = async () => {
      let storedVersion = await localforage.getItem(`${APP_NAME}:version`);
      if (storedVersion == APP_VERSION) {
        ctrl.haveStore = true;  // 没什么用
      };
      let storedUser = await localforage.getItem(`${APP_NAME}:currentUser`);
      if (storedUser != null) {
        ctrl.currentUser = storedUser;
        await setMe();
      };
      let storedTime = await localforage.getItem(`${APP_NAME}:lastTime`);
      if (storedTime != null) {
        ctrl.lastTime = storedTime;
      };
      let storedTimeDict = await localforage.getItem(`${APP_NAME}:lastTimeDict`);
      if (storedTimeDict != null) {
        ctrl.lastTimeDict = storedTimeDict;
      };
      let stored_assignData_settings = await localforage.getItem(`${APP_NAME}:assignData_settings`);
      if (stored_assignData_settings != null) {
        assignData.settings = stored_assignData_settings;
      };
      await goTab(await localforage.getItem(`${APP_NAME}:tab`));
    };
    const saveDB = async () => {
      await localforage.setItem(`${APP_NAME}:DB`, {
        users: foolCopy(theDB.users),
        tasks: foolCopy(theDB.tasks),
        annos: foolCopy(theDB.annos),
        entries: foolCopy(theDB.entries),
      });
      alertBox_pushAlert('数据已缓存', 'info');
    };
    const exportDB = async () => {
      if (!theDB.tasks.length) {
        alertBox_pushAlert('请注意： Task 表为空！导出数据可能不完整！', 'warning', 30000);
      };
      if (!theDB.annos.length) {
        alertBox_pushAlert('请注意： Anno 表为空！导出数据可能不完整！', 'warning', 30000);
      };
      if (!theDB.users.length) {
        alertBox_pushAlert('请注意： User 表为空！导出数据可能不完整！', 'warning', 30000);
      };
      if (!theDB.entries.length) {
        alertBox_pushAlert('请注意： Entry 表为空！导出数据可能不完整！', 'warning', 30000);
      };
      if (!theDB.entries?.[0]?.content?.material?.tokenList?.length) {
        alertBox_pushAlert('请注意： Entry 表中缺少语料文本！导出数据可能不完整！', 'warning', 30000);
      };
      await theSaver.save({
        users: foolCopy(theDB.users),
        tasks: foolCopy(theDB.tasks),
        annos: foolCopy(theDB.annos),
        entries: foolCopy(theDB.entries),
      }, 'db.json');
    };

    const loadCacheDB = async () => {
      let aidx = alertBox_pushAlert('正在读取，请稍等……', 'warning', 9999999);
      console.time('getItem');
      let storedDB = await localforage.getItem(`${APP_NAME}:DB`);
      console.timeEnd('getItem');
      alertBox_removeAlert(aidx);
      if (storedDB != null) {
        console.time('assign');
        await Object.assign(theDB, storedDB);
        console.timeEnd('assign');
        // aidx = alertBox_pushAlert('正在组织数据，请稍等……', 'warning', 9999999);
        // console.time('extendDB');
        await extendDB();
        // console.timeEnd('extendDB');
        // alertBox_removeAlert(aidx);
        return;
      };
      alertBox_pushAlert('没有找到缓存', 'danger');
      alertBox_removeAlert(aidx);
    };

    onMounted(async () => {
      let storedVersion = await localforage.getItem(`${APP_NAME}:version`);
      if (storedVersion == APP_VERSION) {
        alertBox_pushAlert(`ver. ${APP_VERSION}`, "info", 2000);
      } else {
        alertBox_pushAlert(`版本已更新到 ${APP_VERSION}`, "success", 2000);
        await localforage.setItem(`${APP_NAME}:version`, APP_VERSION);
      };
      await loadBasic();
      //
      // let storedDB = await localforage.getItem(`${APP_NAME}:DB`);
      // if (storedDB != null) {
      //   ctrl.haveCache = true;
      // };
    });

    const goTab = async (tb) => {
      ctrl.tab = TABS[tb]??TABS['overview'];
      await saveBasic();
    };

    const begin = async () => {
      await saveBasic();
    };

    // const User = class User {
    //   constructor(core, db) {
    //     this.core = core;
    //     this.db = db;
    //   }
    // }

    const userCurrTasks = user => {
      let tt = user.allTasks ?? [];
      return tt.filter(task => topic_regulation(theDB.taskDict[task]?.topic)==topic_regulation(user.currTask));
    };
    const userCurrDoneTasks = user => {
      let tt = user.doneTasks ?? [];
      return tt.filter(task => topic_regulation(theDB.taskDict[task]?.topic)==topic_regulation(user.currTask));
    };
    const userProgress = user => {
      let cDoneLen = userCurrDoneTasks(user).length;
      let cDueLen = userCurrTasks(user).length;
      let bg = Math.max(cDoneLen, cDueLen);
      let mn = Math.min(cDoneLen, cDueLen);
      let pct = bg==0 ? `0` : `${mn/bg*100}%`;
      let ratio = cDoneLen/cDueLen;
      ratio = isNaN(ratio) ? 0 : ratio;
      let done = cDoneLen >= cDueLen;
      return {
        cDoneLen,
        cDueLen,
        done,
        pct,
        bg,
        mn,
        ratio
      };
    };




    const extendDB = async () => {
      await extendTasks();
      await extendAnnos();
      await extendUsers();
      await extendEntries();
    };

    const syncTable = async (extend=true, tableName, tableListName, fnName) => {
      let aidx = await alertBox_pushAlert('正在同步，请稍等……', 'info', 9999999);
      let time = new Date();
      try {
        await alertBox_removeAlert(aidx);
        aidx = await alertBox_pushAlert(`正在同步${tableName}，请稍等……`, 'info', 9999999);
        let resp = await app.theBackEnd[fnName]();
        if (errorHappened(resp?.data?.err)) {
          throw new Error(resp?.data?.err, {cause: resp?.data?.err});
          return;
        };

        await alertBox_removeAlert(aidx);
        aidx = await alertBox_pushAlert(`已取回${tableName}数据，正在处理，请稍等……`, 'info', 3000);

        theDB[tableListName] = await resp?.data?.data;
        if (extend) {
          // const fnMap = {
          //   'users': (()=>{extendTasks();extendUsers();}),
          //   'entries': extendEntries,
          //   'tasks': extendDB,
          //   'annos': extendDB,
          // };
          // await (fnMap[tableListName]??extendDB)();
          await extendDB();
        }

        await saveDB();

        // await alertBox_removeAlert(aidx);
        ctrl.lastTimeDict[tableListName] = await time.toLocaleString();

        await saveBasic();

        // await alertBox_pushAlert(`${tableName}已更新至最新状态(${ctrl.lastTimeDict[tableListName]})`, 'success', 5000);

        return true;  //theDB[tableListName];

      } catch (error) {
        // if (aidx!=undefined)
        alertBox_removeAlert(aidx);
        alertBox_pushAlert(`【发生错误】${error}`, 'danger', null, error);
        return false;
      };
      await alertBox_removeAlert(aidx);
    };


    const syncUser = async (extend=true) => {
      let result = await syncTable(extend, ' User 表', 'users', 'getUsersAll');
      return result;
    };
    const syncTask = async (extend=true) => {
      let result = await syncTable(extend, ' Task 表', 'tasks', 'getTasksAll');
      return result;
    };
    const syncAnno = async (extend=true) => {
      let result = await syncTable(extend, ' Anno 表', 'annos', 'getAnnosAll');
      return result;
    };
    const syncEntryInfo = async (extend=true) => {
      let result = await syncTable(extend, ' Entry 简表', 'entries', 'getEntryInfoAll');
      return result;
    };







    const sync = async () => {
      let aidx = alertBox_pushAlert('正在获取数据，请稍等……', 'info', 9999999);
      let time = new Date();
      try {

        await syncEntryInfo(false);  // 非常重要，必须放在 Task 表 更新之前！因为它（的后端逻辑）会改变 Task 表！（测谎题相关字段）
        await syncAnno(false);
        await syncTask(false);
        await syncUser(false);

        await extendDB();

        await saveDB();

        alertBox_removeAlert(aidx);
        ctrl.lastTime = time.toLocaleString();

        await saveBasic();

        // alertBox_pushAlert(`数据库已刷新至最新状态(${ctrl.lastTime})`, 'success');

        return theDB;

      } catch (error) {
        // if (aidx!=undefined)
        alertBox_removeAlert(aidx);
        alertBox_pushAlert(`【发生错误】${error}`, 'danger', null, error);
        return;
      };
      alertBox_removeAlert(aidx);
    };



    const editUser = async (user, jsonText) => {};

    const editingUser = async (user, jsonText) => {
      let newObj = {};
      try {
        newObj = JSON.parse(jsonText);
      } catch(error) {
        alertBox_pushAlert(`JSON解析失败，请检查`, 'warning', 60000, jsonText);
        return;
      };
      for (let kk of ['id', 'name', 'token']) {
        if (!(kk in newObj)) {
          alertBox_pushAlert(`缺少必要字段「${kk}」`, 'warning', 60000, jsonText);
          return;
        };
      };
      if (newObj.id!=user.id) {
        alertBox_pushAlert(`id发生改变，操作中止（${user.id} → ${newObj.id}）`, 'warning', 60000, jsonText);
        return;
      };
      for (let [kk, vv] of [['currTask', ''], ['currTaskGroup', ''], ['manager', ''], ['managerName', '']]) {
        if (!(kk in newObj)) {
          newObj[kk] = user[kk] ?? vv;
        };
      };



      if (user.quitted) {
        alertBox_pushAlert(`${user.name} 本来就被记为“已退出”了`, 'warning', 5000);
        return;
      };
      let newUser = foolCopy({
        id: user.id,
        token: user.token,
      });
      newUser.quitted = true;
      try {
        let resp = await theBackEnd.updateUser(newUser);
        if (resp.data?.code!=200) {
          alertBox_pushAlert(`${user.name} 更新失败【${resp.data.msg}】`, 'danger', 5000, resp);
          return;
        };
        Object.assign(user, resp.data.data);
        await saveDB();
        alertBox_pushAlert(`${user.name} 更新成功`, 'success');
        modalBox_hide();
      } catch(error) {
        alertBox_pushAlert(`${user.name} 更新时出错【${error}】`, 'danger', 5000, error);
      }



    };









    const setAsQuitted = async (user) => {
      if (user.quitted) {
        alertBox_pushAlert(`${user.name} 本来就被记为“已退出”了`, 'warning', 5000);
        return;
      };
      let newUser = foolCopy({
        id: user.id,
        token: user.token,
      });
      newUser.quitted = true;
      try {
        let resp = await theBackEnd.updateUser(newUser);
        if (resp.data?.code!=200) {
          alertBox_pushAlert(`${user.name} 更新失败【${resp.data.msg}】`, 'danger', 5000, resp);
          return;
        };
        Object.assign(user, resp.data.data);
        await saveDB();
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
      let newUser = foolCopy({
        id: user.id,
        token: user.token,
      });
      newUser.quitted = null;
      try {
        let resp = await theBackEnd.updateUser(newUser);
        if (resp.data?.code!=200) {
          alertBox_pushAlert(`${user.name} 更新失败【${resp.data.msg}】`, 'danger', 5000, resp);
          return;
        };
        Object.assign(user, resp.data.data);
        await saveDB();
        alertBox_pushAlert(`${user.name} 更新成功`, 'success');
        modalBox_hide();
      } catch(error) {
        alertBox_pushAlert(`${user.name} 更新时出错【${error}】`, 'danger', 5000, error);
      }
    };


















    const assignTopics = [
      {value: "清洗", desc: "清洗"},
      {value: "第1期", desc: "第1期"},
      {value: "第2期", desc: "第2期"},
      {value: "归因", desc: "归因"},
      {value: "精标", desc: "精标"},
    ];

    const assignData = reactive({
      settings: {
        'topic': null,
        'batchName': null,
        'user_tag': null,
        'task_tag': null,
        'users_per_task': 2,
        'tasks_per_user': 20,
        'exclusion': [],
        // 'polygraphs_per_user': {},
        'polygraphs_per_user_json_string': "",
        'retrieve': false,
      },
      'polygraphs_per_user_json_string_error': false,
      //
      assignUserBoxDict: {},
      //
      batch: 0,
      plans: [],
      planPerUser: [],
      analysis: [],
      analysisDict: {},
      undone: true,
      result: {},
    });
    watch(() => assignData.settings, async () => {
      await saveBasic();
    }, { deep: true });

    const selectUsersAuto = () => {
      for (let user of theDB.users) {
        let jd = topic_regulation(user.currTask)==assignData.settings.topic && !user.quitted;
        assignData.assignUserBoxDict[user.id] = jd ? true : false;
      };
    };

    const selectUsersAll = () => {
      for (let user of theDB.users) {
        assignData.assignUserBoxDict[user.id] = true;
      };
    };

    const selectUsersNone = () => {
      for (let user of theDB.users) {
        assignData.assignUserBoxDict[user.id] = false;
      };
    };

    const planAssigment = async () => {
      cleanAssigment();
      assignData.undone = true;
      let aidx = await alertBox_pushAlert(`正在规划任务，请稍等……`, 'info', 99999999);
      let pack = assignData.settings;
      try {
        if (assignData.settings.polygraphs_per_user_json_string.length) {
          let polygraphs_per_user = JSON.parse(assignData.settings.polygraphs_per_user_json_string);
          pack.polygraphs_per_user = polygraphs_per_user;
        } else {
          pack.polygraphs_per_user = {};
        }
      } catch(error) {
        alertBox_removeAlert(aidx);
        alertBox_pushAlert(`无法解析测谎题配置，请检查`, 'warning', 5000, assignData.settings);
        return;
      };
      // pack.polygraphs_per_user = {
      //   'otherErrorString': 2,
      //   'otherErrorSeg': 3,
      // };
      const plansResp = await makeAssigmentPlan(pack);
      // const plansResp = await app.theBackEnd.makeAssigmentPlan(pack);
      if (plansResp?.data?.code!=200) {
        alertBox_removeAlert(aidx);
        alertBox_pushAlert(`规划任务时出现问题：${plansResp?.data?.msg}`, 'danger', 5000, plansResp);
        return;
      };

      const plans = plansResp?.data?.data;
      assignData.batch = plans[0]?.batch ?? 0;
      console.log(plans);
      let dct = {}
      for (let task of plans) {
        for (let user_id of task.to) {
          if (!(user_id in dct)) {
            dct[user_id] = [];
          };
          if (task.submitters==null) {
            task.submitters = [];
          };
          if (!task.submitters.includes(user_id)) {
            dct[user_id].push(task.id);
          };
        };
      };
      console.log(dct);
      //
      assignData.plans = plans;
      assignData.planPerUser = Object.entries(dct).filter(pair => pair[1].length);

      let bidx = alertBox_pushAlert(`计算完毕，准备规划结果……`, 'success', 9999999, plansResp);
      await analyzeAssignmentPlan();
      alertBox_removeAlert(bidx);

      alertBox_removeAlert(aidx);
      if (plans.length) {
        alertBox_pushAlert(`规划成功，请进行后续操作`, 'success', 3000, plansResp);
      } else {
        alertBox_pushAlert(`无法规划，请检查设置`, 'warning', 3000, plansResp);
      };
    };

    const analyzeAssignmentPlan = async () => {
      const analysis = [];
      for (let planTask of assignData.plans) {
        if (planTask.id in theDB.taskDict) {
          let item = {
            id: planTask.id,
            old_to: theDB.taskDict[planTask.id].to,
            old_submitters: theDB.taskDict.submitters,
            new_to: planTask.to,
            plan: planTask,
          };
          item.new_guys = lo.difference(item.new_to, item.old_to);
          item.solid_guys = lo.intersection(item.new_to, item.old_to);
          item.canceled_guys = lo.difference(item.old_to, item.new_to);
          item.type = item.canceled_guys.length ? "modify" : "assign";
          analysis.push(item);
        } else {
          let item = {
            id: planTask.id,
            old_to: [],
            old_submitters: [],
            new_to: planTask.to,
            plan: planTask,
            new_guys: planTask.to,
            solid_guys: [],
            canceled_guys: [],
          };
          item.type = "insert";
          analysis.push(item);
        };
      };
      assignData.analysis = lo.sortBy(lo.sortBy(analysis, it => it.canceled_guys.length), it => -it.new_guys.length);
      assignData.analysisDict = lo.keyBy(assignData.analysis, 'id');
    };

    const cleanAssigment = () => {
      assignData.batch = 0;
      assignData.plans = [];
      assignData.planPerUser = {};
      assignData.analysis = [];
      assignData.analysisDict = {};
      assignData.undone = true;
      assignData.result = {};
    };
    const cancelAssigment = () => {
      cleanAssigment();
      alertBox_pushAlert(`规划已撤除`, 'warning', 3000);
    };

    const doAssigment = async () => {
      let aidx = alertBox_pushAlert(`正在执行分配，请稍等……`, 'info', 99999999);
      const actResp = await app.theBackEnd.actAssigmentPlan(assignData.plans);
      if (actResp?.data?.code!=200) {
        alertBox_removeAlert(aidx);
        alertBox_pushAlert(`执行分配时出现问题：${actResp?.data?.msg}`, 'danger', 5000, actResp);
        return;
      };

      alertBox_removeAlert(aidx);
      if (true) {
        assignData.undone = false;
        assignData.result = actResp?.data?.data;
        // cleanAssigment();
        alertBox_pushAlert(`执行成功`, 'success', 5000, actResp);
      } else {
        alertBox_pushAlert(`执行失败`, 'danger', 5000, actResp);
      };
    };



    const makeAssigmentPlan = async (wrap) => {
      console.log([1, dateString()]);
      // let polygraphs_per_user = {
      //   'otherErrorString': 2,
      //   'otherErrorSeg': 3,
      // };
      let tables_to_update = await assignment(
        wrap?.['topic'],
        wrap?.['batchName'],
        wrap?.['user_tag'],
        wrap?.['task_tag'],
        wrap?.['users_per_task'],
        wrap?.['tasks_per_user'],
        wrap?.['exclusion'],
        wrap?.['polygraphs_per_user'],  // 选项配置
        wrap?.['retrieve'],
      );
      console.log([5, dateString()]);
      console.log(tables_to_update);
      return {'data': {'code': 200, 'data': tables_to_update}};
    };

    const assignment = async function (
      topic=null,
      batchName=null,
      user_tag=null,
      task_tag=null,
      users_per_task=2,
      tasks_per_user=20,
      exclusion=[],
      polygraphs_per_user={},  // TODO 选项配置
      retrieve=false,
      tasks_idx_base=_.max(theDB.tasks.map(it=>+it.id)),
      lo,
    ) {
      console.log(arguments);

      console.log([2, dateString()]);
      if (topic == null) {
        return [];
      };

      // let users = theDB.users.filter(it => (
      //   topic_tags(topic).includes(it['currTask'])
      //   && (user_tag==null||(it['tags']?.length&&it['tags'].includes(user_tag)))
      //   && !it['quitted']
      // ));

      let users = theDB.users.filter(it => assignData.assignUserBoxDict[it.id]);

      let tasks = theDB.tasks.filter(it => (
        topic_tags(topic).includes(it['topic'])
        && it['batchName'] == batchName
        && (task_tag==null||(it['tags']?.length&&it['tags'].includes(task_tag)))
        && !it['deleted']
      ));

      let e_ids = tasks.map(task => task['entry']);
      let entries = [];
      for (let e_id of e_ids) {
        let entry_found = _.find(theDB.entries, it => (it['id']==e_id && !it['deleted']));
        if (entry_found) {
          entries.push(entry_found);
        };
      };

      let pack = {
        entries: entries,
        users: users,
        tasks: tasks,
        topic: topic_regulation(topic),
        batchName: batchName,
        exclusion: exclusion,
        users_per_task: users_per_task,
        tasks_per_user: tasks_per_user,
        polygraphs_per_user: polygraphs_per_user,
        tasks_idx_base: tasks_idx_base,
        retrieve: retrieve,
      };
      // theSaver.save(pack);

      console.log(['start', dateString()]);
      let tasks_to_update = await assign_tasks(foolCopy(pack), _);
      console.log(['end', dateString()]);
      return tasks_to_update;
    };



    const exportPlan = () => {
      theSaver.saveJson(assignData.plans, 'plans.json');
    };


    const classAssignAnalisisByUser = (user_id, task_id) => {
      let classConfig = {};
      if (theDB.entryDict[theDB.taskDict[task_id]?.entry]?.polygraph) {
        classConfig.prefix = "btn-outline-";
      } else {
        classConfig.prefix = "btn-";
      };
      if (assignData.analysisDict[task_id].new_guys.includes(user_id)) {
        classConfig.color = "success";
      } else {
        classConfig.color = "secondary";
      };
      return `${classConfig.prefix}${classConfig.color}`;
    };



















    const onImportEntryTable = async () => {
      let aidx = alertBox_pushAlert(`正在读取，请稍等……`, 'info', 99999999);
      try {
        const fc = new FileControl({
          document: win.document,
          fileGetterChain: ['forms', 'file-form', 'file-input', 'files', '0'],
          reader: theReader,
        });
        let content = (await fc.onImport()).content;
        if (content.length);
        let allEntries = JSON.parse(content);
        theDB.entries = [];

        for (let entry of allEntries) {
          // if (theDB.tasks.find(it=>it.entry==entry.id)) {
          theDB.entries.push(entry);
          // };
        };

        await extendEntries();

        // await saveDB();
      } catch(error) {
        alertBox_removeAlert(aidx);
        alertBox_pushAlert(`发生错误：${error}`, 'danger', 5000, error);
      };
      alertBox_removeAlert(aidx);
      alertBox_pushAlert(`成功`, 'success', 3000);
    };



    const wordAt = (entry, idx) => {
      if (!entry?.content?.material?.tokenList?.length) {
        return "";
      };
      let token = entry.content.material.tokenList[idx];
      return token?.to?.word ?? token?.word ?? "";
    };

    const makeAnnoOnTexts = () => {
      let aidx = alertBox_pushAlert(`开始`, 'info', 99999999);
      for (let anno of theDB.annos) {
        let entry = theDB.entryDict[anno.entry];
        if (entry) {
          for (let annot of anno?.content?.annotations??[]) {
            if (annot.on) {
              annot.onText = annot.on.map(idx => wordAt(entry, idx)).join("");
            };
          };
        };
      };
      alertBox_removeAlert(aidx);
      alertBox_pushAlert(`完成`, 'info', 3000);
    };


    const updateOneEntry = async (entry_id) => {
      let aidx = alertBox_pushAlert(`获取中……`, 'info', 99999999);
      const entryResp = await app.theBackEnd.getEntry(entry_id);
      if (entryResp?.data?.code!=200) {
        alertBox_removeAlert(aidx);
        alertBox_pushAlert(`出现问题：${entryResp?.data?.msg}`, 'danger', 5000, entryResp);
        return;
      };

      let entry;
      if (entryResp.data?.data) {
        entry = theDB.entryDict[entry_id];
        // entry.allTasks = theDB.inf_entry_all_tasks[entry.id];
        // entry.allAnnos = theDB.inf_entry_all_annos[entry.id];
        Object.assign(entry,  entryResp.data.data);

        let entry_annos = theDB.annos.filter(anno => anno.entry==entry.id);
        console.log('entry_annos:', entry_annos);
        for (let anno of entry_annos) {
          for (let annot of anno?.content?.annotations??[]) {
            if (annot.on) {
              annot.onText = annot.on.map(idx => wordAt(entry, idx)).join("");
            };
          };
        };
      } else {
        alertBox_removeAlert(aidx);
        alertBox_pushAlert(`数据异常`, 'danger', 5000, entryResp);
        return;
      };

      await saveDB();

      alertBox_removeAlert(aidx);
      alertBox_pushAlert(`执行成功`, 'success', 1000, entryResp);
    };



    const _annoTimeCompute = (anno) => {
      const logs = anno?.content?._ctrl?.timeLog ?? [];
      let box = [];
      for (let log of logs) {
        if (log[0]=="in") {
          box.push([log[1], null]);
        };
        if (log[0]=="out" && box.length) {
          if (box.at(-1)[1]==null) {
            box.at(-1)[1] = log[1];
          };
        };
      };
      let totalDur = 0;
      for (let pair of box) {
        if (pair[0].length&&pair[1].length) {
          let delta = (new Date(pair[1])) - (new Date(pair[0]));
          totalDur += delta;
        };
      };
      let firstDur = (new Date(box[0][1])) - (new Date(box[0][0]));
      let stride = (new Date(box.at(-1)[1])) - (new Date(box[0][0]));
      let lastAt = box.at(-1)[1];
      return {firstDur, totalDur, stride, lastAt, detail: box};
    };


    const saveAnnoReview = async (anno, review) => {
      let {user, task, entry, content, topic, entryVer} = anno;
      review.reviewing = undefined;
      review.reviewer = {
        id: ctrl.currentUser?.id,
        name: ctrl.currentUser?.name,
      };
      if (!anno._timeInfo.lastAt) {
        anno._timeInfo = _annoTimeCompute(anno);
      };
      review.annoAt = anno._timeInfo.lastAt;
      review.reviewedAt = dateString();
      content.review = review;
      let resp = await theBackEnd.updateAnno(user, task, entry, content, topic, entryVer);
      if (resp?.data?.code!=200) {
        alertBox_pushAlert(`【发生错误】${resp?.data?.msg}`, 'danger', null, resp);
        return false;
      } else {
        alertBox_pushAlert(`已保存，自动刷新……`, 'success');
      };
      await updateOneAnno(anno);
      return true;
    };

    const updateOneAnno = async (anno) => {
      let aidx = alertBox_pushAlert(`获取中……`, 'info', 99999999);
      console.log(anno);
      const annoResp = await app.theBackEnd.getAnno(anno.user, anno.task);
      if (annoResp?.data?.code!=200) {
        alertBox_removeAlert(aidx);
        alertBox_pushAlert(`出现问题：${annoResp?.data?.msg}`, 'danger', 5000, annoResp);
        return;
      };

      if (annoResp.data?.data) {
        let anno_in_dict = theDB.annoDict[anno.id];
        let new_anno = annoResp.data.data;
        new_anno._timeInfo = _annoTimeCompute(new_anno);
        Object.assign(anno_in_dict, new_anno);
      } else {
        alertBox_removeAlert(aidx);
        alertBox_pushAlert(`数据异常`, 'danger', 5000, annoResp);
        return;
      };

      await saveDB();

      alertBox_removeAlert(aidx);
      alertBox_pushAlert(`执行成功`, 'success', 1000, annoResp);
    };



    return {
      win,
      lo,
      // store,
      theSaver,
      theWorker,
      workerState,
      //
      timeString,
      dateString,
      uuid,
      errorHappened,
      //
      topic_regulation,
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
      tasks_computed,
      //
      assignTopics,
      assignData,
      planAssigment,
      doAssigment,
      cancelAssigment,
      cleanAssigment,
      exportPlan,
      //
      goTab,
      begin,
      sync,
      syncUser,
      syncTask,
      syncAnno,
      syncEntryInfo,
      //
      loadCacheDB,
      //
      saveBasic,
      saveDB,
      exportDB,
      //
      editUser,
      setAsQuitted,
      setNotQuitted,
      //
      classAssignAnalisisByUser,
      //
      selectUsersAuto,
      selectUsersAll,
      selectUsersNone,
      //
      onImportEntryTable,
      //
      wordAt,
      makeAnnoOnTexts,
      updateOneEntry,
      updateOneAnno,
      saveAnnoReview,
      //
      search,
      //
    };
  },
};




































const the_app = Vue_createApp(RootComponent);

the_app.component('anno-card', {
  props: ["db", "anno", "reviewer"],
  emits: ['open-modal', 'submit-review', 'update-anno', /*'update:modelValue'*/],
  setup(props, ctx) {
    const ctrl = reactive({
      reviewing: false,
      comment: props?.anno?.content?.review?.comment??"",
      accept: props?.anno?.content?.review?.accept??null,
    });
    const onOpenModal = () => {
      ctx.emit('open-modal', ['anno-detail', props.anno]);
    };
    const reviewPass = () => {
      ctrl.accept=true;
    };
    const reviewReject = () => {
      ctrl.accept=false;
    };
    const submitReview = () => {
      ctx.emit('submit-review', [props.anno, ctrl]);
      ctrl.reviewing=false;
    };
    const updateAnno = () => {
      ctx.emit('update-anno', props.anno);
    };
    return { ctrl, onOpenModal, reviewPass, reviewReject, submitReview, updateAnno };
  },
  render() {
    // console.log(this);
    if (!this.anno) {
      return h('div', {}, ["没有找到这条标注"]);
    };
    return h(
      'div', {
        'class': "form-control form-control-sm mx-1 my-1",
      },
      [
        h('button', {
            'type': "button",
            'class': "btn btn-sm btn-light my-1 me-2",
            'onClick': this.onOpenModal,
            'title': JSON.stringify(this.anno),
          },
          [`${this.db?.userDict?.[this.anno?.user]?.name} 的标注 #${this.anno?.id}`],
        ),
        !this.ctrl.reviewing ? h('button', {
            'type': "button",
            'class': "btn btn-sm btn-outline-primary my-1 me-2",
            'onClick': ()=>{this.ctrl.reviewing=true},
          },
          [`审批`],
        ) : null,
        h('button', {
            'type': "button",
            'class': "btn btn-sm btn-light my-1 me-2",
            'onClick': this.updateAnno,
            'title': `刷新`,
          },
          [`🔄`],
        ),
        h('div', {},
          this.ctrl.reviewing ? [
            h('button', {
                'type': "button",
                'class': ["btn btn-sm my-1 me-2", `btn${this.ctrl.accept===true?'':'-outline'}-success`],
                'onClick': this.reviewPass,
              },
              [`通过`],
            ),
            h('button', {
                'type': "button",
                'class': ["btn btn-sm my-1 me-2", `btn${this.ctrl.accept===false?'':'-outline'}-danger`],
                'onClick': this.reviewReject,
              },
              [`否决`],
            ),

            h('input', {
                'type': "text",
                'class': "form-control form-control-sm my-1 me-2",
                'placeholder': "填写批示/评论/备注",
                'value': this.ctrl.comment,
                'onInput': event => {
                  this.ctrl.comment = event?.target?.value;
                },
              },
            ),

            // h('br'),

            h('button', {
                'type': "button",
                'class': ["btn btn-sm my-1 me-2", `btn-outline-primary`],
                'onClick': this.submitReview,
              },
              [`提交`],
            ),
            h('button', {
                'type': "button",
                'class': ["btn btn-sm my-1 me-2", `btn-outline-dark`],
                'onClick': ()=>{this.ctrl.reviewing=false},
              },
              [`取消`],
            ),
          ] : this.anno?.content?.review.accept!=null ? [
            h('span', {
                'title': JSON.stringify(this.anno?.content?.review),
                'class': ["badge text-wrap my-1 me-2",
                  this.anno?.content?.review?.accept?
                  ('bg-light border border-success text-dark'):
                  (this.anno?.content?.review?.checked?
                    'bg-warning border border-danger text-dark':
                    'bg-light border border-danger text-dark')
                ],
              },
              [
                this.anno?.content?.review?.accept?'已通过':'已否决',' ',
                this.anno?.content?.review?.comment?`「${this.anno?.content?.review?.comment}」`:null,' ',
                this.anno?.content?.review?.accept?null:this.anno?.content?.review?.checked?`标注者已处理`:'标注者尚未处理',
              ],
            ),
          ] : [
            h('span', {
                'class': "badge bg-light text-dark text-wrap my-1 me-2",
              },
              [`暂无批注`],
            ),
          ],
        ),
        h('div', {},
          (this.anno?.content?.annotations??[]).map(annot=>h(
            'span', {
              'class': "badge bg-light text-dark text-wrap my-1 me-2",
            },
            [JSON.stringify(annot)],
          )),
        ),
      ]
    );
  },
});

the_app.component('entry-card', {
  props: ["db", "entry"],
  emits: ["open-modal", 'update-entry'],
  setup(props, ctx) {
    const onOpenModal = () => {
      ctx.emit('open-modal', ['entry-detail', props.entry]);
    };
    const updateEntry = () => {
      ctx.emit('update-entry', props.entry);
    };
    return { onOpenModal, updateEntry };
  },
  render() {
    // console.log(this);
    if (!this.entry) {
      return h('div', {}, ["没有找到这条语料"]);
    };
    return h(
      'div', {
        'class': "form-control form-control-sm mx-1 my-1",
      }, [],
    );
  },
};



the_app.component('task-card', {
  props: ["db", "task"],
  emits: ["open-modal"],
  setup(props, ctx) {
    const onOpenModal = () => {
      ctx.emit('open-modal', ['task-detail', props.task]);
    };
    return { onOpenModal };
  },
  render() {
    // console.log(this);
    if (!this.task) {
      return h('div', {}, ["没有找到这个任务"]);
    };
    return h(
      'div', {
        'class': "d-inline-block"
      },
      [
        h('button', {
            'type': "button",
            'class': ["btn btn-sm my-1 me-2", this.task.deleted?'btn-danger':'btn-outline-dark'],
            'onClick': this.onOpenModal,
            'title': `task#${this.task?.id}`,
          },
          [`task#${this.task?.id}`],
        ),
        this.task.batchName ? h(
          'span', {
            'class': "badge bg-light text-dark text-wrap my-1 me-2",
          },
          [`批次：${this.task.batchName}`],
        ) : null,
        h('span', {
            'class': "badge bg-light text-dark text-wrap my-1 me-2",
          },
          [`提交：${this.task?.submitters?.length}/${this.task?.to?.length}`],
        ),
      ]
    );
  },
});


const app = the_app.mount('#bodywrap');
window.app = app;
// the_app.config.globalProperties.$axios = axios;  // 用 app.theBackEnd 就可以调试了。

export default app;
