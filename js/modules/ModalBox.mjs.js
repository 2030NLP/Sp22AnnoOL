// modifiedAt: 2022-04-09

class ModalBox {
  constructor(reactive_modal_box_data) {
    // this.data.show = false;
      // show: false,
      // theme: 'default',
      // kwargs: {},
      // history: [],
    this.data = reactive_modal_box_data;
    this.data.show = this.data.show ?? false;
    this.data.theme = this.data.theme ?? "default";
    this.data.kwargs = this.data.kwargs ?? {};
    this.data.history = this.data.history ?? [];
  }
  static new(reactive_modal_box_data) {
    return new ModalBox(reactive_modal_box_data);
  }

  show() {
    this.data.show = true;
    return this.data.show;
  }

  load([theme, kwargs]) {
    this.data.theme = theme;
    this.data.kwargs = kwargs;
    this.show();
    return this.data.show;
  };

  open(theme, kwargs) {
    this.data.history.push([theme, kwargs]);
    this.load([theme, kwargs]);
    return this.data.show;
  };

  hide() {
    // console.log('hide', JSON.stringify(this.data));
    this.data.show = false;
    this.data.theme = 'default';
    this.data.kwargs = {};
    //
    this.data.history.pop();
    //
    let last = this?.data?.history?.at?.(-1);
    if (last!=null) {
      this.load(last);
    };
    return this.data.show;
  }
  hideTotal() {
    // console.log('hideTotal', JSON.stringify(this.data));
    this.data.show = false;
    this.data.theme = 'default';
    this.data.kwargs = {};
    this.data.history = [];
    return this.data.show;
  }
  // toggle() {
  //   if (this.data.show) {
  //     this.hide();
  //   } else {
  //     this.show();
  //   };
  //   return this.data.show;
  // }
  // toggleTotal() {
  //   if (this.data.show) {
  //     this.hideTotal();
  //   } else {
  //     this.show();
  //   };
  //   return this.data.show;
  // }
}

export default ModalBox;
