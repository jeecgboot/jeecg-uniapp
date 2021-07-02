<template>

	<view>
		<view class="cu-bar fixed" :style="style" :class="[NavBarColor]">
			<view class="cuIcon-back margin-left" @tap="backRoute()"><text class="margin-left-sm">返回</text></view>
			<view class="content" :style="[{top:StatusBar + 'px'}]">
				通讯录
			</view>
		</view>
		<!-- 展示标题 -->
		<view class="bg-gray text-gray padding" :style="[{marginTop:CustomBar+'px'}]">
			{{ levelTitle }}
		</view>
		<!-- 展示部门和用户 -->
		<view class="cu-list menu sm-border">
			<view class="cu-item" v-for="(item, index) in comList" :key="item.key" @tap="goMember(item)">
				<image class="line2-icon" src="/static/folder.png"></image>
				<view class="content margin-left-sm">
					<view class="text-grey">{{item.title}}</view>
				</view>
			</view>
			<view class="cu-item" v-for="(item,index) in childrenUserList" :key="index" @click="goMemberInfo(item)">
				<view class="cu-avatar round lx" :style="[{backgroundImage:'url('+ item.avatar +')'}]"></view>
				<view class="content margin-left-sm">
					<view class="text-grey">{{item.realname}}</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import { getFileAccessHttpUrl } from "../../api/api.js"
export default {
	name: "level-address-book",
	data(){
		return{
			CustomBar:this.CustomBar,
			StatusBar:this.StatusBar,
			NavBarColor:this.NavBarColor,
			value:"",
			derpartment:'通讯录',
			comList:[],
			childrenUserList:[],
			metaList:[],
			depart2Url:'/sys/sysDepart/queryTreeList',
			queryTreeByKeyWord:'/sys/sysDepart/queryTreeByKeyWord',
			queryUserByDid:'/sys/user/appQueryByDepartId',
			// departUrl:'/sys/user/userDepartList',
			level:0,
			titleArray:[],
			parentId:''
		}
	},
	computed:{
		levelTitle(){
			if(this.titleArray && this.titleArray.length>0){
				return  this.titleArray.join(' > ')
			}
			console.log("this.titleArray",this.titleArray)
			return '企业通讯录'
		},
		style() {
			var StatusBar= this.StatusBar;
			var CustomBar= this.CustomBar;
			var style = `height:${CustomBar}px;padding-top:${StatusBar}px;`;
			return style
		}
	},
	onLoad() {
		console.log("this.CustomBar",this.CustomBar)
		this.loadList()
	},
	methods: {
		backRoute() {
			console.log("this.level",this.level)
			console.log("this.parentId",this.parentId)
			if(this.level==0){
				// 返回首页
				this.$Router.replaceAll({name: 'index'})
			}else{
				//正常列表的回退 只要找parentId的parent的data
				this.getCyclePnode(this.metaList,'');
				//还需要设置 title
				this.titleArray.pop();
				this.level--;
			}
		},
		onRefresh(){
			this.comList=[]
			this.childrenUserList=[]
			this.titleArray=[]
			this.loadList()
		},
		loadList() {
			console.log("loadList==>$Route",this.$Route)
			if(this.$Route.query.level){
				let params=this.$Route.query
				this.level=params.level;
				this.comList=params.comList;
				this.metaList=params.metaList;
				this.childrenUserList=params.childrenUserList;
				this.derpartment=params.derpartment;
				this.parentId=params.parentId;
				this.titleArray=params.titleArray;
				return;
			}

			this.$http.get(this.queryTreeByKeyWord).then(res => {
				console.log("部门通讯树：：", res)
				if (res.data.success) {
					console.log("部门：：", res.data.result.departList)
					if(res.data.result.departList && res.data.result.departList.length >0){
						for (let item of res.data.result.departList) {
							console.log("item::",item);
							this.comList.push(item)
							this.metaList.push(item)
						}
						this.derpartment = this.comList[0].title
					}
				}
			}).catch(e => {
				console.log("queryTreeByKeyWord 请求错误", e)
			})
		},
		getUser(departId,title){
			this.$http.get(this.queryUserByDid,{params:{departId:departId}}).then(res => {
			  this.childrenUserList=res.data.result;
			  for(let item of this.childrenUserList){
				  item.departName=title
				  this.avatarHandler(item)
			   }
			})
		},
		avatarHandler(item){
			let avatar = item.avatar
			if(avatar){
				let url = getFileAccessHttpUrl(avatar);
				item.avatar = url
			}else{
				if(item.sex=='2'){
					item.avatar = 'https://static.jeecg.com/upload/test/avatar_girl_1595818025488.png';
				}else{
					item.avatar = 'https://static.jeecg.com/upload/test/avatar_boy_1595818012577.png';
				}
			}

		},
		goMember(item){
			let params = {...item}
			if (params.children && params.children.length>0){
				this.level++;
				this.comList=[];
				this.childrenUserList=[];
				for (let item of params.children) {
				  this.comList.push(item)
				}
				this.getUser(params.id,params.title)
				this.titleArray.push(params.title);
				this.parentId = params.id;
				this.derpartment = params.title;
			}else{
				console.log("params==>toMember",params)
				params.level=this.level;
				params.comList=this.comList;
				params.metaList=this.metaList;
				params.childrenUserList=this.childrenUserList;
				params.derpartment=this.derpartment;
				params.parentId=this.parentId;
				params.titleArray=this.titleArray;
				this.$Router.push({name: 'member',params:params})
			}
		},
		getCyclePnode(arr, pid){
			for(let item of arr){
				if(item.id == this.parentId){
					this.comList = arr;
					this.childrenUserList=[];
					this.derpartment = this.comList[0].title
					this.parentId = pid;
					this.getUser(this.parentId,item.title)
					break;
				}
				if(item.children && item.children.length>0){
					this.getCyclePnode(item.children, item.id)
				}

			}
		},
		goMemberInfo: function (item){
			console.log("item",item)
			
			let parmas = {...item}
			console.log("parmas",parmas)
			parmas.page='levelAddressBook'
			this.$Router.push({name: 'addressDetail',params:parmas})
		},
	}
}
</script>

<style>
	  .line2-icon {
		width: 25px;
		height: 20px;
	  }
</style>
