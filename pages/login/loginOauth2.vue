<template>
    <view class="zai-box">
        <!-- 登录加载弹窗 -->
        <view class="cu-load load-modal">
            <image src="https://static.jeecg.com/upload/test/login4_1595818039175.png" mode="aspectFit"
                   class="round"></image>
            <view class="gray-text">正在登录中...</view>
        </view>
    </view>

</template>

<script>
import {ACCESS_TOKEN} from "@/common/util/constants"
import {mapActions} from "vuex"
import {isOAuth2AppEnv, getUrlParams} from '@/common/util/util'
import configService from '@/common/service/config.service.js';

export default {
    data() {
        return {
            loading: false,
            env: {
                thirdType: '',
                thirdApp: false,
                wxWork: false,
                dingtalk: false,
            },
            redirectUrl: ''
        };
    },
    beforeCreate() {
        // 如果当前 不是 OAuth2APP环境，就重定向到 /user/login 页面
        if (!isOAuth2AppEnv()) {
            this.$Router.replace({name: 'login'})
        }
    },
    created() {
        this.checkEnv()
        this.doOAuth2Login()
    },
    methods: {
        ...mapActions(['ThirdLogin']),
        /** 检测当前的环境 */
        checkEnv() {
            // 判断当时是否是企业微信环境
            if (/wxwork/i.test(navigator.userAgent)) {
                this.env.thirdApp = true
                this.env.wxWork = true
                //this.env.thirdType='wechat_enterprise'
            }
            // 判断当时是否是钉钉环境
            if (/dingtalk/i.test(navigator.userAgent)) {
                this.env.thirdApp = true
                this.env.dingtalk = true
                //this.env.thirdType='dingtalk'
            }
        },

        /** 进行OAuth2登录操作 */
        doOAuth2Login() {
            if (this.env.thirdApp) {
                // 判断是否携带了Token，是就说明登录成功
                this.redirectUrl = ''
                let search = window.location.search;
                if (search.indexOf('hasToken') > 0) {
                    let obj = getUrlParams(search);
                    if (obj.params.redirect) {
                        this.redirectUrl = decodeURIComponent(decodeURIComponent(obj.params.redirect));
                        this.goRedirectUrl();
                    } else {
                        alert('hasToken参数错误!')
                    }
                } else if (search.indexOf('oauth2LoginToken') > 0) {
                    let obj = getUrlParams(search);
                    this.env.thirdType = obj.params.thirdType;
                    let token = obj.params.oauth2LoginToken;
                    if (obj.params.redirect) {
                        this.redirectUrl = decodeURIComponent(obj.params.redirect)
                    }
                    this.doThirdLogin(token)
                } else if (this.env.wxWork) {
                    this.doWechatEnterpriseOAuth2Login()
                } else if (this.env.dingtalk) {
                    this.doDingTalkOAuth2Login()
                }
            }
        },

        // 根据token执行登录
        doThirdLogin(token) {
            this.ThirdLogin({token: token, thirdType: this.env.thirdType}).then(res => {
                if (res.data.success) {
                    this.loginSuccess()
                } else {
                    this.requestFailed(res)
                }
            }).catch((e) => {
                alert(e.message || e)
            })
        },
        loginSuccess() {
		      	this.$Router.replaceAll({name: 'index'})
        },
        requestFailed(err) {
            this.$message.warning("登录失败")
        },
        goRedirectUrl() {
            let obj = getUrlParams(this.redirectUrl);
            let path = obj.url;
            let params = obj.params;
            if (params.info) {
                let temp = JSON.parse(params.info);
                let query = {
                    instanceId: temp.procInsId,
                    taskId: temp.taskId,
                    taskDefKey: temp.taskDefKey
                }
                if (temp.claim == 1) {
                    query['claim'] = 1
                }
                this.$Router.replaceAll({path, query})
            } else {
                this.$Router.replaceAll({path})
            }
        },
        /** 企业微信OAuth2登录 */
        doWechatEnterpriseOAuth2Login() {
            this.sysOAuth2Login('wechat_enterprise')
        },

        /** 钉钉OAuth2登录 */
        doDingTalkOAuth2Login() {
            this.sysOAuth2Login('dingtalk')
        },

        /** 后台构造oauth2登录地址 */
        sysOAuth2Login(source) {
            let domainURL = configService.apiUrl;
            let url = `${domainURL}/sys/thirdLogin/oauth2/${source}/login`;
            let state = window.location.origin + window.location.search
            url += `?state=${encodeURIComponent(state)}`;
            console.log('sysOAuth2Login====》', url)
            window.location.href = url;
        },
    }
}
</script>

<style>
.login-paddingtop {
    padding-top: 100 upx;
}

.zai-box {
    padding: 0 20 upx;
    padding-top: 100 upx;
    position: relative;
}

.zai-logo {
    width: 200 upx;
    height: 150px;
}

.zai-title {
    font-size: 58 upx;
    color: #000000;
    text-align: center;
}

.input-placeholder, .zai-input {
    color: #94afce;
}

.zai-label {
    padding: 60 upx 0;
    text-align: center;
    font-size: 30 upx;
    color: #a7b6d0;
}

.zai-btn {
    background: #ff65a3;
    color: #fff;
    border: 0;
    border-radius: 100 upx;
    font-size: 36 upx;
}

.zai-btn:after {
    border: 0;
}

/*按钮点击效果*/
.zai-btn.button-hover {
    transform: translate(1 upx, 1 upx);
}

</style>
