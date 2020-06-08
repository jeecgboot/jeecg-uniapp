<template name="home">
	<view>
		<scroll-view>
			<!-- 轮播 -->
			<swiper class="screen-swiper square-dot"  :indicator-dots="true" :circular="true"
			 :autoplay="true" interval="5000" duration="500" :style="[{animation: 'show 0.2s 1'}]">
				<swiper-item v-for="(item,index) in swiperList" :key="index">
					<image :src="item.url" mode="aspectFill" v-if="item.type=='image'"></image>
					<video :src="item.url" autoplay loop muted :show-play-btn="false" :controls="false" objectFit="cover" v-if="item.type=='video'"></video>
				</swiper-item>
			</swiper>
			<!-- 中部应用宫格 -->
			<view class="bg-white"  :style="[{animation: 'show 0.4s 1'}]">
				<view class="grid margin-bottom col-2 ">
				  <navigator  v-for="(item,index) in middleApps" :key="index" :url="'/pages/home/' + item.name" class="nav-li" navigateTo
					 :style="[{animation: 'show ' + ((index+1)*0.2+1) + 's 1'}]" hover-class="none">
						<view class="flex align-center">
							<image :src="'/static/home/'+item.icon"  mode="aspectFill" class="line2-icon"></image>
							<view class="text-df">{{item.title}} <br/> <span class="text-light">{{item.text}}</span></view>
						</view>
					</navigator>	
				</view>
			</view>
			<!-- 常用服务 -->
			<view class="cu-bar bg-white solid-bottom"   :style="[{animation: 'show 0.6s 1'}]">
				<view class="action">
					<text class='cuIcon-title text-blue'></text>常用服务
				</view>
			</view>
			<view class=" bg-white grid col-3 padding-sm">
				<view class="padding-sm animation-slide-bottom" :style="[{animationDelay: (index + 1)*0.1 + 's'}]" v-for="(item,index) in usList" :key="index" @tap="goPage(item.page)">
					<view class="padding radius text-center shadow-blur solid-right ">
						<!-- <image :src="item.icon"  mode="aspectFill" class="line2-icon"></image> -->
						<view class="cu-avatar lg " 
						 :style="{background: 'url(' + item.icon + ') no-repeat',backgroundSize:'100upx 100upx'}">
						   <view class="cu-tag badge" v-if="getTtemDotInfo(item)">{{getTtemDotInfo(item)}}</view>
						</view>
						<view class="text-lg margin-top">{{item.title}}</view>
					</view>
				</view>
			</view>
			
			<!-- 其他服务 -->
			<view class="cu-bar bg-white solid-bottom margin-top"  :style="[{animation: 'show 0.6s 1'}]">
				<view class="action">
					<text class='cuIcon-title text-yellow'></text>其他服务
				</view>
			</view>
			<view class=" bg-white grid col-3 padding-sm">
				<view class="padding-sm animation-slide-bottom" :style="[{animationDelay: (index + 1)*0.1 + 's'}]" v-for="(item,index) in osList" :key="index">
					<view class="padding radius text-center shadow-blur solid-right ">
						<view class="cu-avatar lg "  :style="{background: 'url(' + item.icon + ') no-repeat',backgroundSize:'100upx 100upx'}"><!-- <view class="cu-tag badge">99</view> --></view>
						<view class="text-lg margin-top">{{item.title}}</view>
					</view>
				</view>
			</view>
			
			<view class="cu-tabbar-height">
			</view>
		</scroll-view>
	</view>
</template>

<script>
	import { us,os } from '@/common/util/work.js'
	export default {
		name: 'home',
		props:{
			cur:String,
		},
		watch: {
			cur: {
				immediate: true,
				handler() {
					console.log('watch',this.cur)
				    this.initMenu()
				},
			},
		},
		data() {
			return {
			 swiperList: [
				  {id:1,type: 'image',url: '/static/banner/banner1.png', link: ''},
				  {id:2,type: 'image',url: '/static/banner/banner2.jpg', link: ''},
				  {id:3,type: 'image',url: '/static/banner/banner3.jpg', link: ''},
				  {id:4,type: 'image',url: '/static/banner/banner4.jpg', link: ''},
				],
				middleApps: [
				  {icon: 'line2_icon1.png', title: '审批', 'text': '个人审批'},
				  {icon: 'line2_icon2.png', title: '审批稿', 'text': '审批草稿箱'},
				],
				usList:us.data,
				osList:os.data,
				websock:'',
				heartCheck:null,
				lockReconnect:false,
				msgCount:0,
				dot:{
				  mailHome:false
				}
			}
		},
		methods: {
			initMenu(){
				console.log("-----------home------------")
			    this.initWebSocket();
			    this.loadCount(0);
			},
			goPage(page){
				if(!page){
					return false;
				}
				if(page==='annotationList'){
				  this.msgCount = 0
				}
				this.dot[page]=false
				this.$router.push({name: page})
			},
			initWebSocket: function () {
				// WebSocket与普通的请求所用协议有所不同，ws等同于http，wss等同于https
				var userId = this.$store.getters.userid;
				var url = this.$config.apiUrl.replace("https://","wss://").replace("http://","ws://")+"/websocket/"+userId;
				console.log('websocket url>>'+url);
				this.websock = new WebSocket(url);
				this.websock.onopen = this.websocketOnopen;
				this.websock.onerror = this.websocketOnerror;
				this.websock.onmessage = this.websocketOnmessage;
				this.websock.onclose = this.websocketOnclose;
			},
			websocketOnopen: function () {
				console.log("WebSocket连接成功");
				//心跳检测重置
				//this.heartCheck.reset().start();
			},
			websocketOnerror: function () {
				console.log("WebSocket连接发生错误");
				this.reconnect();
			},
			websocketOnmessage: function (e) {
				console.log("-----接收消息-------",e.data);
				var data = eval("(" + e.data + ")"); //解析对象
				if(data.cmd == "topic"){
				  //系统通知
				  this.loadCount('1')
				}else if(data.cmd == "user"){
				  //用户消息
				  this.loadCount('2')
				} else if(data.cmd == 'email'){
				  this.loadEmailCount()
				}
		
				//心跳检测重置
				//this.heartCheck.reset().start();
			},
			websocketOnclose: function (e) {
				console.log("connection closed (" + e.code + ")");
				this.reconnect();
			},
			websocketSend(text) { // 数据发送
				try {
				  this.websock.send(text);
				} catch (err) {
				  console.log("send failed (" + err.code + ")");
				}
			},
			reconnect() {
				var that = this;
				if(that.lockReconnect) return;
				that.lockReconnect = true;
				//没连接上会一直重连，设置延迟避免请求过多
				setTimeout(function () {
				  console.info("尝试重连...");
				  that.initWebSocket();
				  that.lockReconnect = false;
				}, 5000);
			},
			loadCount(flag){
				console.log("loadCount::flag",flag)
				let url = '/sys/annountCement/listByUser';
				this.$http.get(url).then(res=>{
					console.log("res::",res)
				  if(res.data.success){
					let msg1Count = res.data.result.anntMsgTotal;
					let msg2Count = res.data.result.sysMsgTotal;
					this.msgCount = msg1Count + msg2Count
					console.log("this.msgCount",this.msgCount)
				  }
				})
			},
			loadEmailCount(){
				this.dot.mailHome = true
			},
			getTtemDotInfo(item){
				if(item.page==='annotationList' && this.msgCount>0){
				  return this.msgCount
				}
				return '';
			}
		}
	}
</script>

<style>
  .line2-icon {
	width: 60px;
	height: 60px;
  }
</style>
