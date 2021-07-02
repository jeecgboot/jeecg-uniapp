<template>
	<view>
		<map
			style="width: 100%; height:250px;"
			:latitude="latitude"
			:longitude="longitude"
			:markers="marker"
			:scale="scale"
			:circles="circles"
		>
		<!--  :circles="circles" -->
		</map>
	</view>
</template>

<script>
	import { geoDistance } from '@/common/util/util.js'
	import amap from "@/common/js-sdk/js-amap/amap-wx.js";
	// #ifdef H5
	import AMap  from "@/common/js-sdk/js-amap/amap-h5.js";
	// #endif
	
	export default {
		 props:{
			compLatitude:{
				type:Number,
				default:40.009390,
				required:false
			},
			compLongitude:{
				type:Number,
				default:116.374322,
				required:false
			}
		},
		data() {
			return {
				amapPlugin:null,
				wxMapKey:"53324ee357405c4a65f35a1aa05ffaf2",
				id:0,
			    title: 'map',
				distance:0,
				address:"",
		   　   latitude: this.compLatitude,  //纬度
			    longitude: this.compLongitude,  //经度
				scale:16,//地图缩放程度
				tipText:'打卡范围',
				bgColor:'#00c16f',
			    marker: [],
			　  circles:[{//在地图上显示圆
				  　　latitude: this.compLatitude,
				  　　longitude: this.compLongitude,
				  　　radius:80,//半径
					  fillColor:"#ffffffAA",//填充颜色
				  　　color:"#55aaffAA",//描边的颜色
				 　　 strokeWidth:1//描边的宽度
				}],
				resAmap:null
			}
		},
	    created() {
			// #ifdef MP-WEIXIN || APP-PLUS
	    	this.amapPlugin = new amap.AMapWX({
	    	    key: this.wxMapKey
	    	});
			// #endif
			
			// #ifdef H5
			this.initAMap()
			// #endif
	    },
		mounted() {
			// #ifdef MP-WEIXIN
			  this.getAuthorizeInfo();
			// #endif
			// #ifdef APP-PLUS
			  this.getLocationInfoWx();
			// #endif
			// #ifdef H5
			  //this.getLocationInfo()
			// #endif
		},
		computed:{
		  inCircle(){
			return this.address && this.distance <= 80
		  }
		},
		methods: {
			allowed(){
				return this.inCircle
			},
			getMyAddress(){
				return this.address
			},
			refreshLocation(){
				// #ifdef MP-WEIXIN
				  this.getAuthorizeInfo();
				// #endif
				// #ifdef APP-PLUS
				  this.getLocationInfoWx();
				// #endif
				// #ifdef H5
				  this.initAMap()
				// #endif
			},
			getAuthorizeInfo(){
				//1. uniapp弹窗弹出获取授权（地理，个人微信信息等授权信息）弹窗
				var _this=this;
				uni.authorize({
					scope: "scope.userLocation",
					success() { //1.1 允许授权
						_this.getLocationInfoWx();
					},
					fail(){    //1.2 拒绝授权
						console.log("你拒绝了授权，无法获得周边信息")
						_this.openConfirm();
					}
				})
			},
			getLocationInfoWx(){
				var that=this;
				this.amapPlugin.getRegeo({
				    type: 'gcj02', //map 组件使用的经纬度是国测局坐标， type 为 gcj02
				    success: function(res) {
						console.log("success",res);
						that.latitude = res[0].latitude;
						that.longitude = res[0].longitude;
						that.address = res[0].name + res[0].desc;
						that.distance=geoDistance(that.longitude, that.latitude,that.compLongitude,that.compLatitude)
						console.log("that.distance",that.distance);
						let tipText=(that.distance>80?"未在":"已在")+"打卡范围内";
						let bgColor=that.distance>80?"#ff0000":"#00c16f";
						let marker={
							   id:0,
						   　　latitude:that.latitude,//纬度
						   　　longitude:that.longitude,//经度
						       iconPath: '/static/location.png',
							   width:35,
							   height:35,
							   // #ifdef MP-WEIXIN
							   label:{//为标记点旁边增加标签
							 　　  content:tipText,//文本
						   　　　  color:'#ffffff',//文本颜色
								　 fontSize:14,//文字大小
								   borderWidth:2,//边框宽度
								   borderColor:bgColor,//边框颜色 
								   bgColor:bgColor,//背景颜色
								　 borderRadius:2,//边框圆角  
								　 padding:5,//文本边缘留白
								   textAlign:'center',//文本对齐方式
								   x:0,//label的坐标，原点是 marker 对应的经纬度
								   y:0,//label的坐标，原点是 marker 对应的经纬度 
							    }, 
							   // #endif
							   // #ifdef APP-PLUS
							   callout:{//自定义标记点上方的气泡窗口 点击有效
							   　　content:tipText,//文本
							   　　color:'#ffffff',//文字颜色
							   　　fontSize:14,//文本大小
							   　　//borderRadius:2,//边框圆角
							  　　 bgColor:bgColor,//背景颜色
							   　　display:'ALWAYS',//常显
								   textAlign:'center'
							    },
							   // #endif
						    }
							that.marker=[marker];
				    },
				    fail: (res) => {
				      console.log(JSON.stringify(res));
				    }
				 });
			},
			getLocationInfo() {
				var _this=this;
				uni.showLoading({
					title: '获取信息中',
					mask:true
				});
				uni.getLocation({
					//type: 'wgs84',
					type:'gcj02',
					success: function (res) {
						console.log('当前位置的经度：' + res.longitude);
						console.log('当前位置的纬度：' + res.latitude);
					    _this.distance=geoDistance(res.longitude, res.latitude,_this.compLongitude,_this.compLatitude)
						let tipText=(_this.distance>80?"未在":"已在")+"打卡范围内";
						let bgColor=_this.distance>80?"#ff0000":"#00c16f";
						_this.longitude=res.longitude
						_this.latitude=res.latitude
						let marker={
					       　　latitude: res.latitude,//纬度
					       　　longitude:res.longitude,//经度
					       　　callout:{//自定义标记点上方的气泡窗口 点击有效
					    	   　　content:tipText,//文本
					    	   　　color:'#ffffff',//文字颜色
					    	   　　fontSize:14,//文本大小
					    	   　　borderRadius:2,//边框圆角
					    	  　　 bgColor:bgColor,//背景颜色
					    	   　　display:'ALWAYS'//常显
					           }
					        }
							_this.marker=[marker];
					},
					fail: function (res){
						console.log('getLocation==> fail：' + res);
						console.log(res);
					}
				});
				uni.hideLoading();
			},
			 // 当用户第一次拒绝后再次请求授权
			openConfirm(){
				uni.showModal({
					title: '请求授权当前位置',
					content: '需要获取您的地理位置，请确认授权',
					success: (res)=> {
						if (res.confirm) {
							uni.openSetting();// 打开地图权限设置
						} else if (res.cancel) {
							uni.showToast({
								title: '你拒绝了授权，无法获得位置信息',
								icon: 'none',
								duration: 1000
							})
						}
					}
				});
			},
		  // 根据坐标返回地址(逆地理编码)
	      /* async getAddress (points) {
			  try {
			  	this.resAmap = await AMap();
			  	this.$nextTick(function() {
			  		this.resAmap.plugin('AMap.Geocoder', () => {
			  			var geocoder  = new this.resAmap.Geocoder({
			  				radius: 1000,
						});
			  			geocoder.getAddress(points, (status, result) => {
							if (status === 'complete' && result.regeocode) {
							  this.address = result.regeocode.formattedAddress
							}
						})
			  		});
			  	})
			  } catch (e) {
			  	console.log(e)
			  }
			}, */
			// #ifdef H5
			async initAMap() {
				try {
					uni.showLoading({
						title: '定位中...',
						mask:true
					});
					this.resAmap = await AMap();
					this.$nextTick(function() {
						this.resAmap.plugin('AMap.Geolocation', () => {
							var geolocation = new this.resAmap.Geolocation({
								enableHighAccuracy: true, //是否使用高精度定位，默认:true
								timeout: 10000, //超过10秒后停止定位，默认：5s
								buttonPosition: 'RB', //定位按钮的停靠位置
								// buttonOffset: new AMap.Pixel(10, 20),//定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
								zoomToAccuracy: true, //定位成功后是否自动调整地图视野到定位点
					
							});
							geolocation.getCurrentPosition(function(status, result) {
								if (status == 'complete') {
									onComplete(result)
								} else {
									onError(result)
								}
							});
					
						});
						
						//解析定位结果
						var _this = this;
					
						function onComplete(data) {
							console.log("H5高德定位",data) 
							console.log('当前位置的经度：' + data.position.lat);
							console.log('当前位置的纬度：' + data.position.lng);
							_this.distance=geoDistance(data.position.lng, data.position.lat,_this.compLongitude,_this.compLatitude)
							let tipText=(_this.distance>80?"未在":"已在")+"打卡范围内";
							let bgColor=_this.distance>80?"#ff0000":"#00c16f";
							_this.longitude=data.position.lng
							_this.latitude=data.position.lat
							_this.address=data.formattedAddress
							let marker={
							   　　latitude: _this.latitude,//纬度
							   　　longitude:_this.longitude,//经度
							   　　callout:{//自定义标记点上方的气泡窗口 点击有效
								   　　content:tipText,//文本
								   　　color:'#ffffff',//文字颜色
								   　　fontSize:14,//文本大小
								   　　borderRadius:2,//边框圆角
								  　　 bgColor:bgColor,//背景颜色
								   　　display:'ALWAYS'//常显
							       }
							    }
								_this.marker=[marker];
								uni.hideLoading();
								_this.$tip.success("定位成功")
						}
					
						function onError(data) {
							console.log(data) // 定位失败的信息
						}
					
					})
				} catch (e) {
					console.log(e)
				   _this.$tip.alert("定位失败")
			    }
			}, 
			// #endif
			
		}
	}
</script>

<style>

</style>
