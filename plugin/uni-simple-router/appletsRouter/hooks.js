import { uniAppHook, Global } from '../helpers/config';
import {
    callAppHook, getPageVmOrMp, ruleToUniNavInfo, formatTo, formatFrom, getPages,
} from './util';
import appletsUniPushTo from './appletsNav';
import { noop } from '../helpers/util';
import { warn } from '../helpers/warn';

/**
 *
 * @param {String} key
 * @param {Function} hook 需要执行及还原的生命周期函数
 */
const toutiaoIndexHookCall = function (key, hook) {
    const { indexVue } = uniAppHook;
    const indeHooks = indexVue[key];
    indeHooks.splice(indeHooks.length - 1, 1, hook);
};

/**
 * 还原并执行所有 拦截下来的生命周期 app.vue 及 index 下的生命周期
 * @param {Boolean} callHome // 是否触发首页的生命周期
 *
 * this 为当前 page 对象
 */
const callwaitHooks = function (callHome) {
    return new Promise(async (resolve) => {
        const variation = [];	// 存储一下在uni-app上的变异生命钩子  奇葩的要死
        const {
            appVue, onLaunch, onShow, waitHooks, variationFuns, indexCallHooks,
        } = uniAppHook;
        const app = appVue.$options;
        await onLaunch.fun[onLaunch.fun.length - 1].call(appVue, onLaunch.args);	// 确保只执行最后一个 并且强化异步操作
        onShow.fun[onShow.fun.length - 1].call(appVue, onShow.args);	// onshow 不保证异步 直接确保执行最后一个
        if (callHome) {	// 触发首页生命周期
            // eslint-disable-next-line
            for (const key in waitHooks) {
                if (indexCallHooks.includes(key)) {	// 只有在被包含的情况下才执行
                    callAppHook.call(this, waitHooks[key].fun);
                }
            }
        }
        if (onLaunch.isHijack) {	// 还原 onLaunch生命钩子
            app.onLaunch.splice(app.onLaunch.length - 1, 1, onLaunch.fun[0]);
        }
        if (onShow.isHijack) {	// 继续还原 onShow
            app.onShow.splice(app.onShow.length - 1, 1, onShow.fun[0]);
        }
        // eslint-disable-next-line
        for (const key in waitHooks) {	// 还原 首页下的生命钩子
            const item = waitHooks[key];
            if (item.isHijack) {
                if (variationFuns.includes(key)) {	// 变异方法
                    variation.push({ key, fun: item.fun[0] });
                } else {
                    toutiaoIndexHookCall(key, item.fun[0]);
                }
            }
        }
        resolve(variation);
    });
};
/**
 * 还原剩下的奇葩生命钩子
 * @param {Object} variation 当前uni-app中的一些变异方法  奇葩生命钩子
 */
const callVariationHooks = function (variation) {
    for (let i = 0; i < variation.length; i += 1) {
        const { key, fun } = variation[i];
        toutiaoIndexHookCall(key, fun);
    }
};

/**
 * 主要是对app.vue下onLaunch和onShow生命周期进行劫持
 *
 * this 为当前 page 对象
 */
export const proxyLaunchHook = function () {
    const {
        onLaunch,
        onShow,
    } = this.$options;
    uniAppHook.appVue = this;		// 缓存 当前app.vue组件对象
    if (onLaunch.length > 1) {	// 确保有写 onLaunch 可能有其他混入 那也办法
        uniAppHook.onLaunch.isHijack = true;
        uniAppHook.onLaunch.fun = onLaunch.splice(onLaunch.length - 1, 1, (arg) => {
            uniAppHook.onLaunch.args = arg;
        });		// 替换uni-app自带的生命周期
    }
    if (onShow.length > 0) {
        uniAppHook.onShow.isHijack = true;
        uniAppHook.onShow.fun = onShow.splice(onShow.length - 1, 1, (arg) => {
            uniAppHook.onShow.args = arg;
            if (uniAppHook.pageReady) {		// 因为还有app切前台后台的操作
                callAppHook.call(this, uniAppHook.onShow.fun, arg);
            }
        });	// 替换替换 都替换
    }
};
/**
 * 触发全局beforeHooks 生命钩子
 * @param {Object} _from // from  参数
 * @param {Object} _to  // to 参数
 *
 * this 为当前 Router 对象
 */
const beforeHooks = function (_from, _to) {
    return new Promise(async (resolve) => {
        const beforeHooksFun = this.lifeCycle.beforeHooks[0];
        if (beforeHooksFun == null) {
            return resolve();
        }
        await beforeHooksFun.call(this, _to, _from, resolve);
    });
};
/**
 * 触发全局afterEachHooks 生命钩子
 * @param {Object} _from // from  参数
 * @param {Object} _to  // to 参数
 *
 * this 为当前 Router 对象
 */
