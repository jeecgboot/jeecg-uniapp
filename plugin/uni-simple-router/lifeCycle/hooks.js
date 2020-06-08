import { appPlatform, isH5 } from '../helpers/util';

// #ifdef H5
import H5 from '../patch/h5-patch';

const H5PATCH = new H5(isH5());
// #endif

export const registerHook = function (list, fn) {
    list.push(fn);
    return () => {
        const i = list.indexOf(fn);
        if (i > -1) list.splice(i, 1);
    };
};
/**
 * 注册全局Router生命钩子
 */
export const registerRouterHooks = function () {
    registerHook(this.lifeCycle.routerbeforeHooks, function () {
        return new Promise(async (resolve) => {
            this.CONFIG.routerBeforeEach(); // 触发暴露给开发者的生命钩子
            if (appPlatform(true) === 'H5') {
                H5PATCH.on('toogle', 'startLodding');
            }
            return resolve(true);
        });
    });
    registerHook(this.lifeCycle.routerAfterHooks, function (res = {}) {
        if (res.H5Intercept !== true) {
            this.CONFIG.routerAfterEach(); // 触发暴露给开发者的生命钩子
        }
        if (appPlatform(true) === 'H5') {
            H5PATCH.on('toogle', 'stopLodding');
        }
        return true;
    });
};
