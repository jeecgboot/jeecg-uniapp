import { uniAppHook, Global } from '../helpers/config';
import {
    callAppHook, getPages, getPageVmOrMp, ruleToUniNavInfo, formatTo, formatFrom, APPGetPageRoute, getPageOnBeforeBack,
} from './util';
import { noop } from '../helpers/util';
import { warn } from '../helpers/warn';
import uniPushTo from './uniNav';

let startBack = false;	// 主要是兼容低端手机返回卡 然后多次返回直接提示退出的问题

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
            appVue, indexVue, onLaunch, onShow, waitHooks, variationFuns, indexCallHooks,
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
                    const indeHooks = indexVue[key];
                    // 修复 https://github.com/SilurianYang/uni-simple-router/issues/76
                    setTimeout(() => {	// 异步延迟还原 不然 uni-app 给给触发了
                        indeHooks.splice(indeHooks.length - 1, 1, item.fun[0]);
                    }, 50);
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
        const indeHooks = uniAppHook.indexVue[key];
        indeHooks.splice(indeHooks.length - 1, 1, fun);
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
 * 把指定页面的生命钩子函数保存并替换
 * this 为当前 page 对象
 */
export const proxyIndexHook = function (Router) {
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
    // eslint-disable-next-line
    triggerLifeCycle.call(this, Router);	// 接着 主动我们触发导航守卫
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
 * 触发返回事件公共方法
 * @param {Object} page	用getPages获取到的页面栈对象
 * @param {Object} options 	当前vue页面对象
 * @param {Object} backLayerC	需要返回页面的层级
   *
 * this 为当前 Router 对象
 */
const backCallHook = function (page, options, backLayerC = 1) {
    const route = APPGetPageRoute([page]);
    const NAVTYPE = 'RouterBack';
    // eslint-disable-next-line
    transitionTo.call(this, { path: route.path, query: route.query }, NAVTYPE, (finalRoute, fnType) => {
        if (fnType != NAVTYPE) { // 返回时的api如果有next到其他页面 那么必须带上NAVTYPE  不相同则表示需要跳转到其他页面
            return uniPushTo(finalRoute, fnType);
        }
        if (startBack) { // 如果当前处于正在返回的状态
            return warn('当前处于正在返回的状态，请稍后再试！');
        }
        startBack = true;	// 标记开始返回
        options.onBackPress = [noop];	// 改回uni-app可执行的状态
        setTimeout(() => {
            this.back(backLayerC, undefined, true); // 越过加锁验证
            startBack = false;	// 返回结束
        });
    });
};
/**
 * 处理返回按钮的生命钩子
 * @param {Object} options 当前 vue 组件对象下的$options对象
 * @param {Array} args  当前页面是点击头部返回还是底部返回
 *
 * this 为当前 Router 对象
 */
export const beforeBackHooks = async function (options, args) {
    const isNext = await getPageOnBeforeBack(args); // 执行onBeforeBack
    if (isNext === false) { // onBeforeBack  返回了true 阻止了跳转
        Global.LockStatus = false; // 也需要解锁
        return false;
    }
    const page = getPages(-3);	// 上一个页面对象
    backCallHook.call(this, page, options);
};
/**
 * 处理back api的生命钩子
 * @param {Object} options 当前 vue 组件对象下的$options对象
 * @param {Array} args  当前页面是点击头部返回还是底部返回
 *
 * this 为当前 Router 对象
 */
export const backApiCallHook = async function (options, args) {
    await getPageOnBeforeBack(args);
    const { backLayerC } = Global;
    const pages = getPages();
    let page = null;
    if (backLayerC > pages.length - 1 || backLayerC == pages.length - 1) {	// 返回的首页 我们需要显示tabbar拦截
        // eslint-disable-next-line
        page = pages[0];
    } else {
        page = pages[pages.length - 2];
    }
    backCallHook.call(this, page, options, backLayerC);
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
    return new Promise((resolve) => {
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
        beforeRouteLeave.call(callThis, to, from, resolve); // 执行生命钩子
    });
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
        if (Intercept === false) {		// 路由中断
            Global.LockStatus = false; // 解锁跳转状态
            return reject('路由终止');
        }
        if (Intercept.constructor === String) {		// 说明 开发者直接传的path 并且没有指定 NAVTYPE 那么采用原来的navType
            reject('next到其他页面');
            // eslint-disable-next-line
            return transitionTo.call(this, Intercept, fnType, navCB,leaveHookCall);
        }
        if (Intercept.constructor === Object) {	// 有一系列的配置 包括页面切换动画什么的
            reject('next到其他页面');
            // eslint-disable-next-line
            return transitionTo.call(this, Intercept, Intercept.NAVTYPE || fnType, navCB,leaveHookCall);
        }
    });
};
/**
 * 核心方法 处理一系列的跳转配置
 * @param {Object} rule 当前跳转规则
 * @param {Object} fnType 跳转页面的类型方法
 * @param {Object} navCB:? 回调函数
 * @param {Boolean} leaveHook:? 是否为 beforeRouteLeave 触发的next 到别处 如果是则不再触发 beforeRouteLeave 生命钩子
 *
 * this 为当前 Router 对象
 */
