  <template>
	<view class="zai-box">
        <scroll-view scroll-y class="page">
            <view class="text-center" :style="[{animation: 'show ' + 0.4+ 's 1'}]">
				<image src="https://static.jeecg.com/upload/test/login4_1595818039175.png" mode='aspectFit' class="zai-logo "></image>
				<view class="zai-title text-shadow ">JEECG BOOT </view>
			</view>
            <view class="box padding-lr-xl login-paddingtop" :style="[{animation: 'show ' + 0.6+ 's 1'}]">
				<block v-if="loginWay==1">
					<view class="cu-form-group margin-top  shadow-warp" :class="[shape=='round'?'round':'']">
						<view class="title"><text class="cuIcon-people margin-right-xs"></text>账号:</view>
						<input placeholder="请输入账号" name="input" v-model="userName"></input>
					</view>
					<view class="cu-form-group margin-top shadow-warp" :class="[shape=='round'?'round':'']">
						<view class="title"><text class="cuIcon-lock margin-right-xs"></text>密码:</view>
						<input class="uni-input" placeholder="请输入密码" :password="!showPassword" v-model="password" />
						<view class="action text-lg">
						    <text :class="[showPassword ? 'cuIcon-attention' : 'cuIcon-attentionforbid']" @click="changePassword"></text>
						</view>
					</view>
					<view class="padding text-center margin-top">
						<button class="cu-btn bg-blue lg margin-right shadow" :loading="loading" :class="[shape=='round'?'round':'']"
							@tap="onLogin"><text space="emsp">{{loading ? "登录中...":" 登录 "}}</text>
						</button>
						<button class="cu-btn line-blue lg margin-left shadow" :loading="loading" :class="[shape=='round'?'round':'']"
							@tap="loginWay=3-loginWay">短信登录
						</button>
					</view>
				</block>
                <block v-else>
                	<view class="cu-form-group margin-top  shadow-warp" :class="[shape=='round'?'round':'']">
                		<view class="title"><text class="cuIcon-mobile margin-right-xs"></text>手机号:</view>
                		<input placeholder="请输入手机号" type="number" maxlength="11" v-model="phoneNo"></input>
                	</view>
                	<view class="cu-form-group margin-top shadow-warp" :class="[shape=='round'?'round':'']">
                		<view class="title"><text class="cuIcon-lock margin-right-xs"></text>验证码:</view>
                		<input class="uni-input" placeholder="请输入验证码" v-model="smsCode"/>
                		<view class="action">
                			<button class="cu-btn line-blue sm" :disabled="!isSendSMSEnable" @click="onSMSSend"> {{ getSendBtnText }}</button>
                		</view>
                	</view>
                	<view class="padding text-center margin-top">
                		<button class="cu-btn bg-blue lg margin-right shadow" :loading="loading" :class="[shape=='round'?'round':'']"
                			@tap="onSMSLogin"><text space="emsp">{{loading ? "登录中...":" 登录 "}}</text>
                		</button>
                		<button class="cu-btn line-blue lg margin-left shadow" :loading="loading" :class="[shape=='round'?'round':'']"
                			@tap="loginWay=1">账户登录
                		</button>
                	</view>
                </block>
				
	
				<!-- #ifdef APP-PLUS -->
				<view class="padding flex flex-direction  text-center">
					当前版本:{{version}}
				</view>
				<!-- #endif -->
				
            </view>
        </scroll-view>
		<!-- 登录加载弹窗 -->
		<view class="cu-load load-modal" v-if="loading">
			<!-- <view class="cuIcon-emojifill text-orange"></view> -->
			<image src="https://static.jeecg.com/upload/test/login4_1595818039175.png" mode="aspectFit" class="round"></image>
			<view class="gray-text">登录中...</view>
		</view>
    </view>

</template>

