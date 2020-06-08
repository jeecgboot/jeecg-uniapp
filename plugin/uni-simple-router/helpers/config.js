
export const baseConfig = {
    h5: {
        rewriteFun: true,	// 是否对uni-app reLaunch/navigateBack 两个方法重写 处理uni刷新直接返回到首页和触发路由守卫
        paramsToQuery: false, // h5端上通过params传参时规则是vue-router 刷新会丢失 开启此开关将变成?连接的方式
        loading: true, // 是否显示加载动画
        hinderTab: false, // 是否拦截uni-app自带底部菜单   TODO
        vueRouterDev: false, // 完全使用采用vue-router的开发模式
        useUniConfig: true, // 是否采用在pages.json下的所有页面配置信息,false时需开发者自行设置页面
        keepUniIntercept: false, // 保留uni-app使用vue-router的拦截器
        vueNext: false, // 在next管道函数中是否获取vueRouter next的原本参数
        replaceStyle: false, // 是否对resetStyle函数中返回的style节点进行全部替换，否则为追加
        resetStyle: () => JSON.parse('{}'), // 自定义加载样式函数 可返回一个包涵 html、style、script 的对象来重置Router内置的加载动画
        mode: 'hash',
        base: '/',
        linkActiveClass: 'router-link-active',
        linkExactActiveClass: 'router-link-exact-active',
        scrollBehavior: (to, from, savedPostion) => savedPostion,
        fallback: true,
    },
    APP: {
        holdTabbar: true,	// 是否开启底部菜单拦截
        loddingPageStyle: () => JSON.parse('{"backgroundColor":"#FFF"}'),	// 当前等待页面的样式 必须返回一个json
        loddingPageHook: (view) => { plus.navigator.closeSplashscreen(); view.show(); },		// 刚刚打开页面处于等待状态,会触发此事件
        animation: { animationType: 'pop-in', animationDuration: 300 },	// 页面切换动画
        switchPageOutTime: 1000,	// 最高能忍耐的页面切换时间 达到此时间 不管切换有没有完成都会显示页面出来 这对启动页帮助很大
    },
    debugger: false, // 是否处于开发阶段 设置为true则打印日志
    encodeURI: true, // 是否对url传递的参数进行编码
    routerBeforeEach: () => {}, // router 前置路由函数 每次触发跳转前先会触发此函数
    routerAfterEach: () => {}, // router 后置路由函数 每次触发跳转后会触发此函数
    routes: [],
};

export const methods = {
    push: 'navigateTo',
    replace: 'redirectTo',
    replaceAll: 'reLaunch',
    pushTab: 'switchTab',
    back: 'navigateBack',
};

export const H5FnTypeToggle = {
    push: 'push',
    replace: 'replace',
    replaceAll: 'replace',
    pushTab: 'replace',
};

export const lifeCycle = {
    beforeHooks: [],
    afterHooks: [],
    routerHooks: [],
    routerbeforeHooks: [], // 内部跳转前生命周期
    routerAfterHooks: [], // 内部跳转后生命周期
};

export const Global = { // 缓存一些必要的对象，作为全局可以访问的参数
    $parseQuery: null, // url query 帮助类实例
    Router: {},
    vueRouter: {},
    addedRoutes: [], // 用于缓存用户动态添加的路由
    RouterReadyPromise: () => {},
    H5RouterReady: null, // 当前router是否就绪
    backLayerC: 1,	// 返回api调用时开发者传递的 delta
    LockStatus: false, // 当前是否正在进行跳转 正在跳转调用api是不给跳转的
};

export const uniAppHook = {
    indexVue: {},	// 首页 组件对象
    toutiaoIndexThis: {}, // 头条小程序Index this对象
    appVue: {},	// 同getApp()获取到的对象一毛一样的  其实就是app.vue组件
    onLaunch: {	fun: [], args: {}, isHijack: false }, // 这两个是app.vue
    onShow: { fun: [], args: {}, isHijack: false },
    variationFuns: ['onReady', 'onUnload'],	// 一些uni-app的变异方法 需要处理下
    waitHooks: {},	// 首页等待中的生命钩子 一些需要等待的Hooks,就是在页面没有进来之前一些提前触发的生命钩子 主要是用户已经声明好的
    indexCallHooks: ['onLoad', 'onReady', 'created', 'onShow'],	// 在首页首次启动时需要触发的生命周期
    needHooks: ['onLoad', 'onReady', 'onShow', 'created', 'onHide', 'onUnload', 'onResize'],	// 首页需要拦截的生命钩子
    pageReady: false,
    onLaunched: false,	// 否触发onLaunch事件
};

export const appletsConfig = {	// 小程序端的一些路由所需配置
    onLaunchEd: false,	// 当前小程序端是否触发onLaunch事件
};

export const route = function (object = {}) {
    return {
        ...object,
        params: {},
        query: {},
    };
};
