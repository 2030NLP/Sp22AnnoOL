
import Sp22FN from './sp22fn.mjs.js';
import { assert } from './util.mjs.js';

class Sp22DB {

  constructor(dbBasic, lodash) {
    this.useDB(dbBasic);
    this.useLodash(lodash);
    this.state={};
    this.resetState();
  }

  useDB(db) {
    this.db = db;
    if (!this.db.entries) {
      this.db.entries = [];
    };
    if (!this.db.tasks) {
      this.db.tasks = [];
    };
    if (!this.db.users) {
      this.db.users = [];
    };
    if (!this.db.annos) {
      this.db.annos = [];
    };

    if (!this.db.entryDict) {
      this.db.entryDict = {};
    };
    if (!this.db.taskDict) {
      this.db.taskDict = {};
    };
    if (!this.db.userDict) {
      this.db.userDict = {};
    };
    if (!this.db.annoDict) {
      this.db.annoDict = {};
    };
  }

  assignDB(db) {
    Object.assign(this.db, {
      entries: [],
      tasks: [],
      users: [],
      annos: [],
      entryDict: {},
      taskDict: {},
      userDict: {},
      annoDict: {},
    });
    Object.assign(this.db, db);
  }

  useLodash(lodash) {
    this.lodash = lodash;
    this.lo = this.lodash;
  }

  useState(state) {
    Object.assign(state, this.state);
    this.state = state;
  }

  resetState() {
    Object.assign(this.state, {
      createdAt: JSON.parse(JSON.stringify(new Date())),
      modifiedAt: JSON.parse(JSON.stringify(new Date())),

      entriesExtended: false,
      tasksExtended: false,
      usersExtended: false,
      annosExtended: false,

      entryDictBuilt: false,
      taskDictBuilt: false,
      userDictBuilt: false,
      annoDictBuilt: false,
    });
  }

  toObject() {
    const object = {
      db: {
        entries: this.db.entries,
        tasks: this.db.tasks,
        users: this.db.users,
        annos: this.db.annos,
      },  // this.lo.pick(this.db, ['entries', 'tasks', 'users', 'annos']),
      cache: this.cache,
      state: JSON.parse(JSON.stringify(this.state)),
    };
    object.state.entryDictBuilt = false;
    object.state.taskDictBuilt = false;
    object.state.userDictBuilt = false;
    object.state.annoDictBuilt = false;
    if (!this.completelyNotExtended || !this.allDictsNotBuilt) {
      object.state.modifiedAt = JSON.parse(JSON.stringify(new Date()));
    };
    return object;
  }

  toSave() {
    return this.toObject();
  }

  async loadSave(savedObject) {
    console.log('savedObject', savedObject);
    this.assignDB(savedObject.db);
    this.cache = savedObject.cache;
    Object.assign(this.state, savedObject.state);
    // await this.extendNecessary();
    return this;
  }

  async fix() {
    // console.log('before fix', JSON.parse(JSON.stringify(this)));
    if (!this.state.entryDictBuilt) {await this.buildEntryDict();};
    if (!this.state.taskDictBuilt) {await this.buildTaskDict();};
    if (!this.state.userDictBuilt) {await this.buildUserDict();};
    if (!this.state.annoDictBuilt) {await this.buildAnnoDict();};
    await this.extendNecessary();
    // console.log('after fix', JSON.parse(JSON.stringify(this)));
  }

  static fromSave(savedObject, lo) {
    const db = new Sp22DB({}, lo);
    db.loadSave(savedObject);
    return db;
  }

  updateModified() {
    this.state.modifiedAt = JSON.parse(JSON.stringify(new Date()));
  };

  get entries() { return this.db.entries; }
  get tasks() { return this.db.tasks; }
  get users() { return this.db.users; }
  get annos() { return this.db.annos; }
  get entryDict() { return this.db.entryDict; }
  get taskDict() { return this.db.taskDict; }
  get userDict() { return this.db.userDict; }
  get annoDict() { return this.db.annoDict; }

  buildEntryDict() {
    this.db.entryDict = this.lo.keyBy(this.entries, 'id');
    this.state.entryDictBuilt = true;
    this.updateModified();
  };
  buildTaskDict() {
    this.db.taskDict = this.lo.keyBy(this.tasks, 'id');
    this.state.taskDictBuilt = true;
    this.updateModified();
  };
  buildUserDict() {
    this.db.userDict = this.lo.keyBy(this.users, 'id');
    this.state.userDictBuilt = true;
    this.updateModified();
  };
  buildAnnoDict() {
    this.db.annoDict = this.lo.keyBy(this.annos, 'id');
    this.state.annoDictBuilt = true;
    this.updateModified();
  };
  buildAllDicts() {
    this.buildEntryDict();
    this.buildTaskDict();
    this.buildUserDict();
    this.buildAnnoDict();
  }

