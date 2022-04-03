
const ll0 = ['t0', '第0期', '清洗', '0', 'clean', 'check'];
const ll1 = ['t1', '第1期', '正确性', '1'];
const ll2 = ['t2', '第2期', '同义性', '2'];
const ll3 = ['t3', '第3期', '归因', '3', 'reason'];
const ll4 = ['t4', '第4期', '精标', '4', 'detail'];

// 处理 topic 历史遗留混乱 用于 Task task.topic
const topic_regulation = (topic) => {
  if (ll0.includes(topic)) {
    return '清洗';
  };
  if (ll1.includes(topic)) {
    return '第1期';
  };
  if (ll2.includes(topic)) {
    return '第2期';
  };
  if (ll3.includes(topic)) {
    return '归因';
  };
  if (ll4.includes(topic)) {
    return '精标';
  };
  return null;
};


// 时间标记
// 用来记录批次信息，用于排序
const timeMark = () => {
  let the_date = new Date();
  let str = `1${(''+the_date.getFullYear()).slice(2,4)}${(''+(the_date.getMonth()+1)).length==1?'0':''}${the_date.getMonth()+1}${(''+the_date.getDate()).length==1?'0':''}${the_date.getDate()}${(''+the_date.getHours()).length==1?'0':''}${the_date.getHours()}${(''+the_date.getMinutes()).length==1?'0':''}${the_date.getMinutes()}${(''+the_date.getSeconds()).length==1?'0':''}${the_date.getSeconds()}`;
  // 开头的 1 是用来防止首位为 0 的
  return +str;  // 加号转数字
};





