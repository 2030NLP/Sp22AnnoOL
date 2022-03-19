// modifiedAt: 2022-03-15

import BaseReader from './BaseReader.mjs.js';

class TheReader {
  constructor(handleErrorFn=console.log, jschardet_detect=()=>({'encoding': null})) {
    this.handleErrorFn = handleErrorFn;
    this.baseReader = new BaseReader(handleErrorFn);
    this.detect = jschardet_detect;
  }
  static new(handleErrorFn, jschardet_detect) {
    return new TheReader(handleErrorFn, jschardet_detect);
  }

  async readFileAsArrayBuffer (fileWrap) {
    let file_content = null;
    await this.baseReader.reader_ReadFileAsArrayBuffer(fileWrap.file)
      .then((reader) => {
        console.log(reader.result);
        fileWrap.readed2 = true;
        fileWrap.buffer = reader.result;
      })
      .catch((error) => {
        this.handleError(error);
      });
  }

  async readFileAsBinaryString (fileWrap, encoding) {
    let file_content = null;
    await this.baseReader.reader_ReadFileAsBinaryString(fileWrap.file)
      .then((reader) => {
        // console.log(reader.result);
        fileWrap.tmp = true;
        fileWrap.test = reader.result.slice(0, 300);
        return fileWrap;
        // jschardet.detect(the_vue.files[0].buinaryString.slice(0,100));
      })
      .then((fileWrap) => {
        if (encoding==null) {
          // encoding = encoding || jschardet?.detect(fileWrap.test)?.encoding || "utf-8";
          encoding = encoding || this.detect(fileWrap.test)?.encoding || "utf-8";
          encoding = encoding == "ascii" ? "utf-8" : encoding;
        };
        return [encoding, fileWrap];
      })
      .then(([encoding, fileWrap]) => {
        fileWrap.encoding = encoding;
        fileWrap.encodingGot = true;
        return fileWrap;
      })
      .catch((error) => {
        this.handleError(error);
      });
  }

  async readFile (fileWrap) {
    let file_content = null;
    await this.baseReader.reader_ReadFileAsText(fileWrap)
      .then((reader) => {
        console.debug(reader.result.slice(0, 300));
        fileWrap.content = reader.result;
        fileWrap.readed = true;
      })
      .catch((error) => {
        this.handleError(error);
      });
  }

}

export default TheReader;
