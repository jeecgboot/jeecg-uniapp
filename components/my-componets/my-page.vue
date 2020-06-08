<template>
	<view>
		<scroll-view :scroll-y="modalName==null" class="page" :class="modalName!=null?'show':''">
			<cu-custom bgColor="bg-gradual-pink" :isBack="true">
				<block slot="backText">{{back}}</block>
				<block slot="content">{{title}}</block>
			</cu-custom>
			<slot></slot>
		</scroll-view>
	</view>
</template>

<script>
	export default {
		name: 'MyPage',
		props: {
			title: {
				type: String,
				default: '标题'
			},
			back: {
				type: String,
				default: '返回'
			},
			modalName:  {
				type: String,
				default: null
			},
		},
		watch: {

		},
		computed: {

		},
		data() {
			return {
				
			}
		},
		methods: {}
	}
</script>

<style>
</style>