const afterEachHooks = function (_from, _to) {
    const afterHooks = this.lifeCycle.afterHooks[0];
    if (afterHooks != null && afterHooks.constructor === Function) {
        afterHooks.call(this, _to, _from);
    }
};
/**
 * 触发全局 beforeEnter 生命钩子
 * @param {Object} finalRoute 	// 当前格式化后的路由参数
 * @param {Object} _from // from  参数
 * @param {Object} _to  // to 参数
 *
 * this 为当前 Router 对象
 */
const beforeEnterHooks = function (finalRoute, _from, _to) {
    return new Promise(async (resolve) => {
        const { beforeEnter } = finalRoute.route;
        if (beforeEnter == null || beforeEnter.constructor !== Function) {	// 当前这个beforeEnter不存在 或者类型错误
            return resolve();
        }
        await beforeEnter.call(this, _to, _from, resolve);
    });
};
/**
 *  v1.5.4+
 * beforeRouteLeave 生命周期
 * @param {Object} to       将要去的那个页面 to对象
 * @param {Object} from     从那个页面触发的 from对象
 *  @param {Boolean} leaveHook:? 是否为 beforeRouteLeave 触发的next 到别处 如果是则不再触发 beforeRouteLeave 生命钩子
 * this 为当前 Router 对象
 */
const beforeRouteLeaveHooks = function (from, to, leaveHook) {
    return new Promise(async (resolve) => {
        if (leaveHook) { // 我们知道这个是来自页面beforeRouteLeave next到其他地方，所有不必再执行啦
            warn('beforeRouteLeave next到其他地方，无须再执行！');
            return resolve();
        }
        if (from.path == to.path) { // 进入首页的时候不触发
            return resolve();
        }
        const currentPage = getPages(-2); // 获取到全部的页面对象
        const callThis = getPageVmOrMp(currentPage); // 获取到页面的 $vm 对象 及 page页面的this对象
        const { beforeRouteLeave } = callThis.$options; // 查看当前是否有开发者声明
        if (beforeRouteLeave == null) {
            warn('当前页面下无 beforeRouteLeave 钩子声明，无须执行！');
            return resolve();
        }
        if (beforeRouteLeave != null && beforeRouteLeave.constructor !== Function) {
            warn('beforeRouteLeave 生命钩子声明错误，必须是一个函数！');
            return resolve();
        }
        await beforeRouteLeave.call(callThis, to, from, resolve); // 执行生命钩子
    });
};

/**
 * 核心方法 处理一系列的跳转配置
 * @param {Object} rule 当前跳转规则
 * @param {Object} fnType 跳转页面的类型方法
 * @param {Object} navCB:? 回调函数
 * @param {Boolean} leaveHook:? 是否为 beforeRouteLeave 触发的next 到别处 如果是则不再触发 beforeRouteLeave 生命钩子
 * this 为当前 Router 对象
 *
 */
export const appletsTransitionTo = async function (rule, fnType, navCB, leaveHook = false) {
    await this.lifeCycle.routerbeforeHooks[0].call(this); // 触发内部跳转前的生命周期
    const finalRoute = ruleToUniNavInfo(rule, this.CONFIG.routes);		// 获得到最终的 route 对象
    const _from = formatFrom(this.CONFIG.routes);	// 先根据跳转类型获取 from 数据
    const _to = formatTo(finalRoute);	// 再根据跳转类型获取 to 数据
    try {
        const leaveResult = await beforeRouteLeaveHooks.call(this, _from, _to, leaveHook); // 执行页面中的 beforeRouteLeave 生命周期 v1.5.4+
        // eslint-disable-next-line
        await isNext.call(this, leaveResult, fnType, navCB,true);	// 验证当前是否继续  可能需要递归  那么 我们把参数传递过去

        const beforeResult = await beforeHooks.call(this, _from, _to);		// 执行 beforeEach 生命周期
        // eslint-disable-next-line
        await isNext.call(this, beforeResult, fnType, navCB);	// 验证当前是否继续  可能需要递归  那么 我们把参数传递过去

        const enterResult = await beforeEnterHooks.call(this, finalRoute, _from, _to);	// 接着执行 beforeEnter 生命周期
        // eslint-disable-next-line
        await isNext.call(this, enterResult, fnType, navCB);	// 再次验证  如果生命钩子多的话应该写成递归或者循环
    } catch (e) {
        warn(e); // 打印开发者操作的日志
        return false;
    }
    if (navCB) {
        navCB.call(this, finalRoute, fnType);	// 执行当前回调生命周期
    }
    afterEachHooks.call(this, _from, _to);
    await this.lifeCycle.routerAfterHooks[0].call(this); // 触发内部跳转前的生命周期
};

