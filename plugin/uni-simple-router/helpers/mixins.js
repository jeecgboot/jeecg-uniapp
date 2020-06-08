import { uniAppHook } from './config';
import H5init from '../vueRouter/init';
import { appInit, removeBackPressEvent, pageIsHeadBack } from '../appRouter/init';
import appletsInit from '../appletsRouter/init';
import { appPlatform } from './util';
import { proxyIndexHook } from '../appRouter/hooks';
import { appletsProxyIndexHook } from '../appletsRouter/hooks';

/**
 * 获取一些需要在各个平台混入的事件
 * @param {Object} Router 当前原始路由对象
 */
const getMixins = function (Router) {
    return {
        H5: {
            beforeCreate() {
                if (this.$options.router) {
                    H5init(Router.$root, this.$options.router, this);
                }
            },
        },
        APP: {
            onLaunch() {
                uniAppHook.onLaunched = true;	// 标志已经触发了 onLaunch 事件
                appInit.call(this, Router.$root);
            },
            onLoad() {
                // 第一个页面 拦截所有生命周期
                if (uniAppHook.onLaunched && !uniAppHook.pageReady) {
                    uniAppHook.onLaunched = false;
                    proxyIndexHook.call(this, Router.$root);
                }
                removeBackPressEvent(this.$mp.page, this.$options); // 移除页面的onBackPress事件
            },
            onBackPress(...args) {
                return pageIsHeadBack.call(Router.$root, this.$mp.page, this.$options, args);
            },
        },
        APPLETS: {
            onLaunch() {
                uniAppHook.onLaunched = true;	// 标志已经触发了 onLaunch 事件
                appletsInit.call(this, Router.$root);
            },
            onLoad() {
                if (uniAppHook.onLaunched && !uniAppHook.pageReady) {	// 必须是第一个页面
                    uniAppHook.onLaunched = false;
                    appletsProxyIndexHook.call(this, Router.$root);
                }
            },
        },
    };
};

const initMixins = function (Vue, Router) {
    Vue.mixin({
        ...getMixins(Router)[appPlatform(true)],
    });
};

export default initMixins;
