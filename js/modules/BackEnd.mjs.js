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
      let response = await this.bridge.request({
        ...config,
        headers: {
          'authorization': `Bearer ${this.token}`,
        },
      });
      if (response?.data?.code!=200) {
        console.log("request error", response);
        throw new Error(`request error(${response?.data?.code}): ${response?.data?.msg}`);
      };
      return response;
    } catch (error) {
      // console.log({config, error});
      // this.handleErrorFn(`请求「${config?.url}」出错：${error}`, 'danger');
      throw error;
    };
  }



  // 万能 api 开始
  async db(table, operator, kwargs, timeout=60000) {
    let data = {
      table: `${table??''}`,
      opt: `${operator??''}`,
      args: kwargs ?? {},
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

  async getMe() {
    // 获取 user 信息
    let response = await this.request({
      method: "get",
      url: `/me`,
    });
    return response;
    // 应有输出：
    // response.data.user: {
    //   id,
    //   name,
    //   token,
    //   currTask,               // 该用户当前参与的任务类型
    //   task: [task.id],        // 该用户有哪些 task
    //   annotated: [entry.id],  // 该用户已经标注过了哪些 entry  // 其实有点多余
    // }
    // response.data.topic  // TODO, 此处不应该有 TOPIC 信息
    // response.data.err === ''
  }

  async makeAssigmentPlan(wrap) {
    let response = await this.request({
      method: "post",
      url: `/assigment-plan`,
      data: {
        'topic': wrap?.['topic']??null,
        'user_tag': wrap?.['user_tag']??null,
        'task_tag': wrap?.['task_tag']??null,
        'users_per_task': wrap?.['users_per_task']??null,
        'tasks_per_user': wrap?.['tasks_per_user']??null,
        'exclusion': wrap?.['exclusion']??null,
        'polygraphs_per_user': wrap?.['polygraphs_per_user']??null,
      },
    });
    return response;
  }
  async actAssigmentPlan(plans) {
    let response = await this.request({
      method: "post",
      url: `/assigment-act`,
      data: {
        'plans': plans,
      },
    });
    return response;
  }

  async getUsersAll() {
    let response = await this.request({
      method: "get",
      url: `/users`,
    });
    return response;
  }

  async postUser(user) {
    let response = await this.request({
      method: "post",
      url: `/users`,
      data: user,
    });
    return response;
  }

  async updateUser(user) {
    let response = await this.request({
      method: "put",
      url: `/users/${user.id}`,
      data: {
        item: user,
      },  // TODO 后端接口调整
    });
    return response;
  }

  async getWorkList() {
    // 获取 当前 user 的 任务清单
    let response = await this.request({
      method: "get",
      url: `/work-list-for-me`
    });
    return response;
    // 应有输出：
    // response.data.work_list: [{
    //   id,
    // }]
    // response.data.err === ''
  }

  async getCheckDB() {
    let response = await this.request({
      method: "get",
      url: `/check-list-for-me`
    });
    return response;
  }

  async getThing(user_id, task_id) {
    // 获取 task.id 对应的 task, entry, anno
    // 输入：
    //   user_id
    //   task.id
    let response = await this.request({
      method: "get",
      url: `/things/${user_id}/${task_id}`,
      // data: {
      //   'user_id': user_id,
      // },
    });
    return response;
    // 应有输出：
    // response.data.data: {
    //   task,
    //   entry,
    //   anno,
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
      url: `/tasks/${user_id}/${task_id}`,
      // data: {
      //   'user_id': user_id,
      // },
    });
    return response;
    // 应有输出：
    // response.data.data: {
    //   id,
    //   topic,
    //   eId: entry.id,          // 该 task 所对应的 entry.id
    //   to: [user.id],          // 该 task 分配给了哪些 user
    //   submitters: [user.id],  // 哪些 user 已经提交了该 task 的 anno
    // }
    // response.data.err === ''
  }

  async getEntry(entry_id) {
    let response = await this.request({
      method: "get",
      url: `/entries/${entry_id}`,
    });
    return response;
  }

  async getTasksMatters() {
    let response = await this.request({
      method: "get",
      url: `/tasks-matter`,
    });
    return response;
  }

  async getTasksAll() {
    let response = await this.request({
      method: "get",
      url: `/tasks`,
    });
    return response;
  }

  async getEntryInfoAll(timeout=600000) {
    let response = await this.request({
      method: "get",
      url: `/entry-infos`,
      timeout: timeout,
    });
    return response;
  }

  async getAnno(user_id, task_id) {
    // 获取 anno 信息
    // 输入：
    //   user_id
    //   task.id  // 该 anno 所对应的 task
    let response = await this.request({
      method: "get",
      url: `/annos/${user_id}/${task_id}`,
      // data: {
      //   'user_id': user_id,
      //   'task_id': task_id,
      // },
    });
    return response;
    // 应有输出：
    // response.data.data: {
    //   id,
    //   entry,    // 该 anno 所对应的 entry.id
    //   user,     // 该 anno 所对应的 user.id
    //   task,     // 该 anno 所对应的 task.id
    //   content,  // 该 anno 的具体内容
    // }
    // response.data.err === ''
  }

  async getAnnosAll(timeout=600000) {
    let response = await this.request({
      method: "get",
      url: `/annos`,
      timeout: timeout,
    });
    return response;
  }

  async updateAnno(user_id, task_id, entry_id, anno_wrap, topic, entryVer) {
    // 获取 anno 信息
    // 输入：
    //   user_id
    //   task.id  // 该 anno 所对应的 task
    //   anno_wrap  // 该 anno 所包含的内容，具体为 annotations 和 _ctrl
    //
    // 获取任务主题
    // let topic = appData?.newThings?.topic;
    if (topic == null) {
      let resp = this.getMe();
      if (resp?.data?.data?.currTask?.length) {
        topic = resp?.data?.data?.currTask;
      };
    };
    //
    let data = {
      'user': user_id,
      'task': task_id,
      'entry': entry_id,
      'entryVer': entryVer,
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
      url: `/annos/${user_id}/${task_id}`,
      data: data,
    });
    return response;
    // 应有输出：
    // response.data.err === ''
  }

  async getMemosAll() {
    let response = await this.request({
      method: "get",
      url: `/memos`,
    });
    return response;
  }

  async postMemo(memo) {
    let response = await this.request({
      method: "post",
      url: `/memos`,
      data: memo,
    });
    return response;
  }

  async getMemo(memo_id) {
    let response = await this.request({
      method: "get",
      url: `/memos/${memo_id}`,
    });
    return response;
  }

  async updateMemo(memo) {
    let response = await this.request({
      method: "put",
      url: `/memos/${memo.id}`,
      data: memo,
    });
    return response;
  }

  async getVar(key) {
    let response = await this.request({
      method: "get",
      url: `/var/${key}`,
    });
    return response;
  }

  async setVar(key, value) {
    let response = await this.request({
      method: "put",
      url: `/var/${key}`,
      data: {
        value: value,
      },
    });
    return response;
  }

  async getEntry(entry_id) {
    // 获取 entry 信息
    // 输入：entry.id
    let response = await this.request({
      method: "get",
      url: `/entries/${entry_id}`,
    });
    return response;
    // 应有输出：
    // response.data.data: {
    //   id,
    //   originId,      // 该 entry 的语料的原始句子的编号
    //   content: {},   // 该 entry 的具体内容
    //   results: {},   // 该 entry 在当前 topic 之前已经确定下来的标注内容
    // }
    // response.data.err === ''
  }

  async postBuildTasks(settings) {
    let response = await this.request({
      method: "post",
      url: `/build-tasks`,
      data: {
        settings: settings,
      },
    });
    return response;
  }

  async postBackup(settings, timeout=1000*60*5) {
    let response = await this.request({
      method: "post",
      url: `/backup`,
      data: {
        settings: settings,
      },
      timeout: timeout,
    });
    return response;
  }

}

