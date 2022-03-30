
// import __Wrap_of_lodash__ from './modules_lib/lodash_4.17.21_.min.mjs.js';
// const lo = _;

const len = it => it.length;

class PriorityQueue extends Array {
  constructor() {
    super();
  }
}

class Task {
  constructor(core) {
    // this.core = core;
    this.id = core.id;                          //: str
    this.topic = core.topic;                      //: str
    this.entry = core.entry;                      //: str
    this.users_per_task = core.users_per_task;    //: int
    this.to = core.to ?? [];                      //: List[str] = field(default_factory=list)
    this.submitters = core.submitters ?? [];      //: List[str] = field(default_factory=list)
  }

  get rest() {
    return this.users_per_task - this.to.length;
  }

  __lt__(other) {
    if (this.rest == 0) {
      return false;
    }
    if (other.rest == 0) {
      return true;
    }
    if (this.rest < other.rest) {
      return true;
    }
    if (this.rest > other.rest) {
      return false;
    }
    return (+this.id) < (+other.id);
  }

  to_dict() {
    return {
      'id': this.id,
      'topic': this.topic,
      'entry': this.entry,
      'to': this.to,
      'submitters': this.submitters,
    };
  }

}

class TaskAssigner {
  constructor(core, lo) {
    this.entries = core.entries ?? [];                                        // : List[Dict] = field(default_factory=list)
    this.users = core.users ?? [];                                            // : List[Dict] = field(default_factory=list)
    this.tasks = core.tasks ?? [];                                            // : List[Dict] = field(default_factory=list)
    this.incomplete_tasks = core.incomplete_tasks ?? [];                      // : List[Dict] = field(default_factory=list)
    this.incomplete_tasks_num = core.incomplete_tasks_num ?? 0;               // : int = 0
    this.topic = core.topic ?? null;                                          // : str = None
    this.users_per_task = core.users_per_task ?? 2;                           // : int = 2
    this.tasks_per_user = core.tasks_per_user ?? 30;                          // : int = 30
    this.polygraphs_per_user = core.polygraphs_per_user ?? {};                // : Dict[str, int] = field(default_factory=dict)
    this.total_polygraphs_per_user = core.total_polygraphs_per_user ?? 0;     // : int = 0
    this.polygraphs = core.polygraphs ?? [];                                  // : List[Dict] = field(default_factory=list)
    this.lo = lo;  //: Lodash
  }

  static build(pack, lo) {
    let entries = pack.entries ?? [];
    let users = pack.users ?? [];
    let tasks = pack.tasks ?? [];
    let topic = pack.topic ?? null;
    let exclusion = pack.exclusion ?? [];
    let users_per_task = pack.users_per_task ?? 2;
    let tasks_per_user = pack.tasks_per_user ?? 30;
    let polygraphs_per_user = pack.polygraphs_per_user ?? {};

    tasks = TaskAssigner._get_tasks_by_topic(tasks, topic);
    let [incomplete_tasks, incomplete_tasks_num] = TaskAssigner._get_incomplete_tasks(tasks, users_per_task);
    let unassigned_entries = TaskAssigner._get_unassigned_entries(entries, tasks, exclusion);
    let [polygraphs, total_polygraphs_per_user] = TaskAssigner._get_polygraphs(entries, polygraphs_per_user);
    return new TaskAssigner({
      entries: unassigned_entries,
      users: users,
      tasks: tasks,
      incomplete_tasks: incomplete_tasks,
      incomplete_tasks_num: incomplete_tasks_num,
      topic: topic,
      users_per_task: users_per_task,
      tasks_per_user: tasks_per_user,
      polygraphs_per_user: polygraphs_per_user,
      total_polygraphs_per_user: total_polygraphs_per_user,
      polygraphs: polygraphs,
    }, lo);
  }

  static _get_tasks_by_topic(tasks, topic) {
    let tasks_with_certain_topic = [];
    for (let task of tasks) {
      if (task['topic'] == topic) {
        tasks_with_certain_topic.push(task);
      }
    }
    return tasks_with_certain_topic;
  }

