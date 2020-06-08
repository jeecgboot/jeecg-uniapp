import { warn, err } from '../helpers/warn';
import { isObject, resolveRule, copyObject } from '../helpers/util';
import { proxyBeforeEnter } from './proxy/proxy';
import { Global } from '../helpers/config';

const pagesConfigReg = /props:\s*\(.*\)\s*(\([\s\S]*\))\s*},/;
const pagesConfigRegCli = /props:\s*Object\.assign\s*(\([\s\S]*\))\s*},/; // 脚手架项目
const defRoutersReg = /props:\s*{([\s\S]+)}\s*},/;

/**
 * 解析验证当前的 component 选项是否配置正确 只有vueRouterDev:false 才会调用此方法
 * @param {Function|Object} component
 * @param {Object} item
 * @param {Boolean} useUniConfig
 */
export const resolveRender = function ({
    component,
    components,
}, item, useUniConfig) {
    if (components != null) {
        warn(`vueRouterDev:false时 路由表配置中 ‘components’ 无效，\r\n\r\n ${JSON.stringify(item)}`);
    }
    if (useUniConfig == true) { // 采用uni-pages.json中的配置时component可以为空
        return false;
    }
    if (item.path == '*') { // 唯独这个情况在vue-router中可以不用component
        return true;
    }
    if (component == null) {
        return err(`vueRouterDev:false时 路由表中 ‘component’ 选项不能为空：\r\n\r\n ${JSON.stringify(item)}`);
    }
    if (component.constructor === Function) {
        item.component = {
            render: component,
        };
    } else if (component.constructor === Object) {
        if (component.render == null || component.render.constructor !== Function) {
            err(`vueRouterDev:false时 路由表配置中 ‘render’ 函数缺失或类型不正确：\r\n\r\n ${JSON.stringify(item)}`);
        }
    } else {
        err(
            `vueRouterDev:false时 路由表配置中 ‘component’ 选项仅支持 Function、Object 类型。并确保 Object 类型时传递了 ‘render’ 函数  ：\r\n\r\n ${JSON.stringify(item)}`,
        );
    }
};
/**
 * 递归解析 H5配置中有存在嵌套对象的情况,优先以path为key存储。没有则找aliasPath作为key
 * @param {Object} objRoutes
 * @param {Array} children
 * @param {Boolean} useUniConfig 是否使用pages.json下的页面配置
 */
export const resloveChildrenPath = function (objRoutes, children, useUniConfig) {
    for (let i = 0; i < children.length; i += 1) {
        const item = children[i];
        resolveRender(item, item, useUniConfig);
        if (item.path != null) {
            objRoutes[item.path] = {
                ...item,
                ...{
                    _ROUTERPATH: true, // 使用page.json中的path为路径
                },
            };
        } else {
            objRoutes[item.aliasPath] = {
                ...item,
                ...{
                    _ROUTERPATH: false,
                },
            };
        }
        if (item.children && item.children.constructor === Array) {
            resloveChildrenPath(objRoutes, item.children, useUniConfig);
        }
    }
};
/**
 * 格式化原始路由表
 * @param {Object} routes  路由表
 * @param {Boolean} userRoute  是否为用户自己配置的路由表
 * @param {Boolean} H5CONFIG
 */
export const fromatRoutes = function (routes, userRoute, {
    vueRouterDev,
    useUniConfig,
}) {
    if (userRoute && vueRouterDev) { // 如果是用户的路由表并且 完全采用vueRouter开发 则不作处理直接返回
        return routes;
    }
    const objRoutes = {};
    for (let i = 0; i < routes.length; i += 1) {
        const item = routes[i];
        const path = item.path === '/' ? item.alias : item.path;
        if (userRoute) {
            if (item.children && item.children.constructor === Array) {
                resloveChildrenPath(objRoutes, item.children, useUniConfig);
            }
            resolveRender(item, item, useUniConfig); // 是否使用pages.json下的页面配置
        }
        objRoutes[path] = {
            ...item,
            ...{
                _PAGEPATH: path.substring(1),
            },
        };
    }
    return objRoutes;
};

/**
 * 解析vueRouter中 component 下 render函数中的配置信息
 * @param {String} FunStr
 */
