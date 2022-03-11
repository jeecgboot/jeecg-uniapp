/**
 * 下了列表混入
 * @type {{data(): *, methods: {upCallback(*): void, downCallback(): void, loadList(*): void}}}
 */
const ListMixin = {
	data() {
		return {
			downOption:{
				auto:false,//是否在初始化完毕之后自动执行下拉回调callback; 默认true
			},
			upOption:{
				page:{
				  num : 0 ,
				  size : 8 ,
				  time : null
				}
			},
			queryParam:{
				pageNo:1,
				pageSize:8
			},
			list:[],
			pageNo:1,
			pageSize:8,
		}
	},
	methods: {
		/*下拉刷新的回调 */
		downCallback(){
		//加载列表数据
		  this.loadList('down');
		},
		/*上拉加载的回调: 其中page.num:当前页 从1开始, page.size:每页数据条数,默认10 */
		upCallback(page) {
			let param = this.queryParam
				param.pageNo= page.num,
				param.pageSize= page.size
			
			if(page.num == 1){
				this.list = [];
			}
		 console.log("upCallback==param::",param)
		 this.$http.get(this.url,{params:param}).then(res=>{
		 	 console.log("upCallback请求返回res",res)
		 	 if(res.data.success){
		 		let rec=res.data.result.records;
				let hasNext=true;
				if(!rec || rec.length<this.pageSize){
				  console.log("加载完成!没有更多了")
				  hasNext=false;
				}
				 console.log("hasNext",hasNext)
				//方法四 (不推荐),会存在一个小问题:比如列表共有20条数据,每页加载10条,共2页.如果只根据当前页的数据个数判断,则需翻到第三页才会知道无更多数据.
				this.mescroll.endSuccess(rec.length);
				
				//设置列表数据
				this.list=this.list.concat(rec);
				this.$forceUpdate();
		 	  }else{
		 		this.mescroll.endErr();
		 	  }
		  }).catch(()=>{
		 		//加载失败, 结束
		 		this.mescroll.endErr();
		 })
		},
		loadList(flag){
		    let param = this.queryParam
				param.pageNo=this.pageNo,
				param.pageSize=this.pageSize
		    console.log("请求参数",param)
		    this.$http.get(this.url,{params:param}).then(res=>{
			if(res.data.success){
				console.log("请求返回res.data",res.data) 
				let rec=res.data.result.records
				if(flag=='down'){
					//下拉刷新成功的回调,隐藏下拉刷新的状态
					this.mescroll.endSuccess();	
				}
				//添加新数据
				this.list=rec;
				/* if(!rec || rec.length<this.pageSize){
				  console.log("加载完成!")
				} */
			  }else{
				  console.log("请求返回else",res) 
				this.mescroll.endErr();
			  }
		 }).catch((err)=>{
			 console.log("请求返回err",err) 
				//加载失败, 结束
				this.mescroll.endErr();
		}) 
		},
	}
	
}

export default ListMixin;
