import React from 'react'
import ReactDOM from 'react-dom'

const initialContent = (script) => `
<!DOCTYPE html>
<html>
<head>
<link href="http://unpkg.dockerlab.alipay.net/normalize.css@4.1.1" media="all" rel="stylesheet" />
<script src="http://unpkg.dockerlab.alipay.net/currentscript"></script>
<script src="http://unpkg.dockerlab.alipay.net/babel-polyfill@6.9.1/dist/polyfill.min.js"></script>
${script ? `<script src=${script}></script>` : ''}
</head>
<body>
  <style>
    body { margin: 0; font-size: 12px; line-height: 1.5; }
    #mountNode:empty:after {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      content: '';
      background: url(https://gw.alicdn.com/tps/TB11DyEOXXXXXcCapXXXXXXXXXX-214-264.png) center 40% no-repeat;
      background-size: 100px;
      height: 100%;
      opacity: 0.62;
    }
  </style>
  <div id="mountNode"></div>
  <script>
    var riddleSandbox = {};
    riddleSandbox.loadScript = function(src, opts, cb) {
      var head = document.head || document.getElementsByTagName('head')[0]
      var script = document.createElement('script')
      if (typeof opts === 'function') {
        cb = opts
        opts = {}
      }
      opts = opts || {}
      cb = cb || function() {}
      script.type = opts.type || 'text/javascript'
      script.charset = opts.charset || 'utf8';
      script.async = 'async' in opts ? !!opts.async : true
      script.src = src
      if (opts.attrs) {
        setAttributes(script, opts.attrs)
      }
      if (opts.text) {
        script.text = '' + opts.text
      }
      var onend = stdOnEnd
      onend(script, cb)
      if (!script.onload) {
        stdOnEnd(script, cb);
      }
      head.appendChild(script)
      function setAttributes(script, attrs) {
        for (var attr in attrs) {
          script.setAttribute(attr, attrs[attr]);
        }
      }
      function stdOnEnd(script, cb) {
        script.onload = function () {
          this.onerror = this.onload = null
          cb(null, script)
        }
        script.onerror = function () {
          this.onerror = this.onload = null
          cb(new Error('Failed to load ' + this.src), script)
        }
      }
    }
    riddleSandbox.loadCss = function(attributes) {
      attributes.rel = "stylesheet"
      var styleSheet = document.createElement("link");
      for (var key in attributes) {
        styleSheet.setAttribute(key, attributes[key]);
      }
      var head = document.getElementsByTagName("head")[0];
      head.appendChild(styleSheet);
    };
    var mountNode = document.getElementById('mountNode');
  </script>
</body>
</html>
`

class Sandbox {
  constructor(props) {
    this.props = {
      container: document.body,
      ...props,
    }
    this.init()
    this.overrideDefine = this.overrideDefine.bind(this)
    this.overrideDefine.amd = {}
  }
  Modules = {}
  GLOBOLS_MAP = {
    react: 'React',
    React: 'React',
    ReactDOM: 'ReactDOM',
    'react-dom': 'ReactDOM'
  }
  INSERT_GLOBALS = {
  }
  UMD_MAP = {
    antd: 'antd/dist/antd.min',
    redux: 'redux/dist/redux',
    mobx: 'mobx/lib/mobx.umd.min',
    qs: 'qs/dist/qs',
    history: 'history/umd/history.min',
    angular: 'angular/angular.min',
    vue: 'vue/dist/vue.min',
    reselect: 'reselect/dist/reselect',
    dva: 'dva/dist/dva',
    'dva/fetch': 'dva/dist/fetch',
    'dva/router': 'dva/dist/router',
    'dva/effects': 'dva/dist/effects',
    'react-router': 'react-router/umd/ReactRouter.min',
    'react-redux': 'react-redux/dist/react-redux.min',
    'redux-saga': 'redux-saga/dist/redux-saga.min',
    'redux-thunk': 'redux-thunk/dist/redux-thunk.min',
    'react-slick': 'react-slick/dist/react-slick.min',
    'redux-form': 'redux-form/dist/redux-form.min',
    'react-infinite': 'react-infinite/dist/react-infinite.min',
    'react-router-redux': 'react-router-redux/dist/ReactRouterRedux.min',
    'react-sortable-hoc': 'react-sortable-hoc/dist/umd/react-sortable-hoc.min',
    'react-modal': 'react-modal/dist/react-modal.min',
    'react-tabs': 'react-tabs/dist/react-tabs',
    'antd-mobile': 'antd-mobile/dist/antd-mobile.min',
    '@alipay/ajax': '@alipay/ajax/dist/ajax',
    '@alife/next' : '@alife/next/dist/next',
    '@ali/cn-tui' : '@ali/cn-tui/dist/tui.min',
    'ti-test' : 'ti-test/dist/tui.min'
  }
  init() {
    // create temporary iframe for generating HTML string
    // element is inserted into the DOM as a string so that the security policies do not interfere
    // see: https://gist.github.com/kumavis/8202447
    const node = document.createElement('iframe')
    node.id = 'riddle-sandbox'
    node.setAttribute('scrolling', 'yes')
    node.style.width = '100%'
    node.style.height = '100%'
    node.style.border = '0'
    node.sandbox = 'allow-scripts allow-same-origin allow-modals allow-popups allow-forms'
    // retrieve created iframe from DOM
    this.node = node
  }
  renderTo(container, globals) {
    container.appendChild(this.node)
    this.node.contentWindow.document.write(initialContent(this.externalScript))
    this.node.contentWindow.document.close()
    const insertGlobals = {
      ...globals,
      React,
      ReactDOM,
      ...this.INSERT_GLOBALS,
      define: this.overrideDefine,
      __displayError__: this.displayError,
    }
    Object.keys(insertGlobals).forEach(key => {
      if (!this.node.contentWindow[key]) {
        this.node.contentWindow[key] = insertGlobals[key]
      }
    })
  }
  remove() {
    if (this.node) {
      this.container.removeChild(this.node)
    }
  }

