
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

import assign_tasks from './assign_tasks_new.mjs.js';


// 基本信息 变量
const APP_NAME = "Sp22-Anno-Manager";
const APP_VERSION = "22-0330-01";

// 开发环境 和 生产环境 的 控制变量
const DEVELOPING = 0;
const API_BASE_DEV_LOCAL = "http://127.0.0.1:5000";
const API_BASE_DEV = "http://192.168.124.3:8888";  //"http://10.1.25.237:8888";
const API_BASE_PROD = "https://sp22.nlpsun.cn";
const API_BASE = DEVELOPING ? API_BASE_DEV : API_BASE_PROD;


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
      return null;
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
      return null;
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
      return [];
    }

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
      "taskAssign": "taskAssign",
    };

    const ctrl = reactive({
      currentUser: {
        name: "",
        token: "",
      },
      haveStore: false,
      tab: TABS['overview'],
      lastTime: "never",
      lastTimeDict: {},
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
      topics: [],
      topicTaskDict: {},
    });

    const tasks_sta = (tasks) => ({
      total_num: tasks?.length ?? 0,
      assigned_num: tasks.filter(task => task.to?.length).length,
      working_num: tasks.filter(task => task.to?.length&&task.submitters?.length&&task.submitters?.length<task.to?.length).length,
      done_num: tasks.filter(task => task.to?.length&&task.submitters?.length==task.to?.length).length,
    });

    const tasks_computed = computed(() => ({
      total: tasks_sta(theDB.tasks),
      by_topic: Object.entries(theDB.topicTaskDict).map(pr => [pr[0], tasks_sta(pr[1])]),
    }));





    const saveBasic = () => {
      store.set(`${APP_NAME}:version`, APP_VERSION);
      store.set(`${APP_NAME}:currentUser`, ctrl.currentUser);
      store.set(`${APP_NAME}:tab`, ctrl.tab);
      store.set(`${APP_NAME}:lastTime`, ctrl.lastTime);
      store.set(`${APP_NAME}:lastTimeDict`, ctrl.lastTimeDict);
      store.set(`${APP_NAME}:assignData_settings`, assignData.settings);
    };
    const loadBasic = () => {
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
      let storedTimeDict = store.get(`${APP_NAME}:lastTimeDict`);
      if (storedTimeDict != null) {
        ctrl.lastTimeDict = storedTimeDict;
      };
      let stored_assignData_settings = store.get(`${APP_NAME}:assignData_settings`);
      if (stored_assignData_settings != null) {
        assignData.settings = stored_assignData_settings;
      };
      goTab(store.get(`${APP_NAME}:tab`));
    };
    const saveDB = () => {
      store.set(`${APP_NAME}:DB`, {
        users: theDB.users,
        tasks: theDB.tasks,
        annos: theDB.annos,
        entries: theDB.entries,
      });
    };
    onMounted(() => {
      let storedDB = store.get(`${APP_NAME}:DB`);
      if (storedDB != null) {
        Object.assign(theDB, storedDB);
        extendDB();
      };
      loadBasic();
    });

    const goTab = (tb) => {
      ctrl.tab = TABS[tb]??TABS['overview'];
      saveBasic();
    };

    const begin = () => {
      saveBasic();
    };

    // const User = class User {
    //   constructor(core, db) {
    //     this.core = core;
    //     this.db = db;
    //   }
    // }

    const userCurrTasks = user => {
      let tt = user.allTasks ?? [];
      return tt.filter(task => topic2using(task.topic)==topic2using(user.currTask));
    };
    const userCurrDoneTasks = user => {
      let tt = user.doneTasks ?? [];
      return tt.filter(task => topic2using(task.topic)==topic2using(user.currTask));
    };
    const userProgress = user => {
      let cDoneLen = userCurrDoneTasks(user).length;
      let cDueLen = userCurrTasks(user).length;
      let bg = Math.max(cDoneLen, cDueLen);
      let mn = Math.min(cDoneLen, cDueLen);
      let pct = bg==0 ? `0` : `${mn/bg*100}%`;
      let done = cDoneLen >= cDueLen;
      return {
        done,
        pct,
        bg,
        mn
      };
    };

    const extendDB = () => {
        theDB.topics = [];
        theDB.topicTaskDict = {};
        for (let task of theDB.tasks) {
          task.submitters = theDB.annos.filter(anno => anno.task==task.id).map(anno => anno.user);
          task.enough = task.to?.length??0 <= task.submitters?.length??0;
          theDB.taskDict[task.id] = task;
          if (task.topic?.length && !theDB.topics.includes(task.topic)) {
            theDB.topics.push(task.topic);
          };
          if (task.topic?.length && !(task.topic in theDB.topicTaskDict)) {
            theDB.topicTaskDict[task.topic] = [];
          };
          if (task.topic?.length) {
            theDB.topicTaskDict[task.topic].push(task);
          };
        };

        for (let user of theDB.users) {
          user.allTasks = theDB.tasks.filter(task => task.to.includes(user.id));
          user.allAnnos = theDB.annos.filter(anno => anno.user==user.id);
          user.doneTasks = theDB.tasks.filter(task => task.submitters.includes(user.id));
          theDB.userDict[user.id] = user;
        };

        for (let anno of theDB.annos) {
          theDB.annoDict[anno.id] = anno;
        };

        for (let entry of theDB.entries) {
          theDB.entryDict[entry.id] = entry;
        };
    };

    const syncTable = async (extend=true, tableName, tableListName, fnName) => {
      let aidx = alertBox_pushAlert('正在同步，请稍等……', 'info', 9999999);
      let time = new Date();
      try {
        alertBox_removeAlert(aidx);
        aidx = alertBox_pushAlert(`正在同步${tableName}，请稍等……`, 'info', 9999999);
        let resp = await app.theBackEnd[fnName]();
        if (errorHappened(resp?.data?.err)) {
          throw new Error(resp?.data?.err, {cause: resp?.data?.err});
          return;
        };

        theDB[tableListName] = resp?.data?.data;

        if (extend) {
          extendDB();
        }

        saveDB();

        alertBox_removeAlert(aidx);
        ctrl.lastTimeDict[tableListName] = time.toLocaleString();

        saveBasic();

        alertBox_pushAlert(`${tableName}已更新至最新状态(${ctrl.lastTimeDict[tableListName]})`, 'success', 5000);

        return theDB[tableListName];

      } catch (error) {
        // if (aidx!=undefined)
        alertBox_removeAlert(aidx);
        alertBox_pushAlert(`【发生错误】${error}`, 'danger', null, error);
        return;
      };
      alertBox_removeAlert(aidx);
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
      let aidx = alertBox_pushAlert('正在同步，请稍等……', 'info', 9999999);
      let time = new Date();
      try {

        await syncUser(false);
        await syncTask(false);
        await syncAnno(false);
        await syncEntryInfo(false);

        // alertBox_removeAlert(aidx);
        // aidx = alertBox_pushAlert('正在同步用户表，请稍等……', 'info', 9999999);
        // let usersResp = await app.theBackEnd.getUsersAll();
        // if (errorHappened(usersResp?.data?.err)) {
        //   throw new Error(usersResp?.data?.err, {cause: usersResp?.data?.err});
        //   return;
        // };
        // alertBox_removeAlert(aidx);
        // aidx = alertBox_pushAlert('正在同步任务表，请稍等……', 'info', 9999999);
        // let tasksResp = await app.theBackEnd.getTasksAll();
        // if (errorHappened(tasksResp?.data?.err)) {
        //   throw new Error(tasksResp?.data?.err, {cause: tasksResp?.data?.err});
        //   return;
        // };
        // alertBox_removeAlert(aidx);
        // aidx = alertBox_pushAlert('正在同步语料表（仅基本信息），请稍等……', 'info', 9999999);
        // let entriesResp = await app.theBackEnd.getEntryInfoAll();
        // if (errorHappened(entriesResp?.data?.err)) {
        //   throw new Error(entriesResp?.data?.err, {cause: entriesResp?.data?.err});
        //   return;
        // };
        // alertBox_removeAlert(aidx);
        // aidx = alertBox_pushAlert('正在同步标注表，请稍等……', 'info', 9999999);
        // let annosResp = await app.theBackEnd.getAnnosAll();
        // if (errorHappened(annosResp?.data?.err)) {
        //   throw new Error(annosResp?.data?.err, {cause: annosResp?.data?.err});
        //   return;
        // };

        // theDB.users = usersResp?.data?.data;
        // theDB.entries = entriesResp?.data?.data;
        // theDB.tasks = tasksResp?.data?.data;
        // theDB.annos = annosResp?.data?.data;

        extendDB();

        saveDB();

        alertBox_removeAlert(aidx);
        ctrl.lastTime = time.toLocaleString();

        saveBasic();

        alertBox_pushAlert(`数据库已更新至最新状态(${ctrl.lastTime})`, 'success', 5000);

        return theDB;

      } catch (error) {
        // if (aidx!=undefined)
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
        saveDB();
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
        'user_tag': null,
        'task_tag': null,
        'users_per_task': 2,
        'tasks_per_user': 20,
        'exclusion': [],
        'polygraphs_per_user': {},
      },
      plans: [],
      planPerUser: [],
      analysis: [],
      undone: true,
      result: {},
    });
    watch(() => assignData.settings, () => {
      saveBasic();
    }, { deep: true });

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
    };

    const planAssigment = async () => {
      cleanAssigment();
      assignData.undone = true;
      let aidx = await alertBox_pushAlert(`正在规划任务，请稍等……`, 'info', 99999999);
      let pack = assignData.settings;
      pack.polygraphs_per_user = {
        'otherErrorString': 2,
        'otherErrorSeg': 3,
      };
      const plansResp = await makeAssigmentPlan(pack);
      // const plansResp = await app.theBackEnd.makeAssigmentPlan(pack);
      if (plansResp?.data?.code!=200) {
        alertBox_removeAlert(aidx);
        alertBox_pushAlert(`规划任务时出现问题：${plansResp?.data?.msg}`, 'danger', 5000, plansResp);
        return;
      };

      const plans = plansResp?.data?.data;
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

    const cleanAssigment = () => {
      assignData.plans = [];
      assignData.planPerUser = {};
      assignData.analysis = [];
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











    const exportPlan = () => {
      theSaver.saveJson(assignData.plans, 'plans.json');
    };





    const assignment = async function (
      topic=null,
      user_tag=null,
      task_tag=null,
      users_per_task=2,
      tasks_per_user=20,
      exclusion=[],
      polygraphs_per_user={},  // TODO 选项配置
      tasks_idx_base=_.max(theDB.tasks.map(it=>+it.id)),
      lo,
    ) {
      console.log(arguments);

      console.log([2, dateString()]);
      if (topic == null) {
        return [];
      };

      let users = theDB.users.filter(it => (
        topic_tags(topic).includes(it['currTask'])
        && (user_tag==null||(it['tags']?.length&&it['tags'].includes(user_tag)))
        && !it['quitted']
      ));

      let tasks = theDB.tasks.filter(it => (
        topic_tags(topic).includes(it['topic'])
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
        exclusion: exclusion,
        users_per_task: users_per_task,
        tasks_per_user: tasks_per_user,
        polygraphs_per_user: polygraphs_per_user,
      };
      // theSaver.save(pack);

      console.log(['start', dateString()]);
      let tasks_to_update = await assign_tasks(foolCopy(pack), _);
      console.log(['end', dateString()]);
      return tasks_to_update;
    };

    const makeAssigmentPlan = async (wrap) => {
      console.log([1, dateString()]);
      let polygraphs_per_user = {
        'otherErrorString': 2,
        'otherErrorSeg': 3,
      };
      let tables_to_update = await assignment(
        wrap?.['topic'],
        wrap?.['user_tag'],
        wrap?.['task_tag'],
        wrap?.['users_per_task'],
        wrap?.['tasks_per_user'],
        wrap?.['exclusion'],
        polygraphs_per_user,
        // wrap?.['polygraphs_per_user'],  // TODO 选项配置
      );
      console.log([5, dateString()]);
      console.log(tables_to_update);
      return {'data': {'code': 200, 'data': tables_to_update}};
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
      theSaver,
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
