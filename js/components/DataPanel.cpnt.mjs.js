import {
  reactive,
  computed,
  onMounted,
  watch,
  h,
} from '../modules_lib/vue_3.2.31_.esm-browser.prod.min.js';

const DataPanel = {
  props: ["db", "me", "timedict"],
  emits: ["happy", 'connect'],
  component: {
  },
  setup(props, ctx) {
    const localData = reactive({
    });

    const isManager = (user) => {
      return user.role?.includes?.('manager') || user.role?.includes?.('admin');
    };

    const showFix = computed(()=> ((!props.db.completelyExtended || !props.db.allDictsBuilt) && props.db.isNotEmpty));

    const button = (attrs, children) => {
      attrs.type = "button";
      return h("button", attrs, children);
    };



    return () => [
      h("div", { 'class': "container", }, [

        h("div", { 'class': "row align-items-center my-2", }, [

          h("div", { 'class': "col col-12 my-2", }, [
            h("div", {}, ["现在，请加载基础数据。步骤："],),
            h("div", {}, ["1、如果较长时间没刷新，点「刷新全部」；否则点「加载缓存」"],),
            h("div", {}, ["2、若选择了加载缓存，则现在可按需刷新个别可能有所变化的表"],),
            h("div", {}, ["3、等待右下方不再出现提示框 (意味着数据刷新完毕)"],),
            h("div", {}, ["4、点击「数据补全」(可能稍有卡顿，请耐心等待)"],),
            h("div", {}, ["5、当红灯全部变为绿灯，即可点击「开始工作」"],),
          ],),

          h("div", { 'class': "col col-12", }, [
            button({
              'class': ["btn btn-sm my-1 me-2", "btn-outline-dark"],
              'title': "从服务器更新最新数据，包括 User, Task, Anno 表，以及 Entry 表中的基本信息",
              'onClick': ()=>{ctx.emit('sync-all')},
            }, ["刷新全部"]),
            button({
              'class': ["btn btn-sm my-1 me-2", "btn-outline-dark"],
              'title': "加载缓存数据",
              'onClick': ()=>{ctx.emit('load-cache')},
            }, ["加载缓存"]),
          ],),

          // h("div", { 'class': "col col-12", }, [
          //   button({
          //     'class': ["btn btn-sm my-1 me-2", "btn-outline-dark"],
          //     'onClick': ()=>{ctx.emit('sync-entries')},
          //   }, ["刷新 Entry 表 (仅基本信息，不含文本内容)"]),
          //   button({
          //     'class': ["btn btn-sm my-1 me-2", "btn-outline-dark"],
          //     'onClick': ()=>{ctx.emit('sync-tasks')},
          //   }, ["刷新 Task 表"]),
          //   button({
          //     'class': ["btn btn-sm my-1 me-2", "btn-outline-dark"],
          //     'onClick': ()=>{ctx.emit('sync-annos')},
          //   }, ["刷新 Anno 表"]),
          //   button({
          //     'class': ["btn btn-sm my-1 me-2", "btn-outline-dark"],
          //     'onClick': ()=>{ctx.emit('sync-users')},
          //   }, ["刷新 User 表"]),
          // ],),

          h("div", { 'class': "col col-12", }, [
            showFix.value ? h("div", { }, [
              button({
                'class': ["btn btn-sm my-1 me-2", "btn-outline-primary"],
                'onClick': ()=>{ctx.emit('fix-data')},
              }, ["数据补全"]),
            ],) : null,
          ],),

        // ],),

        // h("div", { 'class': "row align-items-center my-2", }, [

          h("div", { 'class': "col col-12 text-muted small my-2", }, [
            h("div", {}, ["数据状态："],),
            h("div", {}, [
              h("span", {title:"entries"}, [props.db.entries?.length ? "🟢" : "🔴"]),
              h("span", {title:"entriesExtended"}, [props.db.state?.entriesExtended ? "🟢" : "🔴"]),
              h("span", {title:"entryDictBuilt"}, [props.db.state?.entryDictBuilt ? "🟢" : "🔴"]),
              h("span", {title:"entriesSyncTime"}, [" ", "语料 Entry", " ", "上次刷新于 ", props.timedict.entries]),
              h("span", {
                'class': ["mx-2", "text-decoration-underline cursor-pointer"],
                'onClick': ()=>{ctx.emit('sync-entries')},
              }, ["[刷新 (不含文本内容)]"]),
              isManager(props.me) ? h("span", {
                'class': ["mx-2", "text-decoration-underline cursor-pointer"],
                'onClick': ()=>{ctx.emit('export', 'entries')},
              }, ["[导出 (不含文本内容)]"]) : null,
            ],),
            h("div", {}, [
              h("span", {title:"tasks"}, [props.db.tasks?.length ? "🟢" : "🔴"]),
              h("span", {title:"tasksExtended"}, [props.db.state?.tasksExtended ? "🟢" : "🔴"]),
              h("span", {title:"taskDictBuilt"}, [props.db.state?.taskDictBuilt ? "🟢" : "🔴"]),
              h("span", {title:"tasksSyncTime"}, [" ", "任务 Task", " ", "上次刷新于 ", props.timedict.tasks]),
              h("span", {
                'class': ["mx-2", "text-decoration-underline cursor-pointer"],
                'onClick': ()=>{ctx.emit('sync-tasks')},
              }, ["[刷新]"]),
              isManager(props.me) ? h("span", {
                'class': ["mx-2", "text-decoration-underline cursor-pointer"],
                'onClick': ()=>{ctx.emit('export', 'tasks')},
              }, ["[导出]"]) : null,
            ],),
            h("div", {}, [
              h("span", {title:"annos"}, [props.db.annos?.length ? "🟢" : "🔴"]),
              h("span", {title:"annosExtended"}, [props.db.state?.annosExtended ? "🟢" : "🔴"]),
              h("span", {title:"annoDictBuilt"}, [props.db.state?.annoDictBuilt ? "🟢" : "🔴"]),
              h("span", {title:"annosSyncTime"}, [" ", "标注 Anno", " ", "上次刷新于 ", props.timedict.annos]),
              h("span", {
                'class': ["mx-2", "text-decoration-underline cursor-pointer"],
                'onClick': ()=>{ctx.emit('sync-annos')},
              }, ["[刷新]"]),
              isManager(props.me) ? h("span", {
                'class': ["mx-2", "text-decoration-underline cursor-pointer"],
                'onClick': ()=>{ctx.emit('export', 'annos')},
              }, ["[导出]"]) : null,
            ],),
            h("div", {}, [
              h("span", {title:"users"}, [props.db.users?.length ? "🟢" : "🔴"]),
              h("span", {title:"usersExtended"}, [props.db.state?.usersExtended ? "🟢" : "🔴"]),
              h("span", {title:"userDictBuilt"}, [props.db.state?.userDictBuilt ? "🟢" : "🔴"]),
              h("span", {title:"usersSyncTime"}, [" ", "用户 User", " ", "上次刷新于 ", props.timedict.users]),
              h("span", {
                'class': ["mx-2", "text-decoration-underline cursor-pointer"],
                'onClick': ()=>{ctx.emit('sync-users')},
              }, ["[刷新]"]),
              isManager(props.me) ? h("span", {
                'class': ["mx-2", "text-decoration-underline cursor-pointer"],
                'onClick': ()=>{ctx.emit('export', 'users')},
              }, ["[导出]"]) : null,
            ],),
          ],),

        ],),

      ],),
    ];
  },
};

export default DataPanel;



          // <div class="col col-12" v-show="false">
          //   <button
          //     type="button"
          //     class="btn btn-sm me-2 my-1"
          //     :class="{'btn-outline-success': spDB.entries?.[0]?.content?.material?.tokenList?.length, 'btn-outline-secondary': !spDB.entries?.[0]?.content?.material?.tokenList?.length}"
          //     @click="modalBox_open('upload-entries')"
          //     title="因网络传输不太稳定，而语料库较大，故请从本地选择语料库文件进行加载"
          //   >导入 Entry 表（完整)</button>
          //   <button
          //     type="button"
          //     v-if="spDB.entries?.[0]?.content?.material?.tokenList?.length"
          //     class="btn btn-sm me-2 my-1"
          //     :class="'btn-outline-primary'"
          //     @click="makeAnnoOnTexts"
          //     title="配合语料文本更新 anno 细节"
          //   >配合语料文本更新 anno 细节</button>
          // </div>







