<template>
	<view class="bg-white" >
		<cu-custom :bgColor="NavBarColor" :isBack="true" backRouterName="index">
			<block slot="backText">返回</block>
			<block slot="content">公告消息</block>
		</cu-custom>
		<view class="container">
			<view class="solid-bottom">
				<scroll-view scroll-x class="bg-white nav text-center ">
					<view class="flex text-center justify-around">
						<view class="cu-item" :class="item.value==TabCur?'text-blue cur':''" v-for="(item,index) in tabs" :key="index" @tap="tabSelect" :data-id="item.value">
							{{item.title}}
						</view>
					</view>
				</scroll-view>
			</view>
			
			 <mescroll-uni ref="mescrollRef" @init="mescrollInit" :top="top"  @down="downCallback"  @up="upCallback">
				<!-- 数据列表 -->
				<view class="al-list cu-list">
					<view class="message_text bg-white cu-item flex justify-around align-center solid-bottom margin-bottom-sm margin-top-sm" style="width: 100vw;" v-for="(item,index) in msgList" :key="index" @tap="goAnnotationDetail(item)" :class="modalName=='move-box-'+ index?'move-cur':''"
					  @touchstart="ListTouchStart" @touchmove="ListTouchMove" @touchend="ListTouchEnd" :data-target="'move-box-' + index">
						<view v-if="isEmail(item)" class="padding-left">
							<view class="cu-avatar radius cuIcon-mail bg-orange" ></view>
						</view>
						<view v-if="item.msgCategory == '1'&&!isEmail(item)" class="padding-left">
							<view class="cu-avatar radius cuIcon-notification bg-orange" ></view>
						</view>
						<view v-if="item.msgCategory == '2'&&!isEmail(item)" class="padding-left">
							<view class="cu-avatar radius cuIcon-notice bg-orange" ></view>
						</view>
						<view class="titlePad content" style="height: 4em;">
							<view class="flex justify-start text-cut text-lg" style="width:26em;color: #333;font-family: '黑体';">
								<!-- <view v-if="item.readFlag == '0'"  class="cu-tag light bg-blue">未读</view> -->
								<view v-if="item.readFlag == '0'">
									<text class="cuIcon-title text-red padding-left-sm" style="margin-right: -0.8em;"></text>
								</view>
								<view class="padding-left">
									<text class="text-black" v-if="isEmail(item)&&item.emailTitle">{{titleFilter(item.emailTitle,12)}} </text>
									<text class="text-black" v-else>{{titleFilter(item.titile,12)}} </text>
								</view>
							</view>
							<view class="flex justify-between margin-top-xs" style="font-family: '黑体';color: #999;">
								<view v-if="isEmail(item)" class="text-content text-cut" style="padding-left: .8rem;width:18em;"
								 v-html="item.msgContent" @click="goEmailDetailPage(item);">
                                </view>
								<view v-else-if="!isEmail(item)" style="padding-left: .8rem;">
									<view class="text-content text-cut" v-if="item.msgAbstract && item.msgAbstract.length > 0" style="width:18em;"
									 v-html="item.msgAbstract">
									</view>
									<view v-else>
										无摘要
									</view>
								</view>
							</view>
			
						</view>
						<view class="action text-sm" style="color: #aaa;margin-top: -2em;margin-left: -13em;width: 10em;">
							<text >{{formatDate(item.sendTime,10)}}</text>
						</view>
						<view class="move">
							<view class="bg-red" style="margin-right: 3em;margin-left: 2px;" @tap.stop="deleteAnnotation(item)">删除</view>
						</view>
					</view>
				</view>
			</mescroll-uni>
		</view>

	</view>
</template>

