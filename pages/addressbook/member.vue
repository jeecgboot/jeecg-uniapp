<template>
    <view>
        <view class="cu-bar fixed" :class="[NavBarColor]" :style="style" >
        	<view class="cuIcon-back margin-left" @tap="backRoute()"><text class="margin-left-sm">返回</text></view>
        	<view class="content" :style="[{top:StatusBar + 'px'}]">
        		{{ memberTitle }}
        	</view>
        </view>
		<!-- 展示部门和用户 -->
		<view class="cu-list menu-avatar sm-border" :style="[{marginTop:'calc('+CustomBar+ 'px + 10px)'}]">
		    <view class="cu-item" v-for="(item, index) in memberList" :key="index" @click="goMemberInfo(item)">
				<view class="cu-avatar round lg" :style="[{backgroundImage:'url('+ item.avatar +')'}]"></view>
				<view class="content">
					<view class="text-grey">{{item.realname}}</view>
					<view class="text-grey">{{item.post}}</view>
				</view>
			</view>
			<view class="text-center text-lg"><text>共{{ memberTotal}}人</text></view>
		</view>
    </view>
</template>

<script>
	import { getFileAccessHttpUrl } from "../../api/api.js"
    export default {
        name: "member",
        data(){
            return{
				CustomBar:this.CustomBar,
				StatusBar:this.StatusBar,
				NavBarColor:this.NavBarColor,
				departUrl:'/sys/sysDepart/queryTreeList',
                addressSourceUrl:'/sys/user/queryByOrgCodeForAddressList',
                queryByOrgCodeKeyword:'/sys/user/queryByOrgCodeKeyword',
                positionUrl:'/sys/position/list',
                value:'',
                memberTitle:'',
                memberList:[],
                userId:'',
                orgCode:'',
                ids:{},
                memberTotal:0,
            }
        },
        onLoad(){
			console.log("this.$Router", this.$Route);
            this.memberTitle = this.$Route.query.title
            this.orgCode = this.$Route.query.orgCode
            this.loadList()
		},
		computed:{
			style() {
				var StatusBar= this.StatusBar;
				var CustomBar= this.CustomBar;
				var style = `height:${CustomBar}px;padding-top:${StatusBar}px;`;
				return style
			}
		},
        methods: {
            backRoute() {
                this.$Router.push({name: 'levelAddressBook',params:this.$Route.query})
            },
            goMemberInfo(item){
                let parmas = {...item}
                parmas.orgCode= this.orgCode
                this.$Router.push({name: 'addressDetail',params:parmas})
            },
            loadList() {
                let param = {
                    orgCode:this.orgCode,
                    realname:this.value
                }
                this.$http.get(this.addressSourceUrl,{params:param}).then(res => {
                    console.log("用户2", res)
                    if (res.data.success) {
                        let memberArr = res.data.result.records;
                        //memberArr = memberArr.filter(item => item.departName == this.memberTitle)
                        for (let item of memberArr) {
							this.avatarHandler(item);
                            this.memberList.push(item)
                            // this.userId = item.userId
                            this.memberTotal = memberArr.length
                            if (this.memberTotal == undefined){
                                this.memberTotal = 0
                            }
                        }
                    }
                }).catch(e => {
                    console.log("请求错误", e)
                })

                this.$http.get(this.positionUrl).then(res=> {
                   console.log("用户1",res)
                    if (res.data.success) {
                        let postArr = res.data.result.records
                        for (let item of postArr ){
                            for (let it of this.memberList){
                                if (it.post == item.code){
                                    it.post = item.name
                                }
                            }
                        }
                    }
                }).catch(e=>{
                    console.log("请求错误",e)
                })
            },
			avatarHandler(item){
				let avatar = item.avatar
				if(avatar){
					let url = getFileAccessHttpUrl(avatar);
					item.avatar = url
				}else{
					if(item.sex=='2'){
						item.avatar = 'static/avatar_girl.png';
					}else{
						item.avatar = 'static/avatar_boy.png';
					}
				}
			
			},
        }
    }
</script>

<style scoped>
	
</style>