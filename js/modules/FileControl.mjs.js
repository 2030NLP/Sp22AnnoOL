// modifiedAt: 2022-03-22

import { chainGet, timeString, foolCopy } from '../util.mjs.js';

class FileControl {
  constructor(pack) {
    this.document = pack.document;
    this.fileGetterChain = pack.fileGetterChain ?? ['forms', 'file-form', 'file-input', 'files', '0'];
    this.reader = pack.reader;
  }
  static new(pack) {
    return new FileControl(pack);
  }

  async onImport () {
    let fileItem = chainGet(this.document, this.fileGetterChain);
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

    return fileWrap;
  }





}

export default FileControl;