<script>
	const tabs = [{title:'通知公告',value:0}, {title:'系统消息',value:1}];
	import MescrollMixin from "@/components/mescroll-uni/mescroll-mixins.js";
	
	
	export default {
	    mixins: [MescrollMixin], // 使用mixin
		data() {
			return {
				tabs,
				TabCur: 0,
				scrollLeft: 0,
				NavBarColor:this.NavBarColor,
				upOption:{
					page: {
						num: 0, // 当前页码,默认0,回调之前会加1,即callback(page)会从1开始
						size: 10 // 每页数据的数量
					},
					noMoreSize: 4, //如果列表已无数据,可设置列表的总数量要大于半页才显示无更多数据;避免列表数据过少(比如只有一条数据),显示无更多数据会不好看; 默认5
					empty:{
						tip: '~ 暂无数据 ~', // 提示
						
					},
					loading:'',
					text:'全部',
					isShowNoMore:false,
					textNoMore:'我是有底线的 >_<'
				},
				msgList: [], //列表数据
			    read: "all",
				announcement1:[],
				msg1Count:"",
				msg1Title:"",
				announcement2:[],
				msg2Count:"",
				msg2Title:"",
				url:"/sys/sysAnnouncementSend/getMyAnnouncementSend",
				delUrl:'/sys/sysAnnouncementSend/delete',
				listTouchStart: 0,
			    modalName: null,
			    listTouchDirection: null,
			}
		},
		onShow() {
			if(this.mescroll){
				this.mescroll.resetUpScroll()
			}
		},
		computed:{
			top() {
				return this.CustomBar * 2 + 95
			},
			style() {
				var StatusBar= this.StatusBar;
				var CustomBar= this.CustomBar;
				var style = `height:${CustomBar}px;padding-top:${StatusBar}px;`;
				return style
			},
		},
		methods: {
			// unique(arr) {
			//     var obj = {};
			//     return arr.filter(function(item, index, arr){
			//         return obj.hasOwnProperty(typeof item + item) ? false : (obj[typeof item + item] = true)
			//     })
			// },
			upCallback(page) {
				//联网加载数据
				console.log("tabindex",this.TabCur )
				let keyword = this.TabCur
				if(keyword == 0){
					this.$http.get(this.url,{params:{pageNo: page.num, pageSize:page.size,msgCategory: '1'}}).then(res=>{
						//联网成功的回调,隐藏下拉刷新和上拉加载的状态;
						
						this.announcement1 = res.data.result.records
						this.mescroll.endSuccess(this.announcement1.length);
						//console.log("url", res)
						//设置列表数据
						  if (res.data.success) {
							 console.log("res",res.data)
							 this.msg1Count = res.data.result.total
							 this.msg1Title = "通知(" + res.data.result.total + ")";
							 for(let annItem of this.announcement1){
									 this.msgList.push(annItem)							
								}
						 }
						if(page.num == 1){
							this.msgList = []; //如果是第一页需手动制空列表
							this.msgList = this.msgList.concat(this.announcement1); //追加新数据
						}
						
					}).catch(()=>{
						//联网失败, 结束加载
						this.mescroll.endErr();
					})
				}
				if(keyword == 1){
					this.$http.get(this.url,{params:{pageNo: page.num,pageSize: page.size,msgCategory: '2'}}).then(res=>{
						//联网成功的回调,隐藏下拉刷新和上拉加载的状态;
						this.announcement2 = res.data.result.records
						this.mescroll.endSuccess(this.announcement2.length,this.msgCount);
						
						//设置列表数据
						  if (res.data.success) {
							  console.log("res sys",res.data)
							 this.msg2Count = res.data.result.total
							 this.msg2Title = "通知(" + res.data.result.total + ")";
							 // this.announcement2.filter((item,index) => {
							 // // console.log("item",item)
							 //  if(item.anntId == this.announcement2[index+1].anntId){
								//   this.announcement2.splice(item,1)
								  for(let item of this.announcement2){
									  this.msgList.push(item)							
								  }
							//   }
							// })
						 }
						if(page.num == 1){
							this.msgList = []; //如果是第一页需手动制空列表
							this.msgList = this.msgList.concat(this.announcement2); //追加新数据
						}
					}).catch(()=>{
						//联网失败, 结束加载
						this.mescroll.endErr();
					})
				}
				
			},
		
			tabSelect(e) {
				this.TabCur = e.currentTarget.dataset.id;
				this.scrollLeft = (e.currentTarget.dataset.id - 1) * 60;
				this.msgList = []// 先置空列表,显示加载进度
				this.mescroll.resetUpScroll() // 再刷新列表数据
			},
			goAnnotationDetail(item){
				//item.readFlag = '1'
				this.mescroll.resetUpScroll() 
			    if(item.openType=="component" && item.openPage.indexOf('email')>= 0){
					this.goEmailDetailPage(item)
				}else{
					// console.log("detail",encodeURIComponent(JSON.stringify(item)))
					uni.navigateTo({
						url: '/pages/annotation/annotationDetail?item='+ encodeURIComponent(JSON.stringify(item))
					});
				}
			},
			isEmail(item){
				if(item.openType=="component" &&item.openPage.indexOf('email')>=0){
				  return true;
				}else{
				  return false;
				}
		    },
			goEmailDetailPage(item){
				console.log("go",item.anntId)
				console.log("item",item)
				 if(item.readFlag == '0'){
					//item.readFlag = '1'
					this.mescroll.resetUpScroll() 
					let readUrl = '/sys/sysAnnouncementSend/editByAnntIdAndUserId';
					this.$http.put(readUrl,{anntId:item.anntId})					
				}
				// console.log("goe",item.busId)
				
				uni.navigateTo({
					url: '/pages/mail/mailDetail?id='+item.busId
				});
				
			},
			ListTouchStart(e) {
				this.listTouchStart = e.touches[0].pageX
			},
			
			// ListTouch计算方向
			ListTouchMove(e) {
				this.listTouchDirection = e.touches[0].pageX - this.listTouchStart > 0 ? 'right' : 'left'
			},
			
			// ListTouch计算滚动
			ListTouchEnd(e) {
				if (this.listTouchDirection == 'left') {
					this.modalName = e.currentTarget.dataset.target
				} else {
					this.modalName = null
				}
				this.listTouchDirection = null
			},
			deleteAnnotation(item) {
				this.$http.delete(this.delUrl+'?id='+item.id).then(res => {
					console.log("结果数据9", res)
					if (res.data.success) {
						this.mescroll.resetUpScroll() 
					}
				}).catch(e => {
					console.log("al delUrl请求错误2", e)
					this.mescroll.endErr();
				})
			},
			formatDate(text,len){
				if(!text || text.length==0){
					return ''
				}
				if(text.length<len){
					return text;
				}
				return text.substr(0,len)
			},
			titleFilter(text,len){
				if(!text || text.length==0){
					return ''
				}
				if(text.length<len){
					return text;
				}
				return text.substr(0,len)+"..."
			}
			
		}
	}
</script>

<style scoped>
	.e-btn{margin-bottom: 1rem;}

	.titlePad{margin-top:0.6rem;}
	.cu-list>.move-cur{
		transform: translateX(-150rpx);
		
	}
	.nav .cu-item.cur {
		position: flex;
		z-index: 9;
		border-bottom: 4upx solid;
	}

</style>
