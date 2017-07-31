import React, { Component } from 'react'
import classes from './TagMenu.scss'

export default class TagMenu extends Component {

    static defaultProps = {
        onAdd : () => {}
    }

    constructor (props){
        super(props)    

        this.state = {
            bShow : false 
        }
    }

    componentDidMount (){
        const { actions } = this.props
        
        actions.fetchTags()
    }

    componentWillUnmount (){
       this.blurTimer && clearTimeout(this.blurTimer)
    }

    get menuList (){
        const { allTags, tags } = this.props
        const tagIds = tags.map( tag => tag.objectId )

        const ret = allTags.filter( tag => tagIds.indexOf(tag.objectId) === -1 )
        
        return ret
    }

    toggleList = (flag) => {
       this.setState({bShow : flag}) 
    }

    handleClickItem = (item) => {
       const { onAdd } = this.props 
        
       this.blurTimer && clearTimeout(this.blurTimer)

       onAdd(item)

       this.refs.tagInput.focus()
    }

    handleBlur = () => {
        this.blurTimer = setTimeout(() => {
            this.toggleList(false)
        }, 3e2)
    }
    
    render (){
        const { tags } = this.props
        const { bShow } = this.state

        return (
            <div className={classes.tag_menu}>
                <input
                ref="tagInput"
                type="text"
                placeholder="+ 标签"
                className={classes.tag_input}
                onBlur={this.handleBlur}
                onFocus={e => this.toggleList(true)} />
                {
                bShow ? 
                <ul className={classes.tag_list}>
                    {
                        tags.length < 3 ? 
                            this.menuList.map( (item, i) => {
                                return <li className={classes.tag_list_item} key={i} onClick={e => this.handleClickItem(item)}>{item.name}</li>
                            }) : <li className={classes.tag_list_no_item}>已经不能添加标签了噢.</li>
                    }    
                </ul> : null
                }
            </div>       
        )
    }
}
