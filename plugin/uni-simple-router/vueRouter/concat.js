import { warn, err } from '../helpers/warn';
import {
    diffRouter, vueDevRouteProxy, getRouterNextInfo, formatUserRule, nameToRute, encodeURLQuery, strPathToObjPath, getPages,
} from './util';
import { formatURLQuery } from '../helpers/util';
import { vuelifeHooks, vueMount } from './base';
import { lifeCycle, Global } from '../helpers/config';

let beforeEachCount = 0;
let afterEachCount = 0;
let resolveLaunch = null;
let beforeEnterDep = [];// 记录当前是否有重复的页面进入 避免重复触发
const beforeEachLaunch = new Promise((resolve) => resolveLaunch = resolve);

/**
 * 把vue实例进行挂载到dom下
 * @param {Router} Router uni-simple-router实例对象
 */
export const appMount = function () {
    if (vueMount.length == 0) {
        return err('检测到您未进行dom模型挂载操作，请调用api\r\n\r\n RouterMount(Vim: any, el: any): void');
    }
    const {
        Vim,
        el,
    } = vueMount[0];
    let formatEl = el;
    if (el == null) {
        formatEl = '#app'; // 这是uni-app在h5中的官方节点
    }
    try {
        Vim.$mount(formatEl);
    } catch (error) {
        warn(`挂载vue节点时错误啦${error}`);
    }
};

/**
 * 格式化 next传递过来的参数 作为vue-router可用的
 * @param {Object} to//即将跳转到的路由页面
 * @param {*} Intercept
 * @param {Funtion} next//路由连接管道
 * @param {Router} Router//路由对象
 */
export const forMatNext = function (to, Intercept, next, Router) {
    const { CONFIG, selfRoutes } = Router;
    if (CONFIG.h5.vueRouterDev) { // 完全使用vue-router开发的时候 vueRouterDev:true 不用做啥直接略过
        next(Intercept);
        return Intercept;
    }
    if (typeof Intercept === 'object') { // 只有是对象类型的时候 我们才进行格式化
        const navType = Reflect.get(Intercept, 'NAVTYPE');
        delete Intercept.NAVTYPE;
        if (navType == 'push') {
            Intercept.replace = false;
            Intercept.type = 'navigateTo';
        } else {
            Intercept.replace = true; // uni-app导航api所谓的NAVTYPE取值在h5都是replace:true
            Intercept.type = 'reLaunch';
        }
        const name = Reflect.get(Intercept, 'name'); // 统一格式化path
        Intercept.query = Intercept.params || Intercept.query;
        delete Intercept.name;
        delete Intercept.params;
        if (Intercept.query == null) {
            Intercept.query = {};
        }
        if (name != null) {
            const { aliasPath, path } = nameToRute(name, selfRoutes);
            Intercept.path = aliasPath || path;
        } else { // 当设置别名时可以是别名跳转也可以path跳转
            Intercept.path = Reflect.get(Intercept, 'path');
            const rute = formatUserRule(Intercept.path, selfRoutes, CONFIG);
            if (rute == null) {
                return false;
            }
            Intercept.path = rute;
        }
        if (CONFIG.encodeURI) { // 如果设置的编码传递则进行编码后传递
            const query = encodeURIComponent(JSON.stringify(Intercept.query));
            const formatQuery = formatURLQuery(query);
            Intercept.query = {};
            if (formatQuery != '') {
                Intercept.query.query = formatQuery;
            }
        }
    } else if (Intercept != null && Intercept.constructor === String) {
        Intercept = formatUserRule(Intercept, selfRoutes, CONFIG);
    }
    let objPath = Intercept;
    if (Intercept != null && Intercept.constructor !== Boolean) {
        objPath = strPathToObjPath(Intercept);
        if (objPath != null) {
            const type = Reflect.get(objPath, 'type');
            if (type == null) { // 当next()是一个路径时
                objPath.type = 'navigateTo';
            }
        }
    } else if (Intercept === false) {
        Router.lifeCycle.routerAfterHooks[0].call(Router, { H5Intercept: true });
    }
    next(objPath);// 统一格式化为对象的方式传递
    return Intercept;
};
/**
 *  v1.5.4+
 * beforeRouteLeave 生命周期
 * @param {Object} to       将要去的那个页面 vue-router to对象
 * @param {Object} from     从那个页面触发的 vue-router from对象
 * @param {Object} next      vue-router beforeEach next管道函数
 * @param {Object} Router   Router路由对象
 */
