import {
  reactive,
  computed,
  onMounted,
  h,
} from '../modules_lib/vue_3.2.31_.esm-browser.prod.min.js';

const UserListItem = {
  props: ["db", "user", "settings", "me", "functions", "batchname"],
  emits: ["happy", 'click-user-progress-btn', 'click-user-detail-btn'],
  component: {
  },
  setup(props, ctx) {
    const localData = reactive({
    });

    const theDB = props.db;
    const theFN = props.functions;
    const ctrl = props.settings;
    const theMe = props.me;
    const user = props.user;
    // const batchName = props.batchname;

    const isManager = (user) => {
      return user.role?.includes?.('manager') || user.role?.includes?.('admin');
    };

    // const computed = it=>it;


    const userProgress = (user, batchName) => {
      return props.db.userProgress(user, batchName);
    };

    const manager = computed(()=>{return theDB?.userDict?.[user.manager];});
    const progressObj = computed(()=>{return userProgress(user, props.batchname);});
    const 当前进度文本 = computed(()=>{return `${progressObj.value.cDoneLen}/${progressObj.value.cDueLen}`;});

    const inspectionSum = theDB.inspectionSum ? ( (user, batchName) => { return theDB.inspectionSum(user, batchName); }
    ) : ( (user, batchName) => {
      if (batchName==null) {batchName=user?.currBatchName};
      let annos = (user?.allAnnos??[]).map(it=>theDB.annoDict[it]).filter(it=>it?.batchName==batchName);
      let sum = lo.countBy(annos, anno=>anno?.content?.review?.accept);
      sum.sum = (sum.false??0) + (sum.true??0);
      sum.passRatio = sum.sum==0 ? null : (sum.true??0)/sum.sum;
      return sum;
    } );
    const sum = computed(()=>{return inspectionSum(user, props.batchname);});


    const firstInspectionSum = (user, batchName) => { return theDB.firstInspectionSum(user, batchName); };
    const fstsum = computed(()=>{return firstInspectionSum(user, props.batchname);});


    const shouldShow = computed(()=>{
      return true;
    });

    return () => shouldShow.value ? [
      h("div", { 'class': "row align-items-center my-1 border rounded p-2", }, [


        h("div", { 'class': "col col-12 col-md-6 col-lg-4 mb-1", }, [
          h("span", { 'class': "__fw-bold fs-6 me-2", }, [user.name]),
          h("span", { 'class': "badge rounded-pill bg-light text-dark me-1", }, ["#", user.id]),

          ...(user.role??[]).map(role=>h("span", {
            'class': "badge rounded-pill bg-light _border _border-primary text-primary me-1"
          }, [role])),
          user.quitted ? h("span", {
            'class': "badge rounded-pill bg-danger me-1",
          }, ["已退出"]) : null,

          h("span", {
            'class': "badge bg-light text-dark me-1", 'title': "组别"
          }, [user.currTaskGroup ?? "未分组"]),
          manager.value ? h("span", {
            'class': "badge bg-light text-dark me-1",
            'title': `组长：${manager.value?.name}`,
          }, [manager.value?.name]) : null,

          h("span", {
            'class': "badge bg-light text-dark me-1",
            'title': "当前任务",
          }, [theFN.topic_regulation(user.currTask)]),

          h("span", {
            'class': "badge bg-light text-dark me-1", 'title': "已标总量"
          }, ["总 ", user.allAnnos?.length]),

          h("span", {
            'class': "badge bg-light text-dark me-1", 'title': "此类已标量"
          }, [`${props.batchname}: `, 当前进度文本.value]),

          h("span", {
            'class': [
              "badge me-1",
              sum.value?.passRatio>=0.9 ? 'bg-success text-light' :
              sum.value?.passRatio>=0.8 ? 'bg-light text-success border border-1 border-success' :
              sum.value?.passRatio==null ? 'bg-light text-dark' :
              sum.value?.passRatio<=0.6 ? 'bg-danger text-light' :
              'bg-light text-danger border border-1 border-danger',
            ],
            'title': "审核通过率",
          }, ["审核通过率 ", sum.value?.passRatio?.toFixed?.(3)??'null']),

          h("span", {
            'class': [
              "badge me-1",
              fstsum.value?.passRatio>=0.9 ? 'bg-success text-light' :
              fstsum.value?.passRatio>=0.8 ? 'bg-light text-success border border-1 border-success' :
              fstsum.value?.passRatio==null ? 'bg-light text-dark' :
              fstsum.value?.passRatio<=0.6 ? 'bg-danger text-light' :
              'bg-light text-danger border border-1 border-danger',
            ],
            'title': "初审通过率",
          }, ["初审通过率 ", fstsum.value?.passRatio?.toFixed?.(3)??'null']),

          h("span", {
            'class': "badge bg-light text-dark me-1", 'title': "当前批次的已审量"
          }, ["已审 ", sum.value?.sum]),

        ],),


        h("div", { 'class': "col col-12 col-md-6 col-lg-6 my-1", }, [
          h("div", {
            'class': ["progress", {'bg-success bg-opacity-25': progressObj.value.done}],
            'title': "当前任务进度",
          }, [
            h("div", {
              'class': ["progress-bar bg-success"],
              'role': "progressbar",
              'style': `width: ${progressObj.value.pct};`,
              // 'aria-valuenow': progressObj.value.mn,
              // 'aria-valuemax': progressObj.value.bg,
              // 'aria-valuemin': "0",
            }, [
              "当前", " ", progressObj.value.pct, "=", 当前进度文本.value,
            ]),
          ],),
        ],),


        h("div", { 'class': "col col-12 col-md-12 col-lg-2 mt-1", }, [
          h("button", {
            'type': "button",
            'class': "btn btn-sm btn-light my-1 me-2",
            'title': `查看 ${user.name} 所标注的具体情况`,
            'onClick': ()=>{ctx.emit('click-user-progress-btn');},
          }, ["标注详情"]),
          isManager(theMe) ? h("button", {
            'type': "button",
            'class': "btn btn-sm btn-light my-1 me-2",
            'title': `查看更多关于 ${user.name} 的信息`,
            'onClick': ()=>{ctx.emit('click-user-detail-btn');},
          }, ["更多"]) : null,
        ],),


      ],),
    ] : null;

  },
};

export default UserListItem;