/**
 * 触发全局 返回事件
 * @param {Number} backLayer 需要返回的页面层级
 * @param {Function} next 正真的回调函数
 *
 * this 为当前 Router 对象
 */
export const backCallHook = function (backLayer, next) {
    const pages = getPages(); // 获取到全部的页面对象
    const toPage = pages.reverse()[backLayer];
    if (toPage == null) { // 没有匹配到的时候
        return warn('亲爱的开发者，你确定页面栈中有这么多历史记录给你返回？');
    }
    const { query, page } = getPageVmOrMp(toPage, false);
    const beforeFntype = 'RouterBack';
    appletsTransitionTo.call(this, { path: page.route, query }, beforeFntype, (finalRoute, fnType) => {
        const toPath = finalRoute.uniRoute.url;
        if (`/${page.route}` == toPath || page.route == toPath) { // 直接调用返回api
            next();
        } else { // 有拦截到其他页面时
            if (fnType == beforeFntype) {
                return warn('调用返回api被拦截到其他页面需要指定合理的 ‘NAVTYPE’ ');
            }
            appletsUniPushTo(finalRoute, fnType);
        }
    });
};

/**
 * 主动触发导航守卫
 * @param {Object} Router 当前路由对象
 *
 */
export const triggerLifeCycle = function (Router) {
    const topPage = getCurrentPages()[0];
    if (topPage == null) {
        return warn('打扰了,当前一个页面也没有 这不是官方的bug是什么??');
    }
    const { query, page } = getPageVmOrMp(topPage, false);
    appletsTransitionTo.call(Router, { path: page.route, query }, 'push', async (finalRoute, fnType) => {
        let variation = [];
        if (`/${page.route}` == finalRoute.route.path || page.route == finalRoute.route.path) {		// 在首页不动的情况下
            uniAppHook.pageReady = true;		// 标致着路由已经就绪 可能准备起飞
            await callwaitHooks.call(this, true);
        } else {	// 需要跳转
            variation = await callwaitHooks.call(this, false);	// 只触发app.vue中的生命周期
            await appletsUniPushTo(finalRoute, fnType);
        }
        uniAppHook.pageReady = true;		// 标致着路由已经就绪 可能准备起飞
        callVariationHooks(variation);
    });
};
/**
 * 把指定页面的生命钩子函数保存并替换
 * this 为当前 page 对象
 */
export const appletsProxyIndexHook = function (Router) {
    if (process.env.VUE_APP_PLATFORM == 'mp-toutiao') { // 头条小程序首页生命周期由我们手动触发，缓存this
        uniAppHook.toutiaoIndexThis = this;
    }
    const { needHooks, waitHooks } = uniAppHook;
    const options = this.$options;
    uniAppHook.indexVue = options;
    for (let i = 0; i < needHooks.length; i += 1) {
        const key = needHooks[i];
        if (options[key] != null) {	// 只劫持开发者声明的生命周期
            const { length } = options[key];
            // eslint-disable-next-line
            const whObject= waitHooks[key]={};
            whObject.fun = options[key].splice(length - 1, 1, noop);	// 把实际的页面生命钩子函数缓存起来,替换原有的生命钩子
            whObject.isHijack = true;
        }
    }
    triggerLifeCycle.call(this, Router);	// 接着 主动我们触发导航守卫
};
/**
 * 验证当前 next() 管道函数是否支持下一步
 *
 * @param {Object} Intercept 拦截到的新路由规则
 * @param {Object} fnType 跳转页面的类型方法 原始的
 * @param {Object} navCB 回调函数 原始的
 * @param {Boolean} leaveHookCall:? 是否为 beforeRouteLeave 触发的next 做拦截判断
 * this 为当前 Router 对象
 *
 */
const isNext = function (Intercept, fnType, navCB, leaveHookCall = false) {
    return new Promise((resolve, reject) => {
        if (Intercept == null) {		// 什么也不做 直接执行下一个钩子
            return resolve();
        }
        if (Intercept === false) {		// 路由中断 我们需要把防抖设置为false
            Global.LockStatus = false; // 解锁跳转状态
            return reject('路由终止');
        }
        if (Intercept.constructor === String) {		// 说明 开发者直接传的path 并且没有指定 NAVTYPE 那么采用原来的navType
            reject('next到其他页面');
            return appletsTransitionTo.call(this, Intercept, fnType, navCB, leaveHookCall);
        }
        if (Intercept.constructor === Object) {	// 有一系列的配置 包括页面切换动画什么的
            reject('next到其他页面');
            return appletsTransitionTo.call(this, Intercept, Intercept.NAVTYPE || fnType, navCB, leaveHookCall);
        }
    });
};
