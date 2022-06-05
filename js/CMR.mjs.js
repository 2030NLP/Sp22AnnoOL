
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
    this.typeDict = {};
    this.labels = [];
    this.objects = [];
    // this.prefabs = [];
    // this.interface = {};
    this.nextId = 0;
    this.symbols = {
      "@": "@",
      "#": "#",
      "$": "$",
    };
    this.uuid = uuid();
  }
  get types() {
    return Object.values(this.typeDict);
  }
  get objectDict() {
    return Object.fromEntries(this.objects.map(obj => [obj._id??obj.id, obj]));
  }
  get _nextId() {
    return Math.max(...(this.objects.map(it=>+(it._id??it.id)).filter(it=>!isNaN(it))))+1;
  }

  reset() {}

  get(gid) {
    if (typeof(gid)!="string") {return gid};
    const map = {
      // [this.symbols["@"]]: (id) => this.prefabs.find(obj => obj._id==id),
      [this.symbols["#"]]: (id) => this.objectDict[id],
      // [this.symbols["$"]]: (id) => this.interface?.[id] ?? null,
    };
    // console.log(gid);
    if (gid?.[0] in map) {
      return map[gid?.[0]](gid?.slice?.(1));
    };
    return map[this.symbols["#"]](gid);
  }

  typeObjects(type) {
    return this.objects.filter(obj => obj._type==type);
  }

  makeNewObject(bud) {
    let obj = Object.assign({}, JSON.parse(JSON.stringify(bud)));
    // obj._isNew = true;
    obj._id = this.nextId;
    this.nextId++;
    this.objects.push(obj);
    return obj;
  }

  makeNewObjectWithType(typeName) {
    let bud = {
      type: typeName,
    };
    let type = this.typeDict[typeName]??{};
    for (let slot of (type.solts??[])) {
      if (slot.required && slot.name) {
        bud[slot.name] = slot.default??slot.init??null;
      };
    };
    return this.makeNewObject(bud);
  }

  cloneObject(bud) {
    return this.makeNewObject(bud);
  }



  updateObject(obj) {
    // 旧方法
    // this.deleteObject(obj);
    // obj._isNew = false;
    // this.objects.push(obj);

    // 新方法
    let old = this.objectDict[obj._id??obj.id];
    for (let key in old) {
      if (['_id', 'id'].includes(key)) {continue};
      delete old.key;
    };
    Object.assign(old, obj);
  }

  deleteObject(obj) {
    this.deleteObjectById(obj._id??obj.id);
  }
  deleteObjectById(objId) {
    let idx = this.objects.findIndex(obj => obj._id==objId);
    if (idx==-1) {
      idx = this.objects.findIndex(obj => obj.id==objId);
    };
    if (idx==-1) {return;};
    console.log(idx);
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


  typeOf(object) {
    let typeFace = object['_type'] ?? object['type'] ?? "";
    typeFace = typeFace.replace(/^@+/g, "");
    return this.typeDict[typeFace] ?? {'name': typeFace};
  }


  assignObject(object) {
    this.makeNewObject(object);
  }


  assignObjects(objects) {
    for (let object of objects) {
      this.assignObject(object);
    };
  }


  assignType(type) {
    if (type.name!=null) {
      this.typeDict[type.name] = type;
    };
  }


  assignTypes(types) {
    for (let type of types) {
      this.assignType(type);
    };
  }


  assignLabelSet(label_set, definition) {
    let [kk, ll] = label_set;
    for (let vv of ll) {
      let label = {
        'domain': kk,
        'face': vv,
      };
      if (definition['namespace']) {label['namespace'] = definition['namespace'];};
      this.labels.push(label);
    };
  }

  assignLabelSets(label_sets, definition) {
    for (let label_set of label_sets) {
      this.assignLabelSet(label_set, definition);
    };
  }


  initDefinition(definition) {
    // 各种类型的定义
    this.assignLabelSets(definition?.['label_sets']??[], definition);
    this.assignTypes(definition?.['object_types']??[], definition);
  }

  initData(data) {
    // 标注结果，各种对象
    this.assignObjects(data?.['objects']??[]);
  }




}

export default CMR;