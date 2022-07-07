
// 基本信息 变量
const APP_NAME = "Sp22-Anno-Master";

import {
  APP_VERSION,
  DEVELOPING,
  API_BASE_DEV_LOCAL,
  DEV_HOSTS,
  API_BASE_DEV,
  API_BASE_PROD,
  API_BASE
} from './master_constants.mjs.js';

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
      "user-tags-editor": "user-tags-editor",
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
      "finder": "finder",
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

      精标定义: {},
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
      // entry_id=`${+entry_id}`;
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
      userAnnos.list = lo.sortBy((user?.allAnnos??[]).map(it=>spDB.anno(it)), [annoSortFn, it=>(-it?.batch)]);
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










































    // 一个 axios 实例，方便在控制台调试
    const anAxios = axios.create({
      headers: {'Cache-Cotrol': 'no-cache'},
    });

    const 更新精标定义 = async () => {
      let wrap;
      try {
        let response = await anAxios.request({
          url: `schema/steps.schema.json?x=${Math.ceil(Math.random()*999999999)}`,
          headers: {'Cache-Cotrol': 'no-cache'},
          method: 'get',
        });
        wrap = (response.data);
        console.log(wrap);
      } catch (error) {
        console.log("获取精标定义时出错");
        console.log(error);
      };
      ctrl.精标定义 = wrap?.精标?.steps?.start?.props?.definition;
    };

    onMounted(更新精标定义);



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

    const setTask = async (user, topicLabel) => {
      if (user.currTask==topicLabel) {
        alertBox.pushAlert(`${user.name} 的任务本来就是 ${topicLabel}`, 'warning', 5000);
        return;
      };
      let newUser = foolCopy({
        id: user.id,
        currTask: topicLabel,
      });
      await saveUpdatedUser(user, newUser);
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












































    const getWorkloadOfAllOf = async (userId) => {
      let 审核包 = (await getWorkloadOfReviewerOf(userId)) ?? {list:[], name:""};
      let 审核情况 = 审核包.list;
      let name = 审核包.name
      let 标注情况 = (await getWorkloadOf(userId)) ?? [];

      let 汇总 = [];

      for (let it of 标注情况) {
        汇总.push([userId, name, it[1]?.level, it[0], it[1]?.detail, "标"]);
      };

      for (let it of 审核情况) {
        汇总.push([userId, name, it[1]?.level, it[0], it[1]?.detail, "审"]);
      };

      return 汇总;
    }


    const getWorkloadOf = async (userId) => {
      try {
        // console.log(this);
        let resp = await theBackEnd.getWorkload(userId);
        if (errorHappened(resp?.data?.err)) {
          return null;
        };

        console.log(resp?.data?.data);

        const 求标签不连续出现次数 = (labels, label) => {
          let num = 0;
          let lastLabel;
          for (let lb of labels) {
            if (lb === label && lastLabel != label) {
              num++;
            };
            lastLabel = lb;
          };
          return num;
        };

        let user = resp?.data?.data?.[0];
        let all_annos = user?.all_anno_items;
        let apples = [];
        for (let anno of all_annos) {
          let task = anno?.task_wrap?.[0];
          let apple = Object.assign({}, task);

          let 审核次数 = 求标签不连续出现次数(anno?.content?._ctrl?.timeLog?.map?.(it=>it[0]), "check");
          let 审核次数字符 = 审核次数==0?"0":审核次数==1?"1":"多";

          apple.审核次数文本 = 审核次数字符=="0"?"无次数":审核次数字符=="1"?"初审后":"多次审核后";

          apple.审核情况 =
            anno?.content?.review?.accept===true ? "通过" :
            anno?.content?.review?.accept===false ? "否决" :
            anno?.content?.review==null ? "未审核" : "奇怪";
          apple.审核后修改情况 =
            anno?.content?.review?.checked===true ? "有修改" : "未修改";
            // anno?.content?.review?.checked===false ? "未修改" :
            // anno?.content?.review==null ? "未审核" : "不知是否修改";
          apples.push(apple);
        };

        let dict = {};

        for (let apple of apples) {
          let clue = `${apple.审核次数文本}|${apple.审核情况}|${apple.审核后修改情况}`;
          if (dict["总体情况"]==null) {dict["总体情况"]={detail: {}}};
          dict.总体情况.detail[clue] = (dict.总体情况.detail[clue]??0)+1;
          dict.总体情况["level"] = 0;

          let topic = apple.topic;
          if (dict[topic]==null) {dict[topic]={detail: {}}};
          dict[topic].detail[clue] = (dict[topic].detail[clue]??0)+1;
          dict[topic]["level"] = 1;

          let batchName = apple.batchName;
          if (dict[batchName]==null) {dict[batchName]={detail: {}}};
          dict[batchName].detail[clue] = (dict[batchName].detail[clue]??0)+1;
          dict[batchName]["level"] = 2;
        };

        let dictList = Object.entries(dict);

        dictList = lo.sortBy(dictList, [it=>it[1]?.level, it=>it[0]]);

        return dictList;

      } catch (error) {
        return null;
      };
    }


    const getWorkloadOfReviewerOf = async (userId) => {
      try {
        // console.log(this);
        let resp = await theBackEnd.getWorkloadOfReviewer(userId);
        if (errorHappened(resp?.data?.err)) {
          console.log(resp);
          return null;
        };

        console.log(resp?.data?.data);
        let data = resp?.data?.data;

        let reviewed_annos = data.reviewed_annos;
        let name = data.user_name;

        // return data;

        let apples = [];
        for (let anno of reviewed_annos) {
          let task = anno?.task_wrap?.[0];
          let apple = Object.assign({}, task);
          let 初审者 = anno?.content?._ctrl?.timeLog?.find?.(it=>it[0]=="check")?.[2];
          apple.审核类型 = 初审者?.name==name||初审者?.id==userId ? "初审" : "纯复审";

          let 审核次数 = 0;
          let 不连续审核次数 = 0;
          let lastIsCheck = false;
          let lastCheckerName = "";
          for (let it of (anno?.content?._ctrl?.timeLog??[])) {
            if (it[0] === "check") {
              if (it?.[2]?.name==name||it?.[2]?.id==userId) {
                审核次数++;
                if (!lastIsCheck) {
                  不连续审核次数++;
                };
                lastIsCheck = true;
              };
              lastCheckerName = it[2]?.name;
            } else {
              lastIsCheck = false;
            };
          };
          apple.复审次数 = 审核次数 - (apple.审核类型=="初审"?1:0);
          apple.不连续复审次数 = 不连续审核次数 - (apple.审核类型=="初审"?1:0);

          apples.push(apple);
        };

        let dict = {};

        for (let apple of apples) {
          let clue = apple.审核类型;

          if (dict["总体情况"]==null) {dict["总体情况"]={detail: {}}};
          dict.总体情况.detail[clue] = (dict.总体情况.detail[clue]??0)+1;
          dict.总体情况["level"] = 0;

          let topic = apple.topic;
          if (dict[topic]==null) {dict[topic]={detail: {}}};
          dict[topic].detail[clue] = (dict[topic].detail[clue]??0)+1;
          dict[topic]["level"] = 1;

          let batchName = apple.batchName;
          if (dict[batchName]==null) {dict[batchName]={detail: {}}};
          dict[batchName].detail[clue] = (dict[batchName].detail[clue]??0)+1;
          dict[batchName]["level"] = 2;

          // if (clue=="纯复审") {
            dict.总体情况.detail["复审次数"] = (dict.总体情况.detail["复审次数"]??0)+apple.复审次数;
            dict.总体情况.detail["不连续复审次数"] = (dict.总体情况.detail["不连续复审次数"]??0)+apple.不连续复审次数;
            dict[topic].detail["复审次数"] = (dict[topic].detail["复审次数"]??0)+apple.复审次数;
            dict[topic].detail["不连续复审次数"] = (dict[topic].detail["不连续复审次数"]??0)+apple.不连续复审次数;
            dict[batchName].detail["复审次数"] = (dict[batchName].detail["复审次数"]??0)+apple.复审次数;
            dict[batchName].detail["不连续复审次数"] = (dict[batchName].detail["不连续复审次数"]??0)+apple.不连续复审次数;
          // };
        };

        let dictList = Object.entries(dict);

        dictList = lo.sortBy(dictList, [it=>it[1]?.level, it=>it[0]]);

        return {list: dictList, name};

      } catch (error) {
        console.log(error);
        return null;
      };
    }





    const 输出所有人的工作量信息 = async () => {
      let big_list = [];
      for (let user of spDB.users) {
        console.log([user.id, user.name]);
        let list = (await getWorkloadOfAllOf(user.id))??[];
        big_list = [...big_list, ...list];
      };
      return big_list;
    };










    const isManager = (user) => {
      return user.role?.includes?.('manager') || user.role?.includes?.('admin');
    };
    const isMaster = (user) => {
      return user.role?.includes?.('admin');
    };

    const userProgress = (user) => {
      return spDB.userProgress(user);
    };

    const theDB = spDB;

    return {

      APP_NAME,
      APP_VERSION,

      //
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
      isMaster,
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
      getWorkloadOfAllOf,
      getWorkloadOf,
      getWorkloadOfReviewerOf,
      输出所有人的工作量信息,
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

import FinderPanel from './components/FinderPanel.cpnt.mjs.js';
the_app.component('finder-panel', FinderPanel);

import TaskAssignPanel from './components/TaskAssignPanel.cpnt.mjs.js';
the_app.component('task-assign-panel', TaskAssignPanel);

import UserListPanel from './components/UserListPanel.cpnt.mjs.js';
the_app.component('user-list-panel', UserListPanel);
// import UserListControl from './components/UserListControl.cpnt.mjs.js';
// the_app.component('user-list-control', UserListControl);
// import UserListItem from './components/UserListItem.cpnt.mjs.js';
// the_app.component('user-list-panel', UserListItem);


import UserTagsEditor from './components/UserTagsEditor.cpnt.mjs.js';
the_app.component('user-tags-editor', UserTagsEditor);
import UserEditor from './components/UserEditor.cpnt.mjs.js';
the_app.component('user-editor', UserEditor);
import UserImporter from './components/UserImporter.cpnt.mjs.js';
the_app.component('user-importer', UserImporter);



// import BsBadge from './components/bs/BsBadge.cpnt.mjs.js';
// the_app.component('bs-badge', BsBadge);


const app = the_app.mount('#bodywrap');
window.app = app;
// the_app.config.globalProperties.$axios = axios;  // 用 app.theBackEnd 就可以调试了。

export default app;
