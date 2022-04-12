import {  h  } from '../modules_lib/vue_3.2.31_.esm-browser.prod.min.js';

const TaskCard = {
  props: ["db", "task"],
  emits: ["open-modal"],
  setup(props, ctx) {
    const onOpenModal = () => {
      ctx.emit('open-modal', ['task-detail', props.task]);
    };
    return { onOpenModal };
  },
  render() {
    // console.log(this);
    if (!this.task) {
      return h('div', {
        'class': "d-inline-block"
      }, ["没有找到这个任务"]);
    };
    return h(
      'div', {
        'class': "d-inline-block"
      },
      [
        h('button', {
            'type': "button",
            'class': ["btn btn-sm my-1 me-2", this.task.deleted?'btn-danger':'btn-light'],
            'onClick': this.onOpenModal,
            'title': `task#${this.task?.id}`,
          },
          [`task#${this.task?.id}`],
        ),
        this.task.batchName ? h(
          'span', {
            'class': "badge bg-light text-dark text-wrap my-1 me-2",
          },
          [`批次：${this.task.batchName}`],
        ) : null,
        h('span', {
            'class': "badge bg-light text-dark text-wrap my-1 me-2",
          },
          [`提交：${this.task?.submitters?.length}/${this.task?.to?.length}`],
        ),
      ]
    );
  },
};

export default TaskCard;

