
fn = it => it;


fff = () => {

  labelsAgree = (labels, lo) => {
    let countDict = lo.countBy(labels, it=>it);
    // console.log(countDict);
    let vmax = lo.max(lo.values(countDict));
    let vsum = lo.sum(lo.values(countDict));
    let rr = vmax/vsum;
    console.log(rr);
    return rr;
  };

  labelSide = (label) => {
    label = label.toLowerCase();
    const map = {
      'somebad': 'bad',
      'somefine': 'fine',
    };
    if (label in map) {
      return map[label];
    };
    return label;
  };

  annoLabels = (anno, lo) => lo.uniq(anno?.content?.annotations.map(it=>it.label).sort());

  annoLabelText = (anno, lo) => annoLabels(anno, lo).join("&");

  annoLabelSide = (anno, lo) => annoLabels(anno, lo).map(it=>labelSide(it)).join("&");

  // task1最宽松一致性 = (entry, db, lo) => {
  //   let aids = entry?.allAnnos??[];
  //   let annos = aids.map(aid=>db?.annoDict?.[aid]);
  //   let labelses = annos.map(anno=>annoLabels(anno, lo));
  //   return labelsAgree(labelTexts, lo);
  // };

  单条较宽松一致性 = (entry, db, lo) => {
    let aids = entry?.allAnnos??[];
    let annos = aids.map(aid=>db?.annoDict?.[aid]);
    let labelTexts = annos.map(anno=>annoLabelSide(anno, lo));
    return labelsAgree(labelTexts, lo);
  };

  单条严格一致性 = (entry, db, lo) => {
    let aids = entry?.allAnnos??[];
    let annos = aids.map(aid=>db?.annoDict?.[aid]);
    let labelTexts = annos.map(anno=>annoLabelText(anno, lo));
    return labelsAgree(labelTexts, lo);
  };

  双人一致率 = (甲, 乙, db, lo) => {
    let aa = (甲?.allAnnos??[]).map(aid=>db?.annoDict?.[aid]?.entry);
    let bb = (乙?.allAnnos??[]).map(aid=>db?.annoDict?.[aid]?.entry);
    let eids = lo.intersectionBy(aa, bb);
    let entries = eids.map(eid=>db?.entryDict?.[eid]).filter(it=>it);
    console.log(entries);
    let result = {};
    for (let entry of entries) {
      单条严格一致性(entry, db, lo);
      单条较宽松一致性(entry, db, lo);
    };
  };
  aa = app.theDB.userDict["9"];
  bb = app.theDB.userDict["10"];
  双人一致率(aa, bb, app.theDB, _);





};


