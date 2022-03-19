// modifiedAt: 2022-03-15

import { timeString, foolCopy } from '../util.mjs.js';

class BackEndUsage {
  constructor(appPack) {
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

    // console.log(this);
  }
  static new(appPack) {
    return new BackEndUsage(appPack);
  }

  updateProgress() {
    this.data.ctrl.doneNum = this.data.tasks.filter(it=>it.valid||it.dropped).length ?? 0;
    this.data.ctrl.totalNum = this.data.tasks.length ?? 1;
    this.data.ctrl.donePct = `${Math.min(100, this.data.ctrl.doneNum / this.data.ctrl.totalNum * 100)}%`;
  }

  saveStore() {
    this.storeTool.set(`${this.appName}:version`, this.appVersion);
    // let worker = this.data.ctrl.currentWorker;
    // this.storeTool.set(`${this.appName}:worker`, worker);
    this.storeTool.set(`${this.appName}:it`, {
      worker: this.data.ctrl.currentWorker,
      workerId: this.data.ctrl.currentWorkerId,
      secret: this.data.ctrl.currentWorkerSecret,
      target: this.data.ctrl.currentWorkerTarget,
      taskCount: this.data.ctrl.currentWorkerTaskCount,
    });
  }

  // 对 后端 API 进行基础的使用 开始

  async touchTask(task_btn) {
    try {
      let resp = await this.backEnd.getThing(this.data.ctrl.currentWorkerId, task_btn?.id);
      // this.pushAlert(resp?.data);
      if (resp?.data?.err?.length) {
        this.pushAlert(`【发生错误】${resp?.data?.err}`, 'danger');
        return;
      };
      return resp?.data?.thing;
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
      this.ewp.example = {};
      //
      let thing = await this.touchTask(task_btn);
      if (thing?.entry) {
        let content = thing?.entry?.content;
        content.annotations = thing?.annotation?.content?.annotations ?? [];
        content._ctrl = thing?.annotation?.content?._ctrl ?? {};
        content._info = {
          btn_idx: task_btn.idx,
          task_id: thing?.task?.id,
          entry_id: thing?.entry?.id,
          anno_id: thing?.annotation?.id,
        };

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

        //
        this.data.ctrl.currentPage = 'anno';
        this.data.newThings.lastEID = thing?.entry?.id;
        this.storeTool.set(`${this.appName}:lastEID`, this.data.newThings.lastEID);
        return content;
      } else {
        console.log("thing:", thing);
      };
    } catch (error) {
      this.pushAlert(error, 'danger');
    };
  }

  async connect() {
    // this.pushAlert("connect 开始", 'secondary');
    console.log(this);
    try {
      console.log(this);
      let resp = await this.backEnd.getUser(null, this.data.ctrl.currentWorker, this.data.ctrl.currentWorkerSecret);
      if (resp?.data?.err?.length) {
        this.pushAlert(`【发生错误】${resp?.data?.err}`, 'danger');
        return;
      };
      this.data.newThings.topic = resp?.data?.topic;
      await this.updateUser(resp?.data?.user);
      this.pushAlert(`${resp?.data?.user?.name}的信息已同步`);
      await this.updateTaskList();
    } catch (error) {
      console.log(error);
      this.pushAlert(error, 'danger');
    };
    // this.pushAlert("connect 结束", 'secondary');
  }

