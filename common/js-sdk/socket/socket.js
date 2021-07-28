import configService from '@/common/service/config.service.js';
import store from '@/store/index.js';
class socket {
	constructor(options) {
		this.socketUrl = configService.apiUrl;
		this.socketStart = false;
		this.monitorSocketError();
		this.monitorSocketClose();
		this.socketReceive();
	}
	init(socket_type,callback) {
		const _this = this;
		if (configService.apiUrl) {
			if(this.socketStart){
				console.log('webSocket已经启动了');
			}else{
				let userid=store.state.userid?store.state.userid:store.getters.userid;
				let url=this.socketUrl.replace("https://","wss://").replace("http://","ws://")+"/"+socket_type+"/"+userid+"_app";
				console.log("启动this.socketUrl连接地址:",url);
				
				uni.connectSocket({
					url: url,
					method: 'GET'
				});
				uni.onSocketOpen((res) => {
					this.socketStart = true;
					callback && callback();
					console.log('WebSocket连接已打开！');
				});
				/*setTimeout(() => {
				   _this.getHeartbeat();
				}, 5000);*/
			}
		}else{
			console.log('config/baseUrl socketUrl为空');
		}
	}
	//Socket给服务器发送消息
	send(data, callback) {
		const _this = this;
		if (store.state.userid) {
			data.userUid =store.state.userid;
		}
		console.log(data);
		uni.sendSocketMessage({
			data: JSON.stringify(data),
			success: () => {
				callback && callback(true);
			},
			fail: () => {
				callback && callback(false);
			}
		});
	}
	//Socket接收服务器发送过来的消息
	socketReceive() {
		const _this = this;
		uni.onSocketMessage(function(res) {
			console.log("APP:----》收到服务器内容:",res);
			let data = JSON.parse(res.data);
			//console.log('收到服务器内容：', data);
			_this.acceptMessage && _this.acceptMessage(data);
		});
	}
	//关闭Socket
	closeSocket() {
		const _this = this;
		uni.closeSocket();
		_this.socketStart = false;
	}
	//监听Socket关闭
	monitorSocketClose() {
		const _this = this;
		uni.onSocketClose(function(res) {
			console.log('WebSocket 已关闭！');
			_this.socketStart = false;
			setTimeout(function() {
				//_this.init();
			}, 3000); 
		});
	}
	//监听Socket错误
	monitorSocketError() {
		const _this = this;
		uni.onSocketError(function(res) {
			_this.socketStart = false;
			console.log('WebSocket连接打开失败，请检查！');
		});
	}
	//心跳
	getHeartbeat() {
		const _this = this;
		this.send({
			type: "心跳",
			userUid: store.state.userid
		}, (val) => {
			setTimeout(() => {
				if (val) {
					//_this.getHeartbeat();
				} else {
					if(!_this.socketStart){
						//_this.init();
					}
				}
			}, 10000);
		});
	}
};
const mySocket = new socket();
export default mySocket;
