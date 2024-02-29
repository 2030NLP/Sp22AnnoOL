// 基本信息 变量
export const APP_VERSION = "22-0721-1245";

// 开发环境 和 生产环境 的 控制变量
export const DEVELOPING = location?.hostname=="2030nlp.github.io" ? 0 : 1;
if (DEVELOPING) {
  console.log("DEVELOPING");
} else {
  console.log("PRODUCTION");
};
// export const API_BASE_DEV_LOCAL = "http://127.0.0.1:5000";
// const API_BASE_DEV_LOCAL = "http://127.0.0.1:5500";
const API_BASE_DEV_LOCAL = "http://127.0.0.1:8751";
// export const DEV_HOSTS = ["http://192.168.124.5:8888", "http://127.0.0.1:8888", "http://192.168.1.100:8888", "http://10.1.115.146:8888/", "http://10.0.55.176:8888/", "http://10.2.25.245:8888/"];
export const DEV_HOSTS = ["http://127.0.0.1:5000", "http://127.0.0.1:8888", "http://192.168.1.100:8888", "http://10.1.115.146:8888/", "http://10.0.55.176:8888/", "http://10.2.25.245:8888/"];

export const API_BASE_DEV = DEV_HOSTS[0];
export const API_BASE_PROD = "https://www.qinyuhang.cn";
export const API_BASE = DEVELOPING ? API_BASE_DEV : API_BASE_PROD;

// 10.1.115.146

