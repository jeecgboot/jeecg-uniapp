import modules from './modules'
import Vue from 'vue'
import Router from '@/plugin/uni-simple-router/index.js'
import {ACCESS_TOKEN} from '@/common/util/constants.js'
import {isOAuth2AppEnv} from '@/common/util/util.js'

Vue.use(Router)
//初始化
const router = new Router({
	encodeURI:true,  
    routes: [...modules]//路由表
});

const whiteList = ['/pages/login/login','/pages/login/loginOauth2']
//全局路由前置守卫
router.beforeEach((to, from, next) => {
	if(to.path == '/oauth2-app/login'){
		let temp = location.href;
		location.href = temp.replace('/oauth2-app/login','/pages/login/loginOauth2')
		return;
	}
	let token=uni.getStorageSync(ACCESS_TOKEN);
	if(token){
		 if (to.path === '/pages/login/login' || to.path === '/pages/login/loginOauth2') {
			 if(from.path ==='/pages/index/index'){
				 return;
			 }else{
				 next()
			 }
		}
		next()
	}else{
		if (whiteList.indexOf(to.path) !== -1) {
		  // 在免登录白名单，如果进入的页面是login页面并且当前是OAuth2app环境，就进入OAuth2登录页面
		  if (to.path === '/pages/login/login' && isOAuth2AppEnv()) {
			next({path: '/pages/login/loginOauth2'})
		  } else {
			// 在免登录白名单，直接进入
			next()
		  }
		}else{
			// 如果当前是在OAuth2APP环境，就跳转到OAuth2登录页面
			let path = isOAuth2AppEnv() ? '/pages/login/loginOauth2' : '/pages/login/login';
			next({ path: path })
		}
	} 
})
// 全局路由后置守卫
router.afterEach((to, from) => {
	console.log("afterEach")
});
export default router;