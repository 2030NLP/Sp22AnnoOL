# SpaCE2022标注工具前端说明文档



> [TOC]

---

---

---

## 一、作为标注者使用

### 1.1  离线版的使用

【暂略】

### 1.2  网络版的使用

【暂略】

---

---

---

## 二、作为管理者管理和编辑 Schema

本项目通过一种 Json 格式的文件来控制标注的具体流程，我们将此文件称为 StepsSchema 。在当前项目中，该文件的路径为：`/schema/steps.schema.json`。

### 2.1  配置 StepsSchema 文件

一个 StepsSchema 文件由以下字段来描述：

- `name`: 该 StepsSchema 的名称。该字段改变时，用户会在标注下一条语料时收到通知。
- `version`: 该 StepsSchema 的版本。该字段改变时，用户会在标注下一条语料时收到通知。
- `<workflowName>`: 每个 StepsSchema 文件都可以事先存放多套标注流程（Workflow），这些不同的标注流程以不同的 `<workflowName>` 为键，存放在 StepsSchema 文件的根节点下。
  - 关于每个 Workflow 如何配置，请看 2.2 节。

- `using`: 当前正在使用哪一套标注流程，其值为一个同级别的 `<workflowName>` 键名。该字段改变时，用户会在标注下一条语料时收到通知，同时标注界面会改为按照新的流程来呈现。

例如：

```json
{
  "name": "SpaCE2022",
  "version": "2203013v0",
  "using": "语料质量检查",
  "语料质量检查": {
    "...": "..."
  },
  "判断正确性": {
    "...": "..."
  },
  "判断同义性": {
    "...": "..."
  }
}
```

### 2.2  配置 Workflow

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

### 2.3  配置 Step

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

### 2.4  步骤的各种模式及其参数

【暂略】【参考开发相关章节】

### 2.5  工具

可使用代码编辑器直接编辑 StepsSchema 文件，如：

