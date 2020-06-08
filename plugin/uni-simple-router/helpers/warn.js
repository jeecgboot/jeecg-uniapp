import { Global } from './config';


const isLog = function (type, errText, enforce) {
    if (!enforce) {
        const dev = Global.Router.CONFIG.debugger;
        const isObject = dev.toString() === '[object Object]';
        if (dev === false) {
            return false;
        } if (dev === false) {
            return false;
        } if (isObject) {
            if (dev[type] === false) {
                return false;
            }
        }
    }
    /* eslint no-console:"off" */
    console[type](errText);
};
export const err = function (errInfo, enforce = false) {
    isLog('error', errInfo, enforce);
};

export const warn = function (errInfo, enforce = false) {
    isLog('warn', errInfo, enforce);
};

export const log = function (errInfo, enforce = false) {
    isLog('log', errInfo, enforce);
};
export const warnLock = function (errInfo) {
    console.warn(errInfo);
};
