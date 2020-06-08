<template>
		<view class="cu-form-group">
			<view class="title">{{label}}</view>
		<picker @change="PickerChange" :value="index" :range-key="rangeKey" :range="dictOptions">
			<view class="picker">
				{{index>-1?dictOptions[index][rangeKey]:'请选择'}}
			</view>
		</picker>
		</view>
</template>

<script>
	export default {
		name: 'MySelect',
		props: {
			dictCode: String,
			value: String,
			label:String,
			rangeKey:{type:String,default:'label'},
			valueKey:{type:String,default:'value'},
			searchUrl:String,

		},
		watch: {
			dictCode: {
				immediate: true,
				handler() {
					this.initDictData()
				},
			},
		},
		computed: {
			
		},
		data() {
			return {
				dictOptions: [],
				index: -1,
			}
		},
		methods: {
			initDictData() {
				//根据字典Code, 初始化字典数组
				if (this.searchUrl){
					this.$api.get(this.searchUrl,{"code":this.dictCode}).then(res=>{
						this.dictOptions=res;
						this.getIndex()
					})
				}else{
					this.$api.getDict(this.dictCode).then(res => {
						this.dictOptions = res;
						this.getIndex()
					})
				}
			},
			PickerChange(e) {
				this.index=e.detail.value
				if(this.index==-1){
					this.index=0
					this.$emit('input',this.dictOptions[0][this.valueKey])
				}else{
					this.$emit('input', this.dictOptions[this.index][this.valueKey]);
				}
			},
			getIndex() {
				for (var i = 0; i < this.dictOptions.length; i++) {
					if (this.dictOptions[i].value == this.value) {
						this.index = i
						return
					}
				}
				this.index=-1
			},
		}
	}
</script>

<style>

</style>
