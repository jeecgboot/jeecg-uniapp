import { err } from '../helpers/warn';
import { formatUserRule, strPathToObjPath } from './util';

/**
 * @param {Object} replace vue-router的跳转方式
 * @param {Object} rule 需要跳转到的路由匹配规则
 * @param {Object} type 对应的官方跳转模式
 *
 * this 为当前 Router 实例
 */
const H5PushTo = function (replace, rule, type) {
    if (this.$route == null) {
        return err('h5端路由为就绪，请检查调用代码');
    }
    rule = formatUserRule(rule, this.selfRoutes, this.CONFIG);
    const objPath = strPathToObjPath(rule);
    objPath.type = type;
    this.$route[replace](objPath);
};

export default H5PushTo;
