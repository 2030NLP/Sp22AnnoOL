// modifiedAt: 2022-03-15

// import axios from '../modules_lib/axios_0.26.1_.mjs.js';

class BackEnd {
  constructor(bridge, handleErrorFn=console.log) {
    this.bridge = bridge;  // axios
    this.handleErrorFn = handleErrorFn;
  }
  static new(bridge, handleErrorFn) {
    return new BackEnd(bridge, handleErrorFn);
  }

  // const theApi = axios.create({
  //   baseURL: `${API_BASE}/api/`,
  //   timeout: 30000,
  //   headers: {'Catch-Cotrol': 'no-cache'},
  // });

  async request(config) {
    try {
      let response = await this.bridge.request(config);
      return response;
    } catch (error) {
      // console.log({config, error});
      // this.handleErrorFn(`请求「${config?.url}」出错：${error}`, 'danger');
      throw error;
    };
  }



  // 万能 api 开始
  async db(table, operator, kwargs, _$$$) {
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

  async getUser(user_id, name, password) {
    // 获取 user 信息
    // 输入：id或姓名至少其一，外加序列号（密码）
    let data = {
      'password': password,
    };
    if (user_id?.length) {
      data.user_id = user_id;
    } else if (name?.length) {
      data.name = name;
    };
    let response = await this.request({
      method: "post",
      url: `/user/`,
      data: data,
    });
    return response;
    // 应有输出：
    // response.data.user: {
    //   id,
    //   name,
    //   password,
    //   task: [task.id],        // 该用户有哪些 task
    //   annotated: [entry.id],  // 该用户已经标注过了哪些 entry  // 其实有点多余
    // }
    // response.data.err === ''
  }

  async getWorkList(user_id, password) {
    // 获取 当前 user 的 任务清单
    let response = await this.request({
      method: "post",
      url: `/work-list/`,
      data: {
        'user_id': user_id,
        'password': password,
      },
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
      method: "post",
      url: `/thing/${task_id}`,
      data: {
        'user_id': user_id,
      },
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
      method: "post",
      url: `/task/${task_id}`,
      data: {
        'user_id': user_id,
      },
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
      method: "post",
      url: `/annotation/`,
      data: {
        'user_id': user_id,
        'task_id': task_id,
      },
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
    };
    //
    // let dropped = false;
    // let skipped = false;
    // let valid = true;
    //
    let response = await this.request({
      method: "post",
      url: `/update/`,
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
