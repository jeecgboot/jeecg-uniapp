<template>
	<view class="cu-form-group" style="z-index:10">
		<view class="flex align-center">
			<view class="title">
				<text class="text-red" v-if="required">*</text>
				<text space="ensp">{{label}}</text>
			</view>
			<picker
				 @change="pickerChange"
				 :range="selections"
				 :value="valueIndex"
				 :disabled="disabled">
				<input
				   :placeholder="placeholder"
				   name="input"
				   v-model="selected"
				   :disabled="true"
				></input>
			</picker>
		</view>
	</view>
</template>

<script>

    export default {
        name: "AppSecelt",
		behaviors: ['uni://form-field'],
        props:{
            display:{
                type:String,
                default:'inline-block',
                required:false
            },
            placeholder:{
                type:String,
                default:'请选择',
                required:false
            },
            label:{
                type:String,
                default:'',
                required:false
            },
            value:{
                type:String,
                required:false
            },
            border:{
                type:Boolean,
                default:false,
                required:false
            },
            dict:{
                type:Array,
                default:()=>[],
                required:true
            },
            name:{
                type:String,
                default:'',
                required:false
            },
			required:{
			    type:Boolean,
				default:false,
			    required:false
			},
			disabled:{
			    type:Boolean,
				default:false,
			    required:false
			},
			space:{
			    type:Boolean,
				default:false,
			    required:false
			}
        },
        data(){
            return {
                show:false,
                selected:'',
                valueIndex:0,
                selections:[]
            }
        },
        watch:{
            value:{
                immediate:true,
                handler(val){
                  if(!val){
                    this.selected = ''
                    this.valueIndex = 0
                }else{
                  this.dict.map((item,index)=>{
					 if(item.value == val){
                      this.selected = item.text;
                      this.valueIndex = index
					}
                  })
                }
              }
            },
            dict(){
                this.initSelections();
            }
        },
        created(){
            this.initSelections();
        },
        methods:{
            initSelections(){
                let arr = [];
                this.dict.map(item=>{
                    arr.push(item.text)
                });
                this.selections = arr
            },
            pickerChange(e){
				console.log("appselect::pickerChange",e.detail.value)
                let backString = '';
				let obj=this.dict[e.detail.value];
				this.selected=obj.text;
				backString=obj.value;
				console.log("backString",backString)
				console.log("this.selected",this.selected)
				
				this.$emit('input',backString);
				// #ifndef MP-WEIXIN
				this.$emit('change',backString);
				// #endif
            }
        },
        model: {
            prop: 'value',
			event:'change'
        }
    }
</script>

<style scoped>
	.cu-form-group uni-picker::after {
		font-family: cuIcon;
		display: block;
		content: "\e6a3";
		position: absolute;
		font-size: 14px;
		color: #FFFFFF;
		line-height: 42px;
		width: 25px;
		text-align: center;
		top: 0;
		bottom: 0;
		right: -8px;
		margin: auto;
	}
</style>
