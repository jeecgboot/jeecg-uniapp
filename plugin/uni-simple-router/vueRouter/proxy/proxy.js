import { beforeEnterHooks } from '../concat';
import { vuelifeHooks } from '../base';
import MyArray from '../extends/myArray';

/**
 * 通过 Object.defineProperty 代理一个对象主要是拦截beforeEnter 生命钩子
 * @param {Router} Router  路由实例对象
 * @param {Object} BeProxy 需要代理的路由表
 */
export const proxyBeforeEnter = function (Router, BeProxy) {
    const proxyDc = Object.create(null);// 创建没有继承的属性
    const BeProxyKeys = Object.keys(BeProxy);
    for (let i = 0; i < BeProxyKeys.length; i += 1) {
        const key = BeProxyKeys[i];
        Object.defineProperty(proxyDc, key, {
            enumerable: true,
            configurable: true,
            get() {
                const value = BeProxy[key];
                if (key == 'beforeEnter' && value !== undefined) {
                    return (to, from, next) => {
                        beforeEnterHooks(to, from, next, value, Router);
                    };
                }
                return value;
            },
            set(v) {
                BeProxy[key] = v;
            },
        });
    }
    return proxyDc;
};

/**
 * 在uni-app没有注入生命周期时先直接代理相关生命周期数组
 * @param {Object} Router
 * @param {Object} key
 * @param {Funtion} hookFun
 */
export const proxyEachHooks = function (Router, key, hookFun) {
    const vueOldHooks = vuelifeHooks[key];
    return new MyArray(Router, vueOldHooks, hookFun);
};