export const transitionTo = async function (rule, fnType, navCB, leaveHook = false) {
    await this.lifeCycle.routerbeforeHooks[0].call(this); // 触发内部跳转前的生命周期
    const finalRoute = ruleToUniNavInfo(rule, this.CONFIG.routes);		// 获得到最终的 route 对象
    const _from = formatFrom(this.CONFIG.routes);	// 先根据跳转类型获取 from 数据
    const _to = formatTo(finalRoute);	// 再根据跳转类型获取 to 数据
    try {
        const leaveResult = await beforeRouteLeaveHooks.call(this, _from, _to, leaveHook); // 执行页面中的 beforeRouteLeave 生命周期 v1.5.4+
        await isNext.call(this, leaveResult, fnType, navCB, true);	// 验证当前是否继续  可能需要递归  那么 我们把参数传递过去

        const beforeResult = await beforeHooks.call(this, _from, _to);		// 执行 beforeEach 生命周期
        await isNext.call(this, beforeResult, fnType, navCB);	// 验证当前是否继续  可能需要递归  那么 我们把参数传递过去

        const enterResult = await beforeEnterHooks.call(this, finalRoute, _from, _to);	// 接着执行 beforeEnter 生命周期
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
 * 主动触发导航守卫
 * @param {Object} Router 当前路由对象
 *
 * this  当前vue页面组件对象
 */
export const triggerLifeCycle = function (Router) {
    const topPage = getCurrentPages()[0];
    if (topPage == null) {
        return warn('打扰了,当前一个页面也没有 这不是官方的bug是什么??');
    }
    const { query, page } = getPageVmOrMp(topPage, false);
    transitionTo.call(Router, { path: page.route, query }, 'push', async (finalRoute, fnType) => {
        let variation = [];
        if (`/${page.route}` == finalRoute.route.path) {		// 在首页不动的情况下
            uniAppHook.pageReady = true;		// 标致着路由已经就绪 可能准备起飞
            await callwaitHooks.call(this, true);
        } else {	// 需要跳转
            variation = await callwaitHooks.call(this, false);	// 只触发app.vue中的生命周期
            await uniPushTo(finalRoute, fnType);
        }
        plus.nativeObj.View.getViewById('router-loadding').close();
        callVariationHooks(variation);
        uniAppHook.pageReady = true;		// 标致着路由已经就绪 可能准备起飞
    });
};

/**
 * 处理tabbar点击拦截事件
 * @param {Object} path 当前需要跳转的tab页面路径
 *
 * this 为当前 Router 对象
 */
export const beforeTabHooks = function (path) {
    transitionTo.call(this, { path: `/${path}`, query: {} }, 'pushTab', (finalRoute, fnType) => {
        uniPushTo(finalRoute, fnType);
    });
};
