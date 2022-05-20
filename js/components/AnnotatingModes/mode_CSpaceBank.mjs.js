export default (__pack) => {
  // ========== ========== ========== ========== ========== ========== ========== ==========
  let {
    reactive, computed, onMounted, h,
    BsBadge,
    props, ctx,

    div,
    span,
    someBtn,
    someKeyText,
    someKeyString,
    modeMap,

    tokenSelector,
    alertBox,
    stepCtrl,

    mode,
    modeMatch,

    selection_length,
    step_props,
    isWeb,

    idxesToText,
    clearSelector,

    webButtonsDiv,
    generalButtonsDiv,

    __LODASH,
  } = __pack;
  // ========== ========== ========== ========== ========== ========== ========== ==========

  const v = x => x.value;
  const muted = text => span({'class': "text-muted"}, text);
  const btn = (attrs, children, btnStyle) => {
    attrs = attrs ?? {};
    attrs['class']=["btn", `btn-${btnStyle??"outline-primary"}`, attrs.class];
    attrs['type']="button";
    return h("button", attrs, children);
  };
  const lightBtn = (icon, text, title, attrs) => {
    attrs = attrs ?? {};
    attrs['class']=["btn-sm", attrs.class];
    attrs['title']=title??text;
    // return btn({'class': "btn-sm", title: title??text}, [icon, icon?" ":null, muted(text)], "outline-secondary");
    return btn(attrs, [icon, icon?" ":null, muted(text)], "----light");
  };
  const bi = (name) => {
    return h("i", {'class': ["bi", `bi-${name??'square'}`]});
  };
  const ti = (name) => {
    return h("i", {'class': ["ti", `ti-${name??'square'}`]});
  };
  const vr = () => h("div", {'class': "vr"});
  const divWrap = (children, key, attrs) => {
    attrs = attrs ?? {};
    if (key!=null) {
      attrs['key']=key;
    };
    attrs['style']="box-shadow: rgba(0, 0, 0, 0.075) 0px 0px 0px 1px inset;";
    attrs['class']=["card bg-light border-0 gap-2 p-0", attrs.class];
    return div(attrs, children);
  };

  // ========== ========== ========== ========== ========== ========== ========== ==========

  const modeData = reactive({
    entities: [],
    events: [],
    spRelations: [],
  });
  const localData = reactive({
  });

  // ========== ========== ========== ========== ========== ========== ========== ==========

  const analysis = (posList, array) => {
    let temp = {
      text: "",
      tknIdxes: [],
    };
    for (let token of props.tokens??[]) {
      if (!posList.includes(token.pos)) {continue;};
      if (token.seg==null||token.seg=="S") {
        temp = {
          text: idxesToText([token.idx]),
          tknIdxes: [token.idx],
        };
        array.push(temp);
        continue;
      };
      if (token.seg=="B") {
        temp.text = idxesToText([token.idx]);
        temp.tknIdxes = [token.idx];
        continue;
      };
      if (token.seg=="M") {
        temp.text = `${temp.text}${idxesToText([token.idx])}`;
        temp.tknIdxes = [...temp.tknIdxes, token.idx];
        continue;
      };
      if (token.seg=="E") {
        temp.text = `${temp.text}${idxesToText([token.idx])}`;
        temp.tknIdxes = [...temp.tknIdxes, token.idx];
        array.push(temp);
        continue;
      };
    };
    console.log(array);
  };

  const analysisEntities = () => {
    analysis(["n", "nr", "ns", "r", "s"], modeData.entities);
  };

  const analysisEvents = () => {
    analysis(["v"], modeData.events);
  };

  const reindexEntities = (map) => {
    for (let entity of modeData.entities) {
      if (entity.plural) {
        entity.members = (entity.members??[]).map(idx=>map[idx]).filter(it=>it!=null);
      };
      entity.corefs = (entity.corefs??[]).map(idx=>map[idx]).filter(it=>it!=null);
    };
  };

  const sortEntities = () => {
    //
    let ll = modeData.entities.map((entity, idx)=>[idx, entity?.tknIdxes?.[0]]);
    ll.sort((a, b)=>(a[1]??-1)-(b[1]??-1));
    let pp = ll.map((pair, newIdx)=>[pair[0], newIdx]);
    const map = Object.fromEntries(pp);
    console.log(map);
    //
    modeData.entities.sort((a, b)=>(a?.tknIdxes?.[0]??-1)-(b?.tknIdxes?.[0]??-1));
    reindexEntities(map);
  };

  const deleteEntity = (idx) => {
    // 构造新旧 idx 的映射
    const map = {};
    let jjd = 0;
    for (let iid=0; iid<modeData.entities.length; iid++) {
      if (idx == iid) {continue;};
      map[iid] = jjd;
      jjd++;
    };
    reindexEntities(map);
    modeData.entities.splice(idx, 1);
  };

  const makeNewEntity = () => {
    if (selection_length) {
      modeData.entities.push({
        text: idxesToText(props.selection?.array),
        tknIdxes: props.selection?.array,
      });
      clearSelector();
      return;
    };
    modeData.entities.push({});
  };

  // ========== ========== ========== ========== ========== ========== ========== ==========

  const idxesToBlocks = (idxes) => {
    let blocks = [];
    let tmp = [];
    let last = -999;
    for (let idx of idxes) {
      if (idx != last+1) {
        blocks.push(tmp);
        tmp = [];
      };
      tmp.push(idx);
      last = idx;
    };
    blocks.push(tmp);
    blocks = blocks.filter(it=>it.length);
    return blocks;
  };

  const itemMainTextSpan = (item) => {
    const texts = idxesToBlocks(item.tknIdxes).map(block=>idxesToText(block));
    let ll = [];
    let xx = true;
    for (let text of texts) {
      if (xx) {
        xx = false;
      } else {
        ll.push(muted("+"));
      };
      ll.push(text);
    };
    return ll;
  };

  const entityByIdx = idx => modeData.entities[idx];
  const eventByIdx = idx => modeData.events[idx];

  const entitySpanCore = (entity) => {
    if (entity==null) {
      return "[null]";
    };
    const symbol = entity.fictive ? muted("$") : muted("#");
    return [symbol, itemMainTextSpan(entity), symbol];
  };

  const eventSpanCore = (event) => {
    if (event==null) {
      return "[null]";
    };
    const symbol = muted("%");
    return [symbol, itemMainTextSpan(event), symbol];
  };

  const entitySpan = (entity) => {
    if (entity==null) {
      return "[null]";
    };
    const symbol = entity.fictive ? muted("$") : muted("#");
    const corefTail = entity.corefs?.length
      ? (entity.corefs??[]).map(corefIdx=>[muted("="), entitySpanCore(entityByIdx(corefIdx))])
      : null ;
    const pluralTail = entity.plural ? [
      muted("="), muted("<"),
      entity.members?.length
        ? [(entity.members??[]).map(memberIdx=>entityByIdx(memberIdx)?.text).join(", "), entity.filled?null:muted("...")]
        : muted("...") ,
      muted(">")
    ] : null;
    return span({}, [entitySpanCore(entity), corefTail, pluralTail]);
  };

  const entitySpanBase = (entity)=>{
    if (entity==null) {
      return "[null]";
    };
    const corefTailBase = entity.corefs?.length
      ? (entity.corefs??[]).map(corefIdx=>[muted("="), entitySpanBase(entityByIdx(corefIdx))])
      : null ;
    return [itemMainTextSpan(entity), corefTailBase];
  };

  // ========== ========== ========== ========== ========== ========== ========== ==========

  // 实体操作区
  const annotatingSectionOfEntities = () => div({'class': "vstack gap-2 my-1"}, [
    div({'class': "h5 mt-3 mb-1"}, ["实体"]),

    divWrap([
      div({'class': "d-flex gap-1 justify-content-around"}, [
        lightBtn(bi("box"), "实体预分析", null, {
          'class': "w-100",
          'onClick': ()=>{analysisEntities()},
        }),
      ]),
    ], null, {'class': {'d-none': modeData.entities?.length}}),

    ...modeData.entities.map((entity, idx) => divWrap([

      // 基本展示
      div({'class': "input-group input-group-sm"}, [
        span({'class': "input-group-text text-muted"}, [idx]),
        div({'class': "form-control d-inline-block text-center"}, entitySpan(entity)),
        !entity.__ctrl_show_more
        ? btn({'title': "更多操作", 'onClick': ()=>{
          entity.__ctrl_show_more=true;}}, [bi("three-dots")], "outline-secondary")
        : btn({'title': "收起更多操作", 'onClick': ()=>{
          entity.__ctrl_show_more=undefined;
          entity.__ctrl_show_add_coref=undefined;
          entity.__ctrl_show_add_member=undefined;}}, [bi("caret-up")], "outline-secondary"),
      ]),

      // 基础操作
      div({'class': ["btn-toolbar justify-content-around gap-1 mx-1", {'d-none': !entity.__ctrl_show_more}]}, [
        lightBtn(bi("boxes"), "设为群体", "将此实体标记为复数实体构成的群体", {
          'class': {'d-none': entity.plural},
          'onClick': ()=>{entity.plural=true}}),
        lightBtn(bi("record2"), "设为个体", "将此实体标记为单数实体", {
          'class': {'d-none': !entity.plural},
          'onClick': ()=>{entity.plural=undefined; entity.members=undefined;}}),
        lightBtn(bi("plus-circle"), "添加成员", "为群体添加成员", {
          'class': {'d-none': !entity.plural},
          'onClick': ()=>{
            localData.__selected_entity_idx=undefined;
            entity.__ctrl_show_add_coref=undefined;
            entity.__ctrl_show_add_member=true;}}),
        lightBtn(bi("toggle-off"), "设为不完整", "将此复数实体的成员清单标记为不完整", {
          'class': {'d-none': !entity.plural||!entity.filled},
          'onClick': ()=>{entity.filled=false}}),
        lightBtn(bi("toggle-on"), "设为完整", "将此复数实体的成员清单标记为完整", {
          'class': {'d-none': !entity.plural||entity.filled},
          'onClick': ()=>{entity.filled=true}}),
        lightBtn([bi("--sun"), `#...#`], "设为现实实体", "将此实体标记为现实实体", {
          'class': {'d-none': !entity.fictive},
          'onClick': ()=>{entity.fictive=undefined}}),
        lightBtn([bi("--moon"), `$...$`], "设为虚拟实体", "将此实体标记为虚拟实体", {
          'class': {'d-none': entity.fictive},
          'onClick': ()=>{entity.fictive=true}}),
        lightBtn(bi("diagram-2"), "添加共指", null, {
          'class': {'d-none': false},
          'onClick': ()=>{
            localData.__selected_entity_idx=undefined;
            entity.__ctrl_show_add_member=undefined;
            entity.__ctrl_show_add_coref=true;}}),
      ]),

      // 已共指的实体
      div({'class': ["px-2", {'d-none': !entity.__ctrl_show_add_coref}]}, [
        div({'class': "input-group input-group-sm"}, [
          span({'class': "input-group-text text-muted"}, ["已共指"]),
          div({'class': "form-control d-inline-block text-center"}, (entity.corefs??[]).map(
            (corefIdx, ixx) => h(BsBadge, {
              'class': "m-1 text-wrap text-break",
              'canRemove': true,
              'onRemove': (event)=>{
                entity.corefs.splice(ixx, 1);
              },
            }, entitySpan(modeData.entities[corefIdx]))
          )),
        ]),
      ]),

      // 给实体添加共指
      div({'class': ["px-2", {'d-none': !entity.__ctrl_show_add_coref}]}, [
        div({'class': "input-group input-group-sm"}, [
          span({'class': "input-group-text text-muted"}, ["待操作"]),
          h("select", {
            'class': "form-select form-select-sm text-center",
            'value': localData.__selected_entity_idx,
            'onChange': (event)=>{localData.__selected_entity_idx = event.target.value},
            'title': "请选择要操作的实体",
          }, [
            modeData.entities.map((ett, jdx) => (jdx!=idx&&!entity.corefs?.includes?.(+jdx)) ? h(
              "option", {'key': jdx, 'value': jdx,}, entitySpan(ett)
            ) : null),
          ]),
          btn({'title': "加入", 'onClick': ()=>{
            if (entity.corefs==null) {entity.corefs=[]};
            if (localData.__selected_entity_idx && !entity.corefs.includes(+localData.__selected_entity_idx)) {
              // console.log(`${entity.corefs}`, `${localData.__selected_entity_idx}`);
              entity.corefs.push(+localData.__selected_entity_idx);
            };
          }}, [bi("plus-lg")], "outline-secondary"),
          btn({'title': "完成", 'onClick': ()=>{
            entity.corefs?.sort?.();
            entity.__ctrl_show_add_coref=undefined;
            localData.__selected_entity_idx=undefined;
          }}, [bi("check2")], "outline-secondary"),
        ]),
      ]),

      // 复数实体已有的成员
      div({'class': ["px-2", {'d-none': !entity.__ctrl_show_add_member}]}, [
        div({'class': "input-group input-group-sm"}, [
          span({'class': "input-group-text text-muted"}, ["已加入"]),
          div({'class': "form-control d-inline-block text-center"}, (entity.members??[]).map(
            (memberIdx, ixx) => h(BsBadge, {
              'class': "m-1 text-wrap text-break",
              'canRemove': true,
              'onRemove': (event)=>{
                entity.members.splice(ixx, 1);
              },
            }, entitySpan(modeData.entities[memberIdx]))
          )),
        ]),
      ]),

      // 给复数实体添加成员
      div({'class': ["px-2", {'d-none': !entity.__ctrl_show_add_member}]}, [
        div({'class': "input-group input-group-sm"}, [
          span({'class': "input-group-text text-muted"}, ["待操作"]),
          h("select", {
            'class': "form-select form-select-sm text-center",
            'value': localData.__selected_entity_idx,
            'onChange': (event)=>{localData.__selected_entity_idx = event.target.value},
            'title': "请选择要操作的实体",
          }, [
            modeData.entities.map((ett, jdx) => (jdx!=idx&&!entity.members?.includes?.(+jdx)) ? h(
              "option", {'key': jdx, 'value': jdx,}, entitySpan(ett)
            ) : null),
          ]),
          btn({'title': "加入", 'onClick': ()=>{
            if (entity.members==null) {entity.members=[]};
            if (localData.__selected_entity_idx && !entity.members.includes(+localData.__selected_entity_idx)) {
              // console.log(`${entity.members}`, `${localData.__selected_entity_idx}`);
              entity.members.push(+localData.__selected_entity_idx);
            };
          }}, [bi("plus-lg")], "outline-secondary"),
          btn({'title': "完成", 'onClick': ()=>{
            entity.members?.sort?.();
            entity.__ctrl_show_add_member=undefined;
            localData.__selected_entity_idx=undefined;
          }}, [bi("check2")], "outline-secondary"),
        ]),
      ]),

      // 整体操作
      div({'class': ["btn-toolbar justify-content-around gap-1 mx-1", {'d-none': !entity.__ctrl_show_more||entity.__ctrl_show_add_member||entity.__ctrl_show_add_coref}]}, [
        // lightBtn(bi("input-cursor-text"), "填入"),
        lightBtn(bi("textarea-t"), "填入选中的片段", "将选中的片段的文本填入槽中", {
          'class': {'d-none': !v(selection_length)},
          'onClick': ()=>{
            entity.text = idxesToText(props.selection?.array);
            entity.tknIdxes = props.selection?.array;
            clearSelector();
          }}),
        lightBtn(bi("input-cursor"), "补全不连续文本", null, {
          'class': {'d-none': !v(selection_length)},
          'onClick': ()=>{
            entity.text = `${entity.text}${"+"}${idxesToText(props.selection?.array)}`;
            entity.tknIdxes = [...entity.tknIdxes, ...props.selection?.array];
            clearSelector();
          }}),
        lightBtn(bi("trash3"), "删除", null, {'onClick': ()=>{deleteEntity(idx)}}),
      ]),

      entity.__ctrl_show_more ? div() : null,
    ], idx)),

    divWrap([
      div({'class': "d-flex gap-1 justify-content-around"}, [
        lightBtn(bi("plus-square"), "新增", null, {
          'class': "w-100",
          'onClick': ()=>{
            makeNewEntity();
          },
        }),
        modeData.entities?.length ? lightBtn(bi("sort-down-alt"), "排序", "按照文本中出现的顺序排序", {
          'class': "w-100",
          'onClick': ()=>{
            sortEntities();
          },
        }) : null,
        // lightBtn(bi("plus-square-dotted"), "新增隐含实体"),
      ]),
    ]),

  ]);

  // ========== ========== ========== ========== ========== ========== ========== ==========

  const makeNewEvent = () => {
    if (selection_length) {
      modeData.events.push({
        text: idxesToText(props.selection?.array),
        tknIdxes: props.selection?.array,
      });
      clearSelector();
      return;
    };
    modeData.events.push({});
  };

  const sortEvents = () => {
    //
    let ll = modeData.events.map((entity, idx)=>[idx, entity?.tknIdxes?.[0]]);
    ll.sort((a, b)=>(a[1]??-1)-(b[1]??-1));
    let pp = ll.map((pair, newIdx)=>[pair[0], newIdx]);
    const map = Object.fromEntries(pp);
    console.log(map);
    //
    modeData.events.sort((a, b)=>(a?.tknIdxes?.[0]??-1)-(b?.tknIdxes?.[0]??-1));
    reindexEntities(map);
  };

  // 事件操作区
  const annotatingSectionOfEvents = () => div({'class': "vstack gap-2 my-1"}, [
    div({'class': "h5 mt-3 mb-1"}, ["事件"]),

    divWrap([
      div({'class': "d-flex gap-1 justify-content-around"}, [
        lightBtn(bi("film"), "事件预分析", null, {
          'class': "w-100",
          'onClick': ()=>{analysisEvents()},
        }),
      ]),
    ], null, {'class': {'d-none': modeData.events?.length}}),

    divWrap([
      div({'class': "d-flex gap-1 justify-content-around"}, [
        lightBtn(bi("plus-square"), "新增"),
      ]),
    ]),

    divWrap([
      div({'class': "d-flex gap-1 justify-content-around"}, [
        lightBtn(bi("plus-square"), "新增", null, {
          'class': "w-100",
          'onClick': ()=>{
            makeNewEvent();
          },
        }),
        modeData.entities?.length ? lightBtn(bi("sort-down-alt"), "排序", "按照文本中出现的顺序排序", {
          'class': "w-100",
          'onClick': ()=>{
            sortEvents();
          },
        }) : null,
        // lightBtn(bi("plus-square-dotted"), "新增隐含实体"),
      ]),
    ]),

  ]);

  // ========== ========== ========== ========== ========== ========== ========== ==========

  // 空间关系操作区
  const annotatingSectionOfRelations = () => div({'class': "vstack gap-2 my-1"}, [
    div({'class': "h5 mt-3 mb-1"}, ["空间关系"]),

    divWrap([
      div({'class': "d-flex gap-1 justify-content-around"}, [
        lightBtn(bi("layers"), "空间关系预分析"),
      ]),
    ]),

    divWrap([
      div({'class': "input-group input-group-sm"}, [
        span({'class': "input-group-text text-muted"}, ["#"]),
        div({'class': "form-control d-inline-block text-center"}, ["#"]),
        btn({'title': "更多操作"}, [bi("three-dots")], "outline-secondary"),
      ]),
      div({'class': "btn-toolbar justify-content-end gap-1 px-1 mb-1"}, [
        btn({'class': "btn-sm"}, [bi("upload"), " ", "保存1"], "light"),
        btn({'class': "btn-sm"}, [bi("upload"), " ", "保存"], "light"),
        btn({'class': "btn-sm"}, [bi("upload"), " ", "保存"], "light"),
        btn({'class': "btn-sm"}, [bi("upload"), " ", "保存"], "light"),
      ]),
    ]),

    divWrap([
      div({'class': "d-flex gap-1 justify-content-around"}, [
        lightBtn(bi("plus-square"), "新增空间关系"),
      ]),
    ]),

  ]);

  // ========== ========== ========== ========== ========== ========== ========== ==========

  return () => {
    return [
      // ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------

      // 总指导语
      someKeyString("instruction"),

      // 主体
      div({ 'class': "container", }, [
        annotatingSectionOfEntities(),
        annotatingSectionOfEvents(),
        annotatingSectionOfRelations(),
      ]),

      // ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
      div({'class': "my-3"}),

      // 保存载入工具
      div({'class': "btn-toolbar __hstack gap-1 my-1"}, [
        div({'class': "btn-group btn-group-sm"}, [
          lightBtn(bi("upload"), "保存", "保存到服务器"),
          lightBtn(bi("recycle"), "加载已标", "重新加载之前标注好的内容"),
          // lightBtn(bi("clock-history"), "加载缓存"),
          lightBtn(bi("bug"), "debug", null, {
            'onClick': ()=>{console.log(modeData);},
          }),
        ]),
      ]),
      // ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------

      // 通用结束按钮区
      generalButtonsDiv({
        'ok': async(go)=>{
          console.log("---");
          await stepCtrl.goRefStep(go);
        },
        'reset': ()=>{
          console.log("---");
        },
      }, {
        'ok': ()=>true,
        'cancel': ()=>false,
      }),

      // ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
    ];
  };
  // ========== ========== ========== ========== ========== ========== ========== ==========
};
