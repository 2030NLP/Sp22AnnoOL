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
}

export default CMR;