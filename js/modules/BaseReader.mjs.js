// modifiedAt: 2022-03-15

class BaseReader {
  constructor(handleErrorFn=console.log) {
  }
  static new(handleErrorFn) {
    return new BaseReader(handleErrorFn);
  }

  reader_ReadFileAsText(fileWrap, options) {
    let file = fileWrap.file;
    options = options || {};
    return new Promise(function(resolve, reject) {
      let reader = new FileReader();

      reader.onload = function() {
        resolve(reader);
      };
      reader.onerror = reject;

      if (options.accept && !new RegExp(options.accept).test(file.type)) {
        reject({
          code: 1,
          msg: 'wrong file type'
        });
      }

      if (!file.type || /^text\//i.test(file.type) || /\/json/i.test(file.type) || /\/markdown/i.test(file.type)) {
        reader.readAsText(file, fileWrap.encoding);
      } else {
        reader.readAsDataURL(file);
      }
    });
  }

  reader_ReadFileAsArrayBuffer(file, options) {
    options = options || {};
    return new Promise(function(resolve, reject) {
      let reader = new FileReader();

      reader.onload = function() {
        resolve(reader);
      };
      reader.onerror = reject;

      if (options.accept && !new RegExp(options.accept).test(file.type)) {
        reject({
          code: 1,
          msg: 'wrong file type'
        });
      }

      reader.readAsArrayBuffer(file);
    });
  }

  reader_ReadFileAsBinaryString(file, options) {
    options = options || {};
    return new Promise(function(resolve, reject) {
      let reader = new FileReader();

      reader.onload = function() {
        resolve(reader);
      };
      reader.onerror = reject;

      if (options.accept && !new RegExp(options.accept).test(file.type)) {
        reject({
          code: 1,
          msg: 'wrong file type'
        });
      }

      reader.readAsBinaryString(file);
    });
  }

}

export default BaseReader;
