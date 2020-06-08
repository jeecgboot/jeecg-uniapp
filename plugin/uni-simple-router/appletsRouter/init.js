import { proxyLaunchHook } from './hooks';

/**
 * 开始初始化app端路由配置
 *
 * @param {Object} Router 	当前Router对象
 *
 * this 为当前 page 对象
 */
const appletsInit = function () {
    proxyLaunchHook.call(this);
};
export default appletsInit;
