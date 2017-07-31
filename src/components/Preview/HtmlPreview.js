import React, { Component } from 'react'
import sandbox from '../Sandbox/HtmlSandbox'
import shallowequal from 'shallowequal'
import classes from './HtmlPreview.scss'

export default class MdPreview extends Component {
    constructor (props){
        super(props)
    }

    componentDidMount (){
        const { code, actions } = this.props

        actions.setPreviewLoading(false)

        sandbox.onError( msg => this.displayError(msg) ) 
        //sandbox.renderTo(this.refs.rawIframe, code)
        setTimeout( () => sandbox.use(this.refs.rawIframe, code) )
    }

    componentWillUnmount (){
        const { actions } = this.props

        actions.setPreviewLoading(true)
    }

    shouldComponentUpdate (nextProps, nextState){
        return !shallowequal(nextProps, this.props) || !shallowequal(nextState, this.state)
    }

    componentDidUpdate(prevProps, prevState) {
        const { code } = this.props

        if (shallowequal(prevProps.code, code)) {
          return
        }

        //sandbox.render(code)
        setTimeout( () => sandbox.use(this.refs.rawIframe, code))
    }

    displayError (msg){
       const { actions } = this.props 
       
       if(!msg){
           actions.displayError()
       }else{
           console.warn(msg) 
           actions.displayError(msg)
       }
    }

    render (){
        return (
            <div className={classes.html_preview} ref="rawIframe">
            </div>        
        )
    }
}
