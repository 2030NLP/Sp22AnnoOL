import {  reactive, onMounted, h  } from '../modules_lib/vue_3.2.31_.esm-browser.prod.min.js';
import ModalContent from './ModalContent.cpnt.mjs.js';

const UserTagsEditor = {
  props: ["db", "box", "user"],
  emits: ["happy", "check-error", "check-error-on-save", "save"],
  component: {
    ModalContent,
  },
  setup(props, ctx) {
    const localData = reactive({
      userJson: "{}",
      newUser: {},
      isInvalid: false,
      isValid: false,
      userTagsText: "",
    });
    onMounted(()=>{
      let copy = JSON.parse(JSON.stringify(props.user));
      copy._id = undefined;
      copy.token = undefined;
      copy.allAnnos = undefined;
      copy.allTasks = undefined;
      copy.doneTasks = undefined;
      localData.userJson = JSON.stringify(copy, null, 2);
      localData.userTagsText = (copy?.tags??[]).join("\n");
    });
    const textToTags = (text) => {
      const tags = text.split(/[\n\t]+| *[,，;；] */).map(it=>it?.trim?.()).filter(it=>it?.length);
      return tags;
    };
    const check = () => {
      try {
        localData.newUser = JSON.parse(localData.userJson);
        localData.newUser.tags = textToTags(localData.userTagsText);
        localData.userTagsText = localData.newUser.tags.join("\n");
        localData.isInvalid = false;
        localData.isValid = true;
        return true;
      } catch (error) {
        console.log(error);
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
                  h('div', {
                    'class': ["form-text"],
                  }, ["每个标签单独一行，或者用逗号分隔。中英文逗号皆可，逗号两侧可以有空格。"]),
                  h('textarea', {
                      'class': ["form-control form-control-sm", {
                        'is-invalid': localData.isInvalid,
                        'is-valid': localData.isValid,
                      }],
                      'value': localData.userTagsText,
                      'onInput': event => {
                        localData.userTagsText = event?.target?.value;
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

export default UserTagsEditor;

