<template>
    <view>
		<cu-custom :bgColor="NavBarColor" :isBack="true">
			<block slot="backText">返回</block>
			<block slot="content">定位</block>
		</cu-custom>
		<map 
		style="width: 100%; height:500px;" 
		:latitude="latitude" 
		:longitude="longitude" 
		:markers="marker"
		:scale="scale"
		>
		</map>
    </view>
</template>

<script>
	export default {
	    data() {
	        return {
				NavBarColor:this.NavBarColor,
	            id:0, // 使用 marker点击事件 需要填写id
	            title: 'map',
	          　latitude: 40.009704,  //纬度
		　　    longitude: 116.374999,  //经度
		  　　　marker: [{
			   　　id:0,
			   　　latitude: 40.009704,//纬度
			   　　longitude: 116.374999,//经度
			   　　iconPath: '/static/location.png',    //显示的图标        
			   　　rotate:0,   // 旋转度数
			   　　width:20,   //宽
			   　　height:20,   //高
			  　　 title:'你在哪了',//标注点名
			  　　 alpha:0.5,   //透明度
			  　　 /* label:{//为标记点旁边增加标签   //因背景颜色H5不支持
				  　　 content:'北京国炬公司',//文本
				　　　 color:'red',//文本颜色
					　 fontSize:24,//文字大小
					   x:5,//label的坐标，原点是 marker 对应的经纬度
					   y:1,//label的坐标，原点是 marker 对应的经纬度 
					   borderWidth:12,//边框宽度
					   borderColor:'pink',//边框颜色    
					　 borderRadius:20,//边框圆角                        
					　 bgColor:'black',//背景色
					　 padding:5,//文本边缘留白
					   textAlign:'right'//文本对齐方式。
			   }, */
			   callout:{//自定义标记点上方的气泡窗口 点击有效  
			   　　content:'北京国炬公司',//文本
			   　　color:'#ffffff',//文字颜色
			   　　fontSize:14,//文本大小
			   　　borderRadius:2,//边框圆角
			  　　 bgColor:'#00c16f',//背景颜色
			   　　display:'ALWAYS'//常显
			   }
			   // anchor:{//经纬度在标注图标的锚点，默认底边中点
			   //     x:0,    原点为给出的经纬度
			   //     y:0,
			   // }
						
		   }],
		   scale:16,//地图缩放程度
	   　 　controls:[{//在地图上显示控件，控件不随着地图移动
		  　　id:1,//控件id
		  　　iconPath:'/static/login3.png',//显示的图标
		      clickable:true,
		  　　position:{//控件在地图的位置
			 　　left:15,
			 　　top:15,
			 　　width:50,
			 　　height:50
		 　　  },    
	   　　}], 
	   　 　circles:[{//在地图上显示圆
		  　　latitude: 40.009704,
		  　　longitude: 116.374999,
		  　　radius:50,//半径
		      fillColor:"#ffffffAA",//填充颜色
		  　　color:"#55aaffAA",//描边的颜色
		 　　 strokeWidth:1//描边的宽度
		  }], 
	   　/* 　polyline:[{//指定一系列坐标点，从数组第一项连线至最后一项
	   　　　　points:[
			  　　{latitude: 40.009153,longitude: 116.374935},
			 　　 {latitude: 40.009704,longitude: 116.374999},
	   　　　　],
	   　　　　color:"#0000AA",//线的颜色
	   　　　　width:2,//线的宽度
	   　　　　dottedLine:true,//是否虚线
	   　　　　arrowLine:true,    //带箭头的线 开发者工具暂不支持该属性
	   　　}], */
	     }
	    },
		onLoad() {
			this.getLocation()
		},
	    methods: {
			getLocation(){
				uni.getLocation({
				    type: 'gcj02',
				    success: function (res) {
				        console.log('当前位置的经度：' + res.longitude);
				        console.log('当前位置的纬度：' + res.latitude);
				    },
					fail: function (res) {
						 console.log('当前位置的经度');
					}	
				});
			}
	    }
	}
</script>

<style>
</style>
