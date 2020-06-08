export const H5 = function (fn) {
    // #ifdef H5
    fn();
    // #endif
};
export const APP = function (fn) {
    // #ifdef APP-PLUS
    fn();
    // #endif
};
export const applets = function (fn) {
    // #ifdef MP
    fn();
    // #endif
};
export const notH5 = function (fn) {
    // #ifndef H5
    fn();
    // #endif
};
export const baiduApple = function (fn) {
    // #ifdef MP-BAIDU
    fn();
    // #endif
};
export const touTiao = function (fn) {
    // #ifdef MP-TOUTIAO
    fn();
    // #endif
};
export const mp = function (fn) {
    // #ifdef MP
    fn();
    // #endif
};
