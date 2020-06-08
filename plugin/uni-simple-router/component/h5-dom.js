const render = function (node) {
    if (typeof node == 'string') { // 是一个文本节点
        return document.createTextNode(node);
    }
    if (node instanceof HTMLElement) {
        return node;
    }
    // eslint-disable-next-line
    return createElement(node);
};
/**
 * 根据标签及属性创建一个dom
 */
const createElement = function ({
    tag,
    attrs,
    children,
} = {}) {
    const $el = document.createElement(tag);
    // eslint-disable-next-line
    for (const [k, v] of Object.entries(attrs)) {
        $el.setAttribute(k, v);
    }
    // eslint-disable-next-line
    for (const item of children) {
        $el.appendChild(render(item));
    }
    return $el;
};

const html = createElement({
    tag: 'div',
    attrs: {
        id: 'router-loadding',
    },
    children: [
        createElement({
            tag: 'div',
            attrs: {
                class: 'loadding',
            },
            children: [],
        }),
    ],
});
/* eslint-disable */
const style = createElement({
    tag: 'style',
    attrs: {
        id: 'HHYANG_style',
    },
    children: [
        `
		body{padding:0;margin:0}#router-loadding{position:fixed;width:100%;height:3px;transition:all .05s;top:0;z-index:9999999999999999;}#router-loadding .loadding{position:fixed;top:0;height:3px;background-color:#47b14b;width:0;box-shadow:0 0 15px #4CAF50;transition:all .8s;border-top-right-radius:3px;border-bottom-right-radius:3px}
		`,
    ],
});

const script = createElement({
    tag: 'script',
    attrs: {
        id: 'HHYANG_script',
    },
    children: [
        `
		var HHYANG_El=document.querySelector("#router-loadding .loadding"),HHYANG_Pel=document.querySelector("#router-loadding"),w=0,stop=null,WH=window.innerWidth,loop=function(){w=w>=WH-35?w+parseInt(5*Math.random()):w+parseInt(35*Math.random());HHYANG_El.style.cssText="width:"+w+"px";w>=WH&&clearInterval(stop)};window.startLodding=function(a){a=void 0===a?500:a;HHYANG_Pel.style.cssText="display: block;";HHYANG_El.style.cssText="transition: all 0.8s;";w=0;clearInterval(stop);stop=setInterval(function(){loop()},a)};window.stopLodding=function(a){a=void 0===a?200:a;clearInterval(stop);HHYANG_El.style.cssText="width:"+WH+"px;transition: all "+a/1E3+"s;";HHYANG_Pel.style.cssText="opacity: 0;transition: all "+a/1E3+"s;";setTimeout(function(){HHYANG_Pel.style.cssText="display: none;";HHYANG_El.style.cssText="width:0px";w=0},a)};
		`,
    ],
});
export const DOM = {
    style,
    html,
    script,
};
/* eslint-enable */
