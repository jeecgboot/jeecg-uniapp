/**
 * Request 2.0.1
 * @Class Request
 * @description luch-request 2.0.1 http请求插件
 * @Author lu-ch
 * @Date 2020-05-01
 * @Email webwork.s@qq.com
 * http://ext.dcloud.net.cn/plugin?id=392
 * hbuilderx:2.6.15
 */

import buildURL from '../helpers/buildURL'
import buildFullPath from './buildFullPath'
import { isBoolean } from '../utils'

export default class Request {
  config = {
    baseUrl: '',
    header: {},
    method: 'GET',
    dataType: 'json',
    // #ifndef MP-ALIPAY || APP-PLUS
    responseType: 'text',
    // #endif
    custom: {},
    // #ifdef MP-ALIPAY || MP-WEIXIN
    timeout: 30000,
    // #endif
    // #ifdef APP-PLUS
    sslVerify: true,
    // #endif
    // #ifdef H5
    withCredentials: false
    // #endif
  }

  /**
   * @property {Function} request 请求拦截器
   * @property {Function} response 响应拦截器
   * @type {{request: Request.interceptor.request, response: Request.interceptor.response}}
   */
  interceptor = {
    /**
     * @param {Request~requestCallback} cb - 请求之前拦截,接收一个函数（config, cancel）=> {return config}。第一个参数为全局config,第二个参数为函数，调用则取消本次请求。
     */
    request: (cb) => {
      if (cb) {
        this.requestBeforeFun = cb
      }
    },
    /**
     * @param {Request~responseCallback} cb 响应拦截器，对响应数据做点什么
     * @param {Request~responseErrCallback} ecb 响应拦截器，对响应错误做点什么
     */
    response: (cb, ecb) => {
      if (cb) {
        this.requestComFun = cb
      }
      if (ecb) {
        this.requestComFail = ecb
      }
    }
  }

  requestBeforeFun = (config) => {
    return config
  }

  requestComFun = (response) => {
    return response
  }

  requestComFail = (response) => {
    return response
  }

  /**
   * 自定义验证器，如果返回true 则进入响应拦截器的响应成功函数(resolve)，否则进入响应拦截器的响应错误函数(reject)
   * @param { Number } statusCode - 请求响应体statusCode（只读）
   * @return { Boolean } 如果为true,则 resolve, 否则 reject
   */
  validateStatus(statusCode) {
    return statusCode === 200
  }

  /**
   * @Function
   * @param {Request~setConfigCallback} f - 设置全局默认配置
   */
  setConfig(f) {
    this.config = f(this.config)
  }

