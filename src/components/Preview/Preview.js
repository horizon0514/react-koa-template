import React, { Component } from 'react'
import { transform } from 'babel-standalone'
import shallowequal from 'shallowequal'
import debounce from 'lodash.debounce'
//import sandbox from './Sandbox'
import less from 'less'
import classes from './Preview.scss'

import reactSandbox from '../Sandbox/ReactSandbox'

//-----------------------------------------------
// 目前以ctype区分react|raw, 后期种类多时，preview可以继承方式
//----------------------------------------

export default class Preview extends Component {

    sandbox = reactSandbox

    constructor(props) {
        super(props)

        this.state = {
            deps : {},
            hack : false
        }
    }

    componentDidMount (){
        this.sandbox.onError(e => this.displayError(e))
        this.sandbox.renderTo(this.refs.iframe, {
          require: moduleName => {
            return this.npmcdnRequire(moduleName)
          }
        })
        this.executeCode = debounce(this.executeCode, 400) 

        // HACK for 手动触发DidUpdate, 以至去掉preview loading
        this.setState({hack : true})
    }

    shouldComponentUpdate(nextProps, nextState) {
        return !shallowequal(nextProps, this.props) || !shallowequal(nextState, this.state)
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.id !== 'new' && nextProps.id !== this.props.id) {
          this.sandbox.destroy()
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (shallowequal(prevProps.code, this.props.code) &&
            shallowequal(prevState.deps, this.state.deps) &&
            // @TODO HACK still.....
            shallowequal(prevState.hack, this.state.hack)) {
          return
        }
        if (prevProps.code.js !== this.props.code.js) {
          this.compiledCodeCache = null
        }

        setTimeout(() => this.executeCode())

        const deps = this.state.deps
        Object.keys(deps).forEach(dep => {
          if (!deps[dep] ||
              (dep === 'style.css' && prevProps.code.css !== this.props.code.css)) {
            this.loadExtenal(dep)
          }
        })

    }

    componentWillUnmount() {
        this.isEveryScriptLoaded = () => false
        this.sandbox.destroy()
    }

    isEveryScriptLoaded() {
        return !this.state.deps || Object.keys(this.state.deps).every(
          dep => this.state.deps[dep] || (dep !== 'style.css' && dep.indexOf('.css') > 0)
        )
    }

    executeCode (){
        const { code, ctype } = this.props
        try {
          this.sandbox.setBody(this.compileCode())
        } catch (e) {
          this.displayError(e)
          return
        }

        // if(ctype === 'raw'){
        //     let html = code.html
        //     try {
        //       this.sandbox.setHtml(html)   
        //     }catch (e){
        //         this.displayError(e)
        //         return
        //     }
        // }

        let css = code.css
        less.render(css, {rootpath : 'http://unpkg.dockerlab.alipay.net/'}, (err, output) => {
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

    compileCode (){
        if (this.compiledCodeCache) {
          return this.compiledCodeCache
        }

        const compiledCode = transform(
          this.props.code.js, {
            presets: ['es2015', 'react', 'stage-0'],
            plugins: ['transform-decorators-legacy'],
          }
        ).code

        this.compiledCodeCache = compiledCode

        return compiledCode
    }

    onScriptLoad(dep) {
        const deps = { ...this.state.deps }
        deps[dep] = true
        this.setState({ deps })
    }

    onScriptError(dep) {
        const deps = { ...this.state.deps }
        deps[dep] = 'error'
        this.setState({ deps })
    }

    loadExtenal(moduleName) {
        // Load deps script from npmcdn
        this.sandbox.loadExtenal(moduleName, (err) => {
          if (err) {
            this.onScriptError(moduleName)
          } else {
            this.onScriptLoad(moduleName)
          }
        })
    }

    npmcdnRequire(moduleName) {
        const deps = { ...this.state.deps }
        if (!(moduleName in deps)) {
          deps[moduleName] = false
          this.setState({ deps })
        }
        return this.sandbox.moduleRequire(moduleName)
    }

    displayError (e){
        const { actions, error } = this.props

        if (!e) {
          if (error) {
            actions.displayError()
          }
          if (this.isEveryScriptLoaded()) {
            actions.setPreviewLoading(false)
          }
          return
        }

        if (this.isEveryScriptLoaded()) {
          console.warn(e.message)
          actions.displayError(e.message)
        }

    }

    render (){
        return (
            <div className={classes.preview} ref="iframe">
            </div>
        )       
    }
}
