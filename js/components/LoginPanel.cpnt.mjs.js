import {
  reactive,
  computed,
  onMounted,
  watch,
  h,
} from '../modules_lib/vue_3.2.31_.esm-browser.prod.min.js';

const LoginPanel = {
  props: ["user", "settings", "connected"],
  emits: ["happy", 'connect'],
  component: {
  },
  setup(props, ctx) {
    const localData = reactive({
      userInfo: {
        name: "",
        token: "",
      },
    });

    watch(()=>props.user, ()=>{localData.userInfo = props.user;}, { deep: true });

    const isManager = (user) => {
      return user.role?.includes?.('manager') || user.role?.includes?.('admin');
    };


    return () => [
      h("div", { 'class': "container", }, props.connected ? [

        h("div", { 'class': "row align-items-center my-2", }, [
          h("div", { 'class': "col col-12", }, [
            h("button", {
              'type': "button",
              'class': "btn btn-sm my-1 me-2",
            }, [`${localData.userInfo.name} 已登录`]),
            h("button", {
              'type': "button",
              'class': "btn btn-sm btn-light my-1 me-2",
              'onClick': ()=>{ctx.emit('disconnect', localData.userInfo)},
            }, ["登出"]),
          ],),
        ],),
          
      ] : [

        h("div", { 'class': "row align-items-center my-2", }, [

          h("div", { 'class': "col col-12 col-md-3 col-lg-4 my-2", }, [
            h("div", { 'class': "form-floating", }, [
              h("input", {
                'class': "form-control form-control-sm",
                'type': "text",
                'placeholder': "请输入您的姓名",
                'value': localData.userInfo.name,
                'onInput': (event) => {
                  localData.userInfo.name = event?.target?.value;
                  ctx.emit('update-user', localData.userInfo);
                },
              }, null),
              h("label", { 'class': "form-label", }, ["姓名"],),
            ],),
          ],),

          h("div", { 'class': "col col-12 col-md-9 col-lg-8 my-2", }, [
            h("div", { 'class': "form-floating", }, [
              h("input", {
                'class': "form-control form-control-sm",
                'type': "password",
                'placeholder': "请输入您的密码",
                'value': localData.userInfo.token,
                'onInput': (event) => {
                  localData.userInfo.token = event?.target?.value;
                  ctx.emit('update-user', localData.userInfo);
                },
              }, null),
              h("label", { 'class': "form-label", }, ["密码"],),
            ],),
          ],),

        ],),

        h("div", { 'class': "row align-items-center my-2", }, [
          h("div", { 'class': "col col-12", }, [
            h("button", {
              'type': "button",
              'class': "btn btn-sm btn-outline-primary my-1 me-2",
              'onClick': ()=>{ctx.emit('connect', localData.userInfo)},
            }, ["登录"]),
          ],),
        ],),

      ],),
    ];
  },
};

export default LoginPanel;