  /**
   * @Function
   * @param {Object} options - 请求配置项
   * @prop {String} options.url - 请求路径
   * @prop {Object} options.data - 请求参数
   * @prop {Object} [options.responseType = config.responseType] [text|arraybuffer] - 响应的数据类型
   * @prop {Object} [options.dataType = config.dataType] - 如果设为 json，会尝试对返回的数据做一次 JSON.parse
   * @prop {Object} [options.header = config.header] - 请求header
   * @prop {Object} [options.method = config.method] - 请求方法
   * @returns {Promise<unknown>}
   */
  async request(options = {}) {
    return new Promise((resolve, reject) => {
      options.baseUrl = this.config.baseUrl
      options.dataType = options.dataType || this.config.dataType
      // #ifndef MP-ALIPAY || APP-PLUS
      options.responseType = options.responseType || this.config.responseType
      // #endif
      // #ifdef MP-ALIPAY || MP-WEIXIN
      options.timeout = options.timeout || this.config.timeout
      // #endif
      // #ifdef H5
      options.withCredentials = isBoolean(options.withCredentials) ? options.withCredentials : this.config.withCredentials
      // #endif
      options.url = options.url || ''
      options.data = options.data || {}
      options.params = options.params || {}
      options.header = {...this.config.header, ...(options.header || {})}
      options.method = options.method || this.config.method
      options.custom =  {...this.config.custom,...(options.custom || {})}
      // #ifdef APP-PLUS
      options.sslVerify = options.sslVerify === undefined ? this.config.sslVerify : options.sslVerify
      // #endif
      options.getTask = options.getTask || this.config.getTask
      let next = true
      const cancel = (t = 'handle cancel', config = options) => {
        const err = {
          errMsg: t,
          config: config
        }
        reject(err)
        next = false
      }

      const handleRe =  {...this.requestBeforeFun(options, cancel)}
      const _config = {...handleRe}
      if (!next) return
      const requestTask = uni.request({
        url: buildURL(buildFullPath(_config.baseUrl, _config.url), _config.params),
        data: _config.data,
        header: _config.header,
        method: _config.method,
        // #ifdef MP-ALIPAY || MP-WEIXIN
        timeout: _config.timeout,
        // #endif
        dataType: _config.dataType,
        // #ifndef MP-ALIPAY || APP-PLUS
        responseType: _config.responseType,
        // #endif
        // #ifdef APP-PLUS
        sslVerify: _config.sslVerify,
        // #endif
        // #ifdef H5
        withCredentials: _config.withCredentials,
        // #endif
        complete: (response) => {
          response.config = handleRe
          if (this.validateStatus(response.statusCode)) { // 成功
            response = this.requestComFun(response)
            resolve(response)
          } else {
            response = this.requestComFail(response)
            reject(response)
          }
        }
      })
      if (handleRe.getTask) {
        handleRe.getTask(requestTask, handleRe)
      }
    })
  }

  get(url, options = {}) {
    return this.request({
      url,
      method: 'GET',
      ...options
    })
  }

  post(url, data, options = {}) {
    return this.request({
      url,
      data,
      method: 'POST',
      ...options
    })
  }

  // #ifndef MP-ALIPAY
  put(url, data, options = {}) {
    return this.request({
      url,
      data,
      method: 'PUT',
      ...options
    })
  }

  // #endif

  // #ifdef APP-PLUS || H5 || MP-WEIXIN || MP-BAIDU
  delete(url, data, options = {}) {
    return this.request({
      url,
      data,
      method: 'DELETE',
      ...options
    })
  }

  // #endif

  // #ifdef APP-PLUS || H5 || MP-WEIXIN
  connect(url, data, options = {}) {
    return this.request({
      url,
      data,
      method: 'CONNECT',
      ...options
    })
  }

  // #endif

  // #ifdef APP-PLUS || H5 || MP-WEIXIN || MP-BAIDU
  head(url, data, options = {}) {
    return this.request({
      url,
      data,
      method: 'HEAD',
      ...options
    })
  }

  // #endif

  // #ifdef APP-PLUS || H5 || MP-WEIXIN || MP-BAIDU
  options(url, data, options = {}) {
    return this.request({
      url,
      data,
      method: 'OPTIONS',
      ...options
    })
  }

  // #endif

  // #ifdef APP-PLUS || H5 || MP-WEIXIN
  trace(url, data, options = {}) {
    return this.request({
      url,
      data,
      method: 'TRACE',
      ...options
    })
  }

  // #endif

