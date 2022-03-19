// modifiedAt: 2022-03-15

import { timeString, foolCopy } from '../util.mjs.js';

class StepControl {
  constructor(appPack) {
    this.data = appPack.reactive_data;
    this.ewp = appPack.reactive_exam_wrap;

    this.tokenSelector = appPack.tokenSelector;

    this.rootStep = appPack.reactive_rootStep;
    this.currentStep = appPack.reactive_currentStep;
    this.stepsDict = appPack.reactive_stepsDict;
    this.stepsDictWrap = appPack.reactive_stepsDictWrap;

    this.updateProgress = () => {};
    this.saveStore = () => {};
    this.saveExample = () => {};
  }
  static new(appPack) {
    return new StepControl(appPack);
  }


  touchSchema(wrap) {
    if (this.stepsDictWrap.name == wrap.name &&
      this.stepsDictWrap.version == wrap.version &&
      this.stepsDictWrap.using == wrap.using) {
      return false;
    };
    Object.assign(this.stepsDictWrap, wrap);
    Object.assign(this.stepsDict, this.stepsDictWrap?.[this.stepsDictWrap?.using]?.steps??null);
    Object.assign(this.rootStep, this.stepsDictWrap?.[this.stepsDictWrap?.using]?.steps?.[this.stepsDictWrap?.[this.stepsDictWrap?.using]?.startStep]??null);
    Object.assign(this.currentStep, this.rootStep);
    return true;
  }


  ensureExampleStep() {
    // 保存当前步骤
    if (!('_ctrl' in this.ewp.example)) {
      this.ewp.example._ctrl = {};
    };
    this.ewp.example._ctrl.currentStepRef = this.currentStep.ref;
    // this.ewp.example._ctrl.currentSchema = {
    //   name: this.stepsDictWrap.name ?? null,
    //   version: this.stepsDictWrap.version ?? null,
    //   using: this.stepsDictWrap.using ?? null,
    // };
    // 网络版节约空间
    this.ewp.example._ctrl.schema = [
      this.stepsDictWrap.version ?? null,
      this.stepsDictWrap.using ?? null,
    ];
  }







  async goStep(stepObj_, data) {
    // await this.touchSchema();
    if (data!=null) {
      this.dealWithData(data, da=>da);
    };

    if (data) {
      // TODO
      // 在 this.ewp.example?._ctrl 中记录 这条语料是 dropped
      // 在 update 时，构造 post 参数时检查 _ctrl 有没有 dropped，并写到 post 参数里
      // 注意检查 _ctrl 的更新，避免影响其他 entry
    };

    // 消除 stepObj 的引用关系
    let stepObj = {
      ref: stepObj_?.ref ?? null,
      name: stepObj_?.name ?? null,
      mode: stepObj_?.mode ?? null,
      props: foolCopy(stepObj_?.props ?? null),
    };
    this.data.ctrl.showOrigin = stepObj?.props?.showOrigin ?? false;
    Object.assign(this.currentStep, stepObj);

    this.ensureExampleStep();
    this.saveExample();
    this.updateProgress();
    this.saveStore();
  }
  async goRefStep(ref, data) {
    let stepObj = foolCopy(this.stepsDict?.[ref] ?? null);
    await this.goStep(stepObj, data);
  }
  async cancelStep(ref) {
    await this.goRefStep(ref, null);  // 不要把 data 放进去，避免重复标记
    // stepRecords.list = [];
    this.tokenSelector.clear(this.ewp.example?.material?.tokenList);
  }
  async resetStep(ref) {
    this.ewp.example.annotations = [];
    this.cancelStep(ref);
  }

  dealWithData(data, fn) {
    if (!this?.exam?.annotations?.length) {
      this.ewp.example.annotations = [];
    };
    // 按照 schema 补充必要的数据字段
    let idx = this.ewp.example.annotations.length;
    data.idx = idx;
    data.mode = this.currentStep.mode;

    data = fn(data);

    // data._schema = [
    //   this.stepsDictWrap.name ?? null,
    //   this.stepsDictWrap.version ?? null,
    //   this.stepsDictWrap.using ?? null,
    // ];

    // 加入 annotations 清单
    this.ewp.example.annotations.push(foolCopy(data));

    return data;
  }

  async handleTemplate(ref, data, fn) {
    // 这个函数是一个抽象出来的通用流程框架
    // 之前的 value 改成了 data

    this.dealWithData(data, fn);

    this.tokenSelector.clear(this.ewp.example?.material?.tokenList);
    await this.goRefStep(ref);  // 不要把 data 放进去，避免重复标记
  }

  async handleChooseOrText(ref, data) {
    // 这个函数就是之前的「goRefStepChoose」
    // 之前的 value 改成了 data

    let fn = (da)=>{
      da.on = this.tokenSelector.selection.array;
      return da;
    };
    await this.handleTemplate(ref, data, fn);
  }

  async handleWord(ref, data) {
    let fn = (da)=>{
      da.source = this.tokenSelector.selection.array[0];
      return da;
    };
    await this.handleTemplate(ref, data, fn);
  }

  async handleAdd(ref, data) {
    // TODO 这个函数还没写好，想用来试试替换法
    let tokenList = this.ewp.example.material.tokenList;
    let fn = (da)=>{
      da.source = this.tokenSelector.selection.array[0];
      da.targetText = da.side==1 ? `${da.target}${da.source}` : `${da.source}${da.target}`;

      if (da?._pattern?.length) {
        let face = da._pattern;
        for (let kk of ["source", "target", "targetText", "side"]) {
          face = face.replace(`<[%${kk}%]>`, da[kk]??" [?] ");
        };
        da._face = face;
      };

      return da;
    };
    await this.handleTemplate(ref, data, fn);
  }

  async handleQita(ref, data) {
    let fn = (da)=>{
      return da;
    };
    await this.handleTemplate(ref, data, fn);
  }

  async handleMultiSpans(ref, data) {
    let aa = data.tokenarrays.flat(Infinity);
    let should = (aa.length == Array.from(new Set(aa)).length);

    let flag = 0;
    for (i = 0; i < this.ewp.example.annotations.length; i++) {
      if ((this.ewp.example.annotations[i].mode == "multiSpans") && (this.ewp.example.annotations[i].label == data.label)) {
        let flag1 = 0;
        for (j = 0; j < this.ewp.example.annotations[i].tokenarrays.length; j++) {
          for (k = 0; k < data.tokenarrays.length; k++) {
            if (this.ewp.example.annotations[i].tokenarrays[j].toString() == data.tokenarrays[k].toString()) {
              flag1 = flag1 + 1;
            }
            for (t = 0; t < data.tokenarrays[k].length; t++) {
              if ((this.ewp.example.annotations[i].tokenarrays[j].indexOf(data.tokenarrays[k][t])) != -1) {
                flag = 1;
              }
            }
          }
          if (flag1) {
            if ((flag1 == this.ewp.example.annotations[i].tokenarrays.length) && (flag1 == data.tokenarrays.length)) {
              flag = 2;
            }
          }
        }
      }
    }

    if (!should) {
      alert("存在重复的片段，请重新选择");
      data.tokenarrays = [];
      return;
    };

    if (flag == 1) {
      if (!confirm("与之前标注相比有部分重复，点击取消即重新选择，反之则点击确定。")) {
        data.tokenarrays = [];
        return;
      }
    }

    if (flag == 2) {
      alert("与之前标注相比完全重复，请重新选择");
      data.tokenarrays = [];
      return;
    }

    let fn = (da) => {
      return da;
    };
    await this.handleTemplate(ref, data, fn);
  }


}


export default StepControl;
