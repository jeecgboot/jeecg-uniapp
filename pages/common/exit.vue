<template>
	<view>
		<scroll-view :scroll-y="modalName==null" class="page" :class="modalName!=null?'show':''">
			<cu-custom bgColor="bg-gradual-pink" :isBack="false">
				<!-- <block slot="backText">返回</block> -->
				<block slot="content">退出页</block>
			</cu-custom>
			<view class="solids-bottom padding-xs flex align-center">
				<view class="flex-sub text-center">
					<view class="solid-bottom text-xsl padding">
						<text class=" cuIcon-roundcheckfill text-green"></text>
					</view>
					<view class="padding">{{item.msg}}</view>
				</view>
			</view>
			<view class="padding flex flex-direction">
				<button class="cu-btn bg-green shadow-blur round lg" @tap="goback()">返回登录
				</button>
			</view>
		</scroll-view>
	</view>

</template>

<script>
	import api from "@/api/api";
	
	export default {
		data() {
			return {
				modalName: null,
				item:{msg:'退出成功'},
			}
		},
		onLoad: function (option) {
			api.logout().then(res=>{
				uni.clearStorageSync()
			})
		},
		methods: {
			goback(){
				uni.navigateTo({
					url:'/pages/login/login'
				})
			}
		}
	}
</script>

<style>
</style>
