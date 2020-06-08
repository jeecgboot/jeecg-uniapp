export const builtIn = [{
    path: '/preview-image',
    name: 'previewImage',
    component: {
        render: () => {},
    },
}, {
    path: '/choose-location',
    name: 'chooseLocation',
    component: {
        render: () => {},
    },
}, {
    path: '/open-location',
    name: 'openLocation',
    component: {
        render: () => {},
    },
}]; // uni-app内置路由
export const vuelifeHooks = { // vueRouter的原始生命周期
    beforeHooks: [],
    afterHooks: [],
};
export const vueMount = [];// 使用内部对象保留实例化下的appVue,并使用Router进行挂载触发第一次路由钩子
