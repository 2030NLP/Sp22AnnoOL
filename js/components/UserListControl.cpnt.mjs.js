import {  reactive, onMounted, h  } from '../modules_lib/vue_3.2.31_.esm-browser.prod.min.js';
import ModalContent from './ModalContent.cpnt.mjs.js';

const UserListPanel = {
  props: ["db", "settings", "managers", 'manager_id', "user"],
  emits: ['update:manager_id'],
  setup(props, ctx) {
    const localData = reactive({
      showQuittedUsers: false,
      // selectedManagerId: "【all】",
    });

    const spDB = props.db;
    const userProgress = (user) => spDB.userCurrBatchProgress(user);

    return () => [

      h("div", { 'class': "row align-items-center my-2", }, [
        h("div", { 'class': "col col-12 my-2", }, [
          h("div", {}, [

            //

            ctx?.slots?.default ? h("div", { 'class': "d-inline-block my-1 me-2 align-middle", }, ctx.slots.default()) : null,

            h("div", { 'class': "d-inline-block my-1 me-2 align-middle", }, [
              h("select", {
                'class': "form-select form-select-sm",
                // 'onChange': event => {
                //   localData.selectedManagerId = event?.target?.value;
                // },
                'manager_id': props.manager_id,
                // 'onUpdate:manager_id': (value) => ctx.emit('update:manager_id', value),
                'onChange': (event) => {
                  props.settings.managerFilter.manager = event?.target?.value;
                  // ctx.emit('update:manager_id', event?.target?.value);
                },
              }, [
                h("option", {
                  'value': "【all】",
                  'selected': true,
                }, ["【按组长筛选】"]),

                ...props.managers.map(manager=>h("option", {
                  'value': manager.id,
                }, [manager.name])),

                h("option", {
                  'value': "【empty】",
                }, ["【empty】"]),
                h("option", {
                  'value': "【all】",
                }, ["【all】"]),
              ]),
            ]),

            h("button", {
              'type': "button",
              'class': ["btn btn-sm my-1 me-2", props.settings.showQuittedUsers ? 'btn-primary' : 'btn-outline-primary'],
              'onClick': ()=>{
                props.settings.showQuittedUsers = !props.settings.showQuittedUsers;
              },
            }, ["显示/隐藏已退出人员"]),

            h("button", {
              'type': "button",
              'class': "btn btn-sm btn-light my-1 me-2",
              'onClick': ()=>{
                spDB.users.sort((a,b)=>+a.id-b.id);
              },
            }, ["序号 升序"]),

            h("button", {
              'type': "button",
              'class': "btn btn-sm btn-light my-1 me-2",
              'onClick': ()=>{
                spDB.users.sort((a,b)=>+userProgress(a).ratio-userProgress(b).ratio);
              },
            }, ["进度 升序"]),

            h("button", {
              'type': "button",
              'class': "btn btn-sm btn-light my-1 me-2",
              'onClick': ()=>{
                spDB.users.sort((b,a)=>+userProgress(a).ratio-userProgress(b).ratio);
              },
            }, ["进度 降序"]),

            h("button", {
              'type': "button",
              'class': "btn btn-sm btn-light my-1 me-2",
              'onClick': ()=>{
                spDB.users.sort((a,b)=>+userProgress(a).cDoneLen-userProgress(b).cDoneLen);
              },
            }, ["总完成量 升序"]),

            h("button", {
              'type': "button",
              'class': "btn btn-sm btn-light my-1 me-2",
              'onClick': ()=>{
                spDB.users.sort((b,a)=>+userProgress(a).cDoneLen-userProgress(b).cDoneLen);
              },
            }, ["总完成量 降序"]),

            h("button", {
              'type': "button",
              'class': "btn btn-sm btn-light my-1 me-2",
              'onClick': ()=>{
                spDB.users.sort((a,b)=>spDB.sortFnByPassRatio(a,b));
              },
            }, ["审核通过率 升序"]),

            h("button", {
              'type': "button",
              'class': "btn btn-sm btn-light my-1 me-2",
              'onClick': ()=>{
                spDB.users.sort((a,b)=>spDB.sortFnByPassRatioR(a,b));
              },
            }, ["审核通过率 降序"]),

            //

          ]),
        ]),
      ]),



    ];
  },
};

export default UserListPanel;

