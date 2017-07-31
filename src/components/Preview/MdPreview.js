import React, { Component } from 'react'
import marked from 'marked'
import { highlightAuto } from 'highlight.js'
import 'highlight.js/styles/solarized-light.css'
import shallowequal from 'shallowequal'
import classes from './MdPreview.scss'

marked.setOptions({
  highlight : function(code){
    return highlightAuto(code).value
  }
})

export default class MdPreview extends Component {
    constructor (props){
        super(props)

        this.state = {
            html : ''
        }
    }

    componentDidMount (){
        const { code, actions } = this.props

        actions.setPreviewLoading(false)
        this.setState({html : marked(code)})
    }

    componentWillUnmount (){
        const { actions, bUnLoad } = this.props

        !bUnLoad && actions.setPreviewLoading(true)
    }

    shouldComponentUpdate (nextProps, nextState){
        return !shallowequal(nextProps, this.props) || !shallowequal(nextState, this.state)
    }

    componentDidUpdate(prevProps, prevState) {
        const { code } = this.props

        if (shallowequal(prevProps.code, code)) {
          return
        }

        this.setState({html : marked(code)})
    }

    render (){
        return (
            <div className="md-area md-small-area" dangerouslySetInnerHTML={{__html : this.state.html}}>
            </div>        
        )
    }
}