const assign_tasks = async (pack, lo) => {
  console.log(pack);
  let entries = pack.entries ?? [];
  let users = pack.users ?? [];
  let tasks = pack.tasks ?? [];
  let topic = pack.topic ?? null;
  let exclusion = pack.exclusion ?? [];
  let users_per_task = pack.users_per_task ?? 2;
  let tasks_per_user = pack.tasks_per_user ?? 30;
  let polygraphs_per_user_setting = pack.polygraphs_per_user ?? {};
  let tasks_idx_base = pack.tasks_idx_base ?? pack.tasks.length;
  let retrieve = pack.retrieve ?? false;

  const new_task_id = () => {
    let idx = +tasks_idx_base;
    while (lo.find(tasks, {'id': `${idx}`})) {
      idx++;
    };
    return `${idx}`;
  };

  // 要求：
  // 每人分配 tasks_per_user 条任务
  // 　其中 polygraphs_per_user_setting 中指定了各类 测谎题 条数
  // 每个任务被分配给 users_per_task 人
  //
  // 优先对于有提交的 task 进行再分配

  console.log(0);


  // 基本条件达不到，就不玩了
  if (topic==null) {return [];};
  topic = topic_regulation(topic);
  // 用户只有 id 有用，其他没用，不过得先筛选一下
  let user_ids = users.filter(user => topic_regulation(user.currTask)==topic).map(user=>user.id);
  if (user_ids.length==0||(entries.length==0&&tasks.length==0)) {return [];};

  // 记录哪些任务发生了变化
  let modified_task_ids = [];

  // 测谎题 题库 字典
  let polygraph_entries_dict = {};
  // 真正的待标注语料
  let real_entries = [];

  let polygraph_entry_ids = [];
  let real_entry_ids = [];

  for (let entry of entries) {
    if ('polygraph' in entry) {
      if (!(entry.polygraph in polygraph_entries_dict)) {
        polygraph_entries_dict[entry.polygraph] = [];
      };
      polygraph_entries_dict[entry.polygraph].push(entry);
      polygraph_entry_ids.push(entry.id);
    } else {
      real_entries.push(entry);
      real_entry_ids.push(entry.id);
    };
  };

  console.log(1);


  // 检查 tasks 情况，多不动，少补
  // 真任务
  for (let e_id of real_entry_ids) {
    let target = lo.find(tasks, it=>it.entry==e_id&&topic_regulation(it.topic)==topic);
    if (!target) {
      let it = {
        'id': new_task_id(),
        'topic': topic,
        'entry': e_id,
        'to': [],
        'submitters': [],
      }
      tasks.push(it);
      modified_task_ids.push(it.id);
    };
  };
  // 测谎任务
  for (let entry of Object.values(polygraph_entries_dict).flat()) {
    let target = lo.find(tasks, it=>it.entry==entry.id&&topic_regulation(it.topic)==topic);
    if (!target || !target.polygraph?.length) {
      let it = {
        'id': target?.id ?? new_task_id(),
        'topic': topic,
        'entry': entry.id,
        'to': target?.to ?? [],
        'submitters': target?.submitters ?? [],
        'polygraph': entry.polygraph,
      }
      tasks.push(it);
      modified_task_ids.push(it.id);
    };
  };

  console.log(2);

  // 真正的待标注任务
  let real_tasks = tasks.filter(it => real_entry_ids.includes(it.entry));
  console.log('real_tasks.length', real_tasks.length)

  // 构建测谎任务字典
  // let polygraph_entries_dict = {};
  let polygraph_tasks_dict = {};
  for (let [pg_type, pg_type_entries] of Object.entries(polygraph_entries_dict)) {
    polygraph_tasks_dict[pg_type] = [];
    for (let entry of pg_type_entries) {
      let target = lo.find(tasks, it=>it.entry==entry.id&&topic_regulation(it.topic)==topic);
      polygraph_tasks_dict[pg_type].push(target);
    };
  };

  console.log(3);


  // 所有测谎题的数量，以及有效的测谎题各类数量配置
  let total_polygraphs_num_per_user = 0;
  for (let [pg_type, pg_num] of Object.entries(polygraphs_per_user_setting)) {
    if (!(pg_type in polygraph_entries_dict)) {
      polygraph_entries_dict[pg_type] = [];
    };
    if (polygraph_entries_dict[pg_type].length < pg_num) {
      polygraphs_per_user_setting[pg_type] = polygraph_entries_dict[pg_type].length;
    };
    total_polygraphs_num_per_user += polygraphs_per_user_setting[pg_type];
  };

  // 要分配给每个用户的真正的待标注语料的数量
  let real_tasks_per_user = Math.max(tasks_per_user - total_polygraphs_num_per_user, 0);
  console.log('real_tasks_per_user', real_tasks_per_user);
  console.log(4);


  // 正式开始

  for (let task of tasks) {

    if (!('submitters' in task)) {
      task.submitters = [];  // 避免 includes 出错
    };

    // 根据 retrieve 参数
    // true  : 如果已分配的用户不在用户字典中，且未提交，则不再安排给他，即从他手里“收回”此任务
    // false : 如果已分配的用户不在用户字典中，且未提交，也不要从他手里“收回”此任务，换句话说就是不需要做什么处理
    if (retrieve) {
      let new_to = [];
      for (let u_id of task.to) {
        // 但凡不是提交者，就不再保留
        if (!task.submitters.includes(u_id)) {continue;};
        new_to.push(u_id);
      };
      if (new_to.length != task.to.length) {
        task.to = new_to;
        modified_task_ids.push(task.id);
      };
    };

  };

  console.log(5);

  // 对真任务进行取样
  // sampleSize 方法的特点：1、随机且乱序；2、数量不足时全部进入。
  // let taskSamples = lo.sampleSize(real_tasks, real_tasks_per_user * user_ids.length);

  // 待分配任务的用户队列
  // 将 user_ids 重复 real_tasks_per_user 次，并降维，打乱
  // let uq = lo.shuffle(lo.times(real_tasks_per_user, ()=>user_ids).flat());
  // 将 user_ids 重复 real_tasks_per_user 次，并降维，不用打乱，因为任务对应的语料是乱的
  let uq = (lo.times(real_tasks_per_user, ()=>user_ids).flat());
  console.log('uq', uq.length, uq.length/user_ids.length, uq);

  console.log(6);


  // 给一个用户分配1个任务的函数
  const give_task = (u_id, samples) => {
    let task;

    // 优先找到已经有人标注，但是还没标满，并且此用户之前没参与的任务
    task = lo.find(samples, tt => (tt.to.length>0 && tt.to.length<users_per_task && !tt.to.includes(u_id)));
    if (task) {
      task.to.push(u_id);
      modified_task_ids.push(task.id);
      return task;
    };

    // 其次寻找完全没被分配过的任务
    task = lo.find(samples, tt => tt.to.length==0);
    if (task) {
      task.to.push(u_id);
      modified_task_ids.push(task.id);
      return task;
    }

    return null;
  };

  let pp = 0;
  // 遍历用户队列，执行分配
  for (let u_id of uq) {
    let xx = give_task(u_id, real_tasks);
    if (xx==null) {
      pp++;
    };
  };

  console.log('pp', pp);
  console.log(7);


  // 接下来分配测谎题
  // 因为这些题目的 id 本来就是散乱地存在于 Entry 表中的，所以不必纠结排序。
  // 每个 polygraph 都可以重复安排，只要不重复分给同一个用户即可。

  for (let [pg_type, pg_num] of Object.entries(polygraphs_per_user_setting)) {

    for (let u_id of user_ids) {
      // 给这个用户分配的这类的测谎题
      // 如果他做过了，就不要再分配这道题了
      let range = polygraph_tasks_dict[pg_type].filter(it => !it.submitters.includes(u_id));
      let polygraphSamples = lo.sampleSize(range, pg_num);
      for (let task of polygraphSamples) {
        if (task.to.includes(u_id)) {continue;};
        task.to.push(u_id);
        modified_task_ids.push(task.id);
      };
    };
  };

  console.log(8);

  // 给被修改的任务去重
  modified_task_ids = Array.from(new Set(modified_task_ids));
  let output_tasks = tasks.filter(it=>modified_task_ids.includes(it.id));
  let batch = timeMark();
  output_tasks.forEach(it=>{it.batch=batch});
  // 最终输出需要更新的 tasks
  return output_tasks;
};

export default assign_tasks;


