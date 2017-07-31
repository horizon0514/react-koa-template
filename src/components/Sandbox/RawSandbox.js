import Sandbox from './core'

class RawSandbox extends Sandbox {
    GLOBOLS_MAP = {
        //jQuery : 'jQuery'
    }    
    INSERT_GLOBALS = {
        //jQuery
    }

    externalScript = `http://npmcdn.alibaba-inc.com/jquery@3.1.1`

    destroy (){
        const sandboxDoc = this.node.contentWindow.document
        const mountNode = sandboxDoc.getElementById('mountNode')
        if (mountNode) {
            this.node.contentWindow.jQuery(mountNode).empty()
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
        const mountNode = this.node.contentWindow.document.getElementById('mountNode')
        const htmlCode = this.__htmlCode.replace(/[\r\n]/g,"")

        if (riddleScript && this.node.contentWindow.document.body) {
          this.node.contentWindow.document.body.removeChild(riddleScript)
        }

        const script = document.createElement('script')
        script.id = 'riddle-script'
        script.innerHTML = `
          (function() {
            if (mountNode) {
              var $mountNode = $(mountNode);
              $mountNode.empty();
              $mountNode.html('${htmlCode}');
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

    setHtml (htmlCode) {
        // const ciddleHtml = this.node.contentWindow.document.getElementById('ciddle-html')
        // if (ciddleHtml && this.node.contentWindow.document.body) {
        //   this.node.contentWindow.document.body.removeChild(ciddleHtml)
        // }
        // const div = document.createElement('div')
        // div.id = 'ciddle-html'
        // div.innerHTML = htmlCode || ''
        // const mountNode = this.node.contentWindow.document.getElementById('mountNode')
        // if (mountNode && this.node.contentWindow.document.body) {
        //   this.node.contentWindow.document.body.insertBefore(div, mountNode)
        // }

        const mountNode = this.node.contentWindow.document.getElementById('mountNode')

        if(mountNode){
            mountNode.innerHTML = htmlCode || ''
        }

        this.__htmlCode = htmlCode

        // 干掉html标签里面插入 script 标签等非html标签
        // if(this.node.contentWindow.jQuery){
        //     this.node.contentWindow.jQuery('#ciddle-html').html(htmlCode || '')
        // }else{
        //     div.innerHTML = htmlCode || ''
        // }
    }
}

export default new RawSandbox()
