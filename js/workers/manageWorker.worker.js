const extendTasks = async (theDB) => {
  // require tasks, annos

  if (!theDB.topics?.length) {
    theDB.topics = [];
  };
  if (!theDB.batchNames?.length) {
    theDB.batchNames = [];
  };
  if (!theDB.batches?.length) {
    theDB.batches = [];
  };
  theDB.topicTaskDict = {};
  theDB.batchNameTaskDict = {};
  theDB.inf_user_all_tasks = {};
  theDB.inf_entry_all_tasks = {};
  for (let task of theDB.tasks) {

    task.submitters = theDB.annos.filter(anno => anno.task==task.id).map(anno => anno.user);
    task.enough = ((task.to?.length??0) <= (task.submitters?.length??0));

    if (task.topic?.length && !theDB.topics.includes(task.topic)) {
      theDB.topics.push(task.topic);
    };
    if (task.batchName?.length && !theDB.batchNames.includes(task.batchName)) {
      theDB.batchNames.push(task.batchName);
    };
    if (!theDB.batches.includes(task.batch)) {
      theDB.batches.push(task.batch);
    };

    if (task.topic?.length && !(task.topic in theDB.topicTaskDict)) {
      theDB.topicTaskDict[task.topic] = [];
    };
    if (task.topic?.length) {
      theDB.topicTaskDict[task.topic].push(task);
    };

    if (task.batchName?.length && !(task.batchName in theDB.batchNameTaskDict)) {
      theDB.batchNameTaskDict[task.batchName] = [];
    };
    if (task.batchName?.length) {
      theDB.batchNameTaskDict[task.batchName].push(task);
    };

    for (let user of task.to??[]) {
      if (!(user in theDB.inf_user_all_tasks)) {
        theDB.inf_user_all_tasks[user] = [];
      };
      theDB.inf_user_all_tasks[user].push(task.id);
    };

    if (!(task.entry in theDB.inf_entry_all_tasks)) {
      theDB.inf_entry_all_tasks[task.entry] = [];
    };
    theDB.inf_entry_all_tasks[task.entry].push(task.id);

    theDB.taskDict[task.id] = task;

  };

  return theDB;
};

const _annoTimeCompute = (anno) => {
  const logs = anno?.content?._ctrl?.timeLog ?? [];

  let box = [];
  let pureBox = [];

  let pureStop = false;
  for (let log of logs) {
    if (log[0]=="check") {
      pureStop = true;
    };
    if (log[0]=="in") {
      box.push([log[1], null]);
      if (!pureStop) {
        pureBox.push([log[1], null]);
      };
    };
    if (log[0]=="out" && box.length) {
      if (box.at(-1)[1]==null) {
        box.at(-1)[1] = log[1];
        if (!pureStop) {
          pureBox.at(-1)[1] = log[1];
        };
      };
    };
  };

  let totalDur = 0;
  for (let pair of box) {
    if (pair[0].length&&pair[1].length) {
      let delta = (new Date(pair[1])) - (new Date(pair[0]));
      totalDur += delta;
    };
  };

  let pureTotalDur = 0;
  for (let pair of pureBox) {
    if (pair[0].length&&pair[1].length) {
      let delta = (new Date(pair[1])) - (new Date(pair[0]));
      pureTotalDur += delta;
    };
  };

  let firstDur = (new Date(box[0][1])) - (new Date(box[0][0]));
  let stride = (new Date(box.at(-1)[1])) - (new Date(box[0][0]));
  let pureStride = (new Date(pureBox.at(-1)[1])) - (new Date(pureBox[0][0]));
  let lastAt = box.at(-1)[1];
  let pureLastAt = pureBox.at(-1)[1];
  return {firstDur, totalDur, pureTotalDur, stride, pureStride, lastAt, pureLastAt, detail: box};
};