  async updateTarget() {
    // this.pushAlert("updateTarget 开始", 'secondary');
    try {
      let oldCount = this.data.ctrl.currentWorkerTaskCount;
      let target = this.data.ctrl.currentWorkerTarget;
      let delta = target - oldCount;
      if (delta <= 0) {
        this.pushAlert(`【操作取消】新目标要大于原始目标才行`, 'secondary');
        this.data.ctrl.currentWorkerTarget = this.data.ctrl.currentWorkerTaskCount;
        return;
      };
      if (delta > 50) {
        delta = 50;
        this.pushAlert(`【操作调整】新目标比原始目标多过50条，已自动调整`, 'secondary');
      };
      let resp = await this.backEnd.newTask(this.data.ctrl.currentWorkerId, delta, this.data.newThings.topic||null);
      if (resp?.data?.err?.length) {
        this.pushAlert(`【发生错误】${resp?.data?.err}`, 'danger');
        this.data.ctrl.currentWorkerTarget = this.data.ctrl.currentWorkerTaskCount;
        return;
      };
      await this.connect();
      let newDelta = this.data.ctrl.currentWorkerTaskCount - oldCount;
      if (newDelta <= 0) {
        this.pushAlert(`【操作未果】没有更多可分配的任务`, 'info');
        return
      };
      this.pushAlert(`【操作成功】已为您分配 ${newDelta} 条新任务`, 'success');
    } catch (error) {
      this.pushAlert(error, 'danger');
    };
    // this.pushAlert("updateTarget 结束", 'secondary');
  }

  async updateTaskList() {
    // this.pushAlert("updateTaskList 开始");
    try {
      let aa = this.pushAlert("正在获取任务列表，请稍等……", "info", 99999999);
      let resp = await this.backEnd.getWorkList(this.data.ctrl.currentWorkerId, this.data.ctrl.currentWorkerSecret);
      this.removeAlert(aa);
      if (resp?.data?.err?.length) {
        this.pushAlert(`【发生错误】${resp?.data?.err}`, 'danger');
        return;
      };
      let work_list = resp?.data?.work_list ?? [];
      console.debug(work_list);
      let task_btn_list = [];
      for (let work of work_list) {
        let task = work.task;
        let anno = work?.annotation;
        let task_btn = {
          id: task.id,
          eId: task.eId,
          valid: anno && !anno?.dropped && !anno?.skipped ? true : false,
          dropped: anno?.dropped ? true : false,
          skipped: anno?.skipped ? true : false,
        };
        task_btn_list.push(task_btn);
      };
      task_btn_list = task_btn_list.sort((a,b)=> +a.eId-b.eId);
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
    console.log(user);
    let it = {
      worker: user.name,
      workerId: user.id,
      secret: user.password,
      target: user.task.length,
      taskCount: user.task.length,
    };
    this.data.ctrl.currentWorker = user.name;
    this.data.ctrl.currentWorkerId = user.id;
    this.data.ctrl.currentWorkerSecret = user.password;
    this.data.ctrl.currentWorkerTarget = user.task.length;
    this.data.ctrl.currentWorkerTaskCount = user.task.length;
    this.data.newThings.theUser = user;

    this.storeTool.set(`${this.appName}:it`, it);
    this.storeTool.set(`${this.appName}:theUser`, user);
  }



  async save(content) {
    try {
      let task_id = content?._info?.task_id;
      let anno_wrap = {
        'annotations': this.ewp.example?.annotations,
        '_ctrl': this.ewp.example?._ctrl,
      };
      if (!anno_wrap?.annotations?.length) {
        this.pushAlert(`【操作取消】没有标注内容，无需保存`, 'secondary');
        return false;
      }
      if (anno_wrap.annotations.filter(anno => anno.isDropping).length) {
        anno_wrap.isDropping = true;
      };
      let resp = await this.backEnd.updateAnno(this.data.ctrl.currentWorkerId, task_id, anno_wrap, this.data?.newThings?.topic);
      if (resp?.data?.err?.length) {
        this.pushAlert(`【发生错误】${resp?.data?.err}`, 'danger');
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
      return true;
    } catch (error) {
      this.pushAlert(error, 'danger');
      return false;
    };
  }

  async goIdx(idx) {
    if (idx < this.data.tasks.length && idx >= 0) {
      let btn = this.data.tasks[idx];
      let content = await this.touchTaskBtn(btn);
      return content;
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


  // 对 后端 API 进行基础的使用 结束

}

export default BackEndUsage;
