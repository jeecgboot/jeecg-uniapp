/**
 * 实现一个继承的 数组类  代理掉 vue-router 生命钩子的数据
 */
class MyArray extends Array {
    constructor(Router, vueOldHooks, hookFun) {
        super();
        this.Router = Router;
        this.vueOldHooks = vueOldHooks;
        this.hookFun = hookFun;
    }

    push(v) {
        this.vueOldHooks.splice(0, 1, v);// 把vue-router路由生命钩子保存起来
        this[this.length] = (to, from, next) => {
            this.hookFun(to, from, next, this.Router);
        };
    }
}

export default MyArray;