fn2 = () => {

batchName="task1-01";

log = console.log;
annos = app.theDB.annos.filter(it=>it.batchName==batchName&&app.theDB.userDict[it.user]?.currTaskGroup!="zwdGroup");

ll = annos.map(anno=>_.min([anno._timeInfo.totalDur,1000*60*3]));

avg = _.sum(ll)/ll.length;
log(`${batchName} 每条标注平均耗费时长（单位 秒，超过3分钟以3分钟计）：`, avg/1000);
sorted_ll = _.sortBy(ll, it=>+it);
log(`${batchName} 最短的耗时（单位 秒）：`, sorted_ll[0]/1000);
log(`${batchName} 中位数耗时（单位 秒）：`, sorted_ll[Math.round(sorted_ll.length/2)]/1000);

firstTimes = _.sortBy(annos.map(anno=>new Date(anno._timeInfo.detail[0][0])), it=>it.valueOf());
log(`${batchName} 的第一条标注的时间是：`, firstTimes[0]);
log(`${batchName} 的第50条标注的时间是：`, firstTimes[49]);
log(`${batchName} 的最中间标注的时间是：`, firstTimes[Math.round(firstTimes.length/2)]);
log(`${batchName} 的倒数第50条标注的时间是：`, firstTimes.at(-50));
log(`${batchName} 的最后一条标注的时间是：`, firstTimes.at(-1));
log(`${batchName} 总耗时（单位 小时）：`, (firstTimes.at(-1)-firstTimes[0])/1000/60/60);


一些annos的总历时 = (annos, lo) => {
  let firstEnterTimes = lo.sortBy(annos.map(anno=>new Date(anno._timeInfo.detail[0][0])), it=>it.valueOf());
  let firstSaveTimes = lo.sortBy(annos.map(anno=>new Date(anno._timeInfo.detail[0][1])), it=>it.valueOf());
  return firstSaveTimes.at(-1)-firstEnterTimes[0];
};

一个用户某个批次的总历时 = (user, batchName, db, lo) => {
  let annos = db.annos.filter(it=>it.batchName==batchName&&it.user==user.id);
  return 一些annos的总历时(annos, lo);
};

每个用户的总历时pair列表 = app.theDB.users
  .filter(it=>it.currTaskGroup!="zwdGroup")
  .map(it=>[it, 一个用户某个批次的总历时(it, batchName, app.theDB, _)])
  .filter(it=>it[1]!=null&&!isNaN(it[1]));
每个用户的总历时pair列表 = _.sortBy(每个用户的总历时pair列表, it=>+it[1]);
pairs = 每个用户的总历时pair列表.map(it=>[it[0].id, it[0].currTaskGroup, it[0].name, +it[1]]);

每个用户的总历时列表 = 每个用户的总历时pair列表.map(it=>it[1]);


平均总历时 = _.sum(每个用户的总历时列表)/每个用户的总历时列表.length;
log(`${batchName} 每个用户平均历时（单位 分钟）：`, 平均总历时/1000/60);

sorted_每个用户的总历时列表 = _.sortBy(每个用户的总历时列表, it=>+it);
log(`${batchName} 最快用户历时（单位 分钟）：`, sorted_每个用户的总历时列表[0]/1000/60);
log(`${batchName} 中位用户历时（单位 分钟）：`, sorted_每个用户的总历时列表[Math.round(sorted_每个用户的总历时列表.length/2)]/1000/60);
log(`${batchName} 最慢用户历时（单位 分钟）：`, sorted_每个用户的总历时列表.at(-1)/1000/60);





一些annos的总耗时 = (annos, lo) => {
  let totalDurs = annos.map(anno=>anno._timeInfo.totalDur);
  return lo.sum(totalDurs);
};

一个用户某个批次的总耗时 = (user, batchName, db, lo) => {
  let annos = db.annos.filter(it=>it.batchName==batchName&&it.user==user.id);
  return 一些annos的总耗时(annos, lo);
};

每个用户的总耗时pair列表 = app.theDB.users
  .filter(it=>it.currTaskGroup!="zwdGroup")
  .map(it=>[it, 一个用户某个批次的总耗时(it, batchName, app.theDB, _)])
  .filter(it=>it[1]!=null&&!isNaN(it[1])&&it[1]!=0);
每个用户的总耗时pair列表 = _.sortBy(每个用户的总耗时pair列表, it=>+it[1]);
pairs = 每个用户的总耗时pair列表.map(it=>[it[0].id, it[0].currTaskGroup, it[0].name, +it[1]]);

每个用户的总耗时列表 = 每个用户的总耗时pair列表.map(it=>it[1]);


平均总耗时 = _.sum(每个用户的总耗时列表)/每个用户的总耗时列表.length;
log(`${batchName} 每个用户平均耗时（单位 分钟）：`, 平均总耗时/1000/60);

sorted_每个用户的总耗时列表 = _.sortBy(每个用户的总耗时列表, it=>+it);
log(`${batchName} 最快用户耗时（单位 分钟）：`, sorted_每个用户的总耗时列表[0]/1000/60);
log(`${batchName} 中位用户耗时（单位 分钟）：`, sorted_每个用户的总耗时列表[Math.round(sorted_每个用户的总耗时列表.length/2)]/1000/60);
log(`${batchName} 最慢用户耗时（单位 分钟）：`, sorted_每个用户的总耗时列表.at(-1)/1000/60);



log("pairs");
csv = pairs.map(it=>it.map(xx=>JSON.stringify(xx)).join(",")).join("\n");
log(csv);

app.theSaver.saveText(csv, 'task1-01-实际耗时表.csv')




};


export { fn };
