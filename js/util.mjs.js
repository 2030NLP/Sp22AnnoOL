// modifiedAt: 2022-03-15

const forceBlur = event => {
  let target = event.target;
  if (target.parentNode.className.split(/\s+/).includes("btn")) {
    target.blur();
    target = target.parentNode;
  }
  target.blur();
};

const timeString = () => {
  let the_date = new Date();
  let str = `${(''+the_date.getFullYear()).slice(2,4)}${(''+(the_date.getMonth()+1)).length==1?'0':''}${the_date.getMonth()+1}${(''+the_date.getDate()).length==1?'0':''}${the_date.getDate()}-${(''+the_date.getHours()).length==1?'0':''}${the_date.getHours()}${(''+the_date.getMinutes()).length==1?'0':''}${the_date.getMinutes()}${(''+the_date.getSeconds()).length==1?'0':''}${the_date.getSeconds()}`;
  return str;
};

const foolCopy = (it) => JSON.parse(JSON.stringify(it ?? null));

const uuid = () => {
  // Author: Abhishek Dutta, 12 June 2020
  // License: CC0 (https://creativecommons.org/choose/zero/)
   let temp_url = URL.createObjectURL(new Blob());
   let uuid_s = temp_url.toString();
   let uuid = uuid_s.substr(uuid_s.lastIndexOf('/') + 1);  // remove prefix (e.g. blob:null/, blob:www.test.com/, ...)
   URL.revokeObjectURL(temp_url);
   return uuid;
}

export { forceBlur, timeString, foolCopy, uuid };
// if (typeof module !== 'undefined') {
//   module.exports = { forceBlur, timeString, foolCopy, uuid };
// }
