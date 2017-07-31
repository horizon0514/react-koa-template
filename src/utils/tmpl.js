export const initialWeexCode = `<template>
  <div class="container">
    <text class="demo">Demo or it didn't happen</text>
  </div>
</template>

<script>
    module.exports = {
        data : function(){
            return {}
        },
        methods : {
            
        }
    }
</script>

<style>
    .container{
        display : flex;
        flex-direction : column;
        justify-content : center;
        align-items : center;
        margin-top : -100px;
    }

    .demo{
        color : #196ade;
        font-family: Georgia;
	}
</style>`

export const initialCssCode = 
`/* 此处书写样式代码，支持 less scss */
/* @import '@ali/cn-tui/dist/tui.css'; */`

export const initialReactCode =
`// 在这里书写代码，右边预览效果，点击右上角的 ? 号查看帮助文档
// 范例如下，可以去掉注释查看效果，若无样式请到 css 面板中取消样式代码注释

/*
import { Button } from '@ali/cn-tui';

ReactDOM.render(
    <Button type="primary">按钮</Button>,
    mountNode
);
*/`

export const initialHtmlCode =
`<!-- 可以插入html标签 -->`

export const initialHtmlWildCode = (versionObj) => {
return `<!DOCTYPE HTML>
<html>
<head>
  <meta charset="utf-8"/>
  <!--加载资源代码-->
  <link rel="stylesheet" href="//g.alicdn.com/cui/cui/${versionObj.cui}/css/all.css" />
  <script src="//g.alicdn.com/cn/??jquery/${versionObj.jquery}/jquery.js,seajs/${versionObj.seajs}/sea.js,seajs/${versionObj.seajs}/seajs-combo.js"></script>
  <script src="//g.alicdn.com/cui/cui/${versionObj.cui}/cui.js"></script>
  <script src="//g.alicdn.com/cn/platform-base/${versionObj.platform}/??config.js,lib/xss.js"></script>
</head>
<body>
  <!--这里是内容-->
</body>
</html>
`
}

export const initialJavascriptCode =
`// 在这里书写js代码，支持es6语法
/*
({
    init : () => {
        console.log('Hello world')
    } 
}).init()
*/
`
export const initialMdCode =
`# 组件甲

用于让用户在不同的视图中进行切换。

> 强烈推荐阅读 《提问的智慧》、《如何向开源社区提问题》 和 《如何有效地报告 Bug》，更好的问题更容易获得帮助。

## 使用规则

* 标签数量，一般 2-4 个；其中，标签中的文案需要精简，一般 2-4 个字。
* 在场景二中我们是如何使用的
* 在 iOS 端的次级页面中，不建议使用左右滑动来切换 Tab，这个和 iOS 的左滑返回存在冲突，eg：详情页中 Tabs

## 代码演示

	<Component>
	  <Component.Item>项</Component.Item>
	  <SubComponent title="子项">
	    <Component.Item>子项</Component.Item>
	  </SubMenu>
	</Component>

## API

### 属性

系统			| 机型 			| 通过 	| 备注
---			| ---			| ---	| ---
android 4+	| 通用 	| ✘		| 裹裹只唤起webview，不能使用底层API，3.2版本将解决
ios 7+ 	| iphone 	| ✔		|

## 如何使用

### 功能点一

**toPage(url[, options])**

    // 打开对应的客户端功能。
    mcn.callapp.toPage(url,options);
    
    // 例如：菜鸟裹裹协议
    mcn.callapp.toPage('cainiao://guoguo/?ref={"url":"http://xxx.htm"}');

**options参数**

* success - 成功回调，一般不处理
* error - 失败回调，一般用来在失败后处理下载APP的应用。

## 历史记录
- 1.0.1：修复IOS 9.0+ Safari 不能唤醒APP的bug
- 1.0.2：修复https下应用宝和裹裹下载链接的https不能访问问题
`

export const initialWalleMdCode = ``

export const initialWalleCode =
`
<!Doctype html>
<html>

<head>
  <meta charset="utf-8">
  <title>walle - demo</title>
  <!-- walle sdk -->
  <link href="http://g.alicdn.com/wallegroup/walleForFusion/0.0.1/style.css" rel="stylesheet" charset="utf-8">
  <script src="http://g.alicdn.com/wallegroup/walleForFusion/0.0.1/walle.js" charset="utf-8"></script>
  <!--如果需要VO的支持，请打开下面两个标签的注释-->
  <!--script src="http://g.alicdn.com/wallegroup/walle-demo/goods/schema.js"></script-->
  <!--script src="http://g.alicdn.com/wallegroup/walle-demo/goods/serverStates.js"></script-->
</head>

<body>
<!--页面渲染到该元素下面-->
<div id="root"></div>
<!--页面模板代码-->
<script type="text/template">
  <Button type="primary">按钮</Button>
</script>
<!--页面启动脚本，如果只是一个 walle.ready({}) 则可以省略-->
<script>
  walle.ready({
  });
</script>
</body>

</html>
`
