// modifiedAt: 2022-05-09

import { dateString, timeString, foolCopy } from '../util.mjs.js';



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


const errorHappened = (err) => {
  if (err == null) {
    // console.log('err == null');
    return false;
  };
  if (typeof(err)=="string" && err.length==0) {
    // console.log('typeof(err)=="string" && err.length==0');
    return false;
  };
  if (err instanceof Array && err.length==0) {
    // console.log('err instanceof Array && err.length==0');
    return false;
  };
  if (typeof(err)=="number" && (err==200||err<=0)) {
    // console.log('typeof(err)=="number" && err<=0');
    return false;
  };
  if (typeof(err)=="string" && parseInt(err)<=0) {
    // console.log('typeof(err)=="string" && parseInt(err)<=0');
    return false;
  };
  if (!(err instanceof Array) && err instanceof Object && (Object.keys(err).length==0)) {
    // console.log('err instanceof Object ...');
    return false;
  };
  if (!(err instanceof Array) && err instanceof Object &&
    (
      !errorHappened(err?.code) &&
      !errorHappened(err?.message) &&
      !errorHappened(err?.msg) &&
      !errorHappened(err?.Code) &&
      !errorHappened(err?.Message) &&
      !errorHappened(err?.Msg) &&
      !errorHappened(err?.MSG)
    )
  ) {
    console.log('err instanceof Object ...');
    return false;
};
  return true;
};

class BackEndUsage {
  constructor(appPack, checkDB={}) {
    this.data = appPack.reactive_data;
    this.ewp = appPack.reactive_exam_wrap;

    this.tokenSelector = appPack.tokenSelector;

    this.stepCtrl = appPack.stepCtrl;

    this.updateSchema = appPack.updateSchemaFn;

    this.backEnd = appPack.theBackEnd;
    this.pushAlert = appPack.pushAlertFn ?? function(){console.log([...arguments])};
    this.removeAlert = appPack.removeAlertFn ?? function(){console.log([...arguments])};

    this.appName = appPack.appName;
    this.appVersion = appPack.appVersion;

    this.storeTool = appPack.storeTool;
    this.lo = appPack.lodash;

    this.checkDB = checkDB;

    this.playMode = false;
    this.inspectingMode = false;

    // console.log(this);
  }
  static new(appPack, checkDB) {
    return new BackEndUsage(appPack, checkDB);
  }

  updateProgress() {
    this.data.ctrl.doneNum = this.data.tasks.filter(it=>it.done&&(it.valid||it.dropped)).length ?? 0;
    this.data.ctrl.totalNum = this.data.tasks.length ?? 1;
    this.data.ctrl.donePct = `${Math.min(100, this.data.ctrl.doneNum / this.data.ctrl.totalNum * 100)}%`;
  }

  saveStore() {
    if (this.playMode||this.inspectingMode) {return};

    this.storeTool.set(`${this.appName}:version`, this.appVersion);
    // let worker = this.data.ctrl.currentWorker;
    // this.storeTool.set(`${this.appName}:worker`, worker);
    this.storeTool.set(`${this.appName}:it`, {
      worker: this.data.ctrl.currentWorker,
      workerId: this.data.ctrl.currentWorkerId,
      secret: this.data.ctrl.currentWorkerSecret,
      target: this.data.ctrl.currentWorkerTarget,
      taskType: this.data.ctrl.currentWorkerTaskType,
      taskCount: this.data.ctrl.currentWorkerTaskCount,
    });
  }

  // 对 后端 API 进行基础的使用 开始