export const getFuntionConfig = function (FunStr) {
    let matchText = FunStr.match(pagesConfigReg);
    let prefix = '';
    if (matchText == null) { // 是uni-app自带的默认路由及配置 也可能是脚手架项目
        matchText = FunStr.match(pagesConfigRegCli);
        if (matchText == null) { // 确认不是脚手架项目
            try {
                // eslint-disable-next-line
                matchText = FunStr.match(defRoutersReg)[1];
                // eslint-disable-next-line
                matchText = eval(`Object.assign({${matchText}})`);
                prefix = 'system-';
            } catch (error) {
                err(`读取uni-app页面构建方法配置错误 \r\n\r\n ${error}`);
            }
        } else {
            // eslint-disable-next-line
            matchText = eval(`Object.assign${matchText[1]}`);
        }
    } else {
        // eslint-disable-next-line
        matchText = eval(`Object.assign${matchText[1]}`);
    }
    return {
        config: matchText,
        prefix,
        FunStr,
    };
};
/**
 * 通过一个未知的路径名称 在路由表中查找指定路由表 并返回
 * @param {String} path //不管是aliasPath名的路径还是path名的路径
 * @param {Object} routes//当前对象的所有路由表
 */
export const pathToRute = function (path, routes) {
    let PATHKEY = '';
    let rute = {};
    const routeKeys = Object.keys(routes);
    for (let i = 0; i < routeKeys.length; i += 1) {
        const key = routeKeys[i];
        const item = routes[key];
        rute = item;
        if (item.aliasPath == path) { // path参数是优先采用aliasPath为值得 所以可以先判断是否与aliasPath相同
            PATHKEY = 'aliasPath';
            break;
        }
        // eslint-disable-next-line
        if (`/${item._PAGEPATH}` == path) { // 路径相同
            PATHKEY = 'path';
            break;
        }
    }
    return {
        PATHKEY: {
            [PATHKEY]: path,
        },
        rute,
    };
};
/**
 * 通过一个路径name 在路由表中查找指定路由表 并返回
 * @param {String} name//实例化路由时传递的路径表中所匹配的对应路由name
 * @param {Object} routes//当前对象的所有路由表
 */
export const nameToRute = function (name, routes) {
    const routesKeys = Object.keys(routes);
    for (let i = 0; i < routesKeys.length; i += 1) {
        const key = routesKeys[i];
        const item = routes[key];
        if (item.name == name) {
            return item;
        }
    }

    err(`路由表中没有找到 name为:'${name}' 的路由`);
};
/**
 * 根据用户传入的路由规则 格式化成正确的路由规则
 * @param {Object} rule 用户需要跳转的路由规则
 * @param {Object} selfRoutes simple-router下的所有routes对象
 * @param {Object} CONFIG 当前路由下的所有配置信息
 */
export const formatUserRule = function (rule, selfRoutes, CONFIG) {
    let type = '';
    const ruleQuery = (type = 'query', rule.query || (type = 'params', rule.params)) || (type = '', {});
    let rute = {}; // 默认在router中的配置
    if (type == '' && rule.name != null) { // 那就是可能没有穿任何值咯
        type = 'params';
    }
    if (type != 'params') {
        const route = pathToRute(rule.path || rule, selfRoutes);
        if (Object.keys(route.PATHKEY)[0] == '') {
            err(`'${route.PATHKEY['']}' 路径在路由表中未找到`);
            return null;
        }
        rute = route.rute;
        if (rule.path) {
            rule.path = rute.path;
        }
    }
    if (type != '') { // 当然是对象啦 这个主要是首页H5PushTo调用时的
        if (type == 'params' && CONFIG.h5.paramsToQuery) { // 如果是name规则并且设置了转query,那么就转path跳转了
            const {
                aliasPath,
                path,
            } = nameToRute(rule.name, selfRoutes);
            delete rule.name;
            delete rule.params;
            rule.path = aliasPath || path;
            type = 'query';
        }
        const query = Global.$parseQuery.transfer(ruleQuery);
        if (CONFIG.encodeURI) {
            if (query != '') {
                rule[type] = {
                    query: query.replace(/^query=/, ''),
                };
            }
        } else {
            rule[type] = ruleQuery;
        }
    } else { // 纯字符串,那就只有是path啦
        rule = rute.path;
    }
    return rule;
};

/**
 * 根据是否获取非vue-Router next管道参数，来进行格式化
 *
 * @param {Object} to
 * @param {Object} from
 * @param {Router} Router  //router当前实例对象
 */