  get isEmpty() { return !this.entries.length && !this.tasks.length && !this.users.length && !this.annos.length; }
  get isNotEmpty() { return !this.isEmpty; }
  get completelyExtended() { return this.state.entriesExtended && this.state.tasksExtended && this.state.usersExtended && this.state.annosExtended; }
  get allDictsBuilt() { return this.state.entryDictBuilt && this.state.taskDictBuilt && this.state.userDictBuilt && this.state.annoDictBuilt; }
  get completelyNotExtended() { return !this.state.entriesExtended && !this.state.tasksExtended && !this.state.usersExtended && !this.state.annosExtended; }
  get allDictsNotBuilt() { return !this.state.entryDictBuilt && !this.state.taskDictBuilt && !this.state.userDictBuilt && !this.state.annoDictBuilt; }

  entry(id) {
    // if (!Object.keys(this.db.entryDict??{})) {
    //   this.buildEntryDict();
    // };
    return this.db.entryDict[id];
  }
  task(id) {
    // if (!Object.keys(this.db.taskDict??{})) {
    //   this.buildTaskDict();
    // };
    return this.db.taskDict[id];
  }
  user(id) {
    // if (!Object.keys(this.db.userDict??{})) {
    //   this.buildUserDict();
    // };
    return this.db.userDict[id];
  }
  anno(id) {
    // if (!Object.keys(this.db.annoDict??{})) {
    //   this.buildAnnoDict();
    // };
    return this.db.annoDict[id];
  }

  getAnnoByUserAndTask(user_id, task_id) {
    if (!this.cache) {
      this.cache = {};
    };
    if (!this.cache.dictOfAnnoByUserAndTask) {
      this.cache.dictOfAnnoByUserAndTask = {};
    };
    if (!(`${user_id}/${task_id}` in this.cache.dictOfAnnoByUserAndTask)) {
      let found = this.lo.find(this.annos, it => it.user==user_id && it.task==task_id);
      if (found) {
        this.cache.dictOfAnnoByUserAndTask[`${user_id}/${task_id}`] = found.id;
        this.updateModified();
      };
    };
    return this.cache.dictOfAnnoByUserAndTask[`${user_id}/${task_id}`];
  }

  topics() { return this.lo.uniq(this.tasks.map(it=>it.topic)); }
  batches() { return this.lo.uniq(this.tasks.map(it=>it.batche)); }
  batchNames() { return this.lo.uniq(this.tasks.map(it=>it.batchName)); }
  topicLabels() {
    let result = this.lo.uniq(this.annos.map(it=>{
      if (!this.state.annosExtended) {
        it.topic = this.task(it.task)?.topic;
      };
      let annoTopicLabels = [];
      for (let annot of it?.content?.annotations??[]) {
        let topicLabel = `${it.topic}-${annot.label??"<null>"}`;
        annoTopicLabels.push(topicLabel);
      };
      return annoTopicLabels;
    }).flat());
    if (!this.state.annosExtended) {
      this.updateModified();
    };
    return result;
  }

  static computeAnnoTimeInfo(anno) {
    return Sp22FN.computeAnnoTimeInfo(anno);
  }

  async extendUserByTask(user, task) {
    if (!task.to?.includes?.(user.id)) {return};

    if (!this.lo.isArray(user.allTasks)) {
      user.allTasks = [];
    };
    user.allTasks.push(task.id);
    user.allTasks = this.lo.uniq(user.allTasks);

    if (task.batch > (user.currBatch??0)) {
      user.currBatch = task.batch;
      user.currBatchName = task.batchName;
    };

    this.updateModified();
  }

  async extendEntryByTask(entry, task) {
    if (task.entry!=entry.id) {return};

    if (!this.lo.isArray(entry.allTasks)) {
      entry.allTasks = [];
    };
    entry.allTasks.push(task.id);
    entry.allTasks = this.lo.uniq(entry.allTasks);

    if (entry.polygraphType) {
      task.polygraph = entry.polygraph;
      task.polygraphType = entry.polygraphType;
    };

    this.updateModified();
  }

  async extendTask(task) {
    for (let user_id of task.to??[]) {
      let user = this.user(user_id);
      if (!user) {continue};
      await this.extendUserByTask(user, task);
    };

    for (let entry_id of [task.entry]) {
      let entry = this.entry(entry_id);
      if (!entry) {break};
      await this.extendEntryByTask(entry, task);
    };

    this.updateModified();
  }