  async touchTask(task_btn) {
    try {
      let resp = await this.backEnd.getThing(this.data.ctrl.currentWorkerId, task_btn?.id);
      // this.pushAlert(resp?.data);
      if (errorHappened(resp?.data?.err)) {
        this.pushAlert(`【发生错误】${resp?.data?.err}`, 'danger');
        return;
      };
      return resp?.data?.data;
    } catch (error) {
      this.pushAlert(error, 'danger');
    };
  }
  async touchTaskBtn(task_btn) {
    try {
      this.saveStore();
      await this.updateSchema();
      this.tokenSelector.clear(this.ewp.example?.material?.tokenList);
      //
      this.ewp.example = {
        _info: {
          btn_idx: task_btn.idx,
        },
      };
      //
      let thing = await this.touchTask(task_btn);
      this.updateProgress();
      // this.stepCtrl.updateProgress();
      if (thing?.entry) {
        let content = thing?.entry?.content;
        content.annotations = thing?.anno?.content?.annotations ?? [];
        content._ctrl = thing?.anno?.content?._ctrl ?? {};
        if (thing?.anno?.content?.review) {
          content.review = thing?.anno?.content?.review;
        };
        content._info = {
          btn_idx: task_btn.idx,
          batchName: task_btn.batchName,
          batch: task_btn.batch,
          task_id: thing?.task?.id,
          topic: thing?.task?.topic,
          entry_id: thing?.entry?.id,
          entry_ver: thing?.entry?.version,
          anno_id: thing?.anno?.id,
        };

        content._spes = await this.getSPE(thing?.entry?.originId);

        this.ewp.example = {};
        this.ewp.example = foolCopy(content);

        // this.pushAlert(this.ewp.example, 'light');

        // 还原步骤
        let stepRef;
        if (!this.ewp.example?._ctrl?.currentStepRef?.length) {
          stepRef = this.stepCtrl.stepsDictWrap?.[this.stepCtrl.stepsDictWrap?.using]?.startStep ?? 'start';
        } else {
          stepRef = this.ewp.example._ctrl.currentStepRef;
        };
        if (stepRef in this.stepCtrl.stepsDict) {
          await this.stepCtrl.goRefStep(stepRef);
        };
        this.tokenSelector.clear(this.ewp.example?.material?.tokenList);

        if (!this.ewp.example._ctrl?.timeLog?.length) {
          this.ewp.example._ctrl.timeLog = [];
        }
        const symbol_in = this.inspectingMode ? 'reviser_in' : 'in';
        this.ewp.example._ctrl.timeLog.push( [symbol_in, JSON.parse(JSON.stringify(new Date()))] );
        // TODO 区分 审核进入 的工作量计算？

        //
        this.data.ctrl.currentPage = 'anno';
        this.data.newThings.lastEID = thing?.entry?.id;
        if (!this.playMode&&!this.inspectingMode) {
          this.storeTool.set(`${this.appName}:lastEID`, this.data.newThings.lastEID);
        };

        return content;
      } else {
        console.log("thing:", thing);
      };
    } catch (error) {
      this.pushAlert(error, 'danger');
    };
  }

  async beginInspection() {
    try {
      await this.connect();
      await this.updateSchema();
    } catch (error) {
      this.pushAlert(`发生错误，请联系管理员处理（${error}）`, "danger", 60000*60*24, error);
      return;
    };
    this.data.ctrl.currentPage = 'chooseStudent';
  }

  async begin() {
    this.data.ctrl.currentPage = 'anno';
    try {
      await this.connect();
      await this.updateSchema();
    } catch (error) {
      this.pushAlert(`发生错误，请联系管理员处理（${error}）`, "danger", 60000*60*24, error);
      return;
    };
    this.data.ctrl.currentPage = 'anno';
    let lastEID = this?.data?.newThings?.lastEID ?? null;
    // 【寻找首条】
    // 参考 【队列排序】
    if (!this.playMode) {
      let btn =
        this.data.tasks.find(btn => btn.commented&&!btn.checked&&!btn.revised)  // 首条尚未处理的有批示的
        ?? this.data.tasks.find(btn => btn.rejectedTP==3&&!btn.checked&&!btn.revised)  // 首条尚未处理的未通过的
        ?? this.data.tasks.find(btn => !btn.done)
        ?? this.data.tasks.find(btn => btn.rejectedTP==3);
      if (btn) {
        await this.goIdx(btn.idx);
        return;
      };
    };
    await this.goIdx(0);
  }