const beforeRouteLeaveHooks = function (to, from, next, Router) {
    return new Promise((resolve) => {
        const { currentRoute } = Router.$route;
        if (currentRoute.path == to.path) { // 如果是同一个页面直接返回  不执行页面中的Leave事件
            return resolve();
        }
        const page = getPages(); // 获取到当前的页面对象
        if (page == null || page._HHYANGbeforeRouteLeaveCalled) {
            warn('当前环境下无须执行 beforeRouteLeave。 原因：1.page等于null  2.真的的无须执行');
            return resolve();
        }
        const beforeRouteLeaveArray = page.$options.beforeRouteLeave; // 获取到页面下的 beforeRouteLeave 路由守卫
        if (beforeRouteLeaveArray == null) { // 当前页面没有预设 beforeRouteLeave 啥都不做
            return resolve();
        }
        const { toRoute, fromRoute } = getRouterNextInfo(to, from, Router);
        const beforeRouteLeave = beforeRouteLeaveArray[0]; // 不管怎么样 只执行第一个钩子  其他都不管
        beforeRouteLeave.call(page, toRoute, fromRoute, (Intercept) => { // 开始执行生命周期
            if (Intercept == null) { // 放行状态  直接返回
                return resolve();
            }
            page._HHYANGbeforeRouteLeaveCalled = true; // 标记一下当前已经做过 beforeRouteLeave 啦
            forMatNext(to, Intercept, next, Router); // 直接交给vue-router 处理
        });
    });
};

/**
 * 修复首页beforeEnter执行两次的问题 https://github.com/SilurianYang/uni-simple-router/issues/67
 *
 * beforeEnter 生命周期
 * @param {Object} to
 * @param {Object} from
 * @param {Object} next
 * @param {Object} userHooks
 * @param {Object} Router
 */
export const beforeEnterHooks = function (to, from, next, userHooks, Router) {
    return new Promise(async (resolve) => {
        // 修复 (#67)
        if (beforeEnterDep.includes(to.path)) {
            next();
            return resolve();
        }
        beforeEnterDep = [to.path];

        if (Reflect.get(Router, 'H5RouterReady')) {
            const res = await new Promise(async (resolveNext) => {
                const {
                    toRoute,
                    fromRoute,
                } = getRouterNextInfo(to, from, Router);
                await userHooks(toRoute, fromRoute, resolveNext);
            });
            forMatNext(to, res, next, Router);
        } else {
            next();
        }
        resolve();
    });
};
/**
 * vueAfter 生命周期
 * @param {Object} to
 * @param {Object} from
 * @param {Object} next
 * @param {Object} Router
 */
export const afterHooks = async function (to, from, next, Router) {
    vuelifeHooks.afterHooks[0](to, from);
    if (lifeCycle.afterHooks[0]) {
        if (afterEachCount === 0) {
            await beforeEachLaunch;
            appMount(Router);
        }
        const {
            toRoute,
            fromRoute,
        } = getRouterNextInfo(to, from, Router);
        lifeCycle.afterHooks[0](toRoute, fromRoute);
    } else if (afterEachCount === 0) {
        appMount(Router);
    }
    afterEachCount += 1;
    Router.lifeCycle.routerAfterHooks[0].call(Router);
};
/**
 * vueBefore 生命周期
 * @param {Object} to       将要去的那个页面 vue-router to对象
 * @param {Object} from     从那个页面触发的 vue-router from对象
 * @param {Object} next      vue-router beforeEach next管道函数
 * @param {Object} H5Config
 */
export const beforeHooks = function (to, from, next, Router) {
    return new Promise(async (resolve) => {
        await Router.lifeCycle.routerbeforeHooks[0].call(Router); // 触发Router内置前置生命周期
        await beforeRouteLeaveHooks(to, from, next, Router); // 执行1.5.4+ beforeRouteLeave生命钩子
        const H5 = Router.CONFIG.h5;
        vuelifeHooks.beforeHooks[0](to, from, async (Intercept) => {
            if (Intercept != null && H5.keepUniIntercept === true && H5.vueRouterDev === false) {
                next(Intercept);
                warn('uni-app 内部强制触发跳转拦截');
                beforeEachCount += 1;
                return resolve();
            }
            // 顺序问题 没有触发uni-app里面的方法 修复[#44](https://github.com/SilurianYang/uni-simple-router/issues/44)
            if (!lifeCycle.beforeHooks[0]) {
                next();
                beforeEachCount += 1;
                resolveLaunch();
                return resolve();
            }
            const res = await new Promise(async (resolveNext) => {
                const {
                    toRoute,
                    fromRoute,
                } = getRouterNextInfo(to, from, Router);
                await lifeCycle.beforeHooks[0](toRoute, fromRoute, resolveNext);
            });
            const beforeIntercept = forMatNext(to, res, next, Router);
            if (beforeEachCount == 0 && beforeIntercept == null && to.meta.isTabBar) { // 首次触发beforeEach，并且首页没有进行跳转的情况下才触发beforeEnter 主要是keep-alive
                const {
                    selfRoutes,
                } = Router;
                const beforeEnter = Reflect.get(selfRoutes[`/${to.meta.pagePath}`], 'beforeEnter');
                if (beforeEnter) {
                    await beforeEnterHooks(to, from, next, beforeEnter, Router);
                }
            }
            beforeEachCount += 1;
            resolveLaunch();
            resolve();
        });
    });
};
/**
 * 通过自动调用router api来完成触发生命周期
 * 修复 history 模式下报错的问题  https://github.com/SilurianYang/uni-simple-router/issues/38
 * 修复 history 模式下刷新页面参数丢失的问题 https://github.com/SilurianYang/uni-simple-router/issues/45
 * 修复 history 模式下首次打开页面url错误时不走 path:* 的匹配项  https://github.com/SilurianYang/uni-simple-router/issues/58
 *
 * @param {Object} Router //当前simple-router 对象
 * @param {Object} vueRouter vue-router对象
 */
export const triggerLifeCycle = function (Router, vueRouter) {
    const { CONFIG } = Router;
    const currRoute = vueRouter.currentRoute;
    if (vueRouter.mode === 'hash') {
        const {
            query,
            path,
        } = currRoute;

        const URLQuery = encodeURLQuery(CONFIG, query, 'hash');

        vueRouter.replace(`${path}${URLQuery}`);
    } else {
        const {
            toRoute,
        } = getRouterNextInfo(currRoute, currRoute, Router);
        const URLQuery = encodeURLQuery(CONFIG, currRoute.query, 'history');
        vueRouter.replace({
            path: toRoute.aliasPath || toRoute.path || currRoute.path,
            query: URLQuery,
            type: 'redirectTo',
        });
    }
};

/** 注册自定义的路由到vue-router中 前提是必须使用vueRouter开发模式
 * @param {Object} Router
 * @param {Object} vueRouter
 * @param {Boolean} vueRouterDev
 */
export const registerRouter = function (Router, vueRouter, vueRouterDev) {
    let routeMap = [];
    if (!vueRouterDev) { // 则进行对比两个路由表  主要工作是做路径的优化
        routeMap = diffRouter(Router, vueRouter, Router.CONFIG.h5.useUniConfig);
    } else { // 完全使用vue-router开发时直接采用开发者的路由表
        routeMap = vueDevRouteProxy(Router.CONFIG.routes, Router);
    }
    const createRouter = () => new vueRouter.constructor({
        base: vueRouter.options.base,
        mode: vueRouter.options.mode,
        routes: routeMap,
    });
    const router = createRouter();
    vueRouter.matcher = router.matcher;
    Global.vueRouter = vueRouter; // 把当前vueRouter缓存到全局对象中
    Global.RouterReadyPromise(); // router已经准备就绪 调用promise.resolve();
    Router.H5RouterReady = true; // 并挂载到Router对象下
    // 注册完成所有的钩子及相关参数，手动触发Router的生命周期
    setTimeout(() => {
        triggerLifeCycle(Router, vueRouter);
    });
};