  upload(url, {
    // #ifdef APP-PLUS || H5
    files,
    // #endif
    // #ifdef MP-ALIPAY
    fileType,
    // #endif
    filePath,
    name,
    // #ifdef H5
    file,
    // #endif
    header = {},
    formData = {},
    custom = {},
    params = {},
    getTask
  }) {
    return new Promise((resolve, reject) => {
      let next = true
      const globalHeader = {...this.config.header}
      delete globalHeader['content-type']
      delete globalHeader['Content-Type']
      const pubConfig = {
        baseUrl: this.config.baseUrl,
        url,
        // #ifdef MP-ALIPAY
        fileType,
        // #endif
        filePath,
        method: 'UPLOAD',
        name,
        header: {...globalHeader, ...header},
        formData,
        params,
        custom: {...this.config.custom, ...custom},
        getTask: getTask || this.config.getTask
      }
      // #ifdef APP-PLUS || H5
      if (files) {
        pubConfig.files = files
      }
      // #endif
      // #ifdef H5
      if (file) {
        pubConfig.file = file
      }
      // #endif
      const cancel = (t = 'handle cancel', config = pubConfig) => {
        const err = {
          errMsg: t,
          config: config
        }
        reject(err)
        next = false
      }

      const handleRe = {...this.requestBeforeFun(pubConfig, cancel)}
      const _config = {
        url: buildURL(buildFullPath(handleRe.baseUrl, handleRe.url), handleRe.params),
        // #ifdef MP-ALIPAY
        fileType: handleRe.fileType,
        // #endif
        filePath: handleRe.filePath,
        name: handleRe.name,
        header: handleRe.header,
        formData: handleRe.formData,
        complete: (response) => {
          response.config = handleRe
          try {
            // 对可能字符串不是json 的情况容错
            if (typeof response.data === 'string') {
              response.data = JSON.parse(response.data)
            }
            // eslint-disable-next-line no-empty
          } catch (e) {
          }
          if (this.validateStatus(response.statusCode)) { // 成功
            response = this.requestComFun(response)
            resolve(response)
          } else {
            response = this.requestComFail(response)
            reject(response)
          }
        }
      }
      // #ifdef APP-PLUS || H5
      if (handleRe.files) {
        _config.files = handleRe.files
      }
      // #endif
      // #ifdef H5
      if (handleRe.file) {
        _config.file = handleRe.file
      }
      // #endif
      if (!next) return
      const requestTask = uni.uploadFile(_config)
      if (handleRe.getTask) {
        handleRe.getTask(requestTask, handleRe)
      }
    })
  }

  download(url, options = {}) {
    return new Promise((resolve, reject) => {
      let next = true
      const pubConfig = {
        baseUrl: this.config.baseUrl,
        url,
        method: 'DOWNLOAD',
        header: {...this.config.header, ...(options.header || {})},
        params: options.params || {},
        custom: {...this.config.custom, ...(options.custom || {})},
        getTask: options.getTask || this.config.getTask
      }
      const cancel = (t = 'handle cancel', config = pubConfig) => {
        const err = {
          errMsg: t,
          config: config
        }
        reject(err)
        next = false
      }

      const handleRe = {...this.requestBeforeFun(pubConfig, cancel)}
      if (!next) return
      const requestTask = uni.downloadFile({
        url: buildURL(buildFullPath(handleRe.baseUrl, handleRe.url), handleRe.params),
        header: handleRe.header,
        complete: (response) => {
          response.config = handleRe
          if (this.validateStatus(response.statusCode)) { // 成功
            response = this.requestComFun(response)
            resolve(response)
          } else {
            response = this.requestComFail(response)
            reject(response)
          }
        }
      })
      if (handleRe.getTask) {
        handleRe.getTask(requestTask, handleRe)
      }
    })
  }
}


/**
 * setConfig回调
 * @return {Object} - 返回操作后的config
 * @callback Request~setConfigCallback
 * @param {Object} config - 全局默认config
 */
/**
 * 请求拦截器回调
 * @return {Object} - 返回操作后的config
 * @callback Request~requestCallback
 * @param {Object} config - 全局config
 * @param {Function} [cancel] - 取消请求钩子，调用会取消本次请求
 */
/**
 * 响应拦截器回调
 * @return {Object} - 返回操作后的response
 * @callback Request~responseCallback
 * @param {Object} response - 请求结果 response
 */
/**
 * 响应错误拦截器回调
 * @return {Object} - 返回操作后的response
 * @callback Request~responseErrCallback
 * @param {Object} response - 请求结果 response
 */