  async getSPE(originId) {
    try {
      // console.log(this);
      let resp = await this.backEnd.getSPE(originId);
      if (errorHappened(resp?.data?.err)) {
        return [];
      };
      return resp?.data?.data?.SPEs;
    } catch (error) {
      return [];
    };
  }

  async connect() {
    // this.pushAlert("connect 开始", 'secondary');
    // console.log(this);
    try {
      // console.log(this);
      let resp = await this.backEnd.getMe();
      if (errorHappened(resp?.data?.err)) {
        this.pushAlert(`【发生错误】${resp?.data?.err}`, 'danger');
        return;
      };
      this.data.newThings.topic = resp?.currTask;  //以前是 TOPIC 的
      await this.updateUser(resp?.data?.data);
      this.pushAlert(`${resp?.data?.data?.name}的信息已同步`);
      if (this.data.ctrl.currentWorkerQuitted) {
        throw new Error("非活跃用户");
        return;
      }
      await this.updateTaskList();
      if (!this?.data?.tasks?.length) {
        throw new Error("目前没有任务");
        return;
      }
    } catch (error) {
      console.log(error);
      this.pushAlert(error, 'danger');
      throw error;
      return;
    };
    // this.pushAlert("connect 结束", 'secondary');
  }

  // async updateTarget() {
  //   // this.pushAlert("updateTarget 开始", 'secondary');
  //   try {
  //     let oldCount = this.data.ctrl.currentWorkerTaskCount;
  //     let target = this.data.ctrl.currentWorkerTarget;
  //     let delta = target - oldCount;
  //     if (delta <= 0) {
  //       this.pushAlert(`【操作取消】新目标要大于原始目标才行`, 'secondary');
  //       this.data.ctrl.currentWorkerTarget = this.data.ctrl.currentWorkerTaskCount;
  //       return;
  //     };
  //     if (delta > 50) {
  //       delta = 50;
  //       this.pushAlert(`【操作调整】新目标比原始目标多过50条，已自动调整`, 'secondary');
  //     };
  //     let resp = await this.backEnd.newTask(this.data.ctrl.currentWorkerId, delta, this.data.newThings.topic||null);
  //     if (errorHappened(resp?.data?.err)) {
  //       this.pushAlert(`【发生错误】${resp?.data?.err}`, 'danger');
  //       this.data.ctrl.currentWorkerTarget = this.data.ctrl.currentWorkerTaskCount;
  //       return;
  //     };
  //     await this.connect();
  //     let newDelta = this.data.ctrl.currentWorkerTaskCount - oldCount;
  //     if (newDelta <= 0) {
  //       this.pushAlert(`【操作未果】没有更多可分配的任务`, 'info');
  //       return
  //     };
  //     this.pushAlert(`【操作成功】已为您分配 ${newDelta} 条新任务`, 'success');
  //   } catch (error) {
  //     this.pushAlert(error, 'danger');
  //   };
  //   // this.pushAlert("updateTarget 结束", 'secondary');
  // }

  async makeCheckList(user_id, topic, batchName, batch) {}

  async extendCheckDB(data) {
    this.checkDB.users = data?.users??[];
    this.checkDB.tasks = data?.tasks??[];
    this.checkDB.annos = data?.annos??[];

    this.checkDB.userDict = this.lo.keyBy(this.checkDB.users, 'id');
    this.checkDB.taskDict = this.lo.keyBy(this.checkDB.tasks, 'id');
    this.checkDB.annoDict = this.lo.keyBy(this.checkDB.annos, 'id');

    this.checkDB.topics = this.lo.uniq(this.checkDB.tasks.map(task=>topic_regulation(task.topic)));
    this.checkDB.batchs = this.lo.uniq(this.checkDB.tasks.map(task=>topic_regulation(task.batch)));
    this.checkDB.batchNames = this.lo.uniq(this.checkDB.tasks.map(task=>topic_regulation(task.batchName)));
  }

