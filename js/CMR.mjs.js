
const uuid = () => {
  // Author: Abhishek Dutta, 12 June 2020
  // License: CC0 (https://creativecommons.org/choose/zero/)
   let temp_url = URL.createObjectURL(new Blob());
   let uuid_s = temp_url.toString();
   let uuid = uuid_s.substr(uuid_s.lastIndexOf('/') + 1);  // remove prefix (e.g. blob:null/, blob:www.test.com/, ...)
   URL.revokeObjectURL(temp_url);
   return uuid;
}

class CMR {
  // version: 0.5.0.220530
  constructor() {
    this.prefabs = [];
    this.types = {};
    this.labels = {};
    this.interface = {};
    this.objects = [];
    this.nextId = 0;
    this.symbols = {
      "@": "@",
      "#": "#",
      "$": "$",
    };
    this.uuid = uuid();
  }
  dict() {
    return Object.fromEntries(this.objects.map(obj => [obj._id, obj]));
  }
  typeObjects(type) {
    return this.objects.filter(obj => obj._type==type);
  }
  get(gid) {
    if (typeof(gid)!="string") {return gid};
    const map = {
      [this.symbols["@"]]: (id) => this.prefabs.find(obj => obj._id==id),
      [this.symbols["#"]]: (id) => this.objects.find(obj => obj._id==id),
      [this.symbols["$"]]: (id) => this.interface?.[id] ?? null,
    };
    // console.log(gid);
    if (gid?.[0] in map) {
      return map[gid?.[0]](gid?.slice?.(1));
    };
    return map[this.symbols["#"]](gid);
  }
  makeNewObject(bud) {
    let obj = Object.assign({}, JSON.parse(JSON.stringify(bud)));
    obj._id = this.nextId;
    this.nextId++;
    this.objects.push(obj);
    return obj;
  }
  deleteObject(objId) {
    const idx = this.objects.findIndex(obj => obj._id==objId);
    this.objects.splice(idx, 1);
  }



  assignDefinitions(definitions) {
    for(let def of definitions) {
      if (def['_type']=="@Type") {
        this.types[def['refName']] = def;
      };
      if (def['_type']=="@Label") {
        this.labels[def['face']] = def;
      };
    };
  }



  initDefinition(definition) {
    // 各种类型的定义

    for (let [kk, ll] of definition['label_sets']) {
      for (let vv of ll) {
        let label = {
          'domain': kk,
          'face': vv,
        };
        if (definition['namespace']) {label['namespace'] = definition['namespace'];};
      };
    };

  }

  initData(data) {
    // 标注结果，各种对象
  }




}

export default CMR;