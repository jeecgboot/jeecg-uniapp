import {Component,PluginFunction,Location,Route,Animation,H5,APP,RouteConfig,RouterOptions} from './options'

/**
 * 路由挂载点
 * @param {VueComponent } Vim vue实例对象
 * @param {dom} el	dom节点选择器 
 */
declare const RouterMount: (Vim: any, el: string | Element) => void;

declare class Router {
    constructor(options:RouterOptions)
    /**
     * 当前的 Route
     */
    get $Route():Route;
    /**
     * 获取 url 参数帮助类实例
     */
    get $parseQuery():object;
    /**
     * 获取当前是否处于正在跳转的状态
     * H5 状态下始终为false
     */
    get $lockStatus():boolean;
    
    /**
     * 动态设置拦截状态
     */
    set $lockStatus(status:boolean);

	/**动态的导航到一个新 URL 保留浏览历史
	 * navigateTo
	 * @param {Object} rule
	 */
    push(rule: Location | string): void;

    /**动态的导航到一个新 URL 关闭当前页面，跳转到的某个页面。
	 * redirectTo
	 * @param {Object} rule
	 */
    replace(rule:Location | string):void;

    /**动态的导航到一个新 URL 关闭所有页面，打开到应用内的某个页面
	 * 	reLaunch
	 * @param {Object} rule
	 */
    replaceAll(rule:Location | string):void;

    /**动态的导航到一个新 url 关闭所有页面，打开到应用内的某个tab
	 * @param {Object} rule
	 */
    pushTab(rule:Location | string) :void;

    /**
	 * 返回到指定层级页面上
	 */
    back(backLayer?:number,delta?:Object):void

	/**
	 * 获取当前页面下的 Route 信息
	 * @param {Object} Vim 当前开发者可以传递一个 vue 组件对象 来获取当前下的 Route 信息
	 */
    getPageRoute(Vim?:Component) : Route

    /**
     * 注册的全局前置生命周期
     * @param hooks 注册的全局前置生命周期函数
     */
    beforeEach(hooks:Function) : Function

    /**
     * 注册的全局后置生命周期
     * @param hooks 注册的全局后置生命周期函数
     */
    afterEach(hooks:Function) : Function

    static install:PluginFunction<never>
}

declare module "vue/types/vue" {
    interface Vue {
      $Router: Router;
      $Route: Route;
    }
}

export default Router;

export {
    RouterMount,
    Location,
    Route,
    Animation,
    H5,
    APP,
    RouteConfig,
    RouterOptions
}