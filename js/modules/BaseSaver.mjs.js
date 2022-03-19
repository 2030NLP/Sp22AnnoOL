// modifiedAt: 2022-03-15

import * as FileSaver from '../modules_lib/FileSaver.js';

class BaseSaver {
  constructor() {
    this.saveAsFn = FileSaver.saveAs;
  }
  static new() {
    return new BaseSaver();
  }
  saveText(text, fileName) {
    fileName = (fileName == null) ? "file.txt" : fileName;
    let file = new File([text], fileName, {type: "text/plain;charset=utf-8"});
    this.saveAsFn(file);
  }
  saveJson(obj, fileName) {
    let text = JSON.stringify(obj, null, 2);
    fileName = (fileName == null) ? "file.json" : fileName;
    this.saveText(text, fileName);
  }
  save(obj, fileName) {
    this.saveJson(obj, fileName);
  }
}

export default BaseSaver;
