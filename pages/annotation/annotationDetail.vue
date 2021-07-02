<template>
	<view class="bg-white" style="height: 100vh;">
		<cu-custom :bgColor="NavBarColor" :isBack="true" backFlag="navigate">
			<block slot="backText">返回</block>
			<block slot="content">详情</block>
		</cu-custom>
		<view>
			<view class="title">
				<view class="padding" style="font-family: '宋体';">
					<text class="text-black title text-bold text-xl">{{annotation.titile}} </text>
				</view>
			</view>
			<view class=" text-df padding-left " style="color: #999;">
				<text class="title padding-right-xl" style="color: #999;">
					{{annotation.sender||''}}
				</text>	
				<text  class="" v-html="annotation.sendTime">
				</text>
			</view>
			<view class="desc" style="font-family: '仿宋';font-size: 18px;">
				<view class="text-content padding" v-html="annotation.msgContent">
					<!-- <annotation-block :content="annotation.msgContent"/> -->
				</view>
			</view>
			<view class="text-gray padding-left padding-bottom text-gray">
				<text class="cuIcon-attentionfill margin-lr-xs" @click="numberPlus"></text> 10
				<text class="cuIcon-appreciatefill padding-left margin-lr-xs" @click="numberPlus"></text> 20
			</view>
		</view>
	</view>
</template>

<script>


export default {
	data(){
		return{
			NavBarColor:this.NavBarColor,
			annotation:{
				id:"",
				titile:"",
				startTime:"",
				sender:"",
				msgContent:"",

			},
			goodNumber:null,
			flg:true,
		}
	},
	// onLoad:function(){
	// 	console.log("this.$Route.query",this.$Route);
	// 	let query = this.$Route.query
	// 	if(query){
	// 		this.annotation = query;
	// 		}
	// },
	onLoad: function (option) {
	    const annItem = JSON.parse(decodeURIComponent(option.item));
		console.log("ann",annItem)
		this.annotation = annItem 
		this.readOk();
	},
	created(){
		console.log("created")
		//this.readOk();
	},
	methods:{
		readOk(){
			console.log("readOk")
			let param = {anntId:this.annotation.anntId}
			this.$http.put('/sys/sysAnnouncementSend/editByAnntIdAndUserId',param);
		},

		numberPlus(){
			if (this.flg){
				this.goodNumber++
				this.flg = false
			} else {
				this.goodNumber--
				if (this.goodNumber == 0){
					this.goodNumber = null
				}
				this.flg = true
			}
		}
	}
}
</script>

<style>
</style>
