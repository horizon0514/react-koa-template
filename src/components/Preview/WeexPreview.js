import React, { Component } from 'react'
import shallowequal from 'shallowequal'
import classes from './WeexPreview.scss'

export default class WeexPreview extends Component {

    constructor(props) {
        super(props)
        this.state = {
        }
    }

    componentDidMount (){
        const { actions, runWeex } = this.props
        
        //setTimeout(() => runWeex(), 1.5e3)
        //actions.setPreviewLoading(false)
    }

    componentWillUnmount (){
        const { actions } = this.props
        
        actions.setPreviewLoading(true)
    }

    componentDidUpdate (prevProps){
        const { code, actions, canRunWeex, runWeex } = this.props

        if(!prevProps.canRunWeex && canRunWeex){
            setTimeout(() => runWeex(), 3e2)
            return
        }

        // @TODO 因为我们有weex|normal模式，当重新切换回来时，与之前相同不触发
        if (shallowequal(prevProps.code, code)) {
          return
        }

        setTimeout( () => {
            this.refs.weexIframe.contentWindow.postMessage(
                code,
                `${location.protocol}//${location.host}`
            )
            actions.setPreviewLoading(false)
        })
    }

    render (){

        return (
            <div>
                <iframe className={classes.weex_iframe} ref="weexIframe" name="weexIframe" width="100%" src="/weex.html" style={{border : 0}}></iframe>
            </div>        
        )
    }
}
