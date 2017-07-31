import React, { Component } from 'react'
import { Link } from 'react-router'
import { Icon } from 'react-fa'
import classNames from 'classnames'
import moment from 'moment'
import classes from './CiddleList.scss'

export default class CiddleList extends Component {
    static defaultProps = {
        header : ''
    }

    getCiddleTypesClass = (ctype) => {
        return classNames({
            [classes.ciddle_list_item_type_area] : true,
            [classes.ciddle_list_item_type_area_weex] : ctype === 'weex',
            [classes.ciddle_list_item_type_area_react] : ctype === 'react',
            [classes.ciddle_list_item_type_area_raw] : ctype === 'raw',
            [classes.ciddle_list_item_type_area_md] : ctype === 'md',
            [classes.ciddle_list_item_type_area_cui] : ctype === 'cui',
            [classes.ciddle_list_item_type_area_walle] : ctype === 'walle'
        })
    }

    handleClickItem = (e, item) => {
        const { goToCiddles, userid, updateStatusAutoHide } = this.props
        const { id, ctype, creator, isPrivate } = item

        if(!!isPrivate && userid !== creator.userid && e.target.tagName !== 'A'){
            updateStatusAutoHide({error : true, message : '此乃他人的私密片段'})
            return
        }
        if(e.target.tagName === 'A') return

        goToCiddles(id, ctype)
    }

    normalizeRead (read){
        var ret = (read + '').split('')
        var arr = ret.reverse().map((n,i) => i !== 0 && i%3 === 0 ? n+',' : n)
        
        return arr.reverse().join('')
    }
    
    render (){
        const { ciddles, header, userid } = this.props
        const ctypeMaps = {
            weex : 'Weex',
            raw : 'Javascript',
            md : 'Markdown',
            react : 'React'
        }

        const getItemClass = (item) => {
            return classNames({
                [classes.ciddle_list_item] : true,
                [classes.ciddle_list_item_private] : !!item.isPrivate
            })
        }

        return (
            <div className={classes.ciddle_list_area}>
                {
                    header ?
                        <div className={classes.ciddle_list_area_header}>
                            {header}    
                        </div> : null
                }
                <div className={classes.ciddle_list}>
                    { 
                        !ciddles ? <p>努力搬运中...</p> : ciddles.length ? ciddles.map( (item, i) => {
                                return <div key={i} className={getItemClass(item)} onClick={e => this.handleClickItem(e, item)}>
                                        <h4 className={classes.ciddle_list_item_title}>
                                            <span className={classes.ciddle_list_item_star_area}>
                                                <Icon name="star-o" className={classes.ciddle_list_item_star}></Icon>
                                                <span className={classes.ciddle_list_item_star_count}>{item.staredCount || 0}</span>
                                            </span>
                                            <span className={classes.ciddle_list_item_star_area}>
                                                <Icon name="eye" className={classes.ciddle_list_item_star}></Icon>
                                                <span className={classes.ciddle_list_item_star_count}>{item.read ? this.normalizeRead(item.read) : 0}</span>
                                            </span>
                                            <span>{item.title}</span>
                                            {
                                                !!item.isPrivate ?
                                                    <Icon name="lock" className={classes.ciddle_list_item_lock} /> : null
                                            }
                                            {
                                                //<Link to={`/ciddles/${item.id}`}>{item.title}</Link>
                                            }
                                        </h4>
                                        <p className={classes.ciddle_list_item_des}>
                                            <Link to={`/users/${item.creator.userid}`}>{item.creator.cname}</Link>创建于{moment(item.createdAt).fromNow()}
                                        </p>
                                        <div className={classes.ciddle_list_item_types}>
                                            <span className={this.getCiddleTypesClass(item.ctype)}>
                                                {ctypeMaps[item.ctype] || item.ctype}
                                            </span>
                                            <p className={classes.ciddle_list_item_tag_area}>
                                            {
                                                item.tags.map((tag, i) => <span className={classes.ciddle_list_item_tag} key={i}>{tag.name}</span>)    
                                            }
                                            </p>
                                        </div>
                                    </div>
                        }) : <p>亲，没有数据噢!</p>
                    }
                    {
                        ciddles && ciddles.length && (ciddles.length+1)%3 === 0 ?
                            <div className={classes.ciddle_list_item_fake}></div> : null
                    }
                </div>        
            </div>
        )
    }
}

