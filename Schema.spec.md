Schema.spec.md

> [TOC]



本项目通过一种 Json 格式的文件来控制标注的具体流程，我们将此文件称为 StepsSchema 。在当前项目中，该文件的路径为：`/schema/steps.schema.json`。

#### 1  配置 StepsSchema 文件

一个 StepsSchema 文件由以下字段来描述：

- `name`: 该 StepsSchema 的名称。该字段改变时，用户会在标注下一条语料时收到通知。
- `version`: 该 StepsSchema 的总体版本。该字段改变时，离线版用户会在打开网页时收到通知。
- `versions`: 该 StepsSchema 中每个 WorkFlow 的版本。该字段改变时，正在使用对应 WorkFlow 的用户会在标注下一条语料时收到通知。
- `<workflowName>`: 每个 StepsSchema 文件都可以事先存放多套标注流程（Workflow），这些不同的标注流程以不同的 `<workflowName>` 为键，存放在 StepsSchema 文件的根节点下。
  - 关于每个 Workflow 如何配置，请看 2.2 节。
- `using`: 当前正在使用哪一套标注流程，其值为一个同级别的 `<workflowName>` 键名。该字段改变时，用户会在标注下一条语料时收到通知，同时标注界面会改为按照新的流程来呈现。

例如：

```json
{
  "name": "SpaCE2022",
  "version": "220425",
  "versions": {
    "清洗": "220330",
    "第1期": "220421",
    "第2期": "220425",
  },
  "using": "第2期",
  "清洗": {
    "...": "..."
  },
  "第1期": {
    "...": "..."
  },
  "第2期": {
    "...": "..."
  }
}
```

#### 2  配置 Workflow

每个 StepsSchema 文件可存放多个 Workflow，每个 Workflow 由以下字段描述：

- `steps`: 以键值对（字典）形式存储了该 Workflow 包含的所有步骤，每个步骤的 key 与该步骤的 `ref` 字段值相同，以便区分这些步骤，并实现各个步骤之间的跳转。
  - 关于每个 Step 如何配置，请看 2.3 节。
- `startStep`: 该 Workflow 的起点步骤的 `ref` 。
- `endStep`: 该 Workflow 的终点步骤的 `ref` 。

例如：

```json
{
  "steps": {
    "start": {"ref": "start", "...": "..."},
    "step1": {"ref": "step1", "...": "..."},
    "step2": {"ref": "step2", "...": "..."},
    "end": {"ref": "end", "...": "..."},
  },
  "startStep": "start",
  "endStep": "end"
}
```

#### 3  配置 Step

每个 Workflow 包含多个 Step，每个 Step 由以下字段描述：

- `ref`: 其他步骤链接到此步骤时引用的名称，通常用英文来写。
- `name`: 给人类查看的步骤名称，不影响程序逻辑，可以是中文。
- `mode`: 该步骤的运行逻辑所属的模式类型，影响页面呈现和数据处理逻辑。
- `props`: 该步骤所使用的具体变量，涉及的字段因 `mode` 而异。
  - 关于各个 mode 及其相应的 props，请看 2.4 节。


例如：

```json
{
  "ref": "end",
  "name": "标注结果",
  "mode": "finalResult",
  "props": {
    "instruction": "标注已完成。",
    "canReset": true,
    "resetBtn": {
      "text": "清空并重新标注",
      "go": "start",
      "style": "outline-danger"
    },
    "cancelBtn": {
      "text": "继续增加标注",
      "go": "start",
      "style": "outline-danger"
    },
    "nextBtn": {
      "text": "下一条",
      "style": "outline-primary"
    }
  }
}
```

#### 4  步骤的各种模式及其参数

说明

##### 结果呈现  finalResult

界面：

- 操作区
  - 指导语
  - “重置”按钮（可选）
  - “取消”按钮：回到之前的某个步骤（由按钮的 go 字段定义）
  - “下一条”按钮：加载下一条语料
  - “保存并继续”按钮（仅限网络版，不可配置）：保存到服务器并加载下一条语料
- 结果区：显示目前已有的全部标注结果

参数：

- instruction | 指导语
- canReset 👎 | 是否提供重置按钮
  - ⚠️ 建议直接通过是否存在 resetBtn 来判断
- resetBtn | “重置”按钮的细节
  - text | 按钮文本
  - go | 前往哪个 step
  - style | 外观风格，为 bootstrap 的按钮样式去除 “btn-” 前缀之后的部分
- cancelBtn | “取消”按钮的细节
- nextBtn | “下一条”按钮的细节

数据：无

例子：

```json
{
  "<stepRef>": {
    "ref": "<stepRef>",
    "name": "<给人类看的步骤名，可以是中文>",
    "mode": "finalResult",
    "props": {
      "instruction": "标注已完成。",
      "canReset": true,
      "resetBtn": {
        "text": "清空并重新标注",
        "go": "start",
        "style": "outline-danger"
      },
      "cancelBtn": {
        "text": "继续增加标注",
        "go": "start",
        "style": "outline-danger"
      },
      "nextBtn": {
        "text": "下一条",
        "style": "outline-primary"
      }
    }
  }
}
```



##### 选择值  selectValue



##### 幕间  interlude  👎



##### 添加  add



##### 修改  modify



##### 删除  delete



##### 选择多个片段  multiSpans



##### 选择单个片段并选择描述选项  choose  👎



##### 选择单个片段并输入描述文本  text  👎



###### 特例：处理错误字符串  handleErrorString  👎



##### 初始  root  👎













#### 5  工具

可使用代码编辑器直接编辑 StepsSchema 文件，如：

- [Sublime Text](https://www.sublimetext.com/)
- [VS Code](https://code.visualstudio.com/)

也可使用一些 Json 编辑校验工具来编辑或检查 StepsSchema 文件（但暂时没有制作可供高级自动检查的 [JsonSchema](http://json-schema.org/) ），如：

- https://www.bejson.com/jsoneditoronline/index.html
- https://json-editor.tangramjs.com/editor.html

---

---

---















