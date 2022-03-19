// modifiedAt: 2022-03-15

import { timeString, foolCopy } from '../util.mjs.js';

class IoControl {
  constructor(appPack) {
    this.appName = appPack.appName;
    this.appVersion = appPack.appVersion;
    this.projDesc = appPack.projDesc;
    this.projPrefix = appPack.projPrefix;

    this.data = appPack.reactive_data;
    this.ewp = appPack.reactive_exam_wrap;
    this.dfWrap = appPack.reactive_df_wrap;

    this.tokenSelector = appPack.tokenSelector;

    this.reader = appPack.reader;

    this.stepCtrl = appPack.stepCtrl;

    this.updateSchema = appPack.updateSchemaFn;

    this.storeTool = appPack.storeTool;
  }
  static new(appPack) {
    return new IoControl(appPack);
  }

  updateProgress() {
    let endStep = this.stepCtrl.stepsDictWrap?.[this.stepCtrl.stepsDictWrap?.using]?.endStep;
    this.data.ctrl.totalNum = this.dfWrap.dataItems.length;
    this.data.ctrl.doneNum = this.dfWrap.dataItems.filter(it=>{
      return it?._ctrl?.currentStepRef == endStep && endStep?.length;
    }).length;
    this.data.ctrl.donePct = `${this.data.ctrl.doneNum / this.data.ctrl.totalNum * 100}%`;
  }