export const getRouterNextInfo = function (to, from, Router) {
    let [toRoute, fromRoute] = [to, from];
    const H5 = Router.CONFIG.h5;
    if (H5.vueNext === false && H5.vueRouterDev === false) { // 不采用vue-router中的to和from,需要格式化成Router中$Route获取的一样一样的
        let [toPath, fromPath] = [{}, {}];
        toPath[to.meta.PATHKEY] = to.meta.PATHKEY === 'path' ? `/${to.meta.pagePath}` : `${to.path}`;
        fromPath[from.meta.PATHKEY] = from.meta.PATHKEY === 'path' ? `/${from.meta.pagePath}` : `${from.path}`;

        if (to.meta.PATHKEY == null) { // 未使用uni-pages.json中的配置、通过addRoutes时 meta.PATHKEY 可能未undefined
            toPath = pathToRute(to.path, Router.selfRoutes).PATHKEY;
        }
        if (from.meta.PATHKEY == null) {
            fromPath = pathToRute(from.path, Router.selfRoutes).PATHKEY;
        }

        const isEmptyTo = Object.keys(to.query).length != 0 ? copyObject(to.query) : copyObject(to.params);
        const isEmptyFrom = Object.keys(from.query).length != 0 ? copyObject(from.query) : copyObject(from.params);
        /* eslint-disable */
        delete isEmptyTo.__id__; // 删除uni-app下的内置属性
        delete isEmptyFrom.__id__;
        /* eslint-enable */
        const toQuery = Global.$parseQuery.queryGet(isEmptyTo).decode;
        const fromQuery = Global.$parseQuery.queryGet(isEmptyFrom).decode;
        toRoute = resolveRule(Router, toPath, toQuery, Object.keys(toPath)[0]);
        fromRoute = resolveRule(Router, fromPath, fromQuery, Object.keys(fromPath)[0]);
    } else {
        if (fromRoute.name == null && toRoute.name != null) { // 这种情况是因为uni-app在使用vue-router时搞了骚操作。
            fromRoute = {
                ...fromRoute,
                ...{
                    name: toRoute.name,
                },
            }; // 这个情况一般出现在首次加载页面
        }
    }
    return {
        toRoute,
        fromRoute,
    };
};
export const vueDevRouteProxy = function (routes, Router) {
    const proxyRoutes = [];
    for (let i = 0; i < routes.length; i += 1) {
        const item = routes[i];
        const childrenRoutes = Reflect.get(item, 'children');
        if (childrenRoutes != null) {
            const childrenProxy = vueDevRouteProxy(childrenRoutes, Router);
            item.children = childrenProxy;
        }
        const ProxyRoute = proxyBeforeEnter(Router, item);
        proxyRoutes.push(ProxyRoute);
    }
    return proxyRoutes;
};
/**
 * 组装成编码后的路由query传递信息
 * @param {Object} CONFIG simple-router 对象配置
 * @param {Object} query 传递的参数
 * @param {Object} mode 路由模式
 */

export const encodeURLQuery = function (CONFIG, query, mode) {
    if (Object.keys(query).length == 0) { // 没有传值的时候 我们啥都不管
        return '';
    }
    if (CONFIG.h5.vueRouterDev === false) { // 没有采取完全模式开发时 才转换
        const { strQuery, historyObj } = Global.$parseQuery.queryGet(query);
        if (mode === 'history') {
            return historyObj;
        }
        return strQuery;
    } // 完全彩种 vue-router 开发的时候 我们不用管
    if (mode === 'history') { // 此模式下 需要的就是对象
        return query;
    }
    return Global.$parseQuery.stringify(query); // hash转成字符串拼接
};
/**
 * 把一个未知的路由跳转规则进行格式化为 hash、history 可用的,主要表现在 history模式下直接传入path会报错__id__错误的问题
 * @param {*} path 需要判断修改的路径规则
 */
export const strPathToObjPath = function (path) {
    if (path == null) { // 我们也不用管啦,这个情况是路由守卫中传递的
        return path;
    }
    if (isObject(path)) { // 是对象我们不用管
        return path;
    }
    return { // 这种情况就是只有path时,直接返回path对象了
        path,
    };
};
/**
 * 通过 getCurrentPages() api 获取指定页面的 page 对象 默认是获取当前页面page对象
 * @param {Number} index //需要获取的页面索引
 * @param {Boolean} all //是否获取全部的页面
 */
export const getPages = function (index = 0, all) {
    const pages = getCurrentPages(all);
    return pages.reverse()[index];
};
/**
 * 获取当前页面下的 Route 信息
 *
 * @param {Object} pages 获取页面对象集合
 * @param {Object} Vim 用户传递的当前页面对象
 */
export const H5GetPageRoute = function (pages, Vim) {
    if (pages.length > 0) { // 直接取当前页面的对象
        const currentRoute = pages[pages.length - 1].$route;
        return getRouterNextInfo(currentRoute, currentRoute, this).toRoute;
    } if (Vim && Vim.$route) {
        return getRouterNextInfo(Vim.$route, Vim.$route, this).toRoute;
    }
    return {};
};

