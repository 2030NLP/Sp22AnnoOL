import {  reactive, onMounted, h  } from '../modules_lib/vue_3.2.31_.esm-browser.prod.min.js';
import ModalContent from './ModalContent.cpnt.mjs.js';

const UserImporter = {
  props: ["db", "box"],
  emits: ["happy", "check-error", "check-error-on-save", "save"],
  component: {
    ModalContent,
  },
  setup(props, ctx) {
    const localData = reactive({
      csvText: "",
      newUsers: [],
      isInvalid: false,
      isValid: false,
      errorText: "",
    });

    const chainSet = (it, keyChain, value) => {
      let key = keyChain.shift();
      if (keyChain.length > 0) {
        if (!(key in it)) {
          it[key] = {};
        };
        chainSet(it[key], keyChain, value);
      } else {
        it[key] = value;
      };
    };

    const parseTitledCsv = (csv) => {
      csv = csv.replace(/\r/g, "");
      let lines = csv.split(/ *\n */).map(it=>it.trim()).filter(it=>it.length);
      let table = lines.map(line=>line.split(/ *, */).map(it=>it.trim()));
      let keys = table[0];
      let items = table.slice(1);
      let output = [];
      for (let item of items) {
        let it = {};
        for (let idx in keys) {
          let keyChain = keys[idx].split(/ *\. */).map(it=>it.trim()).filter(it=>it.length);
          let value = item[idx];
          chainSet(it, keyChain, value);
        };
        output.push(it);
      };
      return output
    };


    const check = () => {
      try {
        localData.newUsers = parseTitledCsv(localData.csvText);
        if (!localData.newUsers?.length) {
          throw new Error("无内容");
        };
        for (let user of localData.newUsers) {
          if (!user?.name?.length) {
            throw new Error("存在无姓名（name）的用户");
          };
        };
        localData.isInvalid = false;
        localData.isValid = true;
        return true;
      } catch (error) {
        localData.errorText = `${error}`;
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
      ctx.emit('save', localData.newUsers);
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
                      'class': ["form-control form-control-sm vh-20 max-vh-20", {
                        'is-invalid': localData.isInvalid,
                        'is-valid': localData.isValid,
                      }],
                      'value': localData.csvText,
                      'onInput': event => {
                        localData.csvText = event?.target?.value;
                        localData.newUsers = [];
                        localData.isInvalid = false;
                        localData.isValid = false;
                        localData.errorText = "";
                      },
                    },
                  ),
                  h('div', {
                    'class': ["form-text"],
                  }, ["将表格转成 csv 格式，用代码编辑器或记事本打开，然后全选复制粘贴到此处。第一行得是表头。"]),
                  h('div', {
                    'class': ["form-text"],
                  }, ["注意：manager 字段填的应该是小组长的id而不是姓名，manager_name 字段才是小组长姓名。这种错误不会被检查出来！！！"]),
                  h('div', {
                    'class': ["form-text"],
                  }, ["注意：必须要有 name 字段；id 和 token 字段会自动生成，无需填写，执行后会反馈；其他字段选填。"]),
                  h('div', {
                    'class': ["invalid-feedback", {'d-none': !localData.isInvalid}],
                  }, [localData.errorText?.length?localData.errorText:"存在错误，请检查"]),
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
              `开始入库`,
            ]),
          ],
        },
      ),
    ];
  },
};

export default UserImporter;