  async updateCheckDB() {
    let aa = this.pushAlert("正在获取审查数据，请稍等……", "info", 99999999);
    try {
      let resp = await this.backEnd.getCheckDB();
      console.log(resp);
      this.removeAlert(aa);
      if (resp?.data?.code!=200) {
        this.pushAlert(`【发生错误】${resp?.data?.msg}`, 'danger', null, resp);
        return false;
      };

      await extendCheckDB(resp?.data?.data);

      this.pushAlert("完成", 'success', 2000);
    } catch (error) {
      this.removeAlert(aa);
      this.pushAlert(error, 'danger', 5000, error);
    };
    this.removeAlert(aa);
    return true;
  }

  async updateTaskList() {
    // this.pushAlert("updateTaskList 开始");
    try {
      let aa = this.pushAlert("正在获取任务列表，请稍等……", "info", 99999999);
      let resp = await this.backEnd.getWorkList();
      // console.log(resp);
      this.removeAlert(aa);
      // if (errorHappened(resp?.data?.err)) {
      //   this.pushAlert(`【发生错误】${resp?.data?.err}`, 'danger');
      //   return;
      // };
      let work_list = resp?.data?.data ?? [];
      // 【打乱】
      // work_list = this.lo.shuffle(work_list);
      // console.debug(work_list);
      let task_btn_list = [];
      for (let work of work_list) {
        let task = work.task;
        let anno = work?.anno;
        let done = anno?.content?.annotations?.length ? true : false
        for (let annot of anno?.content?.annotations??[]) {
          if (annot.needCompletion&&!annot.completed) {
            done=false;
            break;
          };
        };
        let task_btn = {
          id: task.id,
          entryId: task.entry,
          batchName: task.batchName ?? "",
          batch: task.batch ?? 0,
          done: done,
          rejectedTP: anno?.content?.review?.accept===false
            ? 3
            : anno?.content?.review?.accept===true
            ? 2
            : 1,
          commented: (anno?.content?.review?.comment?.length??0)>0,
          checked: anno?.content?.review?.checked,
          revised: anno?.content?.review?.revised,
          valid: anno && !anno?.dropped && !anno?.skipped ? true : false,
          dropped: anno?.dropped ? true : false,
          skipped: anno?.skipped ? true : false,
        };
        task_btn_list.push(task_btn);
      };
      // 参考 【寻找首条】
      // 【队列排序】
      // task_btn_list = task_btn_list.filter(it=>(!it.done)||(it.rejectedTP==3));
      task_btn_list = this.lo.sortBy(task_btn_list, [
        (it=>!it.done),
        (it=>!it.checked),
        (it=>!it.revised),
        (it=>it.rejectedTP),
        (it=>it.commented),
        (it=>it.batchName),
        (it=>it.batch),
      ]);
      // task_btn_list.sort((a, b)=>(+b.done)-(+a.done));
      // task_btn_list = task_btn_list.sort((a,b)=> +a.entryId-b.entryId);
      for (let idx in task_btn_list) {
        task_btn_list[idx].idx = idx;
      };
      this.data.tasks = task_btn_list;
      //
      this.updateProgress();

    } catch (error) {
      this.pushAlert(error, 'danger');
    };
    // this.pushAlert("updateTaskList 结束");
  }

