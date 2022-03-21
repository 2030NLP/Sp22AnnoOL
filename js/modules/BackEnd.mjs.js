// modifiedAt: 2022-03-15

import axios from '../modules_lib/axios_0.26.1_.mjs.js';

class BackEnd {
  constructor(token, baseURL, handleErrorFn=console.log) {
    // 初始化 后端 API
    const theApi = axios.create({
      baseURL,
      timeout: 30000,
      headers: {'Cache-Cotrol': 'no-cache'},
    });
    this.bridge = theApi;  // axios
    this.token = token;
    this.handleErrorFn = handleErrorFn;
    // this.setRequestHeader();
  }
  static new(token, baseURL, handleErrorFn) {
    return new BackEnd(token, baseURL, handleErrorFn);
  }

  // setRequestHeader () {
  //   // 添加请求拦截器
  //   this.bridge.interceptors.request.use((config) => {
  //     // 发送请求之前带上token
  //     config.headers = {
  //       'authorization': `Bearer ${this.token}`
  //     };
  //   })
  // }

  async request(config) {
    try {
      let response = await this.bridge.request({...config, headers: {
              'authorization': `Bearer ${this.token}`
            }});
      return response;
    } catch (error) {
      // console.log({config, error});
      // this.handleErrorFn(`请求「${config?.url}」出错：${error}`, 'danger');
      throw error;
    };
  }



  // 万能 api 开始
  async db(table, operator, kwargs, _$$$, timeout=30000) {
    let data = {
      table: `${table??''}`,
      opt: `${operator??''}`,
      args: kwargs ?? {},
      "$$$": `${_$$$??''}`,
    };
    let response = await this.request({
      method: "post",
      url: `/db`,
      data: data,
      timeout: timeout,
    });
    return response;
  }
  // 万能 api 结束

  // 几个最基本的 api 开始

  async getTopic() {
    // 获取当前任务主题
    let response = await this.request({
      method: "get",
      url: `/topic/`,
    });
    return response;
    // 应有输出：
    // response.data.topic:String // 当前任务主题
    // response.data.err === ''
  }

  async getUser() {
    // 获取 user 信息
    let response = await this.request({
      method: "get",
      url: `/user/`,
    });
    return response;
    // 应有输出：
    // response.data.user: {
    //   id,
    //   name,
    //   token,
    //   task: [task.id],        // 该用户有哪些 task
    //   annotated: [entry.id],  // 该用户已经标注过了哪些 entry  // 其实有点多余
    // }
    // response.data.topic  // TODO, 此处不应该有 TOPIC 信息
    // response.data.err === ''
  }

  async getWorkList() {
    // 获取 当前 user 的 任务清单
    let response = await this.request({
      method: "get",
      url: `/work-list/`
    });
    return response;
    // 应有输出：
    // response.data.work_list: [{
    //   id,
    // }]
    // response.data.err === ''
  }

  async getThing(user_id, task_id) {
    // 获取 task.id 对应的 task, entry, annotation
    // 输入：
    //   user_id
    //   task.id
    let response = await this.request({
      method: "get",
      url: `/thing/${user_id}/${task_id}`,
      // data: {
      //   'user_id': user_id,
      // },
    });
    return response;
    // 应有输出：
    // response.data.thing: {
    //   task,
    //   entry,
    //   annotation,
    // }
    // response.data.err === ''
  }

  async getTask(user_id, task_id) {
    // 获取 task 信息
    // 输入：
    //   user_id
    //   task.id
    let response = await this.request({
      method: "get",
      url: `/task/${user_id}/${task_id}`,
      // data: {
      //   'user_id': user_id,
      // },
    });
    return response;
    // 应有输出：
    // response.data.task: {
    //   id,
    //   topic,
    //   eId: entry.id,          // 该 task 所对应的 entry.id
    //   to: [user.id],          // 该 task 分配给了哪些 user
    //   submitters: [user.id],  // 哪些 user 已经提交了该 task 的 annotation
    // }
    // response.data.err === ''
  }

  async getAnno(user_id, task_id) {
    // 获取 annotation 信息
    // 输入：
    //   user_id
    //   task.id  // 该 annotation 所对应的 task
    let response = await this.request({
      method: "get",
      url: `/anno/${user_id}/${task_id}`,
      // data: {
      //   'user_id': user_id,
      //   'task_id': task_id,
      // },
    });
    return response;
    // 应有输出：
    // response.data.annotation: {
    //   id,
    //   eId,      // 该 annotation 所对应的 entry.id
    //   user,     // 该 annotation 所对应的 user.id
    //   task_id,  // 该 annotation 所对应的 task.id
    //   content,  // 该 annotation 的具体内容
    // }
    // response.data.err === ''
  }

  async updateAnno(user_id, task_id, anno_wrap, topic) {
    // 获取 annotation 信息
    // 输入：
    //   user_id
    //   task.id  // 该 annotation 所对应的 task
    //   anno_wrap  // 该 annotation 所包含的内容，具体为 annotations 和 _ctrl
    //
    // 获取任务主题
    // let topic = appData?.newThings?.topic;
    if (topic == null) {
      let resp = this.getTopic();
      if (resp?.data?.topic?.length) {
        topic = resp.data.topic;
      };
    };
    //
    let data = {
      'user': user_id,
      'task_id': task_id,
      'topic': topic,
      'content': anno_wrap,
    };
    if (anno_wrap.isDropping) {
      data.dropped = true;
      data.valid = false;
    } else {
      data.dropped = false;
      data.valid = true;
    };
    //
    // let dropped = false;
    // let skipped = false;
    // let valid = true;
    //
    let response = await this.request({
      method: "put",
      url: `/anno/${user_id}/${task_id}`,
      data: data,
    });
    return response;
    // 应有输出：
    // response.data.err === ''
  }

  async getEntry(entry_id) {
    // 获取 entry 信息
    // 输入：entry.id
    let response = await this.request({
      method: "get",
      url: `/entry/${entry_id}`,
    });
    return response;
    // 应有输出：
    // response.data.entry: {
    //   id,
    //   originId,      // 该 entry 的语料的原始句子的编号
    //   content: {},   // 该 entry 的具体内容
    //   results: {},   // 该 entry 在当前 topic 之前已经确定下来的标注内容
    // }
    // response.data.err === ''
  }

  // 几个最基本的 api 结束

  // 几个功能性的 api 开始

  async newTask(user_id, count, topic) {
    // this.handleErrorFn("newTask 开始");
    // 安排新任务
    // 输入：
    //   user_id
    //   count  // 新增加任务的数量
    //   topic  // 任务主题

    // 如果任务主题未知，则从服务器获取
    topic = `${topic}`
    if (!topic.length) {
      let resp = await this.getTopic();
      if (resp?.data?.topic?.length) {
        topic = resp.data.topic;
      };
    };
    //
    let response = await this.request({
      method: "post",
      url: `/new-task/`,
      data: {
        'user_id': user_id,
        'count': count,
        'topic': topic,
      },
    });
    // this.handleErrorFn("newTask 结束");
    return response;
    // 应有输出：
    // response.data.err === ''
  }





}

export default BackEnd;