/**
 * 在useUniConfig:true 的情况下重新拼装路由表 useUniConfig:false 不需要读取page.json中的数据 直接使用component作为页面组件
 * @param {Router} Router//unis-simple-router 路由对象
 * @param {vueRouter} vueRouter//vue-router对象
 * @param {Boolean} useUniConfig//是否采用uni-page.json中的配置选项
 * @param {Array} routes//需要循环的routes表
 */
export const diffRouter = function (Router, vueRouter, useUniConfig, routes) {
    const newRouterMap = [];
    if (useUniConfig) { // 使用pages.json的样式配置 只是单纯的把url路径改成用户自定义的 保留uni的所以的配置及生命周期、缓存
        const Routes = routes || vueRouter.options.routes;
        const cloneSelfRoutes = copyObject(Router.selfRoutes); // copy一个对象随便搞xxoo
        Routes.forEach(((item) => {
            const path = item.path === '/' ? item.alias : item.path;
            const vueRoute = (Router.vueRoutes[path] || Router.vueRoutes[item.path]) || Router.selfRoutes[path];
            const CselfRoute = Router.selfRoutes[path];
            delete cloneSelfRoutes[path]; // 移除已经添加到容器中的路由，用于最后做对比 是否page.json中没有，而实例化时传递了
            if (CselfRoute == null) {
                return err(
                    `读取 ‘pages.json’ 中页面配置错误。实例化时传递的路由表中未找到路径为：${path} \r\n\r\n 可以尝试把 ‘useUniConfig’ 设置为 ‘false’。或者配置正确的路径。如果你是动态添加的则不用理会`,
                );
            }
            let pageConfigJson = {
                config: {},
            };
            if (vueRoute.component) {
                pageConfigJson = getFuntionConfig(vueRoute.component.render.toString());
                CselfRoute.component = {
                    render: (h) => vueRoute.component.render(h),
                };
            }
            delete CselfRoute.components; // useUniConfig:true 时不允许携带components
            delete CselfRoute.children; // useUniConfig:true 时不允许携带children
            CselfRoute.meta = {
                ...pageConfigJson.config,
                ...item.meta || {},
                PATHKEY: CselfRoute.aliasPath ? 'aliasPath' : 'path',
                pagePath: CselfRoute.path.substring(1),
            };
            CselfRoute.path = CselfRoute.aliasPath || (item.path === '/' ? item.path : CselfRoute.path);
            item.alias = item.path === '/' ? item.alias : CselfRoute.path; // 重新给vueRouter赋值一个新的路径，欺骗uni-app源码判断
            const ProxyRoute = proxyBeforeEnter(Router, CselfRoute);
            newRouterMap.push(ProxyRoute);
        }));
        if (Object.keys(cloneSelfRoutes).length > 0) { // 确实page.json中没有，而实例化时传递了
            const testG = cloneSelfRoutes['*']; // 全局通配符,他是个例外'通配符'可以被添加
            if (testG && routes == null) {
                const ProxyRoute = proxyBeforeEnter(Router, Router.selfRoutes['*']);
                newRouterMap.push(ProxyRoute);
            }
            if (routes == null) { // 非动态添加时才打印警告
                const cloneSelfRoutesKeys = Object.keys(cloneSelfRoutes);
                for (let i = 0; i < cloneSelfRoutesKeys.length; i += 1) {
                    const key = cloneSelfRoutesKeys[i];
                    if (key !== '*') { // 通配符不警告
                        warn(`实例化时传递的routes参数：\r\n\r\n ${JSON.stringify(cloneSelfRoutes[key])} \r\n\r\n 在pages.json中未找到。自定排除掉，不会添加到路由中`);
                    }
                }
            }
        }
    } else { // 不使用任何的uni配置完全使用 完全使用component作为页面使用
        const Routes = routes || Router.selfRoutes;
        const RoutesKeys = Object.keys(Routes);
        for (let i = 0; i < RoutesKeys.length; i += 1) {
            const key = RoutesKeys[i];
            const item = Routes[key];
            // eslint-disable-next-line
            if (item._ROUTERPATH != null) { // 不寻找children下的路径，只取第一层
                continue;
            }
            delete item.components;
            delete item.children;
            item.path = item.aliasPath || item.path; // 优先获取别名为路径
            if (item.path !== '*') {
                item.component = item.component.render || item.component; // render可能是用户使用addRoutes api进行动态添加的
            }
            item.meta = {
                ...item.meta || {},
                PATHKEY: item.aliasPath ? 'aliasPath' : 'path',
                pagePath: item.path.substring(1),
            };
            const ProxyRoute = proxyBeforeEnter(Router, item);
            newRouterMap.push(ProxyRoute);
        }
    }
    return newRouterMap;
};
