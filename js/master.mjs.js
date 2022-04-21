
// 基本信息 变量
const APP_NAME = "Sp22-Anno-Manager";
const APP_VERSION = "22-0421-00";

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

import Sp22FN from './sp22fn.mjs.js';
import Sp22DB from './sp22db.mjs.js';

import BaseSaver from './modules/BaseSaver.mjs.js';
import TheReader from './modules/TheReader.mjs.js';
import AlertBox from './modules/AlertBox.mjs.js';
import ModalBox from './modules/ModalBox.mjs.js';
import BackEnd from './modules/BackEnd.mjs.js';
// import BackEndUsage from './modules/BackEndUsage.mjs.js';
import FileControl from './modules/FileControl.mjs.js';
// import BackEndUsage from './modules/BackEndUsage.mjs.js';
// import IoControl from './modules/IoControl.mjs.js';

import axios from './modules_lib/axios_0.26.1_.mjs.js';
import ClipboardJS from './modules_lib/clipboard_2.0.10_.mjs.js';
// 下面这几个包引入之后，直接全局能用，不用做任何处理。
// import __Wrap_of_store__ from './modules_lib/store_2.0.9_.legacy.min.mjs.js';
import __Wrap_of_froage__ from './modules_lib/localforage_1.10.0_.min.mjs.js';
import __Wrap_of_lodash__ from './modules_lib/lodash_4.17.21_.min.mjs.js';
import __Wrap_of_marked__ from './modules_lib/marked_4.0.2_.min.mjs.js';

import assign_tasks from './assign_tasks_new.mjs.js';


