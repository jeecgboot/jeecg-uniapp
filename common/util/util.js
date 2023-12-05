/** 判断是否是OAuth2APP环境 */
export function isOAuth2AppEnv() {
    // #ifdef H5
    return /wxwork|dingtalk/i.test(navigator.userAgent)
    // #endif
    return false;
}

// 获取url中的参数
export const getUrlParams = (url) => {
    let result = {
        url: '',
        params: {}
    };
    let list = url.split('?');
    result.url = list[0];
    let params = list[1];
    if (params) {
        let list = params.split('&');
        list.forEach(ele => {
            let dic = ele.split('=');
            let label = dic[0];
            let value = dic[1];
            result.params[label] = value;
        });
    }
    return result;
};