const extendAnnos = async (theDB) => {
  // require annos, tasks

  if (!theDB.topics?.length) {
    theDB.topics = [];
  };
  theDB.topicAnnoDict = {};
  theDB.labels = [];
  theDB.labelAnnoDict = {};
  theDB.inf_user_all_annos = {};
  theDB.inf_entry_all_annos = {};
  theDB.inf_user_task_anno = {};
  for (let anno of theDB.annos) {
    anno._timeInfo = _annoTimeCompute(anno);

    anno.polygraph = theDB.taskDict[anno.task]?.polygraph;

    if (!anno.topic) {
      anno.topic = theDB.taskDict[anno.task]?.topic;
    };
    if (!anno.batch) {
      anno.batch = theDB.taskDict[anno.task]?.batch;
    };
    if (!anno.batchName) {
      anno.batchName = theDB.taskDict[anno.task]?.batchName;
    };

    if (anno.topic?.length && !theDB.topics.includes(anno.topic)) {
      theDB.topics.push(anno.topic);
    };
    if (anno.topic?.length && !(anno.topic in theDB.topicAnnoDict)) {
      theDB.topicAnnoDict[anno.topic] = [];
    };
    if (anno.topic?.length) {
      theDB.topicAnnoDict[anno.topic].push(anno);
    };

    theDB.inf_user_task_anno[`${anno.user}/${anno.task}`] = anno.id;

    if (!(anno.user in theDB.inf_user_all_annos)) {
      theDB.inf_user_all_annos[anno.user] = [];
    };
    theDB.inf_user_all_annos[anno.user].push(anno.id);

    if (!(anno.entry in theDB.inf_entry_all_annos)) {
      theDB.inf_entry_all_annos[anno.entry] = [];
    };
    theDB.inf_entry_all_annos[anno.entry].push(anno.id);

    for (let annot of anno?.content?.annotations??[]) {
      let annot_topic_label = `${anno.topic}-${annot.label}`
      if (annot.label?.length && !theDB.labels.includes(annot_topic_label)) {
        theDB.labels.push(annot_topic_label);
      };
      if (annot.label?.length && !(annot_topic_label in theDB.labelAnnoDict)) {
        theDB.labelAnnoDict[annot_topic_label] = [];
      };
      if (annot.label?.length) {
        theDB.labelAnnoDict[annot_topic_label].push(anno.id);
      };
    };

    theDB.annoDict[anno.id] = anno;
  };

  return theDB;
};

const extendUsers = async (theDB) => {
  // require users, tasks, annos
  // require extendTasks

  for (let user of theDB.users) {
    // user.allTasks = theDB.tasks.filter(task => task.to.includes(user.id)).map(it=>it.id);
    // user.allAnnos = theDB.annos.filter(anno => anno.user==user.id).map(it=>it.id);
    user.allTasks = theDB.inf_user_all_tasks[user.id]??[];
    user.allAnnos = theDB.inf_user_all_annos[user.id]??[];
    user.currBatchName = theDB?.taskDict?.[user.allTasks.sort((a,b)=>+theDB?.taskDict?.[a]?.batch-theDB?.taskDict?.[b]?.batch)?.at?.(-1)]?.batchName;
    user.doneTasks = user.allTasks.map(tid=>theDB.taskDict[tid]).filter(task => (task.submitters??[]).includes(user.id)).map(it=>it.id);
    theDB.userDict[user.id] = user;
  };

  return theDB;
};

const extendEntries = async (theDB) => {
  // require entries, tasks, annos

  for (let entry of theDB.entries) {
    // if (theDB.tasks.find(it=>it.entry==entry.id)) {
    // entry.allTasks = theDB.tasks.filter(task=>task.entry==entry.id).map(it=>it.id);
    // entry.allAnnos = theDB.annos.filter(anno=>anno.entry==entry.id).map(it=>it.id);
    entry.allTasks = theDB.inf_entry_all_tasks[entry.id]??[];
    entry.allAnnos = theDB.inf_entry_all_annos[entry.id]??[];
    theDB.entryDict[entry.id] = entry;
    // };
  };

  return theDB;
};


onmessage = async function (event) {
  const pack = event.data;
  console.log("pack:", pack);

  const tplt = async (fn, theDB, label="tplt") => {
    console.time(label);
    postMessage({
      'command': "working",
    });
    let result = await fn(theDB);
    postMessage({
      'command': "updateDB",
      'data': result,
    });
    // postMessage({
    //   'command': "done",
    // });
    console.timeEnd(label);
  };

  const actions = {
    'alert': (data)=>{
      postMessage({
        'command': "alert",
        'data': data,
      });
    },
    'extendTasks': async (theDB)=>{
      await tplt(extendTasks, theDB, "extendTasks");
    },
    'extendAnnos': async (theDB)=>{
      await tplt(extendAnnos, theDB, "extendAnnos");
    },
    'extendEntries': async (theDB)=>{
      await tplt(extendEntries, theDB, "extendEntries");
    },
    'extendUsers': async (theDB)=>{
      await tplt(extendUsers, theDB, "extendUsers");
    },


  };
  if (pack.command in actions) {
    console.time(`cmd-${pack.command}`);
    await actions[pack.command](pack.data);
    console.timeEnd(`cmd-${pack.command}`);
  } else {
    postMessage({
      'command': "alert",
      'data': [`Worker 收到无效指令【${pack}】`, "warning", null, pack],
    });
  };
}