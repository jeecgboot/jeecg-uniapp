<template>
	<view>
		<home :cur="PageCur" v-if="PageCur=='home'" :key="commponent1Key"></home>
		<people v-if="PageCur=='people'" :key="commponent2Key"></people>
		<view class="cu-bar tabbar bg-white shadow foot">
			<view :class="PageCur=='home'?'action text-green':'action text-gray'" @click="NavChange" data-cur="home">
				<view class='cuIcon-homefill'></view>主页
			</view>
			<view :class="PageCur=='peoplelis'?'action text-green':'action text-gray'" @click="NavChange" data-cur="peoplelis">
				<view class='cuIcon-peoplelist'></view>审批
			</view>
			<view :class="PageCur=='profile'?'action text-green':'action text-gray'" @click="NavChange" data-cur="profile">
				<view class='cuIcon-profile'></view>发起
			</view>
			<view :class="PageCur=='people'?'action text-green':'action text-gray'" @click="NavChange" data-cur="people">
				<view class='cuIcon-people'></view>个人
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
		return {
				PageCur: 'home',
				commponent1Key: 0,
				commponent2Key: 0,
			}
		},
		onLoad:function(){
			this.PageCur='home'
			++this.commponent1Key
			++this.commponent2Key
		},
		methods: {
			NavChange: function(e) {
				this.PageCur = e.currentTarget.dataset.cur
			}
			
		}
	}
</script>

<style>

</style>
