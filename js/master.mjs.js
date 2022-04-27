
// 基本信息 变量
const APP_NAME = "Sp22-Anno-Master";
const APP_VERSION = "22-0428-0152";

// 开发环境 和 生产环境 的 控制变量
const DEVELOPING = location?.hostname=="2030nlp.github.io" ? 0 : 1;
if (DEVELOPING) {
  console.log("DEVELOPING");
} else {
  console.log("PRODUCTION");
};
const API_BASE_DEV_LOCAL = "http://127.0.0.1:5000";
const DEV_HOSTS = ["http://192.168.124.3:8888", "http://192.168.1.101:8888", "http://10.1.108.200:8888/", "http://10.0.55.176:8888/"];
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














    const extendTasks = async () => {
      ctrl.started=false;
      await spDB.extendTasks();
    };

    const extendAnnos = async () => {
      ctrl.started=false;
      await spDB.extendAnnos();
    };

    const extendUsers = async () => {
      ctrl.started=false;
      await spDB.extendUsers();
    };

    const extendEntries = async () => {
      ctrl.started=false;
      await spDB.extendEntries();
    };

    const saveDB = async () => {
      await frg.setItem(`${APP_NAME}:DB`, foolCopy(spDB.toSave()));
      console.log(await frg.getItem(`${APP_NAME}:DB`));
      alertBox.pushAlert('数据已缓存', 'info', 1000);
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



    const connect = async () => {
      try {
        let resp = await theBackEnd.getMe();
        if (200!=(resp?.data?.code)) {
          alertBox.pushAlert(`【发生错误】${resp?.data?.msg}`, 'danger', resp);
          return;
        };
        ctrl.currentUser = resp?.data?.data;
        alertBox.pushAlert(`你好，${resp?.data?.data?.name}！`);
        ctrl.connected = true;

      } catch (error) {
        console.log(error);
        alertBox.pushAlert(error, 'danger');
        throw error;
        return;
      };
    };

    const disconnect = async () => {
      ctrl.connected = false;
      ctrl.started = false;
      return;
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
      for (let anno of spDB.annos) {
        let entry = spDB.entryDict[anno.entry];
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
        entry = spDB.entryDict[entry_id];
        // entry.allTasks = spDB.inf_entry_all_tasks[entry.id];
        // entry.allAnnos = spDB.inf_entry_all_annos[entry.id];
        Object.assign(entry,  entryResp.data.data);

        await spDB.extendEntry(entry);

        // let entry_annos = spDB.annos.filter(anno => anno.entry==entry.id);
        // console.log('entry_annos:', entry_annos);
        // for (let anno of entry_annos) {
        //   for (let annot of anno?.content?.annotations??[]) {
        //     if (annot.on) {
        //       annot.onText = annot.on.map(idx => wordAt(entry, idx)).join("");
        //     };
        //   };
        // };
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
        let anno_in_dict = spDB.annoDict[anno.id];
        let new_anno = annoResp.data.data;
        new_anno._timeInfo = _annoTimeCompute(new_anno);
        Object.assign(anno_in_dict, new_anno);

        await spDB.extendAnno(anno_in_dict);

      } else {
        alertBox.removeAlert(aidx);
        alertBox.pushAlert(`数据异常`, 'danger', 5000, annoResp);
        return;
      };

      await saveDB();

      alertBox.removeAlert(aidx);
      alertBox.pushAlert(`执行成功`, 'success', 1000, annoResp);
    };




    const inspectionSum = (user, batchName) => {
      return spDB.inspectionSum(user, batchName);
    };




    const userAnnos = reactive({
      list: [],
    });

    const sortUserAnnos = (user) => {
      userAnnos.list = lo.sortBy(user.allAnnos.map(it=>spDB.anno(it)), [annoSortFn, it=>(-it?.batch)]);
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










































    // // 一个 axios 实例，方便在控制台调试
    // const anAxios = axios.create({
    //   headers: {'Cache-Cotrol': 'no-cache'},
    // });
    // // 更新 notes
    // const updateNotes = async () => {
    //   let wrap;
    //   try {
    //     let response = await anAxios.request({
    //       url: "notes.md",
    //       method: 'get',
    //     });
    //     wrap = (response.data);
    //   } catch (error) {
    //     alertBox.pushAlert(`获取 notes 时出错！（${error}）`, "danger", 5000, error);
    //     throw error;
    //     return;
    //     // return;
    //   };
    // };






    // const theBoard
    // const getMemoList













































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
      await syncUser();
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

        spDB.extendUser(user);

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





























































    const isManager = (user) => {
      return user.role?.includes?.('manager') || user.role?.includes?.('admin');
    };

    const userProgress = (user) => {
      return spDB.userProgress(user);
    };

    const theDB = spDB;

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
      connect,
      disconnect,


      isManager,
      userProgress,




      theDB,




      // store,
      theSaver,
      // dbWorker,
      // workerState,
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
      //
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
      // editUser,
      setAsQuitted,
      setNotQuitted,
      setAsInspector,
      setNotInspector,
      saveUpdatedUser,
      makeNewUsers,
      //
      //
      //
      // onImportEntryTable,
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
      // theBoard,
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


import LoginPanel from './components/LoginPanel.cpnt.mjs.js';
the_app.component('login-panel', LoginPanel);
import DataPanel from './components/DataPanel.cpnt.mjs.js';
the_app.component('data-panel', DataPanel);
import StatisticPanel from './components/StatisticPanel.cpnt.mjs.js';
the_app.component('statistic-panel', StatisticPanel);



import UserListPanel from './components/UserListPanel.cpnt.mjs.js';
the_app.component('user-list-panel', UserListPanel);
// import UserListControl from './components/UserListControl.cpnt.mjs.js';
// the_app.component('user-list-control', UserListControl);
// import UserListItem from './components/UserListItem.cpnt.mjs.js';
// the_app.component('user-list-panel', UserListItem);


import UserEditor from './components/UserEditor.cpnt.mjs.js';
the_app.component('user-editor', UserEditor);
import UserImporter from './components/UserImporter.cpnt.mjs.js';
the_app.component('user-importer', UserImporter);



const app = the_app.mount('#bodywrap');
window.app = app;
// the_app.config.globalProperties.$axios = axios;  // 用 app.theBackEnd 就可以调试了。

export default app;