export default BackEnd;





  // 几个最基本的 api 结束

  // 几个功能性的 api 开始

  // async newTask(user_id, count, topic) {
  //   // this.handleErrorFn("newTask 开始");
  //   // 安排新任务
  //   // 输入：
  //   //   user_id
  //   //   count  // 新增加任务的数量
  //   //   topic  // 任务主题

  //   // 如果任务主题未知，则从服务器获取
  //   topic = `${topic}`
  //   if (!topic.length) {
  //     let resp = await this.getTopic();
  //     if (resp?.data?.topic?.length) {
  //       topic = resp.data.topic;
  //     };
  //   };
  //   //
  //   let response = await this.request({
  //     method: "post",
  //     url: `/new-task/`,
  //     data: {
  //       'user_id': user_id,
  //       'count': count,
  //       'topic': topic,
  //     },
  //   });
  //   // this.handleErrorFn("newTask 结束");
  //   return response;
  //   // 应有输出：
  //   // response.data.err === ''
  // }

  // async getTopic() {
  //   // 获取当前任务主题
  //   let response = await this.request({
  //     method: "get",
  //     url: `/topic/`,
  //   });
  //   return response;
  //   // 应有输出：
  //   // response.data.topic:String // 当前任务主题
  //   // response.data.err === ''
  // }


