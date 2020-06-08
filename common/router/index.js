import modules from './modules'
import Vue from 'vue'
import Router from '@/plugin/uni-simple-router/index.js'
import {ACCESS_TOKEN} from '@/common/util/constants.js'

Vue.use(Router)
//初始化
const router = new Router({
	encodeURI:true,  
    routes: [...modules]//路由表
});

const whiteList = ['/pages/login/login'] 
//全局路由前置守卫
router.beforeEach((to, from, next) => {
	let token=uni.getStorageSync(ACCESS_TOKEN);
	if(token){
		 next()
	}else{
		if (whiteList.indexOf(to.path) !== -1) {
		  next()
		}else{
		  next({ path: '/pages/login/login'})
		}
	} 
})
// 全局路由后置守卫
router.afterEach((to, from) => {
	console.log("afterEach")
})
export default router;