  static _get_incomplete_tasks(tasks, users_per_task) {

    const _remove_incomplete_user = (task) => {
      if (task['submitters'].length != task['to'].length) {
        let stay = [];
        for (let user of task['submitters']) {
          if (task['to'].includes(user)) {
            stays.push(user);
          }
        }
        task['to'] = stays;
      }
    }

    let incomplete_tasks = [];
    let incomplete_tasks_num = 0;
    for (let task of tasks) {
      // if (task['to'].length == 0) {
      //   continue;
      // }
      _remove_incomplete_user(task);
      if (task['submitters'].length < users_per_task) {
        incomplete_tasks.push(task);
        incomplete_tasks_num += users_per_task - task['submitters'].length;
      }
    }

    return [incomplete_tasks, incomplete_tasks_num];
  }

  static _get_unassigned_entries(entries, tasks, exclusion) {
    let unassigned_entries = [];
    let assigned_entries = [...new Set(tasks.map(task => task['entry']))];
    for (let entry of entries) {
      // this entry is a polygraph
      if ('polygraph' in entry) {
        continue;
      }
      // this entry is exclusive
      if (exclusion.includes(entry?.['info']?.['rpId'])) {
        continue;
      }
      // this entry is assigned
      if (assigned_entries.includes(entry['id'])) {
        continue;
      }
      unassigned_entries.push(entry);
    }
    return unassigned_entries;
  }

  static _get_polygraphs(entries, polygraphs_per_user) {
    let polygraphs = {};
    let total_polygraphs_per_user = 0;
    for (let polygraph_type of Object.keys(polygraphs_per_user)) {
      polygraphs[polygraph_type] = []
      total_polygraphs_per_user += polygraphs_per_user[polygraph_type];
    }
    for (let entry of entries) {
      if ('polygraph' in entry) {
        polygraph_type = entry['polygraph'];
        if (!polygraphs.includes(entry['polygraph'])) {
          throw new Error(`!polygraphs.includes(entry['polygraph'])`);
        };
        polygraphs[polygraph_type].push(entry);
      }
    }
    for (let polygraph_type of Object.keys(polygraphs)) {
      if (len(polygraphs[polygraph_type]) == 0) {
        throw new Error(`len(polygraphs[polygraph_type]) == 0`);
      }
    }
    return [polygraphs, total_polygraphs_per_user];
  }

  assign() {
    let candidate_entries = this._get_candidate_entries()
    let [candidate_tasks, task_index] = this._create_candidate_tasks(candidate_entries)
    let tasks = this._assign_tasks(candidate_tasks)
    let polygraph_tasks = this._assign_polygraphs(task_index)
    let total_tasks = this._merge_tasks_and_polygraphs(tasks, polygraph_tasks)
    return total_tasks;
  }

  _get_candidate_entries() {
    let real_tasks_per_user = this.tasks_per_user - this.total_polygraphs_per_user;
    let total_tasks_num = real_tasks_per_user * len(this.users);
    let needed_tasks_num = Math.max(0, total_tasks_num - this.incomplete_tasks_num);
    let needed_entries_num = Math.ceil(needed_tasks_num / this.users_per_task);
    let candidate_entries;
    if (needed_entries_num > len(this.entries)) {
      this._update_tasks_per_user();
      candidate_entries = this.entries;
      return candidate_entries;
    }
    this.entries = this.lo.shuffle(this.entries);
    candidate_entries = this.entries.slice(0, needed_entries_num);
    return candidate_entries;
  }

  _update_tasks_per_user() {
    console.log('WARNING: number of unassigned entries are smaller than needed entries');
    let provided_tasks_num = len(this.entries) * this.users_per_task;
    let total_tasks_num = provided_tasks_num + this.incomplete_tasks_num;
    let real_tasks_per_user = Math.ceil(total_tasks_num / len(this.users));
    this.tasks_per_user = real_tasks_per_user + this.total_polygraphs_per_user;
  }