  saveStore() {
    this.storeTool.set(`${this.appName}:dataWrap`, foolCopy(this.dfWrap));
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




  log(action) {
    let worker = this.data.ctrl.currentWorker;
    let info = {
      time: JSON.parse(JSON.stringify(new Date())),
      person: worker,
      action: action,
    };
    this.dfWrap.handleLogs.push(info);
    this.dfWrap.lastModifiedAt = info.time;
    this.dfWrap.appVersion = this.appVersion;
  }


  async loadStore () {
    this.dfWrap = this.storeTool.get(`${this.appName}:dataWrap`);
    await this.fixData();
    this.log(`load from store at idx(${this.dfWrap?._ctrl?.currentIdx})`);
  }

  async onExport () {
    if (!this.dfWrap?.dataItems?.length) {return;};
    await this.beforeSave();
    this.log(`export to file at idx(${this.dfWrap?._ctrl?.currentIdx})`);
    let worker = this.data.ctrl.currentWorker;
    let fid = this.dfWrap.fID;
    let using = this.stepCtrl.stepsDictWrap.using;
    let fileName = `${this.projPrefix}-${using} [${fid}] @${worker} (${timeString()}).json`;
    theSaver.saveJson(this.dfWrap, fileName);
  }

  async onImport (doc) {
    let fileItem = doc.forms["file-form"]["file-input"].files[0];
    console.debug(fileItem);

    if (fileItem == null) {return;};

    let fileWrap = {};
    fileWrap.file = fileItem;
    fileWrap.name = fileItem.name;
    fileWrap.isUsable = true;
    fileWrap.readed = false;
    fileWrap.readed2 = false;
    fileWrap.tmp = false;
    fileWrap.encodingGot = false;
    fileWrap.encoding = null;

    await this.reader.readFileAsBinaryString(fileWrap, fileWrap.encoding);
    await this.reader.readFile(fileWrap);
    // Object.assign(this.data.fileWrapWrap, {fileWrap: fileWrap});
    this.data.fileWrapWrap.fileWrap = fileWrap;
    // console.debug(this.data.fileWrapWrap.fileWrap);

    await this.readData();


    this.log(`import from file at idx(${this.dfWrap?._ctrl?.currentIdx})`);
    this.saveStore();
  }

  async readData () {
    let fileWrap = this.data.fileWrapWrap.fileWrap;
    let obj = JSON.parse(fileWrap.content);
    // fileWrap.obj = obj;

    // 看是不是用于这次评测的数据
    // TODO: 未来如果版本有大改，可能要针对 appVersion 做某些判断和处理。
    if (obj?.desc != this.projDesc) {
      this.data.fileError = true;
      return;
    };
    this.data.fileError = false;

    // ↓ 读取数据
    // Object.assign(this.dfWrap, foolCopy(obj));
    this.dfWrap = foolCopy(obj);

    await this.fixData();
  }

  async fixData () {
    console.debug("开始 fixData");
    console.debug(foolCopy(this.dfWrap));

    // 更新当前要标注的材料的序号
    if (!('_ctrl' in this.dfWrap)) {
      this.dfWrap._ctrl = {};
    };
    if (!('currentIdx' in this.dfWrap._ctrl)) {
      this.dfWrap._ctrl.currentIdx = 0;
    };
    // console.debug(this.dfWrap._ctrl.currentIdx);

    for (let item of this.dfWrap.dataItems) {
      if (!('annotations' in item)) {
        item.annotations = [];
      };
      if (!('_ctrl' in item)) {
        item._ctrl = {};
      };
    };

    if (!('handleLogs' in this.dfWrap)) {
      this.dfWrap.handleLogs = [{
        time: JSON.parse(JSON.stringify(new Date())),
        person: "App",
        action: "fix",
      }];
    };

    console.debug(foolCopy(this.dfWrap));
    console.debug("结束 fixData");

    this.updateProgress();
    await this.goIdx(this.dfWrap._ctrl.currentIdx);
  }


  ensureExampleStep() {
    // 保存当前步骤
    if (!('_ctrl' in this.ewp.example)) {
      this.ewp.example._ctrl = {};
    };
    this.ewp.example._ctrl.currentStepRef = this.stepCtrl.currentStep.ref;
    // this.ewp.example._ctrl.currentSchema = {
    //   name: this.stepCtrl.stepsDictWrap.name ?? null,
    //   version: this.stepCtrl.stepsDictWrap.version ?? null,
    //   using: this.stepCtrl.stepsDictWrap.using ?? null,
    // };
    // 网络版节约空间
    this.ewp.example._ctrl.schema = [
      this.stepCtrl.stepsDictWrap.version ?? null,
      this.stepCtrl.stepsDictWrap.using ?? null,
    ];
  }

  saveExample() {
    if (!this.dfWrap.dataItems.length) {return;};
    this.ensureExampleStep();
    // 覆盖
    this.dfWrap.dataItems[this.data.ctrl.currentIdx] = foolCopy(this.ewp.example);
  }




  fineIdx(idx) {
    idx = Math.min(idx, this.dfWrap.dataItems.length-1);
    idx = Math.max(idx, 0);
    return idx;
  }

  async goIdx(idx) {
    this.saveStore();
    await this.updateSchema();
    this.tokenSelector.clear(this.ewp?.example?.material?.tokenList);

    idx = this.fineIdx(idx);
    this.data.ctrl.currentIdx = idx;
    // Object.assign(this.ewp.example, foolCopy(this.dfWrap.dataItems[this.data.ctrl.currentIdx]));
    if (!this.dfWrap.dataItems.length) {
      this.log(`goIdx(${idx}) returned`);
      return;
    };
    this.log(`goIdx(${idx})`);

    // 覆盖
    this.ewp.example = foolCopy(this.dfWrap.dataItems[this.data.ctrl.currentIdx]);
    this.dfWrap._ctrl.currentIdx = idx;
    this.data.ctrl.targetIdx = null;

    // 还原步骤
    let stepRef;
    if (!this.ewp?.example?._ctrl?.currentStepRef?.length) {
      stepRef = this.stepCtrl.stepsDictWrap?.[this.stepCtrl.stepsDictWrap?.using]?.startStep ?? 'start';
    } else {
      stepRef = this.ewp.example._ctrl.currentStepRef;
    };
    if (stepRef in this.stepCtrl.stepsDict) {
      await this.stepCtrl.goRefStep(stepRef);
    };

    this.tokenSelector.clear(this.ewp?.example?.material?.tokenList);
  }





}

export default IoControl;
