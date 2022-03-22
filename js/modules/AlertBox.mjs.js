// modifiedAt: 2022-03-22

class AlertBox {
  constructor(reactive_alert_box_data) {
    // this.data.lastIdx = 1;
    // this.data.alerts = [];
    this.data = reactive_alert_box_data;
  }
  static new(reactive_alert_box_data) {
    return new AlertBox(reactive_alert_box_data);
  }
  pushAlert(ctt = "🐵", typ = "info", tot = 2000, other) {
    console.log(['pushAlert', ctt, typ, tot, other]);
    let idx = this.data.lastIdx + 1;
    this.data.alerts.push({
      'idx': idx,
      'type': typ,
      'content': ctt,
      'show': 1,
    });
    this.data.lastIdx += 1;
    // let that = self;
    setTimeout(() => {
      this.removeAlert(idx);
    }, tot);
    return idx;
  }
  removeAlert(idx) {
    this.data.alerts.find(alert => alert.idx == idx).show = 0;
  }
}

export default AlertBox;
