<template>
	<view class="margin-top">
		<view class="cu-bar bg-white ">
			<view class="action">
				{{label}}
			</view>
			<view class="action">
				{{imgList.length}}/{{maxImg}}
			</view>
		</view>
		<view class="cu-form-group">
			<view class="grid col-4 grid-square flex-sub">
				<view class="bg-img" v-for="(item,index) in imgList" :key="index" @tap="ViewImage" :data-url="imgList[index]">
					<image :src="imgList[index]" mode="aspectFill"></image>
					<view class="cu-tag bg-red" @tap.stop="DelImg" :data-index="index">
						<text class='cuIcon-close'></text>
					</view>
				</view>
				<view class="solids" @tap="ChooseImage" v-if="imgList.length<maxImg">
					<text class='cuIcon-cameraadd'></text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	
	export default {
		name: 'MyImageUpoad',
		props: {
			value: {type:String,default:''},
			label:{type:String,default:'图片上传'},
			maxImg: {
				type: Number,
				default: 3
			},

		},
		mounted:function(){
			if (this.value.split(',')!=''){
				this.value.split(',').forEach(res=>{
					this.imgList.push(baseurl+res)
				})
			}
		},
		data() {
			return {
				imgList: [],
				pathlist:[],
			}
		},
		methods: {
			ChooseImage() {
				uni.chooseImage({
					count: this.maxImg, //默认9
					sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
					sourceType: ['album','camera'], //从相册选择
					success: (res) => {
						uni.uploadFile({
							url: `${baseurl}systemController/filedeal.do?isup=1`,
							filePath: res.tempFilePaths[0],
							name: 'file',
							success: (uploadFileRes) => {
								let path = JSON.parse(uploadFileRes.data).obj
								this.pathlist.push(path);
								this.$emit('input',this.pathlist.join(','))
								if (this.imgList.length != 0) {
									this.imgList = this.imgList.concat(res.tempFilePaths)
								} else {
									this.imgList = res.tempFilePaths
								}
							}
						})

					}
				});
			},
			ViewImage(e) {
				uni.previewImage({
					urls: this.imgList,
					current: e.currentTarget.dataset.url
				});
			},
			DelImg(e) {
				uni.showModal({
					title: '提示',
					content: '确认要删除吗',
					cancelText: '取消',
					confirmText: '确认',
					success: res => {
						if (res.confirm) {
							this.pathlist.splice(e.currentTarget.dataset.index,1)
							this.imgList.splice(e.currentTarget.dataset.index, 1)
							this.$emit('input',this.pathlist.join(','))
						}
					}
				})
			},
		}
	}
</script>

<style>

</style>