const RootComponent = {
  setup() {

    const win = window;
    const lo = _;
    const mkd = marked;
    const frg = localforage;

    const MODAL_THEMES = {
      "default": null,
      "confirm": "confirm",
      "upload-entries": "upload-entries",
      "user-progress": "user-progress",
      "user-importer": "user-importer",
      "user-editor": "user-editor",
      "user-detail": "user-detail",
      "entry-detail": "entry-detail",
      "task-detail": "task-detail",
      "anno-detail": "anno-detail",
    };

    const TABS = {
      "default": null,
      "functions": "functions",
      "memos": "memos",
      "todos": "todos",
      "userInfo": "userInfo",
      "userProgress": "userProgress",
      "overview": "overview",
      "entryAndTask": "entryAndTask",
      "taskAssign": "taskAssign",
    };

    const dbBasic = reactive({
      "entries": [],
      "tasks": [],
      "users": [],
      "annos": [],
    });

    const dbState = reactive({
      "createdAt": JSON.parse(JSON.stringify(new Date())),
      "modifiedAt": JSON.parse(JSON.stringify(new Date())),

      "entriesExtended": false,
      "tasksExtended": false,
      "usersExtended": false,
      "annosExtended": false,

      "entryDictBuilt": false,
      "taskDictBuilt": false,
      "userDictBuilt": false,
      "annoDictBuilt": false,
    });

    const spDB = new Sp22DB(dbBasic, lo);
    spDB.useState(dbState);

    const ctrl = reactive({
      developing: DEVELOPING,

      currentUser: {
        name: "",
        token: "",
      },

      showOnlyMyMembers: false,
      // started: false,

      userAnnoFilter: {
        topic: "【all】",
        batchName: "【all】",
      },

      managerFilter: {
        manager: "【all】",
      },
      showQuittedUsers: false,

      tab: TABS['overview'],
      lastTime: "never",
      lastTimeDict: {},
    });

    const goTab = async (tb) => {
      ctrl.tab = TABS[tb]??TABS['overview'];
      await saveBasic();
    };

    const begin = async () => {
      await saveBasic();
    };

    onMounted(async () => {
      let storedVersion = await frg.getItem(`${APP_NAME}:version`);
      if (storedVersion == APP_VERSION) {
        alertBox.pushAlert(`ver. ${APP_VERSION}`, "info", 2000);
      } else {
        alertBox.pushAlert(`版本已更新到 ${APP_VERSION}`, "success", 2000);
        await frg.setItem(`${APP_NAME}:version`, APP_VERSION);
      };
      await loadBasic();
    });

    const saveBasic = async () => {
      await frg.setItem(`${APP_NAME}:version`, APP_VERSION);
      await frg.setItem(`${APP_NAME}:currentUser`, foolCopy(ctrl.currentUser));
      await frg.setItem(`${APP_NAME}:tab`, foolCopy(ctrl.tab));
      await frg.setItem(`${APP_NAME}:lastTime`, foolCopy(ctrl.lastTime));
      await frg.setItem(`${APP_NAME}:lastTimeDict`, foolCopy(ctrl.lastTimeDict));
      await frg.setItem(`${APP_NAME}:assignData_settings`, foolCopy(assignData.settings));
    };

    const loadBasic = async () => {
      let storedVersion = await frg.getItem(`${APP_NAME}:version`);
      let storedUser = await frg.getItem(`${APP_NAME}:currentUser`);
      if (storedUser != null) {
        ctrl.currentUser = storedUser;
        await _setMe();
      };
      let storedTime = await frg.getItem(`${APP_NAME}:lastTime`);
      if (storedTime != null) {
        ctrl.lastTime = storedTime;
      };
      let storedTimeDict = await frg.getItem(`${APP_NAME}:lastTimeDict`);
      if (storedTimeDict != null) {
        ctrl.lastTimeDict = storedTimeDict;
      };

      await goTab(await frg.getItem(`${APP_NAME}:tab`));

      let stored_assignData_settings = await frg.getItem(`${APP_NAME}:assignData_settings`);
      if (stored_assignData_settings != null) {
        assignData.settings = stored_assignData_settings;
      };
    };

    const _setMe = async () => {
      if (spDB.users.length) {
        let me = lo.find(spDB.users, it=>it.token==ctrl.currentUser.token);
        if (!me) {
          me = lo.find(spDB.users, it=>it.name==ctrl.currentUser.name);
        };
        if (me) {
          ctrl.currentUser = me;
          await frg.setItem(`${APP_NAME}:currentUser`, foolCopy(ctrl.currentUser));
        };
      };
    };








    // 初始化 提示框 模块
    const modalData = reactive({
      show: false,
      theme: 'default',
      kwargs: {},
      history: [],
    });
    const modalBox = new ModalBox(modalData);
    const modalBox_show = () => modalBox.show();
    const modalBox_hide = () => modalBox.hide();
    const modalBox_open = (theme, kwargs) => {
      console.log(theme, kwargs);
      modalBox.open(theme, kwargs);
    };

    // 初始化 提示框 模块
    const alertData = reactive({
      lastIdx: 1,
      alerts: [],
    });
    const alertBox = new AlertBox(alertData);

    // 初始化 文件读取 模块
    const theReader = new TheReader(alertBox.pushAlert);

    // 初始化 文件保存 模块
    const theSaver = new BaseSaver();

    // 初始化 剪贴板 插件
    onMounted(() => {
      let theClipboard = new ClipboardJS(".btn-copy-token");
      theClipboard.on('success', function (e) {
        // console.info('Action:', [e.action, e.text, e.trigger]);
        alertBox.pushAlert(`已拷贝`, "success");
        e.clearSelection();
      });
      theClipboard.on('error', function (e) {
        // console.info('Action:', [e.action, e.trigger]);
        alertBox.pushAlert(`拷贝失败！`, "danger");
      });
    });

    // 初始化 前后端接口
    const theBackEnd = new BackEnd(ctrl.currentUser.token, `${API_BASE}/api/`, alertBox.pushAlert);

    watch(() => ctrl?.currentUser?.token, () => {
      theBackEnd.token = ctrl?.currentUser?.token;
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

    const workerState = reactive({
      working: false,
      works: [],
      alert_idx: null,
    });

    const dbWorker = new Worker("js/workers/dbExtender.worker.js");

    const pushWork = async (work) => {
      workerState.works.push(work);
      await dbWorker.checkNext();
    };

    dbWorker.checkNext = async () => {
      if (!workerState.working) {
        let nextWork = workerState.works.shift();
        if (nextWork) {
          workerState.working=true;
          if (workerState.alert_idx!=null){
            alertBox.removeAlert(workerState.alert_idx);
          };
          let aidx = alertBox.pushAlert('辅助线程 工作中……', 'info', 9999999);
          workerState.alert_idx = aidx;
          await dbWorker.postMessage(foolCopy(nextWork));
        } else {
          alertBox.removeAlert(workerState.alert_idx);
          alertBox.pushAlert(`辅助线程 队列已完成`, "success");
        };
      } else {
        if (workerState.alert_idx!=null){
          alertBox.removeAlert(workerState.alert_idx);
          let aidx = alertBox.pushAlert('辅助线程 工作中……', 'info', 9999999);
          workerState.alert_idx = aidx;
        };
      };
    };

    watch(()=>workerState.working, async()=>{
      if(!workerState.working){await dbWorker.checkNext();};
    });

    dbWorker.onmessage = async (message) => {
      // console.log(message);
      const pack = message.data;
      const actions = {
        'working': ()=>{
          workerState.working=true;
        },
        // 'done': ()=>{
        //   workerState.working=false;
        //   await dbWorker.checkNext();
        // },
        'updateDB': async()=>{
          workerState.working=true;
          console.log("main got:", foolCopy(pack.data));
          await Object.assign(theDB, pack.data);

          await theDB.entries.forEach(entry=>{theDB.entryDict[entry.id] = entry;});
          await theDB.tasks.forEach(task=>{theDB.taskDict[task.id] = task;});
          await theDB.annos.forEach(anno=>{theDB.annoDict[anno.id] = anno;});
          await theDB.users.forEach(user=>{theDB.userDict[user.id] = user;});

          await _setMe();
          await saveDB();

          workerState.working=false;
          // await dbWorker.checkNext();
        },
        'alert': ()=>{alertBox.pushAlert(...pack.data)},
      };
      if (pack.command in actions) {
        await actions[pack.command]();
      } else {
        alertBox.pushAlert(`辅助线程 传来未知消息【${pack}】`, "warning", null, pack);
      };
    };
    dbWorker.onerror = async (error) => {
      alertBox.pushAlert(`辅助线程 发生错误【${error}】`, "danger", null, error);
    };
    dbWorker.onmessageerror = async (messageerror) => {
      alertBox.pushAlert(`辅助线程 发生消息错误【${messageerror}】`, "danger", null, messageerror);
    };

    onMounted(async()=>{
      // console.time('dbWorker.postMessage');
      dbWorker.postMessage({
        'command': "alert",
        'data': ["辅助线程 连接成功", "success", 1000],
      });
      // console.timeEnd('dbWorker.postMessage');
    });
















    const extendTasks = async () => {
      await spDB.extendTasks();
    };

    const extendAnnos = async () => {
      await spDB.extendAnnos();
    };

    const extendUsers = async () => {
      await spDB.extendUsers();
    };

    const extendEntries = async () => {
      await spDB.extendEntries();
    };

    const saveDB = async () => {
      // await frg.setItem(`${APP_NAME}:DB`, {
      //   users: foolCopy(spDB.users),
      //   tasks: foolCopy(spDB.tasks),
      //   annos: foolCopy(spDB.annos),
      //   entries: foolCopy(spDB.entries),
      // });
      await frg.setItem(`${APP_NAME}:DB`, foolCopy(spDB.toSave()));
      console.log(await frg.getItem(`${APP_NAME}:DB`));
      alertBox.pushAlert('数据已缓存', 'info');
    };

    const exportDB = async () => {
      if (!spDB.entries.length) {
        alertBox.pushAlert('请注意： Entry 表为空！导出数据可能不完整！', 'warning', 30000);
      };
      if (!spDB.entries?.[0]?.content?.material?.tokenList?.length) {
        alertBox.pushAlert('请注意： Entry 表中缺少语料文本！导出数据可能不完整！', 'warning', 30000);
      };
      if (!spDB.tasks.length) {
        alertBox.pushAlert('请注意： Task 表为空！导出数据可能不完整！', 'warning', 30000);
      };
      if (!spDB.users.length) {
        alertBox.pushAlert('请注意： User 表为空！导出数据可能不完整！', 'warning', 30000);
      };
      if (!spDB.annos.length) {
        alertBox.pushAlert('请注意： Anno 表为空！导出数据可能不完整！', 'warning', 30000);
      };
      await theSaver.save({
        entries: foolCopy(spDB.entries),
        tasks: foolCopy(spDB.tasks),
        users: foolCopy(spDB.users),
        annos: foolCopy(spDB.annos),
      }, 'db.json');
    };

    const loadCacheDB = async () => {
      // await getMemoList();
      let aidx = alertBox.pushAlert('正在读取并处理，请稍等……', 'warning', 9999999);
      console.time('getItem');
      let storedDB = await frg.getItem(`${APP_NAME}:DB`);
      console.timeEnd('getItem');
      alertBox.removeAlert(aidx);

      if (storedDB != null) {
        console.time('reset');
        spDB.loadSave(storedDB);
        // await spDB.resetTasks(storedDB.tasks);
        // await spDB.resetAnnos(storedDB.annos);
        // await spDB.resetEntries(storedDB.entries);
        // await spDB.resetUsers(storedDB.users);
        console.timeEnd('reset');

        // console.time('extend');
        // await extendDB();
        // console.timeEnd('extend');

        return;
      };
      alertBox.pushAlert('没有找到缓存', 'danger');
    };

    const extendDB = async () => {
      await spDB.extendAll();
    };

    const syncUser = async (extend=false) => {
      let result = await syncTable(extend, 'User 表', 'users', 'getUsersAll');
      return result;
    };
    const syncTask = async (extend=false) => {
      let result = await syncTable(extend, 'Task 表', 'tasks', 'getTasksAll');
      return result;
    };
    const syncAnno = async (extend=false) => {
      let result = await syncTable(extend, 'Anno 表', 'annos', 'getAnnosAll');
      return result;
    };
    const syncEntryInfo = async (extend=false) => {
      let result = await syncTable(extend, 'Entry 简表', 'entries', 'getEntryInfoAll');
      return result;
    };

    const syncTable = async (extend=false, tableName, tableListName, fnName) => {
      let aidx;// = await alertBox.pushAlert('正在同步，请稍等……', 'info', 9999999);
      let time = new Date();
      try {
        // await alertBox.removeAlert(aidx);
        aidx = await alertBox.pushAlert(`正在同步 ${tableName}，请稍等……`, 'info', 9999999);
        console.time(`下载 ${tableName}`);
        let resp = await app.theBackEnd[fnName]();
        console.timeEnd(`下载 ${tableName}`);
        if (errorHappened(resp?.data?.err)) {
          throw new Error(resp?.data?.err, {cause: resp?.data?.err});
          return;
        };

        await alertBox.removeAlert(aidx);
        aidx = await alertBox.pushAlert(`已取回 ${tableName} 数据，正在处理，请稍等……`, 'info', 3000);

        if (true) {
          const fnMap = {
            'entries': async(list)=>{await spDB.resetEntries(list);},
            'tasks': async(list)=>{await spDB.resetTasks(list);},
            'users': async(list)=>{await spDB.resetUsers(list);},
            'annos': async(list)=>{await spDB.resetAnnos(list);},
          };
          await fnMap[tableListName]?.(resp?.data?.data);
        };

        if (extend) {
          const fnMap = {
            'entries': async()=>{await extendTasks(); await extendAnnos(); await extendEntries();},
            'tasks': async()=>{await extendDB();},
            'users': async()=>{await extendTasks(); await extendAnnos(); await extendUsers();},
            'annos': async()=>{await extendDB();},
          };
          await (fnMap[tableListName]??extendDB)();
        };

        await saveDB();

        await alertBox.removeAlert(aidx);
        ctrl.lastTimeDict[tableListName] = await time.toLocaleString();

        await saveBasic();

        // await alertBox.pushAlert(`${tableName}已更新至最新状态(${ctrl.lastTimeDict[tableListName]})`, 'success', 5000);

        return true;

      } catch (error) {
        // if (aidx!=undefined)
        alertBox.removeAlert(aidx);
        alertBox.pushAlert(`【发生错误】${error}`, 'danger', null, error);
        return false;
      };
      await alertBox.removeAlert(aidx);
    };

    const sync = async (extent=false) => {
      // await getMemoList();
      // let aidx = alertBox.pushAlert('正在获取数据，请稍等……', 'info', 9999999);
      let time = new Date();
      try {

        await syncEntryInfo(false);  // 非常重要，必须放在 Task 表 更新之前！因为它（的后端逻辑）会改变 Task 表！（测谎题相关字段）
        await syncAnno(false);
        await syncTask(false);
        await syncUser(false);

        if (extent) {
          await extendDB();
        };

        await saveDB();

        // alertBox.removeAlert(aidx);
        ctrl.lastTime = time.toLocaleString();

        await saveBasic();

        // alertBox.pushAlert(`数据库已刷新至最新状态(${ctrl.lastTime})`, 'success');

        return true;

      } catch (error) {
        // if (aidx!=undefined)
        // alertBox.removeAlert(aidx);
        alertBox.pushAlert(`【发生错误】${error}`, 'danger', null, error);
        return false;
      };
      // alertBox.removeAlert(aidx);
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
        let jd = Sp22FN.topic_regulation(user.currTask)==assignData.settings.topic && !user.quitted;
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
      let aidx = await alertBox.pushAlert(`正在规划任务，请稍等……`, 'info', 99999999);
      let pack = assignData.settings;
      try {
        if (assignData.settings.polygraphs_per_user_json_string.length) {
          let polygraphs_per_user = JSON.parse(assignData.settings.polygraphs_per_user_json_string);
          pack.polygraphs_per_user = polygraphs_per_user;
        } else {
          pack.polygraphs_per_user = {};
        }
      } catch(error) {
        alertBox.removeAlert(aidx);
        alertBox.pushAlert(`无法解析测谎题配置，请检查`, 'warning', 5000, assignData.settings);
        return;
      };
      // pack.polygraphs_per_user = {
      //   'otherErrorString': 2,
      //   'otherErrorSeg': 3,
      // };
      const plansResp = await makeAssigmentPlan(pack);
      // const plansResp = await app.theBackEnd.makeAssigmentPlan(pack);
      if (plansResp?.data?.code!=200) {
        alertBox.removeAlert(aidx);
        alertBox.pushAlert(`规划任务时出现问题：${plansResp?.data?.msg}`, 'danger', 5000, plansResp);
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

      let bidx = alertBox.pushAlert(`计算完毕，准备规划结果……`, 'success', 9999999, plansResp);
      await analyzeAssignmentPlan();
      alertBox.removeAlert(bidx);

      alertBox.removeAlert(aidx);
      if (plans.length) {
        alertBox.pushAlert(`规划成功，请进行后续操作`, 'success', 3000, plansResp);
      } else {
        alertBox.pushAlert(`无法规划，请检查设置`, 'warning', 3000, plansResp);
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
      alertBox.pushAlert(`规划已撤除`, 'warning', 3000);
    };

    const doAssigment = async () => {
      let aidx = alertBox.pushAlert(`正在执行分配，请稍等……`, 'info', 99999999);
      const actResp = await app.theBackEnd.actAssigmentPlan(assignData.plans);
      if (actResp?.data?.code!=200) {
        alertBox.removeAlert(aidx);
        alertBox.pushAlert(`执行分配时出现问题：${actResp?.data?.msg}`, 'danger', 5000, actResp);
        return;
      };

      alertBox.removeAlert(aidx);
      if (true) {
        assignData.undone = false;
        assignData.result = actResp?.data?.data;
        // cleanAssigment();
        alertBox.pushAlert(`执行成功`, 'success', 5000, actResp);
      } else {
        alertBox.pushAlert(`执行失败`, 'danger', 5000, actResp);
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
      //   Sp22FN.topic_tags(topic).includes(it['currTask'])
      //   && (user_tag==null||(it['tags']?.length&&it['tags'].includes(user_tag)))
      //   && !it['quitted']
      // ));

      let users = theDB.users.filter(it => assignData.assignUserBoxDict[it.id]);

      let tasks = theDB.tasks.filter(it => (
        Sp22FN.topic_tags(topic).includes(it['topic'])
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
        topic: Sp22FN.topic_regulation(topic),
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
      let aidx = alertBox.pushAlert(`正在读取，请稍等……`, 'info', 99999999);
      try {
        const fc = new FileControl({
          document: window.document,
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
        alertBox.removeAlert(aidx);
        alertBox.pushAlert(`发生错误：${error}`, 'danger', 5000, error);
      };
      alertBox.removeAlert(aidx);
      alertBox.pushAlert(`成功`, 'success', 3000);
    };



    const wordAt = (entry, idx) => {
      if (!entry?.content?.material?.tokenList?.length) {
        return "";
      };
      let token = entry.content.material.tokenList[idx];
      return token?.to?.word ?? token?.word ?? "";
    };

    const makeAnnoOnTexts = () => {
      let aidx = alertBox.pushAlert(`开始`, 'info', 99999999);
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
      alertBox.removeAlert(aidx);
      alertBox.pushAlert(`完成`, 'info', 3000);
    };


    const updateOneEntry = async (entry_id) => {
      let aidx = alertBox.pushAlert(`获取中……`, 'info', 99999999);
      const entryResp = await app.theBackEnd.getEntry(entry_id);
      if (entryResp?.data?.code!=200) {
        alertBox.removeAlert(aidx);
        alertBox.pushAlert(`出现问题：${entryResp?.data?.msg}`, 'danger', 5000, entryResp);
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
        alertBox.removeAlert(aidx);
        alertBox.pushAlert(`数据异常`, 'danger', 5000, entryResp);
        return;
      };

      await saveDB();

      alertBox.removeAlert(aidx);
      alertBox.pushAlert(`执行成功`, 'success', 1000, entryResp);
    };



    const _annoTimeCompute = (anno) => {
      const logs = anno?.content?._ctrl?.timeLog ?? [];

      let box = [];
      let pureBox = [];

      let pureStop = false;
      for (let log of logs) {
        if (log[0]=="check") {
          pureStop = true;
        };
        if (log[0]=="in") {
          box.push([log[1], null]);
          if (!pureStop) {
            pureBox.push([log[1], null]);
          };
        };
        if (log[0]=="out" && box.length) {
          if (box.at(-1)[1]==null) {
            box.at(-1)[1] = log[1];
            if (!pureStop) {
              pureBox.at(-1)[1] = log[1];
            };
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

      let pureTotalDur = 0;
      for (let pair of pureBox) {
        if (pair[0].length&&pair[1].length) {
          let delta = (new Date(pair[1])) - (new Date(pair[0]));
          pureTotalDur += delta;
        };
      };

      let firstDur = (new Date(box[0][1])) - (new Date(box[0][0]));
      let stride = (new Date(box.at(-1)[1])) - (new Date(box[0][0]));
      let pureStride = (new Date(pureBox.at(-1)[1])) - (new Date(pureBox[0][0]));
      let lastAt = box.at(-1)[1];
      let pureLastAt = pureBox.at(-1)[1];
      return {firstDur, totalDur, pureTotalDur, stride, pureStride, lastAt, pureLastAt, detail: box};
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

      content?._ctrl?.timeLog?.push?.( ['check', JSON.parse(JSON.stringify(new Date())), review.reviewer] );

      let resp = await theBackEnd.updateAnno(user, task, entry, content, topic, entryVer);
      if (resp?.data?.code!=200) {
        alertBox.pushAlert(`【发生错误】${resp?.data?.msg}`, 'danger', null, resp);
        return false;
      } else {
        alertBox.pushAlert(`已保存，自动刷新……`, 'success');
      };
      await updateOneAnno(anno);
      return true;
    };

    const updateOneAnno = async (anno) => {
      let aidx = alertBox.pushAlert(`获取中……`, 'info', 99999999);
      console.log(anno);
      const annoResp = await app.theBackEnd.getAnno(anno.user, anno.task);
      if (annoResp?.data?.code!=200) {
        alertBox.removeAlert(aidx);
        alertBox.pushAlert(`出现问题：${annoResp?.data?.msg}`, 'danger', 5000, annoResp);
        return;
      };

      if (annoResp.data?.data) {
        let anno_in_dict = theDB.annoDict[anno.id];
        let new_anno = annoResp.data.data;
        new_anno._timeInfo = _annoTimeCompute(new_anno);
        Object.assign(anno_in_dict, new_anno);
      } else {
        alertBox.removeAlert(aidx);
        alertBox.pushAlert(`数据异常`, 'danger', 5000, annoResp);
        return;
      };

      await saveDB();

      alertBox.removeAlert(aidx);
      alertBox.pushAlert(`执行成功`, 'success', 1000, annoResp);
    };



    const annoSortFn = (anno) => {
      // TODO
      // let topic = anno?.topic;
      // let batchName = anno?.batchName;
      let batch = anno?.batch;
      let accepted = anno?.content?.review?.accept;
      let checked = anno?.content?.review?.checked;
      let polygraph = anno?.polygraph;
      if (checked===true && accepted===false) {
        return -100;
      };
      if (accepted===false) {
        return -80;
      };
      if (accepted===true) {
        return -60;
      };
      if (polygraph?.length) {
        return -40;
      };
      return 0;
    };

    const inspectionSum = (user) => {
      let annos = (user?.allAnnos??[]).map(it=>theDB.annoDict[it]).filter(it=>it?.batchName==user?.currBatchName);
      let sum = lo.countBy(annos, anno=>anno?.content?.review?.accept);
      sum.sum = (sum.false??0) + (sum.true??0);
      sum.passRatio = sum.sum==0 ? null : (sum.true??0)/sum.sum;
      return sum;
    };

    // const sortFnByPassRatio = (u1, u2) => {
    //   let ins1 = inspectionSum(u1);
    //   let ins2 = inspectionSum(u2);
    //   if (!ins1.false && !ins1.true) {return true};
    //   if (!ins2.false && !ins2.true) {return false};
    //   let r1 = ins1.passRatio - ins2.passRatio;
    //   if (r1!=0) {return r1;};
    //   return (ins1.true??0) - (ins2.true??0);
    // };

    // const sortFnByPassRatioR = (u1, u2) => {
    //   let ins1 = inspectionSum(u1);
    //   let ins2 = inspectionSum(u2);
    //   if (!ins1.false && !ins1.true) {return true};
    //   if (!ins2.false && !ins2.true) {return false};
    //   let r1 = ins2.passRatio - ins1.passRatio;
    //   if (r1!=0) {return r1;};
    //   return (ins2.true??0) - (ins1.true??0);
    // };












    const userAnnos = reactive({
      list: [],
    });

    const sortUserAnnos = (user) => {
      userAnnos.list = lo.sortBy(user.allAnnos.map(it=>spDB.anno(it)), [annoSortFn, it=>(-it?.batch)]);
    };











































    // 一个 axios 实例，方便在控制台调试
    const anAxios = axios.create({
      headers: {'Cache-Cotrol': 'no-cache'},
    });
    // 更新 notes
    const updateNotes = async () => {
      let wrap;
      try {
        let response = await anAxios.request({
          url: "notes.md",
          method: 'get',
        });
        wrap = (response.data);
      } catch (error) {
        alertBox.pushAlert(`获取 notes 时出错！（${error}）`, "danger", 5000, error);
        throw error;
        return;
        // return;
      };
    };









































    const theBoard = reactive({
      memos: [],
      text: "",
    });

    const getMemoList = async () => {
      try {
        let resp = await theBackEnd.getMemosAll();
        // alertBox.pushAlert(resp?.data);
        if (resp?.data?.code!=200) {
          alertBox.pushAlert(`【发生错误】${resp?.data?.msg}`, 'danger', resp);
          return;
        };
        theBoard.memos = lo.sortBy(resp?.data?.data, [it=>-(it.pinned??0), it=> -(new Date(it?.postedAt)).valueOf()]);
        return theBoard.memos;
      } catch (error) {
        alertBox.pushAlert(error, 'danger');
      };
    };

    const postNormalMemo = async () => {
      if (!theBoard?.text?.length) {
        alertBox.pushAlert(`请先填写内容`, 'warning');
        return;
      };
      try {
        let memo = {
          text: theBoard.text,
          user: {
            id: ctrl.currentUser?.id,
            name: ctrl.currentUser?.name,
          },
          postedAt: dateString(),
        };
        let resp = await theBackEnd.postMemo(memo);
        // alertBox.pushAlert(resp?.data);
        if (resp?.data?.code!=200) {
          alertBox.pushAlert(`【发生错误】${resp?.data?.msg}`, 'danger', resp);
          return;
        };
        let new_memo = resp?.data?.data;
        theBoard.memos.push(new_memo);
        theBoard.memos = lo.sortBy(theBoard.memos, [it=>-(it.pinned??0), it=> -(new Date(it?.postedAt)).valueOf()]);
        theBoard.text="";
        return new_memo;
      } catch (error) {
        alertBox.pushAlert(error, 'danger');
      };
    };

    const deleteMemo = async (memo) => {
      try {
        memo.deleted = true;
        let resp = await theBackEnd.updateMemo(memo);
        // alertBox.pushAlert(resp?.data);
        if (resp?.data?.code!=200) {
          alertBox.pushAlert(`【发生错误】${resp?.data?.msg}`, 'danger', resp);
          return;
        };
        await getMemoList();
        return;
      } catch (error) {
        alertBox.pushAlert(error, 'danger');
      };
    };

    const pinMemo = async (memo) => {
      try {
        memo.pinned = true;
        let resp = await theBackEnd.updateMemo(memo);
        // alertBox.pushAlert(resp?.data);
        if (resp?.data?.code!=200) {
          alertBox.pushAlert(`【发生错误】${resp?.data?.msg}`, 'danger', resp);
          return;
        };
        await getMemoList();
        return;
      } catch (error) {
        alertBox.pushAlert(error, 'danger');
      };
    };

    const unpinMemo = async (memo) => {
      try {
        memo.pinned = false;
        let resp = await theBackEnd.updateMemo(memo);
        // alertBox.pushAlert(resp?.data);
        if (resp?.data?.code!=200) {
          alertBox.pushAlert(`【发生错误】${resp?.data?.msg}`, 'danger', resp);
          return;
        };
        await getMemoList();
        return;
      } catch (error) {
        alertBox.pushAlert(error, 'danger');
      };
    };

























































    const editUser = async (user, jsonText) => {};

    const editingUser = async (user, jsonText) => {
      let newObj = {};
      try {
        newObj = JSON.parse(jsonText);
      } catch(error) {
        alertBox.pushAlert(`JSON解析失败，请检查`, 'warning', 60000, jsonText);
        return;
      };
      for (let kk of ['id', 'name', 'token']) {
        if (!(kk in newObj)) {
          alertBox.pushAlert(`缺少必要字段「${kk}」`, 'warning', 60000, jsonText);
          return;
        };
      };
      if (newObj.id!=user.id) {
        alertBox.pushAlert(`id发生改变，操作中止（${user.id} → ${newObj.id}）`, 'warning', 60000, jsonText);
        return;
      };
      for (let [kk, vv] of [['currTask', ''], ['currTaskGroup', ''], ['manager', ''], ['managerName', '']]) {
        if (!(kk in newObj)) {
          newObj[kk] = user[kk] ?? vv;
        };
      };



      if (user.quitted) {
        alertBox.pushAlert(`${user.name} 本来就被记为“已退出”了`, 'warning', 5000);
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
          alertBox.pushAlert(`${user.name} 更新失败【${resp.data.msg}】`, 'danger', 5000, resp);
          return;
        };
        Object.assign(user, resp.data.data);
        await saveDB();
        alertBox.pushAlert(`${user.name} 更新成功`, 'success');
      } catch(error) {
        alertBox.pushAlert(`${user.name} 更新时出错【${error}】`, 'danger', 5000, error);
      }

    };


    const makeNewUsers = async (newUsers) => {
      let messages = [];
      for await(let newUser of newUsers) {
        let message = "";
        try {
          let resp = await theBackEnd.postUser(newUser);
          if (resp.data?.code!=200) {
            message = `用户 ${newUser?.name} 添加失败【${resp.data.msg}】`;
            messages.push(message);
            alertBox.pushAlert(message, 'danger', 5000, resp);
            continue;
          };
          let newUserGot = resp.data?.data;
          message = `用户 ${newUserGot?.name} 添加成功`;
          messages.push(`#${newUserGot.id} ${newUserGot.name} 的密码是： ${newUserGot.token}`);
          alertBox.pushAlert(message, 'success');
        } catch(error) {
          message = `用户 ${newUser?.name} 添加时出错【${error}】`;
          messages.push(message);
          alertBox.pushAlert(message, 'danger', 5000, error);
        };
      };
      await syncUser(true);
      await saveDB();
      return messages;
    };


    const saveUpdatedUser = async (user, newUser) => {
      if (user.id != null) {newUser.id = user.id;};
      if (user.token != null) {newUser.token = user.token;};
      try {
        let resp = await theBackEnd.updateUser(newUser);
        if (resp.data?.code!=200) {
          alertBox.pushAlert(`用户 ${user?.name} 更新失败【${resp.data.msg}】`, 'danger', 5000, resp);
          return;
        };
        Object.assign(user, resp.data.data);
        await saveDB();
        alertBox.pushAlert(`用户 ${user?.name} 更新成功`, 'success');
      } catch(error) {
        alertBox.pushAlert(`用户 ${user?.name} 更新时出错【${error}】`, 'danger', 5000, error);
      };
    };


    const setAsQuitted = async (user) => {
      if (user.quitted) {
        alertBox.pushAlert(`${user.name} 本来就被记为“已退出”了`, 'warning', 5000);
        return;
      };
      let newUser = foolCopy({
        id: user.id,
        token: user.token,
      });
      newUser.quitted = true;
      await saveUpdatedUser(user, newUser);
    };

    const setNotQuitted = async (user) => {
      if (!user.quitted) {
        alertBox.pushAlert(`${user.name} 没有被记为“已退出”`, 'warning', 5000);
        return;
      };
      let newUser = foolCopy({
        id: user.id,
        token: user.token,
      });
      newUser.quitted = null;
      await saveUpdatedUser(user, newUser);
    };


    const setAsInspector = async (user) => {
      if (user?.role?.includes?.("inspector") || user?.role?.includes?.("super-inspector")) {
        alertBox.pushAlert(`${user.name} 本来就已经是审核员了`, 'warning', 5000);
        return;
      };
      let newUser = foolCopy({
        id: user.id,
        role: user?.role??[],
      });
      newUser.role.push("inspector");
      await saveUpdatedUser(user, newUser);
    };

    const setNotInspector = async (user) => {
      if (!user?.role?.includes?.("inspector") && !user?.role?.includes?.("super-inspector")) {
        alertBox.pushAlert(`${user.name} 本来就不是审核员`, 'warning', 5000);
        return;
      };
      let newUser = foolCopy({
        id: user.id,
        role: lo.difference(user.role, ["inspector", "super-inspector"]),
      });
      await saveUpdatedUser(user, newUser);
    };































































    const userProgress = (user) => {
      return spDB.userProgress(user);
    };










    return {
      win,
      lo,
      mkd,
      frg,
      //
      Sp22FN,
      //
      dbBasic,
      spDB,
      //
      _setMe,
      //



      userProgress,



      // store,
      theSaver,
      dbWorker,
      workerState,
      //
      timeString,
      dateString,
      uuid,
      errorHappened,
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
      setAsInspector,
      setNotInspector,
      saveUpdatedUser,
      makeNewUsers,
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
      annoSortFn,
      inspectionSum,
      // sortFnByPassRatio,
      // sortFnByPassRatioR,
      //
      theBoard,
      getMemoList,
      postNormalMemo,
      deleteMemo,
      pinMemo,
      unpinMemo,
      //
      userAnnos,
      sortUserAnnos,
      //
    };
  },
};


const the_app = Vue_createApp(RootComponent);

import ModalContent from './components/ModalContent.cpnt.mjs.js';
the_app.component('modal-content', ModalContent);

import AnnoCard from './components/AnnoCard.cpnt.mjs.js';
the_app.component('anno-card', AnnoCard);

import EntryCard from './components/EntryCard.cpnt.mjs.js';
the_app.component('entry-card', EntryCard);

import TaskCard from './components/TaskCard.cpnt.mjs.js';
the_app.component('task-card', TaskCard);


import UserListControl from './components/UserListControl.cpnt.mjs.js';
the_app.component('user-list-control', UserListControl);
import UserListPanel from './components/UserListPanel.cpnt.mjs.js';
the_app.component('user-list-panel', UserListPanel);


import UserEditor from './components/UserEditor.cpnt.mjs.js';
the_app.component('user-editor', UserEditor);
import UserImporter from './components/UserImporter.cpnt.mjs.js';
the_app.component('user-importer', UserImporter);



const app = the_app.mount('#bodywrap');
window.app = app;
// the_app.config.globalProperties.$axios = axios;  // 用 app.theBackEnd 就可以调试了。

export default app;
