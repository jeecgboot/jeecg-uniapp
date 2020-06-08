import Vue, { ComponentOptions,PluginFunction, AsyncComponent } from "vue";
type Component = ComponentOptions<Vue> | typeof Vue | AsyncComponent;
type Dictionary<T> = { [key: string]: T };

type Position = { x: number; y: number };
type PositionResult = Position | { selector: string; offset?: Position } | void;

type NAVTYPE= 'push' | 'replace' | 'replaceAll' |  'pushTab'


interface Location {
    name?: string;
    path?: string;	  
    query?: Dictionary<string | (string | null)[] | null | undefined>;
    params?: Dictionary<string>;
    NAVTYPE?: NAVTYPE;
  }

interface Route {
    path: string;
    name?: string;	 
    params?: any;	  
    query?: any;
    beforeEnter?:(to:Route, from:Route, next:Function) => void;
    meta?: any;   //其他格外参数
}

interface Animation{ 
    animationType?:string;
    animationDuration?:number;
}

interface H5{
    rewriteFun?:boolean;	//是否对uni-app reLaunch/navigateBack 两个方法重写 处理uni刷新直接返回到首页和触发路由守卫
    paramsToQuery?: boolean; //h5端上通过params传参时规则是vue-router 刷新会丢失 开启此开关将变成?连接的方式
    loading?: boolean; //是否显示加载动画
    hinderTab?: boolean; //是否拦截uni-app自带底部菜单   TODO
    vueRouterDev?: boolean; //完全使用采用vue-router的开发模式
    useUniConfig?: boolean; //是否采用在pages.json下的所有页面配置信息,false时需开发者自行设置页面
    keepUniIntercept?: boolean; //保留uni-app使用vue-router的拦截器
    vueNext?: boolean; //在next管道函数中是否获取vueRouter next的原本参数
    replaceStyle?: boolean; //是否对resetStyle函数中返回的style节点进行全部替换，否则为追加
    resetStyle?: () => Object; //自定义加载样式函数 可返回一个包涵 html、style、script 的对象来重置Router内置的加载动画
    mode?: string;
    base?: string;
    linkActiveClass?: string;
    linkExactActiveClass?: string;
    scrollBehavior?: (to:Route, from:Route, savedPostion:Position|void) => PositionResult | Promise<PositionResult>,
    fallback?: boolean,
}

interface APP{
    holdTabbar?:boolean;	//是否开启底部菜单拦截
    rewriteFun?:boolean;	//是否对uni-app 下的chooseLocation/openLocation 两个方法重写 目的是隐藏和显示拦截tabbar
    loddingPageStyle?:()=>Object;	//当前等待页面的样式 必须返回一个json
    loddingPageHook?:()=>void;		//刚刚打开页面处于等待状态,会触发此事件
    holdTabbarStyle?:()=>Object;	
    animation?:Animation;	//页面切换动画
    switchPageOutTime?:number,	//最高能忍耐的页面切换时间 达到此时间 不管切换有没有完成都会显示页面出来 这对启动页帮助很大
}

interface RouteConfig  {
    path: string; //pages.json中的path 必须加上 '/' 开头
    component?: Component;    //H5端可用
    name?: string; // 命名路由    
    components?: { [name: string]: Component }; // 命名视图组件，H5端可用   
    redirect?: string | Location | Function;  //H5端可用
    props?: boolean | Object | Function;  //H5端可用
    aliasPath?:string;    //h5端 设置一个别名路径来替换 uni-app的默认路径
    alias?: string | Array<string>;   //H5端可用
    children?: Array<RouteConfig>; // 嵌套路由，H5端可用
    beforeEnter?: (to: Route, from: Route, next: Function) => void;   //路由元守卫
    meta?: any;   //其他格外参数
}


interface RouterOptions{
    h5?:H5;
    APP?:APP;
	debugger?: boolean; //是否处于开发阶段 设置为true则打印日志
	encodeURI?: boolean; //是否对url传递的参数进行编码
	routerBeforeEach?: () => Object; //router 前置路由函数 每次触发跳转前先会触发此函数
	routerAfterEach?: () => Object; //router 后置路由函数 每次触发跳转后会触发此函数
	routes?: RouteConfig[];
}



export {
    PluginFunction,
    Component,
    Location,
    Route,
    Animation,
    H5,
    APP,
    RouteConfig,
    RouterOptions
}