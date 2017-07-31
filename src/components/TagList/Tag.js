import React, { Component } from 'react'
import { Icon } from 'react-fa'
import classes from './Tag.scss'

export default class Tag extends Component {
    
    render (){
        const { data, onRemove, onClick } = this.props

        return (
            <span className={classes.tag} onClick={e => onClick(data)}>
                {data.name}

                <Icon
                onClick={e => {e.stopPropagation();onRemove(data)}}
                className="tag-close"
                name="close" title="删除标签"></Icon>
            </span>        
        )
    }
}
