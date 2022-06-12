import {  reactive, onMounted, h  } from '../modules_lib/vue_3.2.31_.esm-browser.prod.min.js';

const UserListControl = {
  props: ["db", "settings", "managers", "userTags", "userRoles", "groups", "tags", "batchnames", "user"],
  // emits: ['update:manager_id'],
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

            h("div", { 'class': "d-inline-block my-1 me-2 align-middle", }, [
              h("select", {
                'class': "form-select form-select-sm",
                'onChange': (event) => {
                  props.settings.managerFilter = event?.target?.value;
                },
              }, [
                h("option", { 'value': "【all】", 'selected': true, }, ["【按组长筛选】"]),

                ...props.managers.map(manager=>h("option", {
                  'value': manager.id,
                }, [manager.name])),

                h("option", { 'value': "【empty】", }, ["【empty】"]),
                h("option", { 'value': "【all】", }, ["【all】"]),
              ]),
            ]),

            h("div", { 'class': "d-inline-block my-1 me-2 align-middle", }, [
              h("select", {
                'class': "form-select form-select-sm",
                'onChange': (event) => {
                  props.settings.groupFilter = event?.target?.value;
                },
              }, [
                h("option", { 'value': "【all】", 'selected': true, }, ["【按组别筛选】"]),

                ...props.groups.map(group=>h("option", {
                  'value': group,
                }, [group])),

                h("option", { 'value': "【empty】", }, ["【empty】"]),
                h("option", { 'value': "【all】", }, ["【all】"]),
              ]),
            ]),

            h("div", { 'class': "d-inline-block my-1 me-2 align-middle", }, [
              h("select", {
                'class': "form-select form-select-sm",
                'onChange': (event) => {
                  props.settings.userRoleFilter = event?.target?.value;
                },
              }, [
                h("option", { 'value': "【all】", 'selected': true, }, ["【按角色筛选】"]),

                ...props.userRoles.map(userRole=>h("option", {
                  'value': userRole,
                }, [userRole])),

                h("option", { 'value': "【empty】", }, ["【empty】"]),
                h("option", { 'value': "【all】", }, ["【all】"]),
              ]),
            ]),

            h("div", { 'class': "d-inline-block my-1 me-2 align-middle", }, [
              h("select", {
                'class': "form-select form-select-sm",
                'onChange': (event) => {
                  props.settings.userTagFilter = event?.target?.value;
                },
              }, [
                h("option", { 'value': "【all】", 'selected': true, }, ["【按标签筛选】"]),

                ...props.userTags.map(userTag=>h("option", {
                  'value': userTag,
                }, [userTag])),

                h("option", { 'value': "【empty】", }, ["【empty】"]),
                h("option", { 'value': "【all】", }, ["【all】"]),
              ]),
            ]),

            h("br"),

            h("div", { 'class': "d-inline-block my-1 me-2 align-middle", }, [
              h("select", {
                'class': "form-select form-select-sm",
                'onChange': (event) => {
                  props.settings.sortMethod = event?.target?.value;
                },
              }, [
                h("option", { 'value': "id+", 'selected': true, }, ["【排序方式】"]),
                h("option", { 'value': "id+", }, ["序号 升序"]),
                h("option", { 'value': "progress+", }, ["进度 升序"]),
                h("option", { 'value': "progress-", }, ["进度 降序"]),
                h("option", { 'value': "done+", }, ["总完成量 升序"]),
                h("option", { 'value': "done-", }, ["总完成量 降序"]),
                h("option", { 'value': "pass+", }, ["审核通过率 升序"]),
                h("option", { 'value': "pass-", }, ["审核通过率 降序"]),
                h("option", { 'value': "primary_pass+", }, ["初审通过率 升序"]),
                h("option", { 'value': "primary_pass-", }, ["初审通过率 降序"]),
              ]),
            ]),

            h("div", { 'class': "d-inline-block my-1 me-2 align-middle", }, [
              h("select", {
                'class': "form-select form-select-sm",
                'onChange': (event) => {
                  props.settings.userAtWorkFilter = event?.target?.value;
                },
              }, [
                h("option", { 'value': "在岗", 'selected': true, }, ["【在岗情况】"]),
                h("option", { 'value': "在岗", }, ["在岗"]),
                h("option", { 'value': "退出", }, ["退出"]),
                h("option", { 'value': "退出但有分配", }, ["退出但有分配"]),
                h("option", { 'value': "退出但有提交", }, ["退出但有提交"]),
                h("option", { 'value': "全部", }, ["全部"]),
              ]),
            ]),

            // h("button", {
            //   'type': "button",
            //   'class': ["btn btn-sm my-1 me-2", props.settings.showQuittedUsers ? 'btn-primary' : 'btn-outline-dark'],
            //   'onClick': ()=>{
            //     props.settings.showQuittedUsers = !props.settings.showQuittedUsers;
            //   },
            // }, ["显示/隐藏已退出人员"]),

            ctx?.slots?.default ? h("div", { 'class': "d-inline-block my-1 me-2 align-middle", }, ctx.slots.default()) : null,

            //

          ]),
        ]),
      ]),



    ];
  },
};

export default UserListControl;

