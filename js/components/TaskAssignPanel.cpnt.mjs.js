import {
  reactive,
  computed,
  onMounted,
  watch,
  h,
} from '../modules_lib/vue_3.2.31_.esm-browser.prod.min.js';

const TaskAssignPanel = {
  props: ["dude", "guy"],
  emits: ["happy", 'good'],
  component: {
  },

  setup(props, ctx) {
    const localData = reactive({
    });

    const assignTopics = [
      {value: "清洗", desc: "清洗"},
      {value: "第1期", desc: "第1期"},
      {value: "第2期", desc: "第2期"},
      {value: "归因", desc: "归因"},
      {value: "精标", desc: "精标"},
    ];

    const assignData = reactive({
      settings: {
        'topic': null,
        'batchName': null,
        'user_tag': null,
        'task_tag': null,
        'users_per_task': 2,
        'tasks_per_user': 20,
        'exclusion': [],
        // 'polygraphs_per_user': {},
        'polygraphs_per_user_json_string': "",
        'retrieve': false,
      },
      'polygraphs_per_user_json_string_error': false,
      //
      assignUserBoxDict: {},
      //
      batch: 0,
      plans: [],
      planPerUser: [],
      analysis: [],
      analysisDict: {},
      undone: true,
      result: {},
    });
    watch(() => assignData.settings, async () => {
      await saveBasic();
    }, { deep: true });


    const selectUsersAuto = () => {
      for (let user of theDB.users) {
        let jd = Sp22FN.topic_regulation(user.currTask)==assignData.settings.topic && !user.quitted;
        assignData.assignUserBoxDict[user.id] = jd ? true : false;
      };
    };

    const selectUsersAll = () => {
      for (let user of theDB.users) {
        assignData.assignUserBoxDict[user.id] = true;
      };
    };

    const selectUsersNone = () => {
      for (let user of theDB.users) {
        assignData.assignUserBoxDict[user.id] = false;
      };
    };

    const planAssigment = async () => {
      cleanAssigment();
      assignData.undone = true;
      let aidx = await alertBox.pushAlert(`正在规划任务，请稍等……`, 'info', 99999999);
      let pack = assignData.settings;
      try {
        if (assignData.settings.polygraphs_per_user_json_string.length) {
          let polygraphs_per_user = JSON.parse(assignData.settings.polygraphs_per_user_json_string);
          pack.polygraphs_per_user = polygraphs_per_user;
        } else {
          pack.polygraphs_per_user = {};
        }
      } catch(error) {
        alertBox.removeAlert(aidx);
        alertBox.pushAlert(`无法解析测谎题配置，请检查`, 'warning', 5000, assignData.settings);
        return;
      };
      // pack.polygraphs_per_user = {
      //   'otherErrorString': 2,
      //   'otherErrorSeg': 3,
      // };
      const plansResp = await makeAssigmentPlan(pack);
      // const plansResp = await app.theBackEnd.makeAssigmentPlan(pack);
      if (plansResp?.data?.code!=200) {
        alertBox.removeAlert(aidx);
        alertBox.pushAlert(`规划任务时出现问题：${plansResp?.data?.msg}`, 'danger', 5000, plansResp);
        return;
      };

      const plans = plansResp?.data?.data;
      assignData.batch = plans[0]?.batch ?? 0;
      console.log(plans);
      let dct = {}
      for (let task of plans) {
        for (let user_id of task.to) {
          if (!(user_id in dct)) {
            dct[user_id] = [];
          };
          if (task.submitters==null) {
            task.submitters = [];
          };
          if (!task.submitters.includes(user_id)) {
            dct[user_id].push(task.id);
          };
        };
      };
      console.log(dct);
      //
      assignData.plans = plans;
      assignData.planPerUser = Object.entries(dct).filter(pair => pair[1].length);

      let bidx = alertBox.pushAlert(`计算完毕，准备规划结果……`, 'success', 9999999, plansResp);
      await analyzeAssignmentPlan();
      alertBox.removeAlert(bidx);

      alertBox.removeAlert(aidx);
      if (plans.length) {
        alertBox.pushAlert(`规划成功，请进行后续操作`, 'success', 3000, plansResp);
      } else {
        alertBox.pushAlert(`无法规划，请检查设置`, 'warning', 3000, plansResp);
      };
    };

    const analyzeAssignmentPlan = async () => {
      const analysis = [];
      for (let planTask of assignData.plans) {
        if (planTask.id in theDB.taskDict) {
          let item = {
            id: planTask.id,
            old_to: theDB.taskDict[planTask.id].to,
            old_submitters: theDB.taskDict.submitters,
            new_to: planTask.to,
            plan: planTask,
          };
          item.new_guys = lo.difference(item.new_to, item.old_to);
          item.solid_guys = lo.intersection(item.new_to, item.old_to);
          item.canceled_guys = lo.difference(item.old_to, item.new_to);
          item.type = item.canceled_guys.length ? "modify" : "assign";
          analysis.push(item);
        } else {
          let item = {
            id: planTask.id,
            old_to: [],
            old_submitters: [],
            new_to: planTask.to,
            plan: planTask,
            new_guys: planTask.to,
            solid_guys: [],
            canceled_guys: [],
          };
          item.type = "insert";
          analysis.push(item);
        };
      };
      assignData.analysis = lo.sortBy(lo.sortBy(analysis, it => it.canceled_guys.length), it => -it.new_guys.length);
      assignData.analysisDict = lo.keyBy(assignData.analysis, 'id');
    };

    const cleanAssigment = () => {
      assignData.batch = 0;
      assignData.plans = [];
      assignData.planPerUser = {};
      assignData.analysis = [];
      assignData.analysisDict = {};
      assignData.undone = true;
      assignData.result = {};
    };
    const cancelAssigment = () => {
      cleanAssigment();
      alertBox.pushAlert(`规划已撤除`, 'warning', 3000);
    };

    const doAssigment = async () => {
      let aidx = alertBox.pushAlert(`正在执行分配，请稍等……`, 'info', 99999999);
      const actResp = await app.theBackEnd.actAssigmentPlan(assignData.plans);
      if (actResp?.data?.code!=200) {
        alertBox.removeAlert(aidx);
        alertBox.pushAlert(`执行分配时出现问题：${actResp?.data?.msg}`, 'danger', 5000, actResp);
        return;
      };

      alertBox.removeAlert(aidx);
      if (true) {
        assignData.undone = false;
        assignData.result = actResp?.data?.data;
        // cleanAssigment();
        alertBox.pushAlert(`执行成功`, 'success', 5000, actResp);
      } else {
        alertBox.pushAlert(`执行失败`, 'danger', 5000, actResp);
      };
    };



    const makeAssigmentPlan = async (wrap) => {
      console.log([1, dateString()]);
      // let polygraphs_per_user = {
      //   'otherErrorString': 2,
      //   'otherErrorSeg': 3,
      // };
      let tables_to_update = await assignment(
        wrap?.['topic'],
        wrap?.['batchName'],
        wrap?.['user_tag'],
        wrap?.['task_tag'],
        wrap?.['users_per_task'],
        wrap?.['tasks_per_user'],
        wrap?.['exclusion'],
        wrap?.['polygraphs_per_user'],  // 选项配置
        wrap?.['retrieve'],
      );
      console.log([5, dateString()]);
      console.log(tables_to_update);
      return {'data': {'code': 200, 'data': tables_to_update}};
    };

    const assignment = async function (
      topic=null,
      batchName=null,
      user_tag=null,
      task_tag=null,
      users_per_task=2,
      tasks_per_user=20,
      exclusion=[],
      polygraphs_per_user={},  // TODO 选项配置
      retrieve=false,
      tasks_idx_base=_.max(theDB.tasks.map(it=>+it.id)),
      lo,
    ) {
      console.log(arguments);

      console.log([2, dateString()]);
      if (topic == null) {
        return [];
      };

      // let users = theDB.users.filter(it => (
      //   Sp22FN.topic_tags(topic).includes(it['currTask'])
      //   && (user_tag==null||(it['tags']?.length&&it['tags'].includes(user_tag)))
      //   && !it['quitted']
      // ));

      let users = theDB.users.filter(it => assignData.assignUserBoxDict[it.id]);

      let tasks = theDB.tasks.filter(it => (
        Sp22FN.topic_tags(topic).includes(it['topic'])
        && it['batchName'] == batchName
        && (task_tag==null||(it['tags']?.length&&it['tags'].includes(task_tag)))
        && !it['deleted']
      ));

      let e_ids = tasks.map(task => task['entry']);
      let entries = [];
      for (let e_id of e_ids) {
        let entry_found = _.find(theDB.entries, it => (it['id']==e_id && !it['deleted']));
        if (entry_found) {
          entries.push(entry_found);
        };
      };

      let pack = {
        entries: entries,
        users: users,
        tasks: tasks,
        topic: Sp22FN.topic_regulation(topic),
        batchName: batchName,
        exclusion: exclusion,
        users_per_task: users_per_task,
        tasks_per_user: tasks_per_user,
        polygraphs_per_user: polygraphs_per_user,
        tasks_idx_base: tasks_idx_base,
        retrieve: retrieve,
      };
      // theSaver.save(pack);

      console.log(['start', dateString()]);
      let tasks_to_update = await assign_tasks(foolCopy(pack), _);
      console.log(['end', dateString()]);
      return tasks_to_update;
    };



    const exportPlan = () => {
      theSaver.saveJson(assignData.plans, 'plans.json');
    };


    const classAssignAnalisisByUser = (user_id, task_id) => {
      let classConfig = {};
      if (theDB.entryDict[theDB.taskDict[task_id]?.entry]?.polygraph) {
        classConfig.prefix = "btn-outline-";
      } else {
        classConfig.prefix = "btn-";
      };
      if (assignData.analysisDict[task_id].new_guys.includes(user_id)) {
        classConfig.color = "success";
      } else {
        classConfig.color = "secondary";
      };
      return `${classConfig.prefix}${classConfig.color}`;
    };







    const saveBasic = async () => {
      await frg.setItem(`${APP_NAME}:version`, APP_VERSION);
      await frg.setItem(`${APP_NAME}:currentUser`, foolCopy(ctrl.currentUser));
      await frg.setItem(`${APP_NAME}:tab`, foolCopy(ctrl.tab));
      await frg.setItem(`${APP_NAME}:lastTime`, foolCopy(ctrl.lastTime));
      await frg.setItem(`${APP_NAME}:lastTimeDict`, foolCopy(ctrl.lastTimeDict));
      await frg.setItem(`${APP_NAME}:assignData_settings`, foolCopy(assignData.settings));
    };

    const loadBasic = async () => {
      let storedVersion = await frg.getItem(`${APP_NAME}:version`);
      let storedUser = await frg.getItem(`${APP_NAME}:currentUser`);
      if (storedUser != null) {
        ctrl.currentUser = storedUser;
        await _setMe();
      };
      let storedTime = await frg.getItem(`${APP_NAME}:lastTime`);
      if (storedTime != null) {
        ctrl.lastTime = storedTime;
      };
      let storedTimeDict = await frg.getItem(`${APP_NAME}:lastTimeDict`);
      if (storedTimeDict != null) {
        ctrl.lastTimeDict = storedTimeDict;
      };

      await goTab(await frg.getItem(`${APP_NAME}:tab`));

      let stored_assignData_settings = await frg.getItem(`${APP_NAME}:assignData_settings`);
      if (stored_assignData_settings != null) {
        assignData.settings = stored_assignData_settings;
      };
    };
















    watch(()=>props.name, ()=>{localData.userInfo.name = props.name;});
    watch(()=>props.token, ()=>{localData.userInfo.token = props.token;});

    const isManager = (user) => {
      return user.role?.includes?.('manager') || user.role?.includes?.('admin');
    };


    return () => [
      h("div", { 'class': "row align-items-center my-2", }, [
        h("div", { 'class': "col col-12", }, [
          h("p", {}, ["说明：分配任务前，请先：1、在后端构建任务；2、刷新Task表；3、刷新Entry表。"], ),
        ], ),
        h("div", { 'class': "col col-12", }, [
          h("p", {}, ["请进行参数设置："], ),
        ], ),
        h("div", { 'class': "col col-12 col-sm-6 col-lg-4 my-2", }, [
          h("label", { 'class': "form-label", }, ["每个用户多少任务"], ),
          h("input", {
           'class': "form-control form-control-sm"
           'type': "number"
           'v-model': "assignData.settings.tasks_per_user"
          }, [], ),
        ], ),
        h("div", { 'class': "col col-12 col-sm-6 col-lg-4 my-2", }, [
          h("label", { 'class': "form-label", }, ["每个任务需要几名用户参与"], ),
          h("input", {
           'class': "form-control form-control-sm"
           'type': "number"
           'v-model': "assignData.settings.users_per_task"
          }, [], ),
        ], ),
        h("div", { 'class': "col col-12 col-sm-6 col-lg-4 my-2", }, [
          h("label", { 'class': "form-label", }, ["任务类型"], ),
          h("select", {
           'class': "form-select form-select-sm"
           'v-model': "assignData.settings.topic"
          }, [
            `<option 'v-for': "topic in assignTopics" ':value': "topic.value">{{topic.desc}}</option>`
          ], ),
        ], ),
        h("div", { 'class': "col col-12 col-sm-6 col-lg-4 my-2", }, [
          h("label", { 'class': "form-label", }, ["任务批次名称（用于筛选）"], ),
          h("input", {
           'class': "form-control form-control-sm"
           'type': "text"
           'v-model': "assignData.settings.batchName"
          }, [], ),
        ], ),
        h("div", { 'class': "col col-12 my-2", }, [
          h("label", { 'class': "form-label", }, ["质检题设置（Json字符串）"], ),
          h("textarea", {
            'class': "form-control form-control-sm"
            'v-model': "assignData.settings.polygraphs_per_user_json_string"
            ':class': "{'is-invalid': assignData.polygraphs_per_user_json_string_error}"
          }, [], ),
          h("div", {
            'class': "invalid-feedback"
            'v-show': "assignData.polygraphs_per_user_json_string_error"
          }, ["Json解析失败，请检查"], ),
        ], ),
        h("div", { 'class': "col col-12 my-2", }, [
          h("label", { 'class': "form-label", }, [
            h("span", {}, ["选择用户"], ),
          ], ),
          h("div", {}, [
            h("button", {
              'type': "button"
              'class': "btn btn-sm mx-2 my-1 btn-outline-dark"
              'onClick': ()=>{selectUsersAuto();},
            }, ["自动"], ),
            h("button", {
              'type': "button"
              'class': "btn btn-sm mx-2 my-1 btn-outline-dark"
              'onClick': ()=>{selectUsersAll();},
            }, ["全选"], ),
            h("button", {
              'type': "button"
              'class': "btn btn-sm mx-2 my-1 btn-outline-dark"
              'onClick': ()=>{selectUsersNone();},
            }, ["清除"], ),
          ], ),
          h("div", {
            'class': "form-control form-control-sm overflow-auto max-vh-40"
          }, [
            h("button", {
              'v-for': "user in spDB.users"
              'type': "button"
              'class': "btn btn-sm me-2 my-1"
              ':class': "assignData.assignUserBoxDict[user.id] ? `btn-primary` : `btn-outline-secondary`"
              'onClick': ()=>{assignData.assignUserBoxDict[user.id]=!assignData.assignUserBoxDict[user.id]},
            }, [`${ user.currTaskGroup } #${ user.id } ${ user.name }`], ),
          ], ),
        ], ),
        h("div", { 'class': "col col-12 col-sm-6 col-lg-4 my-2", }, [
          h("div", { 'class': "form-check form-switch" ':title': "`通常大家在标注时要分配新任务的话，选「否」；\n如果要总地进行下一轮分配，通常选「是」`", }, [
            h("input", { 'class': "form-check-input" 'type': "checkbox" 'role': "switch" 'v-model': "assignData.settings.retrieve",}, [], ),
            h("label", { 'class': "form-check-label",}, [`是否收回未完成的任务（{{assignData.settings.retrieve?'是':'否'}}）`], ),
          ], ),
        ], ),
      ], ),



      h("div", { 'class': "row align-items-center my-2" 'v-show': "ctrl.tab == TABS.taskAssign", }, [
        h("div", { 'class': "col col-12", }, [
          h("button", {
            'type': "button"
            'class': "btn btn-sm me-2 my-1 btn-outline-primary"
            'onClick': ()=>{planAssigment();},
            'title': "对任务分配进行规划"
          }, ["开始规划"], ),
        ], ),
        assignData.analysis.length ? (...[
          h("div", { 'class': "col col-12", }, [
            h("h4", { 'class': "mt-3 mb-2", }, [`{{ assignData.undone ? '规划' : '执行'}}结果`], ),
          ], ),
          h("div", { 'class': "col col-12", }, [
            h("div", { 'class': "text-muted", }, ["批次编号：{{ assignData.batch }}"], ),
          ], ),
          h("div", { 'class': "col col-12 my-2", }, [
            h("div", { 'class': "fw-bold", }, ["具体到每个标注者："], ),
            h("div", { 'class': "text-muted", }, ["绿色表示新任务，灰色表示之前就分配给他了"], ),
            h("div", { 'class': "text-muted", }, ["着色表示正常任务，框线表示为质检题"], ),
          ], ),
          h("div", { 'class': "col col-12", }, [
            h("ul", { 'class': "list-group max-vh-40 overflow-auto border border-1", }, [
              h("li", { 'class': "list-group-item" 'v-for': "pair in assignData.planPerUser", }, [
                h("div", {}, [
                  h("span", {}, [`#${pair[0]} ${spDB.user(pair[0])?.name}`], ),
                  "分配到的 {{pair[1]?.length}} 条任务是：",
                ], ),
                h("div", {}, [
                  h("button", {
                    'v-for': "task_id in pair[1]"
                    'type': "button"
                    'class': "btn btn-sm me-2 my-1"
                    ':class': "classAssignAnalisisByUser(pair[0], task_id)"
                  }, ["#{{ task_id }}"], ),
                ], ),
              ], ),
            ], ),
          ], ),
          h("div", { 'class': "col col-12 my-2", }, [
            h("div", { 'class': "fw-bold", }, ["具体到每个任务："], ),
          ], ),
          h("div", { 'class': "col col-12", }, [
            h("ul", { 'class': "list-group max-vh-40 overflow-auto border border-1", }, [
              h("li", { 'class': "list-group-item" 'v-for': "item in assignData.analysis", }, [
                h("div", {}, [
                  h("span", {}, [
                    `「{{item?.plan?.topic}} 任务 #{{item.id}}`,
                    h("span", {}, [" / "], ),
                    h("span", {}, [`语料 #{{item?.plan?.entry}}」`], ),
                  ], ),
                  h("span", { 'v-if': "item.new_to?.length", }, [
                    "分配给：",
                    h("span", { 'class': "me-2 text-success __fw-bold" 'v-for': "guy in item.new_guys", }, [`#{{guy}} {{spDB.user(guy)?.name}}`], ),
                    h("span", { 'class': "me-2" 'v-for': "guy in item.solid_guys", }, [`#{{guy}} {{spDB.user(guy)?.name}}`], ),
                    "。",
                  ], ),
                  h("span", { 'v-if': "item.canceled_guys?.length" 'class': "text-muted", }, [
                    "不再分配给：",
                    h("s", { 'class': "me-2" 'v-for': "guy in item.canceled_guys", }, [
                      `#{{guy}} {{spDB.user(guy)?.name}}`,
                    ], ),
                    "。",
                  ], ),
                ], ),
              ], ),
            ], ),
          ], ),
          h("div", { 'class': "col col-12 my-2", }, [
            h("button", {
              'type': "button"
              'class': "btn btn-sm me-2 my-1 btn-danger"
              '__click': "doAssigment"
              'onClick': ()=>{modalBox_open('confirm', {desc: '确定要执行规划好的任务安排吗？', action: doAssigment})();},
              'title': "开始执行规划好的任务安排"
              'v-if': "assignData.undone"
            }, ["开始执行"], ),
            h("button", {
              'type': "button"
              'class': "btn btn-sm me-2 my-1 btn-primary"
              '__click': "doAssigment"
              'onClick': ()=>{exportPlan();},
              'title': "开始执行规划好的任务安排"
              'v-if': "assignData.undone"
            }, ["导出计划"], ),
            h("button", {
              'type': "button"
              'class': "btn btn-sm me-2 my-1"
              ':class': "assignData.undone ? 'btn-outline-secondary' : 'btn-outline-success'"
              'onClick': ()=>{if(assignData.undone){cancelAssigment();}else{cleanAssigment();}},
              ':title': "assignData.undone ? '撤除规划好的任务安排' : '清除以上信息'"
            }, ["{{ assignData.undone ? '撤除规划' : '知道了，清除'}}"], ),
          ], ),
          h("div", { 'class': "col col-12 my-2" 'v-if': "'inserted' in assignData.result", }, [
            h("div", {}, ["执行结果："], ),
          ], ),
          h("div", { 'class': "col col-12 my-2" 'v-if': "'inserted' in assignData.result", }, [
            h("div", {}, ["修改： {{ assignData.result.replaced }}"], ),
            h("div", {}, ["新增： {{ assignData.result.inserted }}"], ),
            h("div", {}, ["异常： {{ assignData.result.strange }}"], ),
          ], ),
        ]) : null,
      ], ),
    ];
  },
};

export default TaskAssignPanel;

