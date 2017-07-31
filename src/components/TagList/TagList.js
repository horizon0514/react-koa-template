import React, { Component } from 'react'
import Tag from './Tag'
import TagMenu from './TagMenu'
import Icon from 'react-fa'
import classes from './TagList.scss'

export default class TagList extends Component {
    static defaultProps= {
        data : [],
        searchable : false,
        onAdd : () => {},
        onRemove : () => {},
        onClick : () => {}
    }
    
    render (){
        const { inline, data, onRemove, onAdd, onClick, searchable, actions, allTags } = this.props

        return (
            <div style={{display : inline ? 'inline-block' : ''}}>
                {
                    data ? data.map((item, i) => {
                        return <Tag data={item} key={i} onClick={onClick} onRemove={onRemove}></Tag>
                    }) : null
                }

                {
                    searchable ? <TagMenu tags={data} actions={actions} allTags={allTags} onAdd={onAdd}></TagMenu> :
                        <span onClick={e => onAdd()}>
                            <Icon name="plus" className={classes.tag_plus}></Icon>
                            标签
                        </span>       
                }
            </div>        
        )
    }
}
