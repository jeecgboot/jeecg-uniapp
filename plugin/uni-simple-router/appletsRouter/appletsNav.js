
import { methods, Global } from '../helpers/config';
import { formatURLQuery } from '../helpers/util';


/**
 * @param {Object} finalRoute 格式化后的路由跳转规则
 * @param {Object} NAVTYPE 需要调用的跳转方法
 */
const appletsUniPushTo = function (finalRoute, NAVTYPE) {
    return new Promise((resolve) => {
        const query = formatURLQuery(`?${finalRoute.uniRoute.query}`);
        const { url } = finalRoute.uniRoute;
        uni[methods[NAVTYPE]]({
            url: url + query,
            complete: () => {
                resolve(url);
                Global.LockStatus = false; // 跳转完成解锁状态
            },
        });
    });
};
export default appletsUniPushTo;
