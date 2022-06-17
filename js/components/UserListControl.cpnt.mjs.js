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

            // h("br"),

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
                h("option", { 'value': "全部", }, ["全部"]),
              ]),
            ]),

            h("div", { 'class': "d-inline-block my-1 me-2 align-middle", }, [
              h("select", {
                'class': "form-select form-select-sm",
                'onChange': (event) => {
                  props.settings.userProgressFilter = event?.target?.value;
                },
              }, [
                h("option", { 'value': "全部", 'selected': true, }, ["【分配及完成情况】"]),
                h("option", { 'value': "有分配", }, ["有分配"]),
                h("option", { 'value': "已完工", }, ["已完工"]),
                h("option", { 'value': "未完工", }, ["未完工"]),
                h("option", { 'value': "无分配", }, ["无分配"]),
                h("option", { 'value': "全部", }, ["全部"]),
              ]),
            ]),

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

                h("option", { 'value': "re_inspect+", }, ["待复审数量 升序"]),
                h("option", { 'value': "re_inspect-", }, ["待复审数量 降序"]),

                h("option", { 'value': "last_save_time+", }, ["最后标注时间 升序"]),
                h("option", { 'value': "last_save_time-", }, ["最后标注时间 降序"]),

                // h("option", { 'value': "last_inspect_time+", }, ["最后审核时间 升序"]),
                // h("option", { 'value': "last_inspect_time-", }, ["最后审核时间 降序"]),

                // h("option", { 'value': "inspected+", }, ["已审核量 升序"]),
                // h("option", { 'value': "inspected-", }, ["已审核量 降序"]),
              ]),
            ]),

            // h("br"),

            h("div", { 'class': "d-inline-block my-1 me-2 align-middle", }, [
              h("div", { 'class': "input-group input-group-sm", 'title': "计算标注员最近进行过保存操作的语料数量的时间范围"}, [
                h("label", { 'class': "input-group-text", }, ["…时间范围:"]),
                h("input", {
                  'type': "number",
                  'class': "form-control form-control-sm",
                  'value': props.settings.timeRangeHour??0,
                  'onChange': (event) => {
                    props.settings.timeRangeHour = event?.target?.value;
                  },
                }),
                h("label", { 'class': "input-group-text", }, ["小时内"]),
              ]),
            ]),

            ctx?.slots?.default ? h("div", { 'class': "d-inline-block my-1 me-2 align-middle", }, ctx.slots.default()) : null,

            //

          ]),
        ]),
      ]),



    ];
  },
};

export default UserListControl;

