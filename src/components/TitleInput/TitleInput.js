import React, { Component } from 'react'
import { Icon } from 'react-fa'
import classes from './TitleInput.scss'

export default class TitleInput extends Component {
    static defaultProps = {
        onConfirm : () => {}
    }

    constructor (props){
        super(props) 

        this.state = {
            value : props.value
        }
    }

    componentDidUpdate (prevProps){
        if(prevProps.value !== this.props.value){
            this.node.innerText = this.props.value
            //this.setState({value : this.props.value})
        }
    }

    handleInput = () => {
        const text = this.node.innerText.trim()
        
        //this.setState({value : text})
    }

    handleBlur = () => {
        
        this.node.innerText = this.props.value
        //this.setState({value : this.props.value})
    }

    handleKeyDown = (e) => {
        const { onConfirm, value } = this.props
        const text = this.node.innerText.trim()

        if(e.key === 'Enter'){
            e.preventDefault()
            value !== text && onConfirm(text)
            this.node.blur()
        }
    }

    render (){
        const { value } = this.state

        return (
            <span className={classes.title} title={value}>
                <div
                 ref={node => this.node = node}
                 className={classes.input}
                 onInput={this.handleInput}
                 onBlur={this.handleBlur}
                 onKeyDown={this.handleKeyDown}
                 contentEditable
                 dangerouslySetInnerHTML={{ __html: value }}
                 spellCheck={false} />

                <span className={classes.hint}>
                  <Icon name="keyboard-o" />
                </span>
            </span>           
        )
    }

}
