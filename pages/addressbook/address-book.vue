<template>
	
	<view>
		<cu-custom :bgColor="NavBarColor" :isBack="true" backRouterName="index">
			<block slot="backText">返回</block>
			<block slot="content">通讯录</block>
		</cu-custom>
		<view class="cu-bar bg-white search fixed" :style="[{top:CustomBar + 'px'}]">
			<view class="search-form round">
				<text class="cuIcon-search"></text>
				<input type="text" v-model="keyword" placeholder="输入搜索的关键词" confirm-type="search" @confirm="searchUserByKey"></input>
			</view>
			<view class="action">
				<button class="cu-btn bg-gradual-blue shadow-blur round" @tap="searchUserByKey">搜索</button>
			</view>
		</view>
		<scroll-view scroll-y class="indexes margin-top-xl"  :scroll-into-view="'indexes-'+ listCurID" :style="[{top:'calc('+ CustomBar + 'px - 20px)',height:'calc(100vh - '+ CustomBar + 'px - 70px)'}]"
		 :scroll-with-animation="true" :enable-back-to-top="true">
			<block v-for="(item,index) in list" :key="index">
				<view :class="'indexItem-' + item.name" :id="'indexes-' + item.name" :data-index="item.name">
					<view class="padding">{{item.name}}</view>
					<view class="cu-list menu-avatar no-padding" >
						<view class="cu-item" v-for="(items,sub) in userList" :key="sub" v-if="items.szm==item.name" @tap="toAddressDetail(items)">
						   <view class="cu-avatar round lg" v-if="items.avatar" :style="[{ backgroundImage:'url(' + items.avatar + ')' }]"></view>
							<view class="cu-avatar round lg" v-else>{{item.name}}</view>
							<view class="content">
								<view class="text-grey">{{items.realname?items.realname:items.username}}</view>
								<view class="text-gray text-sm">
									{{items.orgCode}}
								</view>
							</view>
						</view>
					</view>
				</view>
			</block>
		</scroll-view>
		<view class="indexBar" :style="[{height:'calc(110vh - ' + CustomBar + 'px - 50px)'}]">
			<view class="indexBar-box" @touchstart="tStart" @touchend="tEnd" @touchmove.stop="tMove">
				<view class="indexBar-item" v-for="(item,index) in list" :key="index" :id="index" @touchstart="getCur" @touchend="setCur"> {{item.name}}</view>
			</view>
		</view>
		<!--选择显示-->
		<view v-show="!hidden" class="indexToast">
			{{listCur}}
		</view>
	</view>
</template>

<script>
	import vPinyin from '@/common/util/vue-py.js';
	import {getFileAccessHttpUrl} from '@/api/api.js';
	export default {
		data() {
			return {
				StatusBar: this.StatusBar,
				CustomBar: this.CustomBar,
				hidden: true,
				listCurID: '',
				list: [],
				userList: [],
				listCur: '',
				keyword: '',
				queryUserByKeyWord:'/sys/user/appQueryUser'
			};
		},
		onLoad() {
			let list = [{}];
			for (let i = 0; i < 26; i++) {
				list[i] = {};
				list[i].name = String.fromCharCode(65 + i);
			}
			this.list = list;
			this.listCur = list[0];
			this.loadInfo()
		},
		onReady() {
			let that = this;
			uni.createSelectorQuery().select('.indexBar-box').boundingClientRect(function(res) {
				that.boxTop = res.top
			}).exec();
			uni.createSelectorQuery().select('.indexes').boundingClientRect(function(res) {
				that.barTop = res.top
			}).exec()
		},
		methods: {
			backTap(){
				this.$Router.replace({name:'index'})
			},
			toAddressDetail(item){
				let parmas = {...item}
				parmas.departName=parmas.orgCode
				this.$Router.push({name: 'addressDetail',params:parmas})
			},
			searchUserByKey(){
				this.loadInfo()
			},
			loadInfo(){
				this.$http.get(this.queryUserByKeyWord,{params:{'keyword':this.keyword}}).then(res=>{
			         if (res.data.success) {
						console.log("res",res)
					    let arr=res.data.result;
						let szuArr=[];
					    this.userList = arr.map(item => {
					        let { id,realname,avatar,username,phone,email,post,orgCode} = item
							let pinYin = username.toUpperCase();
							if(realname){
								//TODO 判断汉字的位置
								if(/.*[\u4e00-\u9fa5]+.*$/.test(realname)){
									pinYin=vPinyin.chineseToPinYin(realname);
								}
							}
							if(avatar){
								avatar=getFileAccessHttpUrl(avatar);
							}
					        let event = {
					          id, realname ,avatar,username,phone,email,post,orgCode,
							  szm:pinYin.substr(0,1)
					        }
							szuArr.push(event.szm)
					        return event
					      })
						 
						  this.list=this.list.filter(item=>szuArr.indexOf(item.name)!=-1)	
					      //this.list.unshift({name:"#"})
					}
				}).catch(err => {
					console.log(err);
				});
				
			},
			//获取文字信息
			getCur(e) {
				this.hidden = false;
				this.listCur = this.list[e.target.id].name;
			},
			setCur(e) {
				this.hidden = true;
				this.listCur = this.listCur
			},
			//滑动选择Item
			tMove(e) {
				let y = e.touches[0].clientY,
					offsettop = this.boxTop,
					that = this;
				//判断选择区域,只有在选择区才会生效
				if (y > offsettop) {
					let num = parseInt((y - offsettop) / 20);
					this.listCur = that.list[num].name
				};
			},

			//触发全部开始选择
			tStart() {
				this.hidden = false
			},

			//触发结束选择
			tEnd() {
				this.hidden = true;
				this.listCurID = this.listCur
			},
			indexSelect(e) {
				let that = this;
				let barHeight = this.barHeight;
				let list = this.list;
				let scrollY = Math.ceil(list.length * e.detail.y / barHeight);
				for (let i = 0; i < list.length; i++) {
					if (scrollY < i + 1) {
						that.listCur = list[i].name;
						that.movableY = i * 20
						return false
					}
				}
			}
		}
	}
</script>

<style>
	page {
		padding-top: 100upx;
	}

	.indexes {
		position: relative;
	}

	.indexBar {
		position: fixed;
		right: 0px;
		bottom: 0px;
		padding: 20upx 20upx 20upx 60upx;
		display: flex;
		align-items: center;
	}

	.indexBar .indexBar-box {
		width: 40upx;
		height: auto;
		background: #fff;
		display: flex;
		flex-direction: column;
		box-shadow: 0 0 20upx rgba(0, 0, 0, 0.1);
		border-radius: 10upx;
	}

	.indexBar-item {
		flex: 1;
		width: 40upx;
		height: 40upx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 24upx;
		color: #888;
	}

	movable-view.indexBar-item {
		width: 40upx;
		height: 40upx;
		z-index: 9;
		position: relative;
	}

	movable-view.indexBar-item::before {
		content: "";
		display: block;
		position: absolute;
		left: 0;
		top: 10upx;
		height: 20upx;
		width: 4upx;
		background-color: #f37b1d;
	}

	.indexToast {
		position: fixed;
		top: 0;
		right: 80upx;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		width: 100upx;
		height: 100upx;
		border-radius: 10upx;
		margin: auto;
		color: #fff;
		line-height: 100upx;
		text-align: center;
		font-size: 48upx;
	}
</style>