  async extendTasks() {
    console.time('extendTasks');
    // require tasks, annos, users, entries
    // change tasks, users, entries

    for await (let task of this.tasks) {
      await this.extendTask(task);
      this.db.taskDict[task.id] = task;
    };
    this.state.taskDictBuilt = true;
    this.state.tasksExtended = true;
    this.updateModified();
    console.timeEnd('extendTasks');
  }

  async extendUserByAnno(user, anno) {
    if (anno.user!=user.id) {return};

    if (!this.lo.isArray(user.allAnnos)) {
      user.allAnnos = [];
    };
    user.allAnnos.push(anno.id);
    user.allAnnos = this.lo.uniq(user.allAnnos);

    if (!this.lo.isArray(user.doneTasks)) {
      user.doneTasks = [];
    };

    // TODO: 区分 needCompletion 的 annot 到底是否 completed

    user.doneTasks.push(anno.task);
    user.doneTasks = this.lo.uniq(user.doneTasks);

    this.updateModified();
  }

  async extendEntryByAnno(entry, anno) {
    if (anno.entry!=entry.id) {return};

    if (!this.lo.isArray(entry.allAnnos)) {
      entry.allAnnos = [];
    };
    entry.allAnnos.push(anno.id);
    entry.allAnnos = this.lo.uniq(entry.allAnnos);

    if (entry.polygraphType) {
      anno.polygraph = entry.polygraph;
      anno.polygraphType = entry.polygraphType;
    };

    this.updateModified();
  }

  async extendAnno(anno) {
    if (!this.cache) {
      this.cache = {};
    };
    if (!this.cache.dictOfAnnoByUserAndTask) {
      this.cache.dictOfAnnoByUserAndTask = {};
    };

    anno._timeInfo = Sp22FN.computeAnnoTimeInfo(anno);

    this.cache.dictOfAnnoByUserAndTask[`${anno.user}/${anno.task}`] = anno.id;

    for (let task_id of [anno.task]) {
      let task = this.task(anno.task);
      if (!task) {continue};
      if (!anno.topic) {
        anno.topic = task.topic;
      };
      anno.batch = task.batch;
      anno.batchName = task.batchName;

      if (!task.submitters) {
        task.submitters = [];
      };
      task.submitters.push(anno.user);
      task.submitters = this.lo.uniq(task.submitters);
      task.enough = ((task.to?.length??0) <= (task.submitters?.length??0));
    };

    for (let user_id of [anno.user]) {
      let user = this.user(user_id);
      if (!user) {continue};
      await this.extendUserByAnno(user, anno);
    };

    for (let entry_id of [anno.entry]) {
      let entry = this.entry(entry_id);
      if (!entry) {break};
      await this.extendEntryByAnno(entry, anno);
    };

    this.updateModified();
  }

  async extendAnnos() {
    console.time('extendAnnos');
    // require tasks, annos, users, entries
    // change annos, tasks, users, entries

    for await (let anno of this.annos) {
      await this.extendAnno(anno);
      this.db.annoDict[anno.id] = anno;
    };
    this.state.annoDictBuilt = true;
    this.state.annosExtended = true;
    this.updateModified();
    console.timeEnd('extendAnnos');
  }

  async extendUser(user) {
    const userTasks = this.tasks.filter(it=>it.to.includes(user.id));
    for await (let task of userTasks) {
      await this.extendUserByTask(user, task);
    };
    const userAnnos = this.annos.filter(it=>it.user==user.id);
    for await (let anno of userAnnos) {
      await this.extendUserByAnno(user, anno);
    };
  }

  async extendUsers() {
    assert(this.state.tasksExtended);
    assert(this.state.annosExtended);
    for await (let user of this.users) {
      this.db.userDict[user.id] = user;
    };
    this.state.userDictBuilt = true;
    this.state.usersExtended = true;
    this.updateModified();
  }


  wordAt(entry, idx) {
    if (!entry?.content?.material?.tokenList?.length) {
      return "";
    };
    let token = entry.content.material.tokenList[idx];
    return token?.to?.word ?? token?.word ?? "";
  }


