// modifiedAt: 2022-03-23

class ModalBox {
  constructor(reactive_modal_box_data) {
    // this.data.show = false;
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
    return this.data.show;
  }
  toggle() {
    this.data.show = !this.data.show;
    return this.data.show;
  }
}

export default ModalBox;
