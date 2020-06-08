<template>
	<view>
		<scroll-view scroll-y class="page">
			<cu-custom bgColor="bg-gradual-pink" :isBack="true">
				<block slot="backText">返回</block>
				<block slot="content">用户详情</block>
				<view slot="right"  @tap="rightClick">编辑</view>
			</cu-custom>
			<!-- list列表 -->
			<view class="cu-list menu">
				<view class="cu-item animation-slide-bottom" :style="[{animationDelay: '0.1s'}]">
					<view class="content">
						<text class="text-grey">头像</text>
					</view>
					<view class="action">
						<view class="cu-avatar round sm" :style="{backgroundImage: 'url(' + personalMsg.avatar + ')'}"></view>
					</view>
				
				</view>
				<view class="cu-item animation-slide-bottom" :style="[{animationDelay: '0.2s'}]">
					<view class="content">
						<text class="text-grey">姓名</text>
					</view>
					<view class="action">
						<text class="text-grey">{{personalMsg.realname}}</text>
					</view>
				</view>
				<view class="cu-item animation-slide-bottom" :style="[{animationDelay: '0.3s'}]">
					<view class="content">
						<text class="text-grey">性别</text>
					</view>
					<view class="action">
						<text class="text-grey">{{personalMsg.sex}}</text>
					</view>
				</view>
				<view class="cu-item animation-slide-bottom" :style="[{animationDelay: '0.4s'}]">
					<view class="content">
						<text class="text-grey">生日</text>
					</view>
					<view class="action">
						<text class="text-grey">{{personalMsg.birthday}}</text>
					</view>
				</view>
			</view>
			
			<view class="cu-list menu">
				<view class="cu-item animation-slide-bottom" :style="[{animationDelay: '0.5s'}]">
					<view class="content">
						<text class="text-grey">对外信息展示</text>
					</view>
					<view class="action">
						<text class="text-grey">{{getSubStringText(personalMsg.realname+'@'+personalMsg.orgCode,11)}}</text>
					</view>
				</view>
			</view>
			
			<view class="cu-list menu">
				<view class="cu-item animation-slide-bottom" :style="[{animationDelay: '0.6s'}]">
					<view class="content">
						<text class="text-grey">所在部门</text>
					</view>
					<view class="action">
						<text class="text-grey">{{personalMsg.orgCode}}</text>
					</view>
				</view>
				<view class="cu-item animation-slide-bottom" :style="[{animationDelay: '0.7s'}]">
					<view class="content">
						<text class="text-grey">工号</text>
					</view>
					<view class="action">
						<text class="text-grey">{{personalMsg.workNo}}</text>
					</view>
				</view>
				<view class="cu-item animation-slide-bottom" :style="[{animationDelay: '0.8s'}]">
					<view class="content">
						<text class="text-grey">状态</text>
					</view>
					<view class="action">
						<text class="text-grey">{{personalMsg.status}}</text>
					</view>
				</view>
			</view>
			
			<view class="cu-list menu">
				<view class="cu-item animation-slide-bottom" :style="[{animationDelay: '0.9s'}]">
					<view class="content">
						<text class="text-grey">手机</text>
					</view>
					<view class="action">
						<text class="text-grey">{{personalMsg.phone}}</text>
					</view>
				</view>
				<view class="cu-item animation-slide-bottom" :style="[{animationDelay: '1s'}]">
					<view class="content">
						<text class="text-grey">邮箱</text>
					</view>
					<view class="action">
						<text class="text-grey">{{personalMsg.email}}</text>
					</view>
				</view>
			</view>
			
			<view class="cu-list menu">
				<view class="cu-item animation-slide-bottom" :style="[{animationDelay: '1.1s'}]">
					<view class="content">
						<text class="text-grey">职务</text>
					</view>
					<view class="action">
						<text class="text-grey">{{personalMsg.post}}</text>
					</view>
				</view>
				<view class="cu-item animation-slide-bottom" :style="[{animationDelay: '1.2s'}]">
					<view class="content">
						<text class="text-grey">身份</text>
					</view>
					<view class="action">
						<text class="text-grey">{{personalMsg.identity}}</text>
					</view>
				</view>
				<view class="cu-item animation-slide-bottom" v-if="personalMsg.identity =='上级'" >
					<view class="content">
						<text class="text-grey">负责部门</text>
					</view>
					<view class="action">
						<text class="text-grey">{{personalMsg.departIds}}</text>
					</view>
				</view>
			</view>

		</scroll-view>
	</view>
</template>

<script>
	import api from '@/api/api.js'
	export default {
		data() {
			return {
				 personalMsg:{
					avatar:'',
					realname:'',
					username:'',
					sex:1,
					birthday:new Date(),
					orgCode:'',
					workNo:'',
					status:1,
					phone:'',
					telephone:'',
					email:'',
					post:'',
					departIds:'',
					identity:'',
				},
				userUrl:'/sys/user/queryById',
				positionUrl:'/sys/position/list',
				departUrl:'/sys/user/userDepartList'
			};
		},
		onLoad() {
			this.loadinfo()
		},
		methods: {
			getSubStringText(text,len){
				if(!text || text.length==0){
					return ''
				}
				if(text.length<len){
					return text;
				}
				return text.substr(0,len)+"..."
			},
			rightClick(){
				this.$Router.push({name:'useredit', params:this.personalMsg})
				/* uni.navigateTo({
				    url: '/pages/user/useredit?item='+item
				}); */
			},
			loadinfo(){
				this.$http.get(this.userUrl,{params:{id:this.$store.getters.userid}}).then(res=> {
					console.log("用户",res)
					if (res.data.success) {
						let result = res.data.result
						if(result.avatar&&result.avatar.length >0)
						this.personalMsg.avatar = api.getFileAccessHttpUrl(result.avatar)
						this.personalMsg.realname = result.realname
						this.personalMsg.username= result.username
						this.personalMsg.post = result.post
						this.personalMsg.sex = result.sex===1?'男':'女'
						this.personalMsg.birthday = result.birthday== null?'无':result.birthday
						this.personalMsg.departIds= result.departIds
						this.personalMsg.workNo= result.workNo
						this.personalMsg.phone= result.phone
						this.personalMsg.telephone= result.telephone== null?'无':result.telephone
						this.personalMsg.email= result.email
						this.personalMsg.post= result.post
						this.personalMsg.identity= result.identity=== 1?'普通成员':'上级'
						this.personalMsg.status= result.status === 1?'正常':'冻结'
						this.personalMsg.orgCode= result.orgCode
					}
				}).catch(e=>{
					console.log("请求错误",e)
				})
				
				this.$http.get(this.departUrl,{params:{userId:this.$store.getters.userid}}).then(res=> {
					if (res.success) {
						for (let item of res.result){
							this.personalMsg.orgCode = item.title
							this.personalMsg.departIds = item.title
						}
					}
				}).catch(e=>{
					console.log("请求错误",e)
				})
				
				this.$http.get(this.positionUrl).then(res=> {
					if (res.success) {
						let postArr = res.result.records
						for (let item of postArr ){
							if (this.personalMsg.post == item.code){
								this.personalMsg.post = item.name
							}
						}
					}
				}).catch(e=>{
					console.log("请求错误",e)
				})
			},
		}
	}
</script>

<style>
	.page {
		height: 100Vh;
		width: 100vw;
	}

	.page.show {
		overflow: hidden;
	}

	.switch-sex::after {
		content: "\e716";
	}

	.switch-sex::before {
		content: "\e7a9";
	}

	.switch-music::after {
		content: "\e66a";
	}

	.switch-music::before {
		content: "\e6db";
	}
</style>
