import { isH5, formatConfig, appPlatform } from './helpers/util';
import navjump from './helpers/navJump';
import { H5GetPageRoute } from './vueRouter/util';
import { APPGetPageRoute } from './appRouter/util';
import { AppletsPageRoute } from './appletsRouter/util';
import { lifeCycle, Global } from './helpers/config';
import { warn, err } from './helpers/warn';
import { registerRouterHooks, registerHook } from './lifeCycle/hooks';
import { vueMount } from './vueRouter/base';
import appletsMount from './patch/applets-patch';
import appMount from './patch/app-patch';
import initMixins from './helpers/mixins';
import ParseQuery from './helpers/urlQuery';
// #ifdef H5
import H5 from './patch/h5-patch';
// #endif

let H5PATCH = null;
// #ifdef H5
H5PATCH = new H5(isH5());
// #endif

const parseQuery = new ParseQuery();

Global.H5RouterReady = new Promise((resolve) => Global.RouterReadyPromise = resolve);

class Router {
    constructor(arg) {
        Router.$root = this;
        Global.Router = this; // 全局缓存一个对象，不必使用时都传递
        Global.$parseQuery = parseQuery;
        this.CONFIG = formatConfig(arg);
        this.lifeCycle = lifeCycle;
        registerRouterHooks.call(this);	// 注册全局Router生命钩子
        if (appPlatform() === 'H5') {
            H5PATCH.setLoadingStatus(this.CONFIG.h5);
        }
    }

    get $Route() {
        return this.getPageRoute();
    }

    /**
     * 获取 url 参数帮助类实例
     */
    get $parseQuery() {
        return Global.$parseQuery;
    }

    /**
     * 获取当前是否处于正在跳转的状态
     * H5 状态下始终为false
     */
    get $lockStatus() {
        return Global.LockStatus;
    }

    /**
     * 动态设置拦截状态
     */
    set $lockStatus(status) {
        warn('你确定要这么做？你知道后果？', true);
        Global.LockStatus = status;
    }

    /** 动态的导航到一个新 URL 保留浏览历史
	 * navigateTo
	 * @param {Object} rule
	 */
    push(rule) {
        navjump.call(this, rule, 'push');
    }

    /** 动态的导航到一个新 URL 关闭当前页面，跳转到的某个页面。
	 * redirectTo
	 * @param {Object} rule
	 */
    replace(rule) {
        navjump.call(this, rule, 'replace');
    }

    /** 动态的导航到一个新 URL 关闭所有页面，打开到应用内的某个页面
	 * 	reLaunch
	 * @param {Object} rule
	 */
    replaceAll(rule) {
        navjump.call(this, rule, 'replaceAll');
    }

    /** 动态的导航到一个新 url 关闭所有页面，打开到应用内的某个tab
	 * @param {Object} rule
	 */
    pushTab(rule) {
        navjump.call(this, rule, 'pushTab');
    }

    /**
	 * 返回到指定层级页面上
     * @param {Number} backLayer 需要返回的页面层级 默认 1
     * @param {Object} delta 暂时无用
     * @param {enforce} 是否强制越过跳转加锁检查 默认 false
	 */
    back(backLayer = 1, delta, enforce = false) {
        if (backLayer.constructor != Number) {
            return err(
                `返回层级参数必须是一个Number类型且必须大于1：${backLayer}`,
            );
        }
        navjump.call(this, {
            backLayer, delta, H5PATCH,
        }, 'back', true, enforce);
    }

    /**
	 * 获取当前页面下的 Route 信息
	 *
	 * @param {Object} Vim 当前开发者可以传递一个 vue 组件对象 来获取当前下的 Route 信息
	 */
    getPageRoute(Vim) {
        const pages = getCurrentPages();
        switch (appPlatform(true)) {
        case 'H5':
            return H5GetPageRoute.call(this, pages, Vim);
        case 'APP':
            return APPGetPageRoute(pages, Vim);
        case 'APPLETS':
            return AppletsPageRoute(pages, Vim);
        default:
            break;
        }
    }

    beforeEach(fn) {
        return registerHook(this.lifeCycle.beforeHooks, fn);
    }

    afterEach(fn) {
        return registerHook(this.lifeCycle.afterHooks, fn);
    }
}

Router.install = function (Vue) {
    initMixins(Vue, Router);
    Object.defineProperty(Vue.prototype, '$Router', {
        get() {
            return Router.$root;
        },
    });
    Object.defineProperty(Vue.prototype, '$Route', {
        get() {
            return Router.$root.getPageRoute(this);
        },
    });
};
export default Router;
/**
 *
 * @param {VueComponent } Vim vue实例对象
 * @param {dom} el	dom节点选择器
 */
export const RouterMount = function (Vim, el) {
    switch (appPlatform(true)) {
    case 'APP':
        appMount(Vim, el);
        break;
    case 'APPLETS':
        appletsMount(Vim, el);
        break;
    case 'H5':
        vueMount.push({ Vim, el });
        break;
    default:
        warn('糟糕！！！还有其他的执行环境？？？没听说过啊。一脸懵逼？？？加QQ群问问：769241495');
        break;
    }
};