  async extendEntry(entry) {
    const entryTasks = this.tasks.filter(it=>it.entry==entry.id);
    for await (let task of entryTasks) {
      await this.extendEntryByTask(entry, task);
    };
    const entryAnnos = this.annos.filter(it=>it.entry==entry.id);
    for await (let anno of entryAnnos) {
      await this.extendEntryByAnno(entry, anno);
      //
      // 补全 anno 的字面内容
      // on, tokenarrays
      if (entry?.content?.material?.tokenList?.length) {
        for (let annot of anno?.content?.annotations??[]) {
          if (annot.on) {
            annot.onText = annot.on.map(idx => this.wordAt(entry, idx)).join("");
          };
          if (annot.tokenarrays) {
            annot.tokenarrayTexts = annot.tokenarrays.map(tokenarray => tokenarray.map(idx => this.wordAt(entry, idx)).join(""));
          };
        };
      };
      //
      //
    };
  }

  async extendEntries() {
    assert(this.state.tasksExtended);
    assert(this.state.annosExtended);
    for await (let entry of this.entries) {
      this.db.entryDict[entry.id] = entry;
    };
    this.state.entryDictBuilt = true;
    this.state.entriesExtended = true;
    this.updateModified();
  }

  async extendAll() {
    await this.extendTasks();
    await this.extendAnnos();
    await this.extendUsers();
    await this.extendEntries();
  }

  async extendNecessary() {
    if (!this.state.tasksExtended) {await this.extendTasks();};
    if (!this.state.annosExtended) {await this.extendAnnos();};
    if (!this.state.usersExtended) {await this.extendUsers();};
    if (!this.state.entriesExtended) {await this.extendEntries();};
  }

  resetTasks(tasks) {
    this.db.tasks = tasks;
    this.state.tasksExtended = false;
    this.state.annosExtended = false;
    this.state.usersExtended = false;
    this.state.entriesExtended = false;
    this.state.taskDictBuilt = false;
    this.updateModified();
  }

  async resetAndExtendTasks(tasks) {
    this.resetTasks(tasks);
    await this.extendTasks();
    this.updateModified();
  }

  resetAnnos(annos) {
    this.db.annos = annos;
    this.state.tasksExtended = false;
    this.state.annosExtended = false;
    this.state.usersExtended = false;
    this.state.entriesExtended = false;
    this.state.annoDictBuilt = false;
    this.updateModified();
  }

  async resetAndExtendAnnos(annos) {
    this.resetAnnos(annos);
    await this.extendAnnos();
    this.updateModified();
  }

  resetUsers(users) {
    this.db.users = users;
    this.state.tasksExtended = false;
    this.state.annosExtended = false;
    this.state.usersExtended = false;
    this.state.userDictBuilt = false;
    this.updateModified();
  }

  async resetAndExtendUsers(users) {
    this.resetUsers(users);
    await this.extendTasks();
    await this.extendAnnos();
    await this.extendUsers();
    this.updateModified();
  }

  resetEntries(entries) {
    this.db.entries = entries;
    this.state.tasksExtended = false;
    this.state.annosExtended = false;
    this.state.entriesExtended = false;
    this.state.entryDictBuilt = false;
    this.updateModified();
  }

  async resetAndExtendEntries(entries) {
    this.resetEntries(entries);
    await this.extendTasks();
    await this.extendAnnos();
    await this.extendEntries();
    this.updateModified();
  }






  userCurrTasks(user, batchName) {
    let tt = user.allTasks ?? [];
    if (batchName==null) {batchName=user?.currBatchName};
    return this.lo.filter(tt, task_id => this.task(task_id)?.batchName==batchName);
    // return this.lo.filter(tt, task_id => Sp22FN.topic_regulation(this.task(task_id)?.topic)==Sp22FN.topic_regulation(user.currTask));
  }
  userCurrDoneTasks(user, batchName) {
    let tt = user.doneTasks ?? [];
    if (batchName==null) {batchName=user?.currBatchName};
    return this.lo.filter(tt, task_id => this.task(task_id)?.batchName==batchName);
    // return this.lo.filter(tt, task_id => Sp22FN.topic_regulation(this.task(task_id)?.topic)==Sp22FN.topic_regulation(user.currTask));
  }
  userProgress(user, batchName) {
    let cDoneLen = this.userCurrDoneTasks(user, batchName).length;
    let cDueLen = this.userCurrTasks(user, batchName).length;
    let bg = Math.max(cDoneLen, cDueLen);
    let mn = Math.min(cDoneLen, cDueLen);
    let pct = bg==0 ? `0` : `${(mn/bg*100).toFixed(2)}%`;
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
  }
  userCurrBatchTasks(user) {
    let tt = user.allTasks ?? [];
    return this.lo.filter(tt, task_id => this.task(task_id)?.batchName==user.currBatchName);
  }
  userCurrBatchDoneTasks(user) {
    let tt = user.doneTasks ?? [];
    return this.lo.filter(tt, task_id => this.task(task_id)?.batchName==user.currBatchName);
  }
  userCurrBatchProgress(user) {
    let cDoneLen = this.userCurrBatchDoneTasks(user).length;
    let cDueLen = this.userCurrBatchTasks(user).length;
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
  }

