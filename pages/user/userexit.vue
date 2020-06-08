<template name="user">
	<view>
		<scroll-view scroll-y class="page">
			<image src="/static/componentBg.png " mode="widthFix" class="response"></image>
			<view class="nav-list">
				<navigator hover-class="none" :url="'/pages/common/' + item.name" class="nav-li" navigateTo :class="'bg-'+item.color"
				 :style="[{animation: 'show ' + ((index+1)*0.2+1) + 's 1'}]" v-for="(item,index) in elements" :key="index">
					<view class="nav-title">{{item.title}}</view>
					<view class="nav-name">{{item.name}}</view>
					<text :class="'cuIcon-' + item.cuIcon"></text>
				</navigator>
			</view>
			<view class="cu-tabbar-height"></view>
		</scroll-view>
	</view>
</template>

<script>
	export default {
		name: 'user',
		data() {
			return {
				elements: [{
						title: '退出',
						name: 'exit',
						color: 'cyan',
						cuIcon: 'newsfill',
						auth: 'ac'
					}
				],
			}
		},
		methods: {}
	}
</script>

<style>

</style>