  _create_candidate_tasks(candidate_entries) {
    let task_ids = this.tasks.map(task => task['id']);
    let task_index = len(task_ids);
    const next_index = (idx) => {
      idx += 1;
      while (task_ids.includes(`${idx}`)) {
        idx += 1;
      }
      return idx;
    };

    let queue = new PriorityQueue();
    for (let task of this.incomplete_tasks) {
      queue.push(new Task({
        id: task['id'],
        topic: task['topic'],
        entry: task['entry'],
        users_per_task: this.users_per_task,
        to: task['to'],
        submitters: task['submitters'],
      }));
    }
    for (let entry of candidate_entries) {
      task_index = next_index(task_index);
      queue.push(new Task({
        id: `${task_index}`,
        topic: this.topic,
        entry: entry['id'],
        users_per_task: this.users_per_task,
        to: [],
        submitters: [],
      }));
    }
    return [queue, task_index];
  }

  _assign_tasks(candidate_tasks) {
    for (let ix=0; ix<this.tasks_per_user; ix++) {
      if (!this._assign_tasks_to_each_user(candidate_tasks)) {break;}
    }
    return this._queue_to_list(candidate_tasks);
  }

  _assign_tasks_to_each_user(candidate_tasks) {
    this.users = this.lo.shuffle(this.users);
    candidate_tasks = candidate_tasks.sort((b, a)=>(a.__lt__(b)));
    for (let user of this.users) {
      let user_id = user['id'];
      let task = candidate_tasks.shift();
      if (len(task.to) == this.users_per_task) {
        return false;
      }
      candidate_tasks.push(task);
      this._assign_task_to_user(user_id, candidate_tasks);
    }
    return true;
  }

  _assign_task_to_user(user, tasksQueue) {
    let temp_list = [];
    tasksQueue = tasksQueue.sort((b, a)=>(a.__lt__(b)));
    while (tasksQueue.length!=0) {
      let task = tasksQueue.shift();
      temp_list.push(task);
      if (len(task.to) == this.users_per_task) {break;}
      if (!task.to.includes(user)) {
        task.to.push(user);
        break;
      }
    }
    for (let task of temp_list) {
      tasksQueue.push(task);
    }
  }

  _queue_to_list(candidate_tasks) {
    return candidate_tasks.map(task => task.to_dict());
  }

  _assign_polygraphs(task_index) {
    let polygraph_tasks = this._create_polygraph_tasks(task_index);
    this._assign_polygraph_tasks_to_users(polygraph_tasks);
    return polygraph_tasks;
  }

  _create_polygraph_tasks(task_index) {
    let task_ids = this.tasks.map(task => task['id']);
    const next_index = (idx) => {
      idx += 1;
      while (task_ids.includes(`${idx}`)) {
        idx += 1;
      }
      return idx;
    };

    let polygraph_tasks = {};
    for (let polygraph_type of Object.keys(this.polygraphs)) {
      polygraph_tasks[polygraph_type] = [];
      let polygraphs = this.polygraphs[polygraph_type];
      for (let entry of polygraphs) {
        task_index = next_index(task_index);
        polygraph_tasks[polygraph_type].push({
          'id': `${task_index}`,
          'topic': this.topic,
          'entry': entry['id'],
          'to': [],
        })
      }
    }
    return polygraph_tasks;
  }

  _assign_polygraph_tasks_to_users(polygraph_tasks) {
    for (let user of this.users) {
      let user_id = user['id'];
      for (let polygraph_type of Object.keys(polygraph_tasks)) {
        let polygraphs = polygraph_tasks[polygraph_type];
        let polygraphs_num = this.polygraphs_per_user[polygraph_type];
        if (polygraphs_num > len(polygraphs)) {
          throw new Error(`polygraphs_num > len(polygraphs)`);
        }
        tasks = this.lo.sampleSize(polygraphs, polygraphs_num)
        for (let task of tasks) {
          if (task['to'].includes(user_id)) {
            throw new Error(`task['to'].includes(user_id)`);
            task['to'].push(user_id);
          }
        }
      }
    }
  }

  _merge_tasks_and_polygraphs(tasks, polygraphs, shuffle=true) {
    for (let polygraph_type of Object.keys(polygraphs)) {
      let polygraph_tasks = polygraphs[polygraph_type];
      for (let task of polygraph_tasks) {
        tasks.push(task);
      }
    }
    if (shuffle) {
      tasks = this.lo.shuffle(tasks);
    }
    return tasks;
  }

}

const assign_tasks = async (pack, lo) => {
  console.log(pack);
  let task_assigner = TaskAssigner.build(pack, lo);
  return task_assigner.assign();
}

export default assign_tasks;