  userPairs() {
    return Sp22FN.userPairs(this);
  }


  consistanceReportForTask1() {
    let report = Sp22FN.所有用户在task1语料上的标注一致性报告(this);
    console.log(report);
    return report;
  }






  inspectionSum(user, batchName) {
    if (batchName==null) {batchName=user?.currBatchName};
    let annos = (user?.allAnnos??[]).map(it=>this.anno(it)).filter(it=>it?.batchName==batchName);
    let sum = this.lo.countBy(annos, anno=>anno?.content?.review?.accept);
    sum.sum = (sum.false??0) + (sum.true??0);
    sum.passRatio = sum.sum==0 ? null : (sum.true??0)/sum.sum;
    return sum;
  };

  firstInspectionSum(user, batchName) {
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
    const 是否经过审核 = (anno) => {
      return 求标签不连续出现次数(anno?.content?._ctrl?.timeLog?.map?.(it=>it[0]), "check") > 0;
    };
    const 是否只审核了一次 = (anno) => {
      return 求标签不连续出现次数(anno?.content?._ctrl?.timeLog?.map?.(it=>it[0]), "check") === 1;
    };
    const 是否初审就通过 = (anno) => {
      return anno?.content?.review?.accept && 是否只审核了一次(anno);
    };
    if (batchName==null) {batchName=user?.currBatchName};
    let annos = (user?.allAnnos??[]).map(it=>this.anno(it)).filter(it=>it?.batchName==batchName&&是否经过审核(it));
    let sum = this.lo.countBy(annos, anno=>是否初审就通过(anno));
    sum.sum = (sum.false??0) + (sum.true??0);
    sum.passRatio = sum.sum==0 ? null : (sum.true??0)/sum.sum;
    return sum;
  };

  sortFnByPassRatio(u1, u2, batchName) {
    let ins1 = this.inspectionSum(u1, batchName);
    let ins2 = this.inspectionSum(u2, batchName);
    if (!ins1.false && !ins1.true) {return true};
    if (!ins2.false && !ins2.true) {return false};
    let r1 = ins1.passRatio - ins2.passRatio;
    if (r1!=0) {return r1;};
    return (ins1.true??0) - (ins2.true??0);
  };

  sortFnByPassRatioR(u1, u2, batchName) {
    let ins1 = this.inspectionSum(u1, batchName);
    let ins2 = this.inspectionSum(u2, batchName);
    if (!ins1.false && !ins1.true) {return true};
    if (!ins2.false && !ins2.true) {return false};
    let r1 = ins2.passRatio - ins1.passRatio;
    if (r1!=0) {return r1;};
    return (ins2.true??0) - (ins1.true??0);
  };

  sortFnByPrimaryPassRatio(u1, u2, batchName) {
    let ins1 = this.firstInspectionSum(u1, batchName);
    let ins2 = this.firstInspectionSum(u2, batchName);
    if (!ins1.false && !ins1.true) {return true};
    if (!ins2.false && !ins2.true) {return false};
    let r1 = ins1.passRatio - ins2.passRatio;
    if (r1!=0) {return r1;};
    return (ins1.true??0) - (ins2.true??0);
  };

  sortFnByPrimaryPassRatioR(u1, u2, batchName) {
    let ins1 = this.firstInspectionSum(u1, batchName);
    let ins2 = this.firstInspectionSum(u2, batchName);
    if (!ins1.false && !ins1.true) {return true};
    if (!ins2.false && !ins2.true) {return false};
    let r1 = ins2.passRatio - ins1.passRatio;
    if (r1!=0) {return r1;};
    return (ins2.true??0) - (ins1.true??0);
  };






  annoLabelTextStatisticsForEntry(entry) {
    return Sp22FN.annoLabelTextStatisticsForEntry(entry, this);
  }













  computeTopicTaskDict() {
    return this.lo.groupBy(this.tasks, 'topic');
  }

  computeBatchNameTaskDict() {
    return this.lo.groupBy(this.tasks, 'batchName');
  }








  labelAnnoDict() {
    return Sp22FN.labelAnnoDict(this.annos, this.lo);
  }





































































































}

export default Sp22DB;
