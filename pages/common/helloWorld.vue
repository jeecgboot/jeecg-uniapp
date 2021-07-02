<template>
	<view>
		<scroll-view :scroll-y="modalName==null" class="page" :class="modalName!=null?'show':''">
			<cu-custom bgColor="bg-gradual-pink" :isBack="true">
				<block slot="content">helloWorld</block>
			</cu-custom>
			
			<view class="padding flex flex-direction">
				<app-select label=" 类    型：" v-model="type" placeholder="请选择类型" :dict="plan_type" space ></app-select>
			</view>
			
			<view class="padding flex flex-direction">
			  <my-date label="开始时间：" v-model="beginTime" placeholder="请选择开始时间" required fields="minute"></my-date>
			</view>
			
			
			<view class="padding flex flex-direction">
			  <uni-calendar :showMonth="true" :selected="selected" />
			</view>
			
			
			<view class="padding flex flex-direction">
			  <my-image-upload />
			</view>
			
		</scroll-view>
	</view>

</template>

<script>
	const plan_type = [{text:'日常记录',value:'1'},{text:'本周工作',value:'2'},{text:'下周计划',value:'3'}];
	import appSelect from '@/components/my-componets/appSelect.vue'
	import myImageUpload from '@/components/my-componets/my-image-upload.vue'
	import myDate from '@/components/my-componets/my-date.vue'
	
	
	export default {
		components:{
		    appSelect,myImageUpload,myDate
		 },
		data() {
			return {
				modalName: null,
				item:{msg:'退出成功'},
				plan_type,
				type:"1",
				selected:[],
				beginTime:''
			}
		},
		methods: {
			
		}
	}
</script>

<style>
</style>
