import React, { Component } from 'react'
import Preview from './Preview'
import rawSandbox from '../Sandbox/RawSandbox'

export default class RawPreview extends Preview {
    sandbox = rawSandbox    

    constructor(props) {
        super(props)
    }

    executeCode (){
        const { code } = this.props

        let html = code.html
        try {
          this.sandbox.setHtml(html)   
        }catch (e){
            this.displayError(e)
            return
        }

        try {
          this.sandbox.setBody(this.compileCode())
        } catch (e) {
          this.displayError(e)
          return
        }

        let css = code.css
        less.render(css, {rootpath : 'http://unpkg.com/'}, (err, output) => {
          if (err) {
            this.displayError(err)
            return
          }
          try {
            this.sandbox.setStyle(output.css)
          } catch (e) {
            this.displayError(e)
          }
        })
    }
}
