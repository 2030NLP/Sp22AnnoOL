import {
  reactive,
  computed,
  onMounted,
  h,
  watch,
} from '../modules_lib/vue_3.2.31_.esm-browser.prod.min.js';
import UserListControl from './UserListControl.cpnt.mjs.js';
import UserListItem from './UserListItem.cpnt.mjs.js';

const UserListPanel = {
  props: ["db", "me", "functions", "show"],
  emits: ["happy", 'click-add-user-btn', 'click-user-progress-btn', 'click-user-detail-btn'],
  component: {
    UserListControl,
    UserListItem,
  },
  setup(props, ctx) {
    const localData = reactive({
      selectedBatchName: "",
      通过率分界线: 0.9,
      总审核量文本: "",
      此批审核量文本: "",
      审核完美率文本: "",
      初审完美率文本: "",
      参与人数文本: "",
      已完成人数文本: "",
      未完成人数文本: "",
      listControlSettings: {
        showQuittedUsers: false,
        managerFilter: "【all】",
        groupFilter: "【all】",
        userRoleFilter: "【all】",
        userTagFilter: "【all】",
        sortMethod: "id+",
        userAtWorkFilter: "在岗",
        userProgressFilter: "有分配",
        timeRangeHour: 24,
      },
    });
    const 筛选后的统计 = reactive({
      总审核量文本: "",
      此批审核量文本: "",
      审核完美率文本: "",
      初审完美率文本: "",
      参与人数文本: "",
      已完成人数文本: "",
      未完成人数文本: "",
    });

    const theDB = props.db;
    const theFN = props.functions;
    const theMe = props.me;
    const isManager = (user) => {
      return user.role?.includes?.('manager') || user.role?.includes?.('admin');
    };

    const batchNames = computed(()=>theDB.batchNames());
    const managers = computed(()=>theDB.managers());
    const userTags = computed(()=>theDB.userTags());
    const userRoles = computed(()=>theDB.userRoles());
    const groups = computed(()=>[...(new Set(theDB.users.map(user=>user.currTaskGroup)))]);
    const newestBatchName = computed(()=>(theDB.tasks??[]).sort((a, b)=>(+a.batch-b.batch)).map(it=>it.batchName).at(-1));

    onMounted(()=>{localData.selectedBatchName=newestBatchName.value;});

    const 未完工筛选函数 = (it) => {
      const pg = user => theDB?.userProgress?.(user, localData.selectedBatchName);
      const fn = (user) => {
        const pg_user = pg(user);
        return pg_user?.cDueLen>0&&pg_user?.cDueLen>pg_user?.cDoneLen;
      };
      return fn(it);
    };
    const 已完工筛选函数 = (it) => {
      const pg = user => theDB?.userProgress?.(user, localData.selectedBatchName);
      const fn = (user) => {
        const pg_user = pg(user);
        return pg_user?.cDueLen>0&&pg_user?.cDueLen<=pg_user?.cDoneLen;
      };
      return fn(it);
    };

    const 计算审核量 = () => {
      let allReviewedAnnos = theDB?.annos?.filter?.(it=>it?.content?.review) ?? [];
      let currAnnos = theDB?.annos?.filter?.(it=>it?.batchName==localData.selectedBatchName) ?? [];
      let currReviewedAnnos = allReviewedAnnos?.filter?.(it=>it.batchName==localData.selectedBatchName) ?? [];
      localData.总审核量文本 = `${allReviewedAnnos.length} / ${theDB?.annos?.length} = ${(allReviewedAnnos.length/theDB?.annos?.length).toFixed(2)}`;
      localData.此批审核量文本 = `${currReviewedAnnos.length} / ${currAnnos.length} = ${(currReviewedAnnos.length/currAnnos.length).toFixed(2)}`;

      let 有效用户 = (theDB?.users??[]).filter(user => theDB.inspectionSum(user, localData.selectedBatchName)?.sum>0);

      let 审核完美布尔数组 = 有效用户.map(user => theDB.inspectionSum(user, localData.selectedBatchName)?.passRatio >= +localData.通过率分界线);
      let 初审完美布尔数组 = 有效用户.map(user => theDB.firstInspectionSum(user, localData.selectedBatchName)?.passRatio >= +localData.通过率分界线);

      let 审核完美量 = 审核完美布尔数组.filter(it=>it==true).length;
      let 初审完美量 = 初审完美布尔数组.filter(it=>it==true).length;

      let 审核完美率 = 审核完美量 / 审核完美布尔数组.length;
      let 初审完美率 = 初审完美量 / 初审完美布尔数组.length;

      localData.审核完美率文本 = `${审核完美量} / ${审核完美布尔数组.length} = ${审核完美率.toFixed(2)}`;
      localData.初审完美率文本 = `${初审完美量} / ${初审完美布尔数组.length} = ${初审完美率.toFixed(2)}`;

      const 参与用户 = (theDB?.users??[]).filter(user => theDB?.userProgress?.(user, localData.selectedBatchName)?.cDueLen);
      const 完成用户 = 参与用户.filter(user => 已完工筛选函数(user));
      const 已完成率 = (完成用户.length??0) / (参与用户.length??0);
      const 未完成率 = ((参与用户.length??0)-(完成用户.length??0)) / (参与用户.length??0);

      localData.参与人数文本 = `${参与用户.length??0}`;
      localData.已完成人数文本 = `${完成用户.length??0} (${已完成率.toFixed(2)})`;
      localData.未完成人数文本 = `${(参与用户.length??0)-(完成用户.length??0)} (${未完成率.toFixed(2)})`;

      console.log(localData);
    };

    const 计算筛选部分的审核量 = () => {
      let 所选用户 = userList.value;

      let 所选有效用户 = 所选用户.filter(user => theDB.inspectionSum(user, localData.selectedBatchName)?.sum>0);

      let 审核完美布尔数组 = 所选有效用户.map(user => theDB.inspectionSum(user, localData.selectedBatchName)?.passRatio >= +localData.通过率分界线);
      let 初审完美布尔数组 = 所选有效用户.map(user => theDB.firstInspectionSum(user, localData.selectedBatchName)?.passRatio >= +localData.通过率分界线);

      let 所选用户的标注 = 所选有效用户.map(it=>theDB.用户批次标注(it)).flat();

      let allReviewedAnnos = 所选用户的标注?.filter?.(it=>it?.content?.review) ?? [];
      let currAnnos = 所选用户的标注?.filter?.(it=>it?.batchName==localData.selectedBatchName) ?? [];
      let currReviewedAnnos = allReviewedAnnos?.filter?.(it=>it.batchName==localData.selectedBatchName) ?? [];
      筛选后的统计.总审核量文本 = `${allReviewedAnnos.length} / ${所选用户的标注?.length} = ${(allReviewedAnnos.length/所选用户的标注?.length).toFixed(2)}`;
      筛选后的统计.此批审核量文本 = `${currReviewedAnnos.length} / ${currAnnos.length} = ${(currReviewedAnnos.length/currAnnos.length).toFixed(2)}`;

      let 审核完美量 = 审核完美布尔数组.filter(it=>it==true).length;
      let 初审完美量 = 初审完美布尔数组.filter(it=>it==true).length;

      let 审核完美率 = 审核完美量 / 审核完美布尔数组.length;
      let 初审完美率 = 初审完美量 / 初审完美布尔数组.length;

      筛选后的统计.审核完美率文本 = `${审核完美量} / ${审核完美布尔数组.length} = ${审核完美率.toFixed(2)}`;
      筛选后的统计.初审完美率文本 = `${初审完美量} / ${初审完美布尔数组.length} = ${初审完美率.toFixed(2)}`;

      const 参与用户 = 所选用户.filter(user => theDB?.userProgress?.(user, localData.selectedBatchName)?.cDueLen);
      const 完成用户 = 参与用户.filter(user => 已完工筛选函数(user));
      const 已完成率 = (完成用户.length??0) / (参与用户.length??0);
      const 未完成率 = ((参与用户.length??0)-(完成用户.length??0)) / (参与用户.length??0);

      筛选后的统计.参与人数文本 = `${参与用户.length??0}`;
      筛选后的统计.已完成人数文本 = `${完成用户.length??0} (${已完成率.toFixed(2)})`;
      筛选后的统计.未完成人数文本 = `${(参与用户.length??0)-(完成用户.length??0)} (${未完成率.toFixed(2)})`;

      console.log(筛选后的统计);
    };

    const userList = computed(()=>{
      // console.log(localData.listControlSettings);
      let list = theDB.users??[];
      if (localData.listControlSettings.managerFilter!="【all】") {
        if (localData.listControlSettings.managerFilter!="【empty】") {
          list = list.filter(it => (it.manager??"")==localData.listControlSettings.managerFilter);
        } else {
          list = list.filter(it => !it?.manager?.length);
        };
      };
      if (localData.listControlSettings.groupFilter!="【all】") {
        if (localData.listControlSettings.groupFilter!="【empty】") {
          list = list.filter(it => (it.currTaskGroup??"")==localData.listControlSettings.groupFilter);
        } else {
          list = list.filter(it => !it?.currTaskGroup?.length);
        };
      };
      if (localData.listControlSettings.userRoleFilter!="【all】") {
        if (localData.listControlSettings.userRoleFilter!="【empty】") {
          list = list.filter(it => it.role?.includes?.(localData.listControlSettings.userRoleFilter));
        } else {
          list = list.filter(it => !it?.role?.length);
        };
      };
      if (localData.listControlSettings.userTagFilter!="【all】") {
        if (localData.listControlSettings.userTagFilter!="【empty】") {
          list = list.filter(it => it.tags?.includes?.(localData.listControlSettings.userTagFilter));
        } else {
          list = list.filter(it => !it?.tags?.length);
        };
      };
      // if (!localData.listControlSettings.showQuittedUsers) {
      //   list = list.filter(it => !it.quitted);
      // };
      const atWorkFns = {
        '在岗': ()=>{list = list.filter(it => !it.quitted);},
        '退出': ()=>{list = list.filter(it => it.quitted);},
        '有分配': ()=>{
          const fn = (user)=>{return theDB?.userProgress?.(user, localData.selectedBatchName)?.cDueLen;};
          list = list.filter(it => fn(it));
        },
        '无分配': ()=>{
          const fn = (user)=>{return theDB?.userProgress?.(user, localData.selectedBatchName)?.cDueLen;};
          list = list.filter(it => !fn(it));
        },
        '退出但有分配': ()=>{
          const fn = (user)=>{return theDB?.userProgress?.(user, localData.selectedBatchName)?.cDueLen;};
          list = list.filter(it => it.quitted);
          list = list.filter(it => fn(it));
        },
        '退出但有提交': ()=>{
          const fn = (user)=>{return theDB?.userProgress?.(user, localData.selectedBatchName)?.cDoneLen;};
          list = list.filter(it => it.quitted);
          list = list.filter(it => fn(it));
        },
        '未完工': ()=>{
          list = list.filter(it => 未完工筛选函数(it));
        },
        '在岗未完工': ()=>{
          list = list.filter(it => !it.quitted);
          list = list.filter(it => 未完工筛选函数(it));
        },
        '退出未完工': ()=>{
          list = list.filter(it => it.quitted);
          list = list.filter(it => 未完工筛选函数(it));
        },
      };
      if (localData.listControlSettings.userAtWorkFilter in atWorkFns) {
        atWorkFns[localData.listControlSettings.userAtWorkFilter]();
      };
      const progressFns = {
        '有分配': ()=>{
          const fn = (user)=>{return theDB?.userProgress?.(user, localData.selectedBatchName)?.cDueLen;};
          list = list.filter(it => fn(it));
        },
        '未完工': ()=>{
          list = list.filter(it => 未完工筛选函数(it));
        },
        '已完工': ()=>{
          list = list.filter(it => 已完工筛选函数(it));
        },
        '无分配': ()=>{
          const fn = (user)=>{return theDB?.userProgress?.(user, localData.selectedBatchName)?.cDueLen;};
          list = list.filter(it => !fn(it));
        },
      };
      if (localData.listControlSettings.userProgressFilter in progressFns) {
        progressFns[localData.listControlSettings.userProgressFilter]();
      };
      //
      //
      const sortMethodsMap01 = {
        "id+": it => (+it.id),
        "progress+": it => (+theDB.userProgress(it, localData.selectedBatchName).ratio),
        "progress-": it => (-theDB.userProgress(it, localData.selectedBatchName).ratio),
        "done+": it => (+theDB.userProgress(it, localData.selectedBatchName).cDoneLen),
        "done-": it => (-theDB.userProgress(it, localData.selectedBatchName).cDoneLen),
      };
      if (localData.listControlSettings.sortMethod in sortMethodsMap01) {
        list = theDB.lo.sortBy(list, sortMethodsMap01[localData.listControlSettings.sortMethod]);
      };
      const sortMethodsMap02 = {
        "pass+": (a,b) => theDB.sortFnByPassRatio(a,b, localData.selectedBatchName),
        "pass-": (a,b) => theDB.sortFnByPassRatioR(a,b, localData.selectedBatchName),
        "primary_pass+": (a,b) => theDB.sortFnByPrimaryPassRatio(a,b, localData.selectedBatchName),
        "primary_pass-": (a,b) => theDB.sortFnByPrimaryPassRatioR(a,b, localData.selectedBatchName),
        "re_inspect+": (a,b) => theDB.sortFnByShouldReInspect(a,b, localData.selectedBatchName),
        "re_inspect-": (a,b) => theDB.sortFnByShouldReInspectR(a,b, localData.selectedBatchName),
      };
      if (localData.listControlSettings.sortMethod in sortMethodsMap02) {
        list = list.sort(sortMethodsMap02[localData.listControlSettings.sortMethod]);
      };
      const sortMethodsMap03 = {
        "last_save_time+": (a,b) => theDB.sortFnByLastSaveTime(a,b, localData.selectedBatchName),
        "last_save_time-": (a,b) => theDB.sortFnByLastSaveTimeR(a,b, localData.selectedBatchName),
      };
      if (localData.listControlSettings.sortMethod in sortMethodsMap03) {
        list = list.sort(sortMethodsMap03[localData.listControlSettings.sortMethod]);
      };
      // console.log(list);
      return list;
    });

    watch(()=>userList.value, ()=>{
      计算审核量();计算筛选部分的审核量();
    });

    const 导出用户信息 = ()=>{
      const user_main_infos = theDB.users.map(it=>[
        it.id,
        it.name,
        theDB.userDict[it.manager]?.name,
        it.quitted?true:false,
        it.role?.join?.("|"),
        it.tags?.join?.("|"),
      ]);

      let lines = user_main_infos.map(
        ln=>ln.map(
          it=> ((typeof it)=="string") ? JSON.stringify(it) : JSON.stringify(JSON.stringify(it))
        ).join(",")
      );
      lines.unshift(`"id","name","组长","是否已退出","角色","标签"`);

      const txt = lines.join("\n");

      console.log(txt);

      app.theSaver.saveText(txt, `人员信息(${JSON.parse(JSON.stringify(new Date()))}).csv`);
    };

    return () => [
      h("div", {
          'class': ["container", props.show ? null : "d-none"],
        }, [

          h("div", { 'class': "row align-items-center my-2", }, [
            h("div", { 'class': "col col-12", }, [
              h("div", { 'class': "d-inline-block my-1 me-2 align-middle", }, [
                h("select", {
                  'class': "form-select form-select-sm",
                  'onChange': (event) => {
                    localData.selectedBatchName = event?.target?.value;
                    计算审核量();
                    计算筛选部分的审核量();
                  },
                }, [
                  h("option", {
                    'value': newestBatchName.value,
                    'selected': true,
                  }, [`【最新(${newestBatchName.value})】`]),

                  ...batchNames.value.map(batchName=>h("option", {
                    'value': batchName,
                  }, [batchName])),

                ]),
              ]),

              h("div", { 'class': "__d-inline-block align-middle my-1 me-2", }, [
                "全部已审", " ", localData.总审核量文本, h("br"),
                `${localData.selectedBatchName} 已审`, " ", localData.此批审核量文本, h("br"),
                `${localData.selectedBatchName} 审核通过率达${localData.通过率分界线}以上的人员的比例`, " ", localData.审核完美率文本, h("br"),
                `${localData.selectedBatchName} 初审通过率达${localData.通过率分界线}以上的人员的比例`, " ", localData.初审完美率文本, h("br"),
                `${localData.selectedBatchName} 参与标注的人数`, " ", localData.参与人数文本, h("br"),
                `${localData.selectedBatchName} 已完成的人数`, " ", localData.已完成人数文本, h("br"),
                `${localData.selectedBatchName} 未完成的人数`, " ", localData.未完成人数文本,
              ]),

              h("div", { 'class': "d-inline-block my-1 me-2 align-middle", }, [
                h("div", { 'class': "input-group input-group-sm", 'title': "设置通过率界限"}, [
                  h("label", { 'class': "input-group-text", }, ["通过率界限:"]),
                  h("input", {
                    'type': "number",
                    'max': 1,
                    'min': 0,
                    'step': 0.05,
                    'class': "form-control form-control-sm",
                    'value': localData.通过率分界线,
                    'onChange': (event) => {
                      localData.通过率分界线 = event?.target?.value;
                    },
                  }),
                  h("label", { 'class': "input-group-text", }, ["设置后需重新统计"]),
                ]),
              ]),

              h("button", {
                'type': "button",
                'class': "btn btn-sm btn-outline-dark my-1 me-2",
                'title': "重新统计",
                'onClick': ()=>{计算审核量();计算筛选部分的审核量();},
              }, ["重新统计"]),

            ]),
          ]),

          h(UserListControl, {
            'db': theDB,
            'settings': localData.listControlSettings,
            'managers': managers.value,
            'userTags': userTags.value,
            'userRoles': userRoles.value,
            'groups': groups.value,
            'batchnames': batchNames.value,
            'batchname': localData.selectedBatchName,
          }, {
            default: () => isManager(theMe) ? [
              h("button", {
                'type': "button",
                'class': "btn btn-sm btn-outline-dark my-1 me-2",
                'title': "新增用户",
                'onClick': (event)=>{ctx.emit('click-add-user-btn', event)},
              }, ["新增用户"]),
              h("button", {
                'type': "button",
                'class': "btn btn-sm btn-outline-dark my-1 me-2",
                'title': "导出用户信息",
                'onClick': ()=>{导出用户信息()},
              }, ["导出用户信息"]),
            ] : null,
          }),

          h("div", { 'class': "row align-items-center my-2", }, [
            h("div", { 'class': "col col-12", }, [
              h("div", { 'class': "__d-inline-block align-middle my-1 me-2", }, [
                `对于 筛选出的 ${userList.value.length??0} 人：`, h("br"),
                "全部已审", " ", 筛选后的统计.总审核量文本, h("br"),
                `${localData.selectedBatchName} 已审`, " ", 筛选后的统计.此批审核量文本, h("br"),
                `${localData.selectedBatchName} 审核通过率达${localData.通过率分界线}以上的人员的比例`, " ", 筛选后的统计.审核完美率文本, h("br"),
                `${localData.selectedBatchName} 初审通过率达${localData.通过率分界线}以上的人员的比例`, " ", 筛选后的统计.初审完美率文本, h("br"),
                `${localData.selectedBatchName} 参与标注的人数`, " ", 筛选后的统计.参与人数文本, h("br"),
                `${localData.selectedBatchName} 已完成的人数`, " ", 筛选后的统计.已完成人数文本, h("br"),
                `${localData.selectedBatchName} 未完成的人数`, " ", 筛选后的统计.未完成人数文本,
              ]),
              h("button", {
                'type': "button",
                'class': "btn btn-sm btn-outline-dark my-1 me-2",
                'title': "重新统计",
                'onClick': ()=>{计算审核量();计算筛选部分的审核量();},
              }, ["重新统计"]),
            ]),
          ]),

          h("div", { 'class': "row align-items-center my-2", }, [
            h("div", { 'class': "col col-12 my-2", }, [
              h("div", { 'class': "container my-2", },
                userList.value.map(user => h(UserListItem, {
                  'db': theDB,
                  'me': theMe,
                  'user': user,
                  'settings': props.settings,
                  'functions': theFN,
                  'batchname': localData.selectedBatchName,
                  'hours': localData.listControlSettings?.timeRangeHour??24,
                  'key': user.id,
                  'onClickUserDetailBtn': ()=>{ctx.emit('click-user-detail-btn', user);},
                  'onClickUserProgressBtn': ()=>{ctx.emit('click-user-progress-btn', user);},
                }))
              ),
            ]),
          ]),

          // h("div", { 'class': "row align-items-center my-2", }, [
          //   h("div", { 'class': "col col-12 my-2", }, []),
          //   h("div", { 'class': "col col-12 my-2", }, []),
          // ]),
          // h("div", { 'class': "row align-items-center my-2", }, []),
          // h("div", { 'class': "row align-items-center my-2", }, []),
        ],
      ),
    ];
  },
};

export default UserListPanel;

