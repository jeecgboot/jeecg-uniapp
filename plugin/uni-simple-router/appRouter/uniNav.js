import { methods, baseConfig, Global } from '../helpers/config';
import { noop, formatURLQuery } from '../helpers/util';

let stop = null;

/**
 * @param {Object} finalRoute 格式化后的路由跳转规则
 * @param {Object} NAVTYPE 需要调用的跳转方法
 */
const uniPushTo = function (finalRoute, NAVTYPE) {
    return new Promise((resolve) => {
        const query = formatURLQuery(`?${finalRoute.uniRoute.query}`);
        const { APP } = baseConfig;
        const { url } = finalRoute.uniRoute;
        stop = setTimeout(() => {
            resolve(url);
            resolve = noop;	// 执行完了就没了 确保不会被下一次执行
            Global.LockStatus = false; // 跳转完成解锁状态
        }, APP.switchPageOutTime);

        uni[methods[NAVTYPE]]({
            url: url + query,
            ...finalRoute.route.animation,
            complete: () => {
                clearTimeout(stop);
                resolve(url);
                resolve = noop;	// 执行完了就没了 确保不会被下一次执行
                Global.LockStatus = false; // 跳转完成解锁状态
            },
        }, true); // 这里传递true 主要是兼容重写 uni.switchTab
    });
};

export default uniPushTo;