  async updateUser(user) {
    // console.log(user);
    let it = {
      worker: user.name,
      workerId: user.id,
      secret: user.token,
      target: user.task?.length,
      taskType: user?.currTask,
      taskGroup: user?.currTaskGroup,
      taskCount: user.task?.length,
      quitted: user?.quitted,
    };
    this.data.ctrl.currentWorker = user.name;
    this.data.ctrl.currentWorkerId = user.id;
    this.data.ctrl.currentWorkerSecret = user.token;
    this.data.ctrl.currentWorkerTarget = user.task?.length;
    this.data.ctrl.currentWorkerTaskType = user?.currTask;
    this.data.ctrl.currentWorkerTaskGroup = user?.currTaskGroup;
    this.data.ctrl.currentWorkerTaskCount = user.task?.length;
    this.data.ctrl.currentWorkerQuitted = user?.quitted;
    this.data.newThings.theUser = user;

    if (this.playMode||this.inspectingMode) {return;};

    this.storeTool.set(`${this.appName}:it`, it);
    this.storeTool.set(`${this.appName}:theUser`, user);
  }


  _annoLogsTimeCompute(logs) {
    // const logs = anno?.content?._ctrl?.timeLog ?? [];
    logs = logs ?? [];

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
      console.log(pair);
      if (pair[0]?.length&&pair[1]?.length) {
        let delta = (new Date(pair[1])) - (new Date(pair[0]));
        totalDur += delta;
      };
    };

