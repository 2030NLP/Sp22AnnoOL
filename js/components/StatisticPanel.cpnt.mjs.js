import {
  reactive,
  computed,
  onMounted,
  h,
} from '../modules_lib/vue_3.2.31_.esm-browser.prod.min.js';

export default {
  props: ["db", "functions", "me", "show"],
  emits: ["happy"],
  component: {
  },
  setup(props, ctx) {

    const theDB = props.db;
    const theFN = props.functions;

    const theMe = props.me;
    const isManager = (user) => {
      return user.role?.includes?.('manager') || user.role?.includes?.('admin');
    };


    const labelAnnoDictEntries = computed(()=>Object.entries(theDB.labelAnnoDict()));

    const batchNames = computed(()=>theDB.batchNames());
    const newestBatchName = computed(()=>(theDB.tasks??[]).sort((a, b)=>(+a.batch-b.batch)).map(it=>it.batchName).at(-1));

    const managers = computed(()=>theDB.users.filter(user=>isManager(user)));
    const groups = computed(()=>[...(new Set(theDB.users.map(user=>user.currTaskGroup)))]);

    const localData = reactive({
      sta: {},
    });

    const computeSta = () => {
      localData.sta = theFN.tasks_computed(theDB);
    };




    return () => [
      h("div", {
          'class': ["container", props.show ? null : "d-none"],
        }, [

          h("div", { 'class': "row align-items-center my-2", }, [
            h("div", { 'class': "col col-12", }, [
              h("button", {
                'type': "button",
                'class': "btn btn-sm btn-outline-primary my-1 me-2",
                'title': "重新统计",
                'onClick': ()=>{computeSta();},
              }, ["重新统计"]),
            ]),

            h("div", { 'class': "col col-12", }, [
              h("p", { }, ["总量 = (已分配量", h("small", {'class': "text-muted"}, " = 已足量提交 + 非足量提交 + 尚未提交"), ") + 未分配量"]),
            ]),

            h("div", { 'class': "col col-12", }, [
              h("p", { }, ["总体情况："]),
              h("ul", { }, [
                h("li", { }, ["总量：", (localData.sta?.total?.total_num??0) - (localData.sta?.total?.deleted_num??0), ...((localData.sta?.total?.deleted_num>0) ? [" = ", (localData.sta?.total?.total_num??0), "-", (localData.sta?.total?.deleted_num??0)] : [])]),
                h("li", { }, [
                  "已分配量：", (localData.sta?.total?.assigned_num??0),
                  h("ul", { }, [
                    h("li", { }, ["已足量提交：", (localData.sta?.total?.done_num??0)]),
                    h("li", { }, ["非足量提交：", (localData.sta?.total?.working_num??0)]),
                    h("li", { }, ["尚未提交：", (localData.sta?.total?.total_num??0)-(localData.sta?.total?.done_num??0)-(localData.sta?.total?.working_num??0)]),
                  ]),
                ]),
                h("li", { }, ["未分配量：", (localData.sta?.total?.total_num??0) - (localData.sta?.total?.deleted_num??0) - (localData.sta?.total?.assigned_num??0)]),
              ]),
            ]),

            h("div", { 'class': "col col-12", }, [
              h("p", { }, ["各批次情况："]),
              h("ul", { }, (localData.sta?.by_batchName??[])
                .map(pair =>
                  h("li", { }, [
                    h("p", { }, [pair[0]]),
                    h("ul", { }, [
                      h("li", { }, ["总量：", (pair[1]?.total_num??0) - (pair[1]?.deleted_num??0), ...((pair[1]?.deleted_num>0) ? [" = ", (pair[1]?.total_num??0), "-", (pair[1]?.deleted_num??0)] : [])]),
                      h("li", { }, [
                        "已分配量：", (pair[1]?.assigned_num??0),
                        h("ul", { }, [
                          h("li", { }, ["已足量提交：", (pair[1]?.done_num??0)]),
                          h("li", { }, ["非足量提交：", (pair[1]?.working_num??0)]),
                          h("li", { }, ["尚未提交：", (pair[1]?.total_num??0)-(pair[1]?.done_num??0)-(pair[1]?.working_num??0)]),
                        ]),
                      ]),
                      h("li", { }, ["未分配量：", (pair[1]?.total_num??0) - (pair[1]?.deleted_num??0) - (pair[1]?.assigned_num??0)]),
                    ]),
                  ]),
                ),
              ),
            ]),

            h("div", { 'class': "col col-12", }, [
              h("p", { }, ["各标签数量："]),
              h("ul", { }, labelAnnoDictEntries.value.map(kv=> h("li", { }, [
                h("span", { }, [kv[0]]),
                h("span", { }, ["："]),
                h("span", { }, [kv[1].length]),
              ]))),
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