- [Sublime Text](https://www.sublimetext.com/)
- [VS Code](https://code.visualstudio.com/)

也可使用一些 Json 编辑校验工具来编辑或检查 StepsSchema 文件（但暂时没有制作可供高级自动检查的 [JsonSchema](http://json-schema.org/) ），如：

- https://www.bejson.com/jsoneditoronline/index.html
- https://json-editor.tangramjs.com/editor.html

---

---

---

## 三、回收数据之后如何处理（数据格式说明）

使用浏览器处理 json 数据的工具： [jsontool](https://tridict.github.io/jsontool/)

【暂略】

---

---

---

## 四、部署和运行

本章介绍如何部署和运行项目代码。

代码存放在 Github 仓库：

- https://github.com/2030NLP/Sp22Annotator

代码的分支情况：

- 离线版：`main` 分支
- 网络版：`newBackEnd` 分支
- 其他分支是历史版本归档，可忽略

推荐使用 [Sublime Merge](https://www.sublimemerge.com/) 进行代码版本管理。



### 4.1  本地运行

1. 使用 git 从仓库 pull 代码，或者在仓库页面打包下载代码。
2. 在本地搭建简易服务器，挂载本项目，访问 index.html 即可。例如：
   1. 安装 Sublime Text 并打开。
   2. 安装并启用 SublimeServer 。
      1. 通过 Tools -> Install Package Control 安装插件包管理工具。
      2. 上一步完成后，通过 Tools -> Command Palette 呼出命令板，输入“`Package Control: Install Package`”并回车，搜索“`SublimeServer`”并回车安装。注：虽然这个项目已经不再维护，但不影响使用。
      3. 安装完成后，通过 Tools -> SublimeServer -> Start SublimeServer 启动本地服务。每次重启 Sublime Text 都需重启此功能。
   3. 将整个代码目录文件夹拖进软件窗口，然后在左侧列表打开 index.html。
   4. 在代码任意区域单击右键，选择 View in SublimeServer；或者直接在浏览器访问`localhost:8080/Sp22Annotator/index.html`。
   5. 即可在浏览器访问此项目。



### 4.2  Github-pages

- 建立 Github 仓库，导入代码，或者直接从原始仓库 fork 代码。
- Settings -> Pages ，设置 Source 为 main 或 你需要的分支，Save 。
- 无需其他任何环境配置，即可通过相应链接访问。
- 但需注意，网络版涉及到与后端交互，要做两个处理：
  - 1、前端 `main.js` 里要将 `API_BASE_PROD` 设置为正确的地址。
  - 2、后端要将此仓库的 pages 地址的域名部分列入允许跨域访问的清单之中。



### 4.3  部署到服务器

- 只要放到服务器并提供链接，无需其他任何环境配置，即可访问。
- 但需注意，网络版涉及到与后端交互，要做两个处理：
  - 1、前端 `main.js` 里要将 `API_BASE_PROD` 设置为正确的地址。
  - 2、后端要将前端所在域名或ip地址列入允许跨域访问的清单之中。



---

---

---

## 五、开发



### 5.1  技术基础

#### 5.1.1  项目技术栈

- 页面样式：[Bootstrap 5.1](https://getbootstrap.com/docs/5.1/getting-started/introduction/)
  - 要点提示： [响应式](https://getbootstrap.com/docs/5.1/layout/breakpoints/) , [栅格系统](https://getbootstrap.com/docs/5.1/layout/grid/) , [间距](https://getbootstrap.com/docs/5.1/utilities/spacing/) , [表单](https://getbootstrap.com/docs/5.1/forms/overview/) , [按钮](https://getbootstrap.com/docs/5.1/components/buttons/) , [进度条](https://getbootstrap.com/docs/5.1/components/progress/) , [提示框](https://getbootstrap.com/docs/5.1/components/alerts/)
- 页面渲染，页面内容与数据的绑定：Vue3
  - 要点提示： `setup()`, `reactive()`, `onMounted()` 等
  - 注1：为了降低工作门槛，本项目的开发没有使用构建工具，也没有使用 Vue 的单位件组件，而是直接采用传统前端开发模式，即：直接编写交由浏览器处理的最终页面内容（html, css, js 等）。
  - 注2：目前整个页面是一个完整的 Vue 组件，没有进行组件拆分。
- 程序逻辑实现：ES6 及以上的 JS 语法
  - 要点提示： [模块](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Modules)、[类](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Classes)、[箭头函数](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Functions#%E7%AE%AD%E5%A4%B4%E5%87%BD%E6%95%B0)、[异步](https://developer.mozilla.org/zh-CN/docs/Learn/JavaScript/Asynchronous)；使用 [let](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/let) 和 [const](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/const) 而不是 [var](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/var)

- 前后端通信：[Axios](https://github.com/axios/axios)
  - 注：Axios 官方不支持 ES6 模块，项目里使用的是我们重新封装后的版本。

- 其他第三方库（位于 `/js/modules_lib` 目录下）：
  - clipboard.js: 实现文本复制功能
  - FileSaver.js: 实现文件保存功能
  - store.js: 实现缓存功能

#### 5.1.2  技术要求及学习资源

进行本项目的开发或维护，需要掌握以下技术，若暂时未掌握，可参考以下线路进行学习。

- 主题1
  - 描述：能够制作简单的静态网页。
  - 技能与知识点：
    - HTML5 基础
      - 块级元素和行内元素，语义化标签；表单元素
    - CSS3 基础
      - 定位方案，尤其是 flex 定位；背景，边框，圆角，字体，透明度，层次（z-index）等；CSS3 动画
    - 可选：Bootstrap 基础，用来快速搭建静态前端页面，也可以用来快速学习良好的 HTML 和 CSS 可以写成什么样
      - 响应式布局，栅格系统
  - 学习资源：
    - [W3school](https://www.w3school.com.cn/) : 关于网页编程的基础内容都在这里了，包括后续其他主题的知识也可在这里查找
    - [Bootstrap官方文档](https://getbootstrap.com/docs) : 很简明
- 主题2
  - 描述：能够使用 JS 编程。了解 dom 操作、表单操作。熟悉 JSON。
  - 技能与知识点：
    - JS 基础
    - JSON 基础；可选：[JSON lines](https://jsonlines.org/) ，[JSON Schema](http://json-schema.org/)
    - 可选：jQuery，虽然过时了，但是用来熟悉 dom 和 css 是很有效的
  - 学习资源：
    - [MDN 的 JS 教程](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/A_re-introduction_to_JavaScript) : MDN是互联网技术规范的主要贡献者，它的 JS 教程比较可靠
    - [《JavaScript高级程序设计》](https://zhuanlan.zhihu.com/p/196524278) : JS 红宝书
    - [某网友制作的jQuery手册](https://jquery.cuishifeng.cn/index.html)
    - [阮一峰博客](https://www.ruanyifeng.com/blog/) : 前端技术牛人
    - [MDN HTML表单指南](https://developer.mozilla.org/zh-CN/docs/Learn/Forms)

- 主题3
  - 描述：能够使用 JS 进行网络编程或测试接口。
  - 技能与知识点：
    - JS 异步编程，参考： [MDN](https://developer.mozilla.org/zh-CN/docs/Learn/JavaScript/Asynchronous)
      - `async` 和 `await`
      - `Promise`
    - 网络请求（post, get, put 等）
    - [Axios 库](https://github.com/axios/axios) 的使用
    - [Ajax](https://www.w3school.com.cn/js/js_ajax_intro.asp) 相关
- 主题4
  - 描述：能够进行代码版本管理。
  - 技能与知识点：Github 及 git 操作。
  - 推荐工具： [Sublime Merge](https://www.sublimemerge.com/)
- 主题5
  - 描述：了解 JS 近年来的新发展
  - 知识点：
    - 了解 JS 的版本发展，参考： [W3school](https://www.w3school.com.cn/js/js_history.asp) , [ecma标准制定国际组织](https://www.ecma-international.org)
    - 了解 ES6 之后的新语法，参考：① [简书文章](https://www.jianshu.com/p/3189195b03e6) 注意文章最后附有历年的新语法；② http://es6-features.org
    - 熟悉 ES6 模块，参考：
      - [MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Modules)
      - [阮一峰：浏览器加载 CommonJS 模块的原理与实现](http://www.ruanyifeng.com/blog/2015/05/commonjs-in-browser.html)
      - [阮一峰：Node.js 如何处理 ES6 模块](http://www.ruanyifeng.com/blog/2020/08/how-nodejs-use-es6-module.html)
    - 了解 [Webpack](https://webpack.github.io/)
    - 了解 [Node.js](https://nodejs.org/zh-cn/) ，了解 [Deno](https://deno.land/)
    - 了解 [TypeScript](https://www.tslang.cn/)
- 主题6
  - 描述：能够使用 Vue3 构建 web 应用
  - 知识点：
    - Vue 模板语法
    - Vue3 组合式 API（主要是 `setup()` 的编写）
    - Vue 单文件组件
  - 学习资源：
    - [Vue 官网文档](https://vuejs.org/guide/introduction.html)
    - [Vue3 官方中文文档](https://v3.cn.vuejs.org/guide/introduction.html) 但是写得很糟糕



### 5.2  项目概览

#### 5.2.1  项目结构

本项目主要文件的目录结构如下，其中加粗项为最核心的文件：

- `/README.md`  项目说明
- **`/index.html`**  **前端主页面**
- `/favicon.ico`  图标
- `/schema`  StepsSchema 存放位置
  - **`/schema/steps.schema.json`**  **StepsSchema 文件**
- `/css`  样式文件存放位置
  - `/css/bootstrap_5.1.3_.min.css`  Bootstrap 样式文件
  - **`/css/style.css`**  **前端主页面使用的样式文件**
- `/js`  逻辑代码存放位置
  - `/js/modules_lib`  项目使用的第三方模块
    - `/js/modules_lib/vue_3.2.31_.esm-browser.prod.min.js`  Vue3  前端框架
    - `/js/modules_lib/axios_0.26.1_.mjs.js`  Axios  用于发送网络请求
    - `/js/modules_lib/clipboard_2.0.10_.mjs.js`  Clipboard.js  用于实现文本复制功能
    - `/js/modules_lib/store_2.0.9_.legacy.min.mjs.js`  Store.js  用于实现浏览器缓存
    - `/js/modules_lib/FileSaver.js`  FileSaver.js  用于保存文件到本地
  - `/js/util.mjs.js`  一些通用的工具函数
  - **`/js/main.mjs.js`**  **项目核心逻辑入口**
  - `/js/modules`  项目各个功能模块的代码文件，供 `main.mjs.js` 使用
    - `/js/modules/AlertBox.mjs.js`  消息提示功能模块
    - `/js/modules/TokenSelector.mjs.js`  文本选取功能模块
    - `/js/modules/StepControl.mjs.js`  标注流程控制模块
    - `/js/modules/BackEnd.mjs.js`  后端接口功能模块
    - **`/js/modules/BackEndUsage.mjs.js`**  后端具体用法，**网络版核心功能模块**
    - `/js/modules/BaseReader.mjs.js`  文件读取功能模块（相对通用）
    - `/js/modules/TheReader.mjs.js`  文件读取功能模块（项目专用）
    - `/js/modules/BaseSaver.mjs.js`  文件保存功能模块
    - **`/js/modules/IoControl.mjs.js`**  本地文件读写控制，**离线版核心功能模块**

说明1：以 `.mjs.js` 为后缀名的文件皆为符合 [JS 原生模块规范](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Modules) 的模块，之所以以这样的后缀命名，是因为有些浏览器还不支持 `.mjs` 后缀结尾的脚本，同时仅以 `.js` 结尾又无法直接区分模块和非模块，因此才用了这种后缀写法。

说明2：第三方模块中以 `.mjs.js` 结尾的，都不是官方提供的版本，而是我们为了将其作为原生模块引入，而专门改造之后的版本。

#### 5.2.2  项目核心业务逻辑

离线版

【暂略】

网络版

【暂略】



### 5.3  各功能模块接口介绍

#### 5.3.1  `main.mjs.js`  页面核心逻辑

该模块为前端页面提供了若干内容以供使用，主要包括：

（1）数据、简单对象

```javascript
example            // 当前标注的语料对象
dfWrap.dataItems   // 语料对象清单（离线版）
tasks              // 标注任务清单（网络版）

ctrl               // 应用控制相关变量

alertData          // 消息提示盒的内容数据
selection          // 选区相关数据

rootStep           // 当前 StepsSchema 中的初始步骤
currentStep        // 当前正在进行的标注步骤
stepsDict          // 当前 StepsSchema 的详细描述
stepsDictWrap      // 当前 StepsSchema 的元信息
```

（2）函数

```javascript
updateSchema()           // 更新 StepsSchema
toogleShowOrigin()       // 切换是否显示原句
fileInfo(originId)       // 获取 originId 对应语料的类型、原始文件名等信息
getReplacedToken(idx)    // 获取语料（替换句）中第 idx 个词语
getOriginToken(idx)      // 获取语料（原句）中第 idx 个词语
getTokenList()           // 获取 example.material.tokenList
```

（3）复杂对象接口

```javascript
alertBox          // 消息盒子接口
tokenSelector     // 文本片段选取工具接口
theSaver          // 文件保存接口
theApi            // 与后端连接的 Axios 实例的接口（ baseURL: `${API_BASE}/api/` ）
theBackEnd        // 更加直接的后端功能接口

win               // 浏览器 window 对象接口
anotherAxios      // 另一个 Axios 实例的接口，未事先设置 baseURL

stepCtrl          // 标注流程步骤控制接口
ioC               // 离线版核心接口，是 ioControl 的简写
bEU               // 网络版核心接口，是 backEndUsage 的简写
```

此外，该模块还在浏览器控制台创建了名为 `app` 的 Vue 实例变量，供调试使用。

生产环境下应将最后几行之中的 `window.app = app;` 一行注释掉，以免用户自行调试，产生意外情况。

各变量、函数、对象的具体细节，可查看源码，或在浏览器控制台中调试（`app.[变量名]`）。



#### 5.3.2  `util.mjs.js`  一些工具函数

该模块提供了几个工具性的函数，供其他模块使用，具体如下：

```javascript
forceBlur(event)    // 令按钮强制失去焦点，不太好用
timeString()        // 返回 `yyMMdd-HHmmss` 格式的时间标记文本，如 `220316-195703`
foolCopy(it)        // 返回对象 it 的拷贝，算法比较蠢，所以称为 `foolCopy`
uuid()              // 返回一个新的 uuid
```



#### 5.3.3  `AlertBox.mjs.js`  消息提示功能模块

该模块提供了 `AlertBox` 类，配合前端 html 文件中的 `div.alert-wrap` 块，以及 css 文件中相应的 css，可实现右下角消息提示框的功能。 `AlertBox` 类的用法如下：

```javascript
let data = reactive({
  lastIdx: 1,
  alerts: [],
});
let alertBox = new AlertBox(data);  // 实例化

let idx = alertBox.pushAlert(ctt, typ, tot);  // 推送消息，ctt 为文本内容，typ 为 Bootstrap 配色类型，tot 为持续毫秒数；返回值为这条消息在 alertBox.data.alerts 数组中的序号。

alertBox.removeAlert(idx);  // 从页面中隐去 alertBox.data.alerts 中序号为 idx 的消息。
```



#### 5.3.4  `TokenSelector.mjs.js`  文本选取功能模块

该模块提供 `TokenSelector` 类，用于文本选取相关的控制。用法及接口如下：

```javascript
let selection = reactive({"...": "..."});  // 详情请看 main.mjs.js
let tokenSelector = new TokenSelector(selection);  // 实例化

tokenSelector.clear(tokenList);  // 清除选区

// 以下函数与 语料 token 与鼠标的交互有关，用来实现选区的数据传递
tokenSelector.onMouseDown(token, event, tokenList);  // 触发鼠标按下事件
tokenSelector.onMouseEnter(token, tokenList);        // 触发鼠标移入事件
tokenSelector.onMouseOut(token);                     // 触发鼠标移出事件
tokenSelector.onMouseUp(token, tokenList);           // 触发鼠标松开事件

// 以下函数与 选区中的文本 有关
tokenSelector.getReplacedToken(idx, tokenList);    // 获取替换句中的第 idx 个 token
tokenSelector.getOriginToken(idx, tokenList);      // 获取　原句中的第 idx 个 token
tokenSelector.selectedReplacedText(tokenList);     // 获取替换句中 被选中的文本内容
tokenSelector.selectedOriginText(tokenList);       // 获取　原句中 被选中的文本内容
```



#### 5.3.5  `StepControl.mjs.js`  标注流程控制模块

该模块提供 `StepControl` 类，用于文本选取相关的控制。用法及接口如下：

```javascript
let appPack = {"...": "..."};  // 详情请看 main.mjs.js
let stepCtrl = new StepControl(appPack);  // 实例化

stepCtrl.touchSchema(wrap);      // 更换 StepSchema
stepCtrl.ensureExampleStep();    // 为 example 附加 schema 信息

await stepCtrl.goStep(stepObj_, data);    // 使用 stepObj_ 描述的步骤，并保存 data 标注数据
await stepCtrl.goRefStep(ref, data);      // 前往 ref 对应的步骤，并保存 data 标注数据
await stepCtrl.cancelStep(ref);           // 执行取消按钮的功能
await stepCtrl.resetStep(ref);            // 执行重置按钮的功能

// 以下函数用于各类 mode 下的步骤的数据处理
stepCtrl.dealWithData(data, fn);          // 按预设流程加工 data 数据，并附加执行 fn 的操作，在下列各个函数中被调用
await stepCtrl.handleTemplate(ref, data, fn);  // 各类 mode 下进行数据处理的一般化模板，在下列各个函数中被调用
await stepCtrl.handleChooseOrText(ref, data);  // mode 为 choose 或 text 时调用
await stepCtrl.handleWord(ref, data);          // mode 为 word 时调用
await stepCtrl.handleAdd(ref, data);           // mode 为 add 时调用
await stepCtrl.handleQita(ref, data);          // mode 为 qita 时调用 ??? 【待核实】
await stepCtrl.handleMultiSpans(ref, data);    // mode 为 multiSpan 时调用
```



#### 5.3.6  `BackEnd.mjs.js`  后端接口功能模块

该模块提供 `BackEnd` 类，用于后端接口的调用。用法及接口如下：

```javascript
let bridge = axios.create({"...": "..."});  // 一个 axios 实例，详情请看 main.mjs.js
let handleErrorFn = (ctt, typ, tot) => alertBox.pushAlert(ctt, typ, tot);  // 错误处理函数
let theBackEnd = new BackEnd(bridge, handleErrorFn);  // 实例化

// 以下接口在源码中有比较详细的说明
await theBackEnd.request(config);                      // 给后端发送定制请求
await theBackEnd.db(table, operator, kwargs, _$$$);    // 后端数据库万能接口，非常危险，谨慎使用
await theBackEnd.getTopic();                           // 获取当前标注任务的主题
await theBackEnd.getUser(user_id, name, password);     // 获取用户信息
await theBackEnd.getWorkList(user_id, password);       // 获取用户的任务清单
await theBackEnd.getThing(user_id, task_id);           // 获取任务id对应的任务详情、语料、标注内容等
await theBackEnd.getTask(user_id, task_id);            // 获取任务信息
await theBackEnd.getEntry(entry_id);                   // 获取语料
await theBackEnd.getAnno(user_id, task_id);            // 获取标注内容
await theBackEnd.updateAnno(user_id, task_id, anno_wrap, topic);    // 更新标注内容
await theBackEnd.newTask(user_id, count, topic);       // 给用户分配一定数量的新任务
```



#### 5.3.7  `BackEndUsage.mjs.js`  后端具体用法模块

这是**网络版核心功能模块**。

该模块提供 `BackEndUsage` 类，用于对后端接口进行具体使用。用法及接口如下：

```javascript
const appPack = {"...": "..."};  // 详情请看 main.mjs.js
const bEU = new BackEndUsage(appPack);  // 实例化

bEU.updateProgress();                // 更新页面上的标注进度
bEU.saveStore();                     // 缓存一些用户信息，不太有用

// 为 标注流程控制器 接上 相应函数
stepCtrl.updateProgress = () => { bEU.updateProgress(); };
stepCtrl.saveStore = () => { bEU.saveStore(); };

await bEU.touchTask(task_btn);       // 获取具体任务按钮对应的 任务详情、语料、标注内容等
await bEU.touchTaskBtn(task_btn);    // 点击具体任务按钮时触发，更新页面上的语料并跳转到标注页

await bEU.connect();                 // 与后端进行连接，更新用户信息及任务清单
await bEU.updateTarget();            // 更新标注目标
await bEU.updateTaskList();          // 刷新任务清单，【TODO】名字改成 refreshTaskList 更好
await bEU.updateUser(user);          // 刷新用户信息，【TODO】名字改成 refreshUser 更好

await bEU.save(content);             // 保存（上传）针对当前语料的标注
await bEU.goIdx(idx);                // 前往任务清单中的第 idx 条语料
await bEU.prev(content);             // 前往上一条语料，【TODO】名字改成 goPrev 更好
await bEU.next(content);             // 前往下一条语料，【TODO】名字改成 goNext 更好
await bEU.saveAndPrev(content);      // 保存当前语料标注，并前往上一条语料
await bEU.saveAndNext(content);      // 保存当前语料标注，并前往下一条语料
```



#### 5.3.8  `BaseReader.mjs.js`  文件读取功能模块（相对通用）

该模块提供 `BaseReader` 类，用于本地文件读取。用法及接口如下：

```javascript
const baseReader = new BaseReader(handleErrorFn);  // 实例化

// 【TODO】这个模块命名和具体使用方式都不太完善，通常不会直接使用
await baseReader.reader_ReadFileAsText(fileWrap, options);
await baseReader.reader_ReadFileAsArrayBuffer(file, options);
await baseReader.reader_ReadFileAsBinaryString(file, options);
```

此模块在本项目中主要供 `TheReader.mjs.js` 调用。



#### 5.3.9  `TheReader.mjs.js`  文件读取功能模块（项目专用）

该模块提供 `TheReader` 类，用于本地文件读取。用法及接口如下：

```javascript
const theReader =  new TheReader(handleErrorFn, jschardet_detect);  // 实例化

// 【TODO】这个模块命名和具体使用方式都不太完善
await theReader.readFile (fileWrap);        // 在本项目中主要用这个方法来读取本地文件
await theReader.readFileAsArrayBuffer (fileWrap);
await theReader.readFileAsBinaryString (fileWrap, encoding);
```



#### 5.3.10  `BaseSaver.mjs.js`  文件保存功能模块

该模块提供 `xx` 类，用于文本选取相关的控制。用法及接口如下：

```javascript
const theSaver = new BaseSaver();  // 实例化

theSaver.saveText(text, fileName);  // 保存文本内容
theSaver.saveJson(obj, fileName);   // 保存 json 对象
theSaver.save(obj, fileName);       // 保存 json 对象，简写
```



#### 5.3.11  `IoControl.mjs.js`  本地文件读写控制模块

这是**离线版核心功能模块**。

该模块提供 `xx` 类，用于文本选取相关的控制。用法及接口如下：

```javascript
const appPack = {"...": "..."};  // 详情请看 main.mjs.js
const ioC = new IoControl(appPack);  // 实例化

ioC.updateProgress();        // 更新页面上的标注进度
ioC.saveStore();             // 缓存一些数据
ioC.saveExample();           // 将当前标注内容保存到本地数据中

// 为 标注流程控制器 接上 相应函数
stepCtrl.updateProgress = () => { ioC.updateProgress(); };
stepCtrl.saveStore = () => { ioC.saveStore(); };
stepCtrl.saveExample = () => { ioC.saveExample(); };

ioC.ensureExampleStep();     // 为 example 附加 schema 信息，【TODO】应该与 stepCtrl 接起来

ioC.log(action);             // 在本地数据中记录用户行为

ioC.fineIdx(idx);            // 将用户输入的序号限制在有效范围内
await ioC.goIdx(idx);        // 前往序号为 idx 的语料

await ioC.loadStore();       // 从缓存中加载数据
await ioC.onExport();        // 将本地数据输出为文件
await ioC.onImport(doc);     // 导入本地文件时触发的加工过程
await ioC.readData();        // 读取数据，供导入文件流程使用
await ioC.fixData();         // 修复数据，供导入文件流程使用
```



---

---

---

## 六、产品规格

### 页面主要板块

页面主体布局通过若干的 `div.page` 块来组织，每个 `div.page` 可称为一个“板块”。

板块的布局主要通过 bootstrap 提供的样式类实现。

主要的板块如下：

#### 1）数据导入板块（限离线版）

cssPath: `div.page#page-import`

用途：填写姓名、导入导出数据、查看标注进度

内容：

###### ① 用户姓名输入框

- 如果输入的姓名为“`admin`”，则语料样式需作特殊处理，参看语料标注板块相关说明。

###### ② 标注进度条

###### ③ 文件选择框

###### ④ 导入按钮

###### ⑤ 加载缓存数据按钮

- 仅当输入了用户名，且存在缓存数据时显示

###### ⑥ 导出按钮

- 仅当当前存在加载的数据时可用

#### 2）页面选择板块（限网络版）

cssPath: `div.page#page-nav`

- 提供「配置」「清单」「标注」三个按钮，将页面主体板块分别切换到「用户信息配置板块」「待标注列表板块」「语料标注板块」。



#### 3）用户信息配置板块（限网络版）

cssPath: `div.page#page-setup`

- 仅当页面选择板块选中「配置」时显示。
- 供用户填写「姓名」「序列号」「标注目标数量」。
- 🚧【**TODO**】提供「更新」按钮，向服务器请求再分配「标注目标数量 - 已分配给此用户的任务数量」的任务给该用户。



#### 4）进度总览板块（限网络版）

cssPath: `div.page#page-overview`

- 提供一个进度条显示「已标注数量」相对于「标注目标数量」的进度。
- 🚧【**TODO**】显示一些细节，如「已丢弃的数量」「已跳过的数量」「已标注的数量」等。



#### 5）待标注列表板块

cssPath: `div.page#page-list`

- 仅当页面选择板块选中「清单」时显示。
- 转到此页面时，通过 `alltask` 接口从服务器获取当前用户需要标注的所有任务编号。
- 🚧【**TODO**】



#### 6）语料标注板块（最核心的功能板块）

cssPath: `div.page#page-main-editor`

- 仅当页面选择板块选中「标注」时显示。
- 此模块功能后面专门讨论，这里先不展开。



#### 7）语料切换控件板块

cssPath: `div.position-fixed`

- 用于在所有要标注的语料之间切换，具体包括三个功能：「上一条」「下一条」和「前往第x条」
- 仅当页面选择板块选中「标注」时显示。
- 注：这不是 `div.page`
- TODO：目前没有设置 id，不太好，建议设为 `div#page-ctrl-wrap` 之类（很不重要）



---

---

---

**编辑历史**

- 孙春晖  2022-03-16

