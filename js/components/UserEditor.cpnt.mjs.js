import {  reactive, onMounted, h  } from '../modules_lib/vue_3.2.31_.esm-browser.prod.min.js';
import ModalContent from './ModalContent.cpnt.mjs.js';

const UserEditor = {
  props: ["db", "box", "user"],
  emits: ["happy"],
  component: {
    ModalContent,
  },
  setup(props, ctx) {
    const localData = reactive({
      userJson: "{}",
      newUser: {},
      isInvalid: false,
      isValid: false,
    });
    onMounted(()=>{
      let copy = JSON.parse(JSON.stringify(props.user));
      copy._id = undefined;
      copy.token = undefined;
      copy.allAnnos = undefined;
      copy.allTasks = undefined;
      copy.doneTasks = undefined;
      localData.userJson = JSON.stringify(copy, null, 2);
    });
    const check = () => {
      try {
        localData.newUser = JSON.parse(localData.userJson);
        localData.isInvalid = false;
        localData.isValid = true;
        return true;
      } catch (error) {
        ctx.emit('check-error', error);
        localData.isInvalid = true;
        localData.isValid = false;
        return false;
      };
    };
    const onSave = () => {
      let checkOK = check();
      if (!checkOK) {
        ctx.emit('check-error-on-save');
        return;
      };
      ctx.emit('save', localData.newUser);
    };


    return () => [
      h(ModalContent, {
          // 'class': "d-block",
          "box": props.box,
          // "needconfirm": false,
          // "closetext": "关闭",
          // "confirmtext": "确定",
          // "confirmstyle": "primary",
        },
        {
          default: () => [h('div', {'class': 'container'},
            [
              h('div', {'class': 'row align-items-center my-2'}, [
                h('div', {'class': 'col-12 my-1'}, [
                  h('textarea', {
                      'class': ["form-control form-control-sm vh-60 max-vh-60", {
                        'is-invalid': localData.isInvalid,
                        'is-valid': localData.isValid,
                      }],
                      'value': localData.userJson,
                      'onInput': event => {
                        localData.userJson = event?.target?.value;
                        localData.isInvalid = false;
                        localData.isValid = false;
                      },
                    },
                  ),
                  h('div', {
                    'class': ["invalid-feedback", {'d-none': !localData.isInvalid}],
                  }, ["存在错误，请检查"]),
                  h('div', {
                    'class': ["valid-feedback", {'d-none': !localData.isValid}],
                  }, ["没问题"]),
                ]),
                h('div', {'class': 'col-12 my-1'}, [
                  h('button', {
                    'class': "btn btn-sm btn-outline-primary",
                    'onClick': check,
                  }, [
                    `校验`,
                  ]),
                ]),
              ]),
            ])],
          footer: () => [
            h('button', {
              'class': ["btn btn-sm", `btn-primary`],
              'onClick': ()=>{onSave()},
            }, [
              `保存`,
            ]),
          ],
        },
      ),
    ];
  },
};

export default UserEditor;

