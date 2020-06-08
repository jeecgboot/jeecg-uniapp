//APP更新

export default function appUpdate() {
	uni.request({
		url: 'http://app.jeecg.com/update.json', //检查更新的服务器地址
		data: {
			appid: plus.runtime.appid,
			version: plus.runtime.version,
			imei: plus.device.imei
		},
		success: (res) => {
			plus.runtime.getProperty(plus.runtime.appid, function(wgtinfo) {
				let client_version = wgtinfo.version
				var flag_update = client_version.split(".").splice(0, 2).join(".") != res.data.version.split(".").splice(0, 2)
					.join(".")
				var flag_hot = (Number(client_version.split(".")[2]) < Number(res.data.version.split(".")[2])) & !flag_update
				console.log(client_version)
				console.log(flag_update)
				console.log(flag_hot)

				if (flag_update) {
					// 提醒用户更新
					uni.showModal({
						title: '更新提示',
						content: res.data.note,
						success: (showResult) => {
							if (showResult.confirm) {
								plus.nativeUI.toast("正在准备环境，请稍后!");
								console.log(res.data.url, )
								var dtask = plus.downloader.createDownload(res.data.url, {
									method: 'GET',
									filename: '_doc/update/'
								}, function(d, status) {
									if (status == 200) {
										var path = d.filename; //下载apk
										plus.runtime.install(path); // 自动安装apk文件
									} else {
										plus.nativeUI.alert('版本更新失败:' + status);
									}
								});
								dtask.start();
							}
						}
					})
				} else if (flag_hot) {
					uni.downloadFile({
						url: res.data.wgtUrl,
						success: (downloadResult) => {
							console.log(downloadResult.tempFilePath)
							if (downloadResult.statusCode === 200) {
								plus.nativeUI.toast(`正在热更新!${res.data.versionCode}`);
								plus.runtime.install(downloadResult.tempFilePath, {
									force: false
								}, function() {
									plus.nativeUI.toast("热更新成功");
									plus.runtime.restart();
								}, function(e) {
									console.log(e)
									plus.nativeUI.toast(`热更新失败:${e.message}`);
								});
							}
						}
					});
				}

			});




		}
	})
}