<script>
	import { ACCESS_TOKEN,USER_NAME,USER_INFO } from "@/common/util/constants"
	import { mapActions } from "vuex"
    import configService from '@/common/service/config.service.js';
	
    export default {
        data() {
            return {
				shape:'',//round 圆形
				loading: false,
				userName: 'admin',
				password: '123456',
				phoneNo: '',
				smsCode: '',
				showPassword: false, //是否显示明文
				loginWay: 1, //1: 账密，2：验证码
				smsCountDown: 0,
				smsCountInterval: null,
				toggleDelay: false,
				version:'',
				//第三方登录相关信息
				thirdType:"",
				thirdLoginInfo:"",
				thirdLoginState:false,
				bindingPhoneModal:false,
				thirdUserUuid:'',
				url: {
					bindingThirdPhone: '/sys/thirdLogin/bindingThirdPhone'
				}
            };
        },
		onLoad:function(){
			// #ifdef APP-PLUS
			var that=this
			plus.runtime.getProperty( plus.runtime.appid, function ( wgtinfo ) {
				that.version=wgtinfo.version
			});
			// #endif
		},
		computed: {
		      isSendSMSEnable() {
		        return this.smsCountDown <= 0 && this.phoneNo.length > 4;
		      },
		      getSendBtnText() {
		        if (this.smsCountDown > 0) {
		          return this.smsCountDown + '秒后发送';
		        } else {
		          return '发送验证码';
		        }
		      },
		      canSMSLogin() {
		        return this.userName.length > 4 && this.smsCode.length > 4;
		      },
		      canPwdLogin() {
		        return this.userName.length > 4 && this.password.length > 4;
		      },
		},
        methods: {
			 ...mapActions([ "mLogin","PhoneLogin","ThirdLogin" ]),
			onLogin: function (){
			        if(!this.userName || this.userName.length==0){
			          this.$tip.toast('请填写用户名');
			          return;
			        }
			        if(!this.password || this.password.length==0){
			           this.$tip.toast('请填写密码');
			          return;
			        }
			        let loginParams = {
			          username:this.userName,
			          password:this.password
			        }
					this.loading=true;
			        this.mLogin(loginParams).then((res) => {
					  this.loading=false;
			          if(res.data.success){
						 // #ifdef APP-PLUS
						  this.saveClientId()
						 // #endif
						 // #ifndef APP-PLUS
						  this.$tip.success('登录成功!')
						  this.$Router.replaceAll({name:'index'})
						 // #endif
						}else{
			              this.$tip.alert(res.data.message);
			            }
			        }).catch((err) => {
			          let msg = err.data.message || "请求出现错误，请稍后再试"
			          this.loading=false;
					  this.$tip.alert(msg);
			        }).finally(()=>{
					  this.loading=false;
				})
			},
			saveClientId(){
				var info = plus.push.getClientInfo();
				var cid = info.clientid;
				this.$http.get("/sys/user/saveClientId",{params:{clientId:cid}}).then(res=>{
					console.log("res::saveClientId>",res)
					this.$tip.success('登录成功!')
					this.$Router.replaceAll({name:'index'})
				})
			},
			changePassword() {
				this.showPassword = !this.showPassword;
			},
			onSMSSend() {
				let smsParams = {};
				smsParams.mobile=this.phoneNo;
				smsParams.smsmode="0";
				let checkPhone = new RegExp(/^[1]([3-9])[0-9]{9}$/);
                if(!smsParams.mobile || smsParams.mobile.length==0){
					this.$tip.toast('请输入手机号');
					return false
				}
				if(!checkPhone.test(smsParams.mobile)){
					this.$tip.toast('请输入正确的手机号');
					return false
				}
				this.$http.post("/sys/sms",smsParams).then(res=>{
				  if(res.data.success){
					this.smsCountDown = 60;
					this.startSMSTimer();
				  }else{
					this.smsCountDown = 0;
					this.$tip.toast(res.data.message);
				  }
				});
			  },
			startSMSTimer() {
				this.smsCountInterval = setInterval(() => {
				  this.smsCountDown--;
				  if (this.smsCountDown <= 0) {
					clearInterval(this.smsCountInterval);
				  }
				}, 1000);
			},
			onSMSLogin() {
				let checkPhone = new RegExp(/^[1]([3-9])[0-9]{9}$/);
				
				if(!this.phoneNo || this.phoneNo.length==0){
				  this.$tip.toast('请填写手机号');
				  return;
				}
				if(!checkPhone.test(this.phoneNo)){
					this.$tip.toast('请输入正确的手机号');
					return false
				}
				if(!this.smsCode || this.smsCode.length==0){
				  this.$tip.toast('请填短信验证码');
				  return;
				}
				let loginParams = {
				  mobile:this.phoneNo,
				  captcha:this.smsCode
				};
				this.PhoneLogin(loginParams).then((res) => {
				  console.log("res====》",res)
				  if(res.data.success){
					this.$tip.success('登录成功!')
					this.$Router.replaceAll({name:'index'})
				  }else{
					this.$tip.error(res.data.message);
				  }
				}).catch((err) => {
				  let msg = ((err.response || {}).data || {}).message || err.data.message || "请求出现错误，请稍后再试"
				  this.$tip.error(msg);
				});
			},
			loginSuccess() {
			  // 登陆成功，重定向到主页
			  this.$Router.replace({name:'index'})
			},
			requestFailed(err) {
			  this.$message.warning("登录失败")
			},
        },
		beforeDestroy() {
		    if (this.smsCountInterval) {
		        clearInterval(this.smsCountInterval);
		    }
		},
    }
</script>

<style>
    .login-paddingtop {
        padding-top: 100upx;
    }

    .zai-box {
        padding: 0 20upx;
        padding-top: 100upx;
        position: relative;
    }

    .zai-logo {
        width: 200upx;
        height: 150px;
    }

    .zai-title {
       font-size: 58upx;
       color: #000000;
       text-align: center;
    }

    .input-placeholder, .zai-input {
        color: #94afce;
    }

    .zai-label {
        padding: 60upx 0;
        text-align: center;
        font-size: 30upx;
        color: #a7b6d0;
    }

    .zai-btn {
        background: #ff65a3;
        color: #fff;
        border: 0;
        border-radius: 100upx;
        font-size: 36upx;
    }

    .zai-btn:after {
        border: 0;
    }

    /*按钮点击效果*/
    .zai-btn.button-hover {
        transform: translate(1upx, 1upx);
    }

</style>
