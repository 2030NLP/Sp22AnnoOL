// modifiedAt: 2022-03-23

class ModalBox {
  constructor(reactive_modal_box_data) {
    // this.data.show = false;
      // show: false,
      // theme: 'default',
      // kwargs: {},
    this.data = reactive_modal_box_data;
  }
  static new(reactive_modal_box_data) {
    return new ModalBox(reactive_modal_box_data);
  }
  show() {
    this.data.show = true;
    return this.data.show;
  }
  hide() {
    this.data.show = false;
    this.data.theme = 'default';
    this.data.kwargs = {};
    return this.data.show;
  }
  toggle() {
    if (this.data.show) {
      this.hide();
    } else {
      this.show();
    };
    return this.data.show;
  }
}

export default ModalBox;
