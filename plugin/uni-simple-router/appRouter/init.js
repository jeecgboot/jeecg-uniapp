import {
    proxyLaunchHook, beforeBackHooks, beforeTabHooks, backApiCallHook,
} from './hooks';
import { Global, uniAppHook } from '../helpers/config';
import { assertCanBack } from './util';
import { warn } from '../helpers/warn';

/**
 * 重写掉uni-app的 uni.getLocation 和 uni.chooseLocation APi
 * @param {Object} Router  当前路由对象
 */
export const rewriteUniFun = function (Router) {
    const oldSwitchTab = uni.switchTab; // 缓存 跳转到 tabBar 页面
    uni.switchTab = function ({ url, ...args }, normal = false) {
        if (normal === true || uniAppHook.pageReady === false) { // 调用原始的uni-app  api
            oldSwitchTab({
                url,
                ...args,
            });
        } else {
            if (uniAppHook.pageReady) { // 只有在路由守卫等  处理完所有操作后才能触发
                const { path } = Router.$Route; // 获取当前路径
                if (path == url) { // 路径相同不执行
                    return warn(`当前跳转路径：${url}  已在本页面无须跳转`);
                }
                beforeTabHooks.call(Router, url.substring(1)); // 不要 /
            } else {
                warn('路由守卫正在忙碌中 不允许执行 ‘uni.switchTab’');
            }
        }
    };
};

/**
 * 对当前app做一个动画页面 用来过渡首次next 等待时间过长的尴尬
 * @param {Object} Router 当前路由对象
 */
export const registerLoddingPage = function (Router) {
    const { loddingPageHook, loddingPageStyle } = Router.CONFIG.APP;	// 获取app所有配置
    const view = new plus.nativeObj.View('router-loadding', {
        top: '0px',
        left: '0px',
        height: '100%',
        width: '100%',
        ...loddingPageStyle.call(Router),
    });
    loddingPageHook.call(Router, view);	// 触发等待页面生命周期
};
/**
 * 移除当前 页面上 非router 声明的 onBackPress 事件
 * @param {Object} page 当前 vue 组件对象
 * @param {Object} options	当前page对象的 $options
 * 修复 https://github.com/SilurianYang/uni-simple-router/issues/106
 */
export const removeBackPressEvent = function (page, options) {
    const isBack = assertCanBack(page);
    if (isBack) {	// 可返回
        options.onBackPress = [options.onBackPress[0]];		// 路由混入的都干掉
    }
};
/**
 * 判断当前页面是否需要拦截返回
 *
 * @param {Object} page 当前 vue 组件对象
 * @param {Object} options 当前 vue 组件对象下的$options对象
 * @param {Array} args  当前页面是点击头部返回还是底部返回
 * 修复 https://github.com/SilurianYang/uni-simple-router/issues/66
 *
 * this 为当前 Router 对象
 */
export const pageIsHeadBack = function (page, options, args) {
    if (args[0].from == 'navigateBack') {		// 调用api返回
        if (Global.LockStatus) { // 正在跳转的时候 返回按键按的太快啦
            warn('当前页面正在处于跳转状态，请稍后再进行跳转....');
            return true;
        }
        Global.LockStatus = true; // 设置为锁住状态
        backApiCallHook.call(this, options, args);
        return true;
    }
    const isBack = assertCanBack(page);
    if (isBack) {	// 可返回
        if (Global.LockStatus) { // 正在跳转的时候 返回按键按的太快啦
            warn('当前页面正在处于跳转状态，请稍后再进行跳转....');
            return true;
        }
        Global.LockStatus = true; // 设置为锁住状态
        beforeBackHooks.call(this, options, args);
        return true;
    }
    return false;
};

/**
 * 开始初始化app端路由配置
 *
 * @param {Object} Router
 *
 * this 为当前 page 对象
 */
export const appInit = function (Router) {
    proxyLaunchHook.call(this);
    const { holdTabbar } = Router.CONFIG.APP;
    if (holdTabbar) { // 开启tab拦截时
        rewriteUniFun(Router);
    }
    registerLoddingPage(Router);
};