    let pureTotalDur = 0;
    for (let pair of pureBox) {
      if (pair[0]?.length&&pair[1]?.length) {
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
  }


  async saveForReview() {
    if (!this.inspectingMode) {
      this.pushAlert(`非审核模式，无法保存审核意见`, 'info', 2600);
      return;
    };
    if (this.ewp.example?.review==null||this.ewp.example?.review?.accept==null) {
      this.pushAlert(`没有审核意见，无法提交`, 'info', 2600);
      return;
    };

    try {

      //
      const review = this.ewp.example.review;
      review.reviewer = {
        name: this?.data?.inspecting?.inspectingUser?.name,
        id: this?.data?.inspecting?.inspectingUser?.id,
      };

      //
      console.log(this.ewp.example?._ctrl?.timeLog);
      if (!this.ewp.example._ctrl?.timeLog?.length) {
        this.ewp.example._ctrl.timeLog = [];
      }

      review.annoAt = this._annoLogsTimeCompute(this.ewp.example?._ctrl?.timeLog)?.lastAt;  // TODO 这个有点奇怪
      review.reviewedAt = dateString();

      this.ewp.example._ctrl.timeLog.push( ['check', JSON.parse(JSON.stringify(new Date())), {
        name: this?.data?.inspecting?.inspectingUser?.name,
        id: this?.data?.inspecting?.inspectingUser?.id,
        detail: {
          type: review?.accept===true ? "accept" : review?.accept===false ? "reject" : "unknown",
        },
      }] );

      //
      let anno_wrap = {
        'annotations': this.ewp.example?.annotations,
        '_ctrl': this.ewp.example?._ctrl,
        'review': review,
      };

      if (!anno_wrap?.annotations?.length) {
        this.pushAlert(`【操作取消】没有标注内容，无法提交`, 'danger');
        return false;
      };

      let task_id = this.ewp.example?._info?.task_id;
      let entry_id = this.ewp.example?._info?.entry_id;
      let entryVer = this.ewp.example?._info?.entry_ver;
      let topic = this.ewp.example?._info?.topic;

      let resp = await this.backEnd.updateAnno(this.data.ctrl.currentWorkerId, task_id, entry_id, anno_wrap, topic, entryVer);
      if (resp?.data?.code!=200) {
        this.pushAlert(`【发生错误】${resp?.data?.msg}`, 'danger', null, resp);
        return false;
      };
      this.pushAlert(`已保存`, 'success', 500);
      return true;
    } catch (error) {
      this.pushAlert(error, 'danger');
      return false;
    };
  }

  async save(content) {
    if (this.playMode) {
      this.pushAlert(`演示模式，无法保存`, 'info', 2600);
      return;
    };
    try {

      // if (this.ewp.example?.review?.accept) {
      //   this.pushAlert(`审核已通过的标注不可再修改！`, 'warning');
      //   return;
      // };

      if (!this.ewp.example._ctrl?.timeLog?.length) {
        this.ewp.example._ctrl.timeLog = [];
      }
      const symbol_out = this.inspectingMode ? 'reviser_out' : 'out';
      this.ewp.example._ctrl.timeLog.push( [symbol_out, JSON.parse(JSON.stringify(new Date()))] );
      // TODO 区分 审核离开 的工作量计算？

      let task_id = content?._info?.task_id;
      let entry_id = content?._info?.entry_id;
      let entryVer = content?._info?.entry_ver;
      let topic = content?._info?.topic;

      let anno_wrap = {
        'annotations': this.ewp.example?.annotations,
        '_ctrl': this.ewp.example?._ctrl,
      };
      if (!this.inspectingMode) {
        if (this.ewp.example?.review) {
          let review = this.ewp.example.review??{};
          review.checked = true;
          review.checkedAt = dateString();
          anno_wrap['review'] = review;
        };
      } else {
        if (this.ewp.example?.review) {
          let review = this.ewp.example.review??{};
          review.reviser = this?.data?.inspecting?.inspectingUser;
          review.revised = true;
          review.revisedAt = dateString();
          anno_wrap['review'] = review;
        };
      };

      if (!anno_wrap?.annotations?.length) {
        this.pushAlert(`【操作取消】没有标注内容，无需保存`, 'secondary');
        return false;
      };

      if (anno_wrap.annotations.filter(anno => anno.isDropping).length) {
        anno_wrap.isDropping = true;
      };

      let resp = await this.backEnd.updateAnno(this.data.ctrl.currentWorkerId, task_id, entry_id, anno_wrap, topic, entryVer);
      if (resp?.data?.code!=200) {
        this.pushAlert(`【发生错误】${resp?.data?.msg}`, 'danger', null, resp);
        return false;
      };
      this.pushAlert(`已保存`, 'success', 500);

      if (!anno_wrap.isDropping) {
        this.data.tasks[content?._info?.btn_idx].valid = true;
        this.data.tasks[content?._info?.btn_idx].dropped = false;
      } else {
        this.data.tasks[content?._info?.btn_idx].valid = false;
        this.data.tasks[content?._info?.btn_idx].dropped = true;
      };
      let done = anno_wrap?.annotations?.length ? true : false
      for (let annot of anno_wrap?.annotations??[]) {
        if (annot.needCompletion&&!annot.completed) {
          done=false;
          break;
        };
      };
      this.data.tasks[content?._info?.btn_idx].done = done;
      this.updateProgress();

      return true;
    } catch (error) {
      this.pushAlert(error, 'danger');
      return false;
    };
  }

  async goIdx(idx) {
    this.updateProgress();
    if (idx < this.data.tasks.length && idx >= 0) {
      let btn = this.data.tasks[idx];
      let content = await this.touchTaskBtn(btn);
      return content ?? {};
    };
    return null;
  }

  async prev(content) {
    let last_idx = + content?._info?.btn_idx - 1;
    let it = await this.goIdx(last_idx);
    if (it == null) {
      this.pushAlert(`没有上一条了`, 'secondary');
    };
  }

  async next(content) {
    let next_idx = + content?._info?.btn_idx + 1;
    let it = await this.goIdx(next_idx);
    if (it == null) {
      this.pushAlert(`没有下一条了`, 'secondary');
    };
  }

  async saveAndPrev(content) {
    let result = await this.save(content);
    if (result) {
      await this.prev(content);
    };
  }

  async saveAndNext(content) {
    let result = await this.save(content);
    if (result) {
      await this.next(content);
    };
  }





  async saveUserToCloud(user, newUser) {
    if (user.id != null) {newUser.id = user.id;};
    if (user.token != null) {newUser.token = user.token;};
    try {
      let resp = await this.backEnd.updateUser(newUser);
      if (resp.data?.code!=200) {
        this.pushAlert(`用户 ${user?.name} 更新失败【${resp.data.msg}】`, 'danger', 5000, resp);
        return false;
      };
      Object.assign(user, resp.data.data);

      this.pushAlert(`用户 ${user?.name} 更新成功`, 'success');
      return true;
    } catch(error) {
      this.pushAlert(`用户 ${user?.name} 更新时出错【${error}】`, 'danger', 5000, error);
      return false;
    };
  }

  async setTask(user, topicLabel) {
    if (user.currTask==topicLabel) {
      this.pushAlert(`${user.name} 的任务本来就是 ${topicLabel}`, 'warning', 5000);
      return;
    };
    let newUser = foolCopy({
      id: user.id,
      currTask: topicLabel,
    });
    let succeed = await this.saveUserToCloud(user, newUser);
    return succeed;
  }


  async getWorkloadOfAllof(userId) {
    let 审核包 = (await this.getWorkloadOfReviewerOf(userId)) ?? {list:[], name:""};
    let 审核情况 = 审核包.list;
    let name = 审核包.name
    let 标注情况 = (await this.getWorkloadOf(userId)) ?? [];

    let 汇总 = [];

    for (let it of 标注情况) {
      汇总.push([userId, name, it[1]?.level, it[0], it[1]?.detail, "标"]);
    };

    for (let it of 审核情况) {
      汇总.push([userId, name, it[1]?.level, it[0], it[1]?.detail, "审"]);
    };

    return 汇总;
  }


  async getWorkloadOf(userId) {
    try {
      // console.log(this);
      let resp = await this.backEnd.getWorkload(userId);
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
          anno?.content?.review?.checked===true ? "有修改" : "未修改或未记录";
          // anno?.content?.review?.checked===false ? "未修改" :
          // anno?.content?.review==null ? "未审核" : "不知是否修改";
        apples.push(apple);
      };

      let dict = {};

      for (let apple of apples) {
        let clue = `${apple.审核次数文本}${apple.审核情况}${apple.审核后修改情况}`;
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

      dictList = this.lo.sortBy(dictList, [it=>it[1]?.level, it=>it[0]]);

      return dictList;

    } catch (error) {
      return null;
    };
  }


  async getWorkloadOfReviewerOf(userId) {
    try {
      // console.log(this);
      let resp = await this.backEnd.getWorkloadOfReviewer(userId);
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

      dictList = this.lo.sortBy(dictList, [it=>it[1]?.level, it=>it[0]]);

      return {list: dictList, name};

    } catch (error) {
      console.log(error);
      return null;
    };
  }


  async __getWorkloadOfReviewerOf(userId) {
    try {
      // console.log(this);
      let resp = await this.backEnd.getWorkloadOfReviewer(userId);
      if (errorHappened(resp?.data?.err)) {
        console.log(resp);
        return null;
      };

      // console.log(resp?.data?.data);
      let data = resp?.data?.data;

      let reviewed_annos = data.reviewed_annos;
      let name = data.user_name;

      // return data;

      let apples = [];
      for (let anno of reviewed_annos) {
        let task = anno?.task_wrap?.[0];
        let apple = Object.assign({}, task);
        let 初审者 = anno?.content?._ctrl?.timeLog?.find?.(it=>it[0]=="check")?.[2];
        apple.审核类型 =
          初审者?.name==name||初审者?.id==userId ? "初审" : "复审";
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
      };

      let dictList = Object.entries(dict);

      dictList = this.lo.sortBy(dictList, [it=>it[1]?.level, it=>it[0]]);

      return {list: dictList, name};

    } catch (error) {
      console.log(error);
      return null;
    };
  }

  async getAllUsersList () {
    try {
      // console.log(this);
      let resp = await this.backEnd.getUsersAll();
      if (errorHappened(resp?.data?.err)) {
        console.log(resp);
        return null;
      };

      let data = resp?.data?.data;
      console.log(data);
      return data;

    } catch (error) {
      console.log(error);
      return null;
    };
  }


  // 对 后端 API 进行基础的使用 结束

}

export default BackEndUsage;
