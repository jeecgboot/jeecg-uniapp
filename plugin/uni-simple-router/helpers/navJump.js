import { appPlatform } from './util';
import { methods, H5FnTypeToggle, Global } from './config';
import { transitionTo } from '../appRouter/hooks';
import { appletsTransitionTo, backCallHook } from '../appletsRouter/hooks';
import uniPushTo from '../appRouter/uniNav';
import appletsUniPushTo from '../appletsRouter/appletsNav';
import { err, warn } from './warn';
import H5PushTo from '../vueRouter/routerNav';
import * as compile from './compile';


/**
 * 返回api 触发的公共函数
 * @param {Object/String} rule  当前跳转规则
 * @param {String} fnType    跳转页面的类型方法
 *
 * this 为当前 Router 实例
 */
const isBcakNav = function ({
    backLayer,
    delta,
    H5PATCH,
}) {
    compile.H5(() => {
        H5PATCH.on('historyBack', {
            backLayer,
            delta,
        });
    });
    compile.APP(() => {
        Global.backLayerC = backLayer;	// 告诉路由需要返回几层
        uni.navigateBack({
            delta: backLayer,
            complete: () => {
                Global.LockStatus = false; // 跳转完成解锁状态
            },
        });
    });
    compile.mp(() => {
        backCallHook.call(this, backLayer, () => {
            uni.navigateBack({
                delta: backLayer,
            });
        });
    });
};

/**
 * 非 返回api 触发的公共函数
 * @param {Object/String} rule  当前跳转规则
 * @param {String} fnType    跳转页面的类型方法
 *
 * this 为当前 Router 实例
 */

const notBackNav = function (rule, fnType) {
    if (rule == null) {
        return err('跳转规则为空，不允许这样操作');
    }
    if (rule.constructor === String) { // 单独 path 的情况   允许？拼接参数
        const ruleArray = rule.split('?');
        if (ruleArray.length > 1) {
            rule = {
                path: ruleArray[0],
                query: Global.$parseQuery.parse(ruleArray[1]),
            };
        }
    }
    switch (appPlatform(true)) {
    case 'H5':
        return H5PushTo.call(this, H5FnTypeToggle[fnType], rule, methods[fnType]);
    case 'APP':
        Global.LockStatus = true; // 设置为锁住状态
        return transitionTo.call(this, rule, fnType, uniPushTo);
    case 'APPLETS':
        Global.LockStatus = true; // 设置为锁住状态
        return appletsTransitionTo.call(this, rule, fnType, appletsUniPushTo);
    default:
        err('糟糕！！！还有其他的执行环境？？？没听说过啊。一脸懵逼？？？加QQ群问问：769241495');
        break;
    }
};

/**
 * 处理正在跳转的公共api
 * @param {Object/String} rule  当前跳转规则
 * @param {String} fnType    跳转页面的类型方法
 * @param {Boolean} isBack  是否通过 back() api 调用的 默认为false
 * @param {Boolean} enforce 是否强制越过跳转加锁检查 默认false  目前只有back() api 传递了
 *
 * this 为当前 Router 实例
 */
const navjump = function (rule, fnType, isBack = false, enforce = false) {
    if (Global.LockStatus && !enforce) { // 正在跳转的状态下 给出提示正在跳转
        return warn('当前页面正在处于跳转状态，请稍后再进行跳转....');
    }
    if (isBack) { // 是返回api触发的
        return isBcakNav.call(this, rule, fnType);
    }
    return notBackNav.call(this, rule, fnType);
};

export default navjump;
