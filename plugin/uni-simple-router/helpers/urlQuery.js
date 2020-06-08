import { Global } from './config';
import { warn, err } from './warn';

const nodeURL = require('query-string');

class ParseQuery {
    get queryName() {
        return nodeURL;
    }

    /**
     * 判断当前这个对象是否为深度对象
     * @param {Object} obj
     */
    isDepthObject(obj) {
        const str = JSON.stringify(obj);
        return str.match(/}/g).length > 1;
    }

    /**
     * 从URL中提取查询字符串
     * @param {String} url
     */
    extract(url) {
        return nodeURL.extract(url);
    }

    /**
     * 把一个 key=value&key1=value 的字符串转成对象
     * @param {string} strQuery key=value&key1=value 类型的字符串
     */
    parse(strQuery) {
        return nodeURL.parse(strQuery);
    }

    /**
     * 把一个对象转成 key=value&key1=value 类型的字符串
     * @param {Object} ObjQuery 符合js标注的对象
     * @param {Boolean} intact 是否在转成的字符串前添加？号
     */
    stringify(ObjQuery, intact = true) {
        const strQuery = nodeURL.stringify(ObjQuery);
        if (intact) {
            return `?${strQuery}`;
        }
        return strQuery;
    }

    /**
     * 把一个对象或者 key=value&key1=value 类型的数据加密成 query=encodeURIComponent(value)
     * @param {Object|String} query 符合js标注的对象 或者 key=value&key1=value 字符串
     * @param {Boolean} intact 是否在转成的字符串前添加？号
     */
    encode(query, intact = true) {
        let [strQuery, formatQuery] = ['', ''];
        if (query == null) {
            warn('加密参数没有传递，你知道？', true);
            return '';
        }
        if (query.constructor === String) { // 字符串 尝试 转成 对象
            strQuery = JSON.stringify(this.parse(query));
        } else if (query.constructor === Object) { // 直接转成字符串对象即可
            if (Object.keys(query).length === 0) {
                warn('当前参数不满足加密规范！');
                return '';
            }
            strQuery = JSON.stringify(query);
        }
        if (intact) {
            formatQuery = '?';
        }
        formatQuery += `query=${encodeURIComponent(strQuery)}`;
        return formatQuery;
    }

    /**
     * 把一个已经加密好的字符串 query=encodeURIComponent(value) 解密成 对象
     * @param {string} strQuery  已经加密好的字符串 query=encodeURIComponent(value)
     */
    decode(strQuery) {
        if (strQuery == null) {
            warn('解密参数没有传递，你知道？', true);
            return {};
        }
        let jsonQuery = strQuery;
        if (strQuery.constructor === Object) { // 如果是对象 看能不能满足要求
            jsonQuery = strQuery.query;
            if (jsonQuery == null) {
                warn('当前解密参数不满足编码规则');
                return {};
            }
            jsonQuery = `query=${jsonQuery}`;
        }
        let decode = {};
        // query 长这个样  query=encodeURIComponent(value)
        const decodeStr = decodeURIComponent(jsonQuery);
        const { query } = this.parse(decodeStr); // 转成 json 获取到正真的json字符串
        if (query == null) {
            warn('当前解密参数不满足编码规则');
        } else {
            try {
                decode = JSON.parse(query);
            } catch (error) {
                warn('当前解密参数不满足编码规则');
            }
        }
        return decode;
    }

    queryGet(query) {
        const { encodeURI } = Global.Router.CONFIG; // 获取到路由配置
        let [decode, historyObj, strQuery] = [query, query, ''];
        switch (encodeURI) {
        case true: { // 加密模式
            decode = this.decode(query);
            strQuery = this.encode(decode);
            historyObj = {
                query: encodeURIComponent(JSON.stringify(decode)),
            };
            break;
        }
        case false: { // 不加密模式
            strQuery = this.stringify(query);
            break;
        }
        default: {
            err('未知参数模式，请检查 \'encodeURI\'', true);
        }
        }
        return { strQuery, historyObj, decode };
    }


    /**
     * 对需要传递的参数进行加密解密
     * @param {Object|String} query get为false 必须为 Object 类型
     * @param {String} get 是取值 还是通过api传值
     */
    transfer(query = {}) {
        const { encodeURI } = Global.Router.CONFIG; // 获取到路由配置
        switch (encodeURI) {
        case true: {
            // 加密模式
            return this.encode(query, false);
        }
        case false: {
            // 不加密模式
            return this.stringify(query);
        }
        default: {
            err('未知参数模式，请检查 \'encodeURI\' ', true);
        }
        }
    }
}

export default ParseQuery;
