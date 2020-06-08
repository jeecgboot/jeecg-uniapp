let BASE_URL = ''


if (process.env.NODE_ENV == 'development') {
    BASE_URL = 'http://127.0.0.1:8080/jeecg-boot' // 开发环境
} else {
	BASE_URL = 'http://boot.jeecg.org:8080/jeecg-boot' // 生产环境
}
let staticDomainURL = BASE_URL+ '/sys/common/static';

const configService = {
	apiUrl: BASE_URL,
	staticDomainURL: staticDomainURL
};

export default configService