  destroy() {
    // const sandboxDoc = this.node.contentWindow.document
    // const mountNode = sandboxDoc.getElementById('mountNode')
    // if (mountNode) {
    //   ReactDOM.unmountComponentAtNode(mountNode)
    //   mountNode.innerHTML = ''
    // }
    // [].forEach.call(sandboxDoc.querySelectorAll('.npmcdn-links'), (linkNode) => {
    //   linkNode.onload = linkNode.onerror = linkNode.onreadystatechange = null
    //   linkNode.parentNode.removeChild(linkNode)
    // })
    // this.setStyle('')
    // this.Modules = {}

    throw new Error('Its abstruct method, please extend it')
  }
  setBody(content) {
    // const riddleScript = this.node.contentWindow.document.getElementById('riddle-script')
    // if (riddleScript && this.node.contentWindow.document.body) {
    //   this.node.contentWindow.document.body.removeChild(riddleScript)
    // }

    // const script = document.createElement('script')
    // script.id = 'riddle-script'
    // script.innerHTML = `
    //   (function() {
    //     if (mountNode) {
    //       ReactDOM.unmountComponentAtNode(mountNode)
    //       mountNode.innerHTML = ''
    //     }    

    //     try {
    //       ${content}
    //     } catch(e) {
    //       __displayError__(e)
    //       return
    //     }
    //     __displayError__() // 执行成功则清空错误
    //   })();
    // `
    // if (this.node.contentWindow.document.body) {
    //   this.node.contentWindow.document.body.appendChild(script)
    // }

    throw new Error('Its abstruct method, please extend it')
  }
  setStyle(cssCode) {
    const riddleStyle = this.node.contentWindow.document.getElementById('riddle-style')
    if (riddleStyle && this.node.contentWindow.document.body) {
      this.node.contentWindow.document.body.removeChild(riddleStyle)
    }
    const style = document.createElement('style')
    style.id = 'riddle-style'
    style.innerHTML = cssCode || ''
    const mountNode = this.node.contentWindow.document.getElementById('mountNode')
    if (mountNode && this.node.contentWindow.document.body) {
      this.node.contentWindow.document.body.insertBefore(style, mountNode)
    }
  }


  loadExtenal(moduleName, callback) {
    const { riddleSandbox: { loadScript, loadCss } } = this.node.contentWindow
    if (this.node.contentWindow.document.getElementById(`npmcdn-links-${moduleName}`)) {
      return
    }
    if (moduleName.indexOf('.css') > 0) {
      loadCss({
        href: `http://unpkg.dockerlab.alipay.net/${moduleName}`,
        class: 'npmcdn-links',
        id: `npmcdn-links-${moduleName}`,
      })
      return
    }
    loadScript(`http://unpkg.dockerlab.alipay.net/${this.transforModuleMain(moduleName)}`, {
      attrs: {
        class: 'npmcdn-links',
        id: `npmcdn-links-${moduleName}`,
      },
    }, (err, tag) => {
      if (err) {
        this.node.contentWindow.document.getElementsByTagName('head')[0].removeChild(tag)
      }
      callback(err)
    })
  }
  moduleRequire(moduleName) {
    return this.Modules[moduleName]
  }

  transforModuleMain(moduleName) {
    if (this.UMD_MAP[moduleName]) {
      return this.UMD_MAP[moduleName]
    }
    const MODULE_PATH_REG = /^(@[^\/|@]*\/)?([^\/|@]*)(@[^\/|@]*)?(\/.*)?$/
    const result = moduleName.match(MODULE_PATH_REG)
    if (!result) {
      return moduleName
    }
    const scope = result[1] || ''
    const name = result[2] || ''
    const version = result[3] || ''
    const local = result[4] || ''
    // redux@~3.5.2 => redux@~3.5.2/dist/redux
    // dva@~1.0.0/effects => dva@~1.0.0/dist/effects
    const transformedModuleName = this.UMD_MAP[`${scope}${name}${local}`]
    if (transformedModuleName) {
      return transformedModuleName.replace(
        new RegExp(`^${scope}${name}${local}`),
        `${scope}${name}${version}${local}`
      )
    }
    return moduleName
  }

  overrideDefine(...args) {
    const sandboxWin = this.node.contentWindow
    let deps
    let factory
    if (args.length === 1) {
      deps = []
      factory = args[0]
    } else if (args.length === 2) {
      deps = args[0]
      factory = args[1]
    } else if (args.length >= 3) {
      deps = args[1]
      factory = args[2]
    }
    const moduleName = sandboxWin.document.currentScript.id.replace('npmcdn-links-', '')
    const depsArguments = deps.map(dep => sandboxWin[this.GLOBOLS_MAP[dep]])
    this.Modules[moduleName] = factory.apply(null, depsArguments)
  }

  onError(fn) {
    this.displayError = fn
  }
}

export default Sandbox
