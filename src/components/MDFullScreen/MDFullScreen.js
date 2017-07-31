import React, { Component } from 'react'
import { IndexLink, Link } from 'react-router'
import classNames from 'classnames'
import marked from 'marked'
import { Icon } from 'react-fa'
import { highlightAuto } from 'highlight.js'
import classes from './MDFullScreen.scss'

const renderer = new marked.Renderer()

renderer.heading = function (text, level) {
  return `<h${level} id="${text}">${text}</h${level}>`
}

marked.setOptions({
  highlight : function(code){
    return highlightAuto(code).value
  },
  renderer : renderer
})

export default class MDFullScreen extends Component {

    constructor (props){
        super(props)

        this.state = {
            showText : false,
            fixed : false
        }
    }

    componentDidMount (){
        
        setTimeout(() => this.setState({showText : true}), 1e3)
    }

    componentDidUpdate (prevProps){
        
        if(prevProps.visible !== this.props.visible){
            this.componentDidMount()
        }
    }

    handleClose = () => {
        const { onClose } = this.props
        
        this.setState({showText : false})

        if(typeof onClose === 'function'){
            onClose()
        }
    }

    get contents(){
        const { code } = this.props
        const ret = code && (code.match(/#{2,3}.+/g) || []).filter(item => !(/->/.test(item))).
                        map(item => {
                            const arr = item.split(/\s+/)
                            return {level : arr[0].length, label : arr[1]}
                        })
        const catalogClass = classNames({
            [classes.catalog] : true,
            [classes.catalog_fixed] : this.state.fixed
        })

        return (
            <div className={catalogClass}>
              <h3>－ 纲要</h3>
              <ul>
                {
                    ret && ret.map((item, i) => {
                        return <li key={i} className={classes[`catalog_${item.level}`]} onClick={e => this.handleGotoHref(item.level, item.label)}>
                                {
                                //<a href={`#${item.label}`}>{item.label}</a>
                                }
                                <span>{item.label}</span>
                               </li>
                    })
                }
              </ul>
            </div>        
        )
    }

    handleGotoHref = (level, label) => {
        let el
        if(level == 2 && (el = document.getElementById(label))){
            this.domNode.scrollTop = el.offsetTop - 100
        }
    }

    handleScroll = (e) => {

        //this._timer && clearTimeout(this._timer)
        //this._timer = setTimeout(() => {
            //console.log(e.target && e.target.scrollTop >= 200)
            this.setState({fixed : e.target && e.target.scrollTop >= 285})
        //}, 3e2)
    }
    
    render (){
        const { visible, code, pathname } = this.props

        const layClass = classNames({
            [classes.md_lay] : true,
            [classes.md_lay_visible] : 'undefined' !== typeof visible
        })

        return (
            <div className={layClass} onScroll={this.handleScroll} ref={node => this.domNode = node}>
                {
                this.state.showText ?
                    <div dangerouslySetInnerHTML={{__html : marked(code)}} className="md-area">
                    </div> : null
                }
                {
                    this.contents
                }
                <Link to={{pathname}} style={{color : '#666'}}>
                    <Icon name="close" className={classes.lay_close} onClick={this.handleClose} />
                </Link>
            </div>        
        )
    }

}
