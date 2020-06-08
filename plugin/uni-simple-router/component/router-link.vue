<template>
	<view @click="gotoPage()"><slot></slot></view>
</template>

<script>
const navType = {
	push: 'push',
	replace: 'replace',
	replaceAll: 'replaceAll',
	pushTab: 'pushTab'
};
export default {
	props: {
		to: {
			type: [String, Object],
		},
		stopNavto: {
			type: Boolean,
			default: false
		},
		navType: {
			type: String,
			default: 'push'
		},
		level: {
			type: Number,
			default: 1
		},
		append: {
			type: Boolean,
			default: false
		}
	},
	methods: {
		formatNav(text) {
			if (text != null && text.constructor === String) {
				text = text.replace(/\'/g, '');
				text = text.replace(/(\w+)(?=:)/g, function(val) {
					return `"${val}"`;
				});
				text = text.replace(/:\s*([^,{}\s"]+)/g, function(val) {
					const arr = val.split(':');
					return `:"${arr[1].trim()}"`;
				});
				try {
					text = JSON.parse(text);
				} catch (e) {}
			}
			if (this.append) {
				let pathArr = this.$Route.path.split('/');
				pathArr.splice(pathArr.length - this.level, this.level);
				pathArr = pathArr.join('/');
				if (text.constructor === Object) {
					if (text.path) {
						text.path = pathArr + text.path;
					}
				} else {
					text = pathArr + text;
				}
			}
			return text;
		},
		gotoPage() {
			if (this.stopNavto) {
				return true;
			}
			const type = navType[this.navType];
			if (type == null) {
				return console.error(` "navType" unknown type \n\n value：${Object.values(navType).join('、')}`);
			}
			const navInfo = this.formatNav(this.to);

			this.$Router[type](navInfo);
		}
	}
};
</script>

<style></style>
