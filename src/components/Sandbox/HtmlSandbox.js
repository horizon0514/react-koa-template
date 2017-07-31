let guid = +new Date()

class HtmlSandbox {
  constructor(props) {
    this.props = {
      container: document.body,
      ...props,
    }
    //this.init()
  }
  
  // init() {

  //   const node = document.createElement('iframe')
  //   node.id = 'ciddle-sandbox'
  //   node.setAttribute('scrolling', 'yes')
  //   node.style.width = '100%'
  //   node.style.height = '100%'
  //   node.style.border = '0'
  //   node.sandbox = 'allow-scripts allow-same-origin allow-modals allow-popups allow-forms'

  //   this.node = node
  // }

  create (){
    const node = document.createElement('iframe')
    node.id = guid++
    node.setAttribute('scrolling', 'yes')
    node.style.width = '100%'
    node.style.height = '100%'
    node.style.border = '0'
    node.sandbox = 'allow-scripts allow-same-origin allow-modals allow-popups allow-forms'

    return this.node = node
  }

  use (container, content){
     var iframe = this.create()

     container.innerHTML = ''
     container.appendChild(iframe)

     iframe.contentWindow['__displayError__'] = this.displayError

     iframe.contentWindow.document.write(this.plusError(content))
     iframe.contentWindow.document.close()

     this.displayError()    
  }

  // renderTo(container, content) {
  //   container.appendChild(this.node)

  //   this.node.contentWindow['__displayError__'] = this.displayError

  //   this.node.contentWindow.document.write(this.plusError(content))
  //   this.node.contentWindow.document.close()
  // }

  // render (content){
  //   this.displayError()

  //   this.node.contentWindow.document.write(this.plusError(content))
  //   this.node.contentWindow.document.close()
  // }

  plusError (content){
    let ret = content.split(/<\/head>/)
    const str = `
      <script>
        window.onerror = function(msg){
            __displayError__(msg);
            return true;
        }
      </script>
      </head>
    `
    ret.splice(1,0,str)

    return ret.join('')
  }

  remove() {
    if (this.node) {
      this.container.removeChild(this.node)
    }
  }

  onError (fn){
    this.displayError = fn
  }
}

export default new HtmlSandbox
