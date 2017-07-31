import React from 'react'
import ReactDOM from 'react-dom'

import Sandbox from './core'

class ReactSandbox extends Sandbox {
    GLOBOLS_MAP = {
        react: 'React',
        'react-dom': 'ReactDOM',
        React: 'React',
        ReactDOM: 'ReactDOM'
    }    
    INSERT_GLOBALS = {
        React,
        ReactDOM
    }

    destroy (){
        const sandboxDoc = this.node.contentWindow.document
        const mountNode = sandboxDoc.getElementById('mountNode')
        if (mountNode) {
          ReactDOM.unmountComponentAtNode(mountNode)
          mountNode.innerHTML = ''
        }
        [].forEach.call(sandboxDoc.querySelectorAll('.npmcdn-links'), (linkNode) => {
          linkNode.onload = linkNode.onerror = linkNode.onreadystatechange = null
          linkNode.parentNode.removeChild(linkNode)
        })
        this.setStyle('')
        this.Modules = {}
    }

    setBody(content) {
        const riddleScript = this.node.contentWindow.document.getElementById('riddle-script')
        if (riddleScript && this.node.contentWindow.document.body) {
          this.node.contentWindow.document.body.removeChild(riddleScript)
        }

        const script = document.createElement('script')
        script.id = 'riddle-script'
        script.innerHTML = `
          (function() {
            if (mountNode) {
              ReactDOM.unmountComponentAtNode(mountNode)
              mountNode.innerHTML = ''
            }    

            try {
              ${content}
            } catch(e) {
              __displayError__(e)
              return
            }
            __displayError__() // 执行成功则清空错误
          })();
        `
        if (this.node.contentWindow.document.body) {
          this.node.contentWindow.document.body.appendChild(script)
        }
    }
}

export default new ReactSandbox()
