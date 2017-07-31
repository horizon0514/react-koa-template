import React, { Component } from 'react'
import { Link } from 'react-router'
import { Icon } from 'react-fa'
import moment from 'moment'
import classes from './CiddleHozList.scss'

export default class CiddleHozList extends Component {
    static defaultProps = {
        header : ''
    }
    
    render (){
        const { ciddles, header, userid } = this.props

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
                        !ciddles ? <p className={classes.ciddle_item_holder}>努力搬运中...</p> : ciddles.length ? ciddles.map( (item, i) => {
                            return <div key={i} className={classes.ciddle_list_item}>
                                        <span className={classes.ciddle_list_item_star_area}>
                                            <Icon name="star-o" className={classes.ciddle_list_item_star}></Icon>
                                            <span className={classes.ciddle_list_item_star_count}>{item.staredCount || 0}</span>
                                        </span>
                                        <h4 className={classes.ciddle_list_item_title}>
                                            {
                                                (item.creator.userid === userid && item.isPrivate) || !item.isPrivate ?
                                                    <Link to={`/ciddles/${item.id}`}>{item.title}</Link> : <span>{item.title}</span>
                                            }
                                            {
                                            item.isPrivate ?
                                                <span className={classes.ciddle_list_item_private}>私有片段</span> : null
                                            }
                                        </h4>
                                        <p className={classes.ciddle_list_item_tags}>
                                        {
                                            item.tags.map((tag, i) => <span className={classes.ciddle_list_item_tag} key={i}>{tag.name}</span>)    
                                        }
                                        </p>
                                        <Link to={`/users/${item.creator.userid}`} target="_blank" className={classes.ciddle_list_item_img_link}>
                                            <img src={item.creator.avatar_url} className={classes.ciddle_list_item_img} />
                                        </Link>
                                        <p className={classes.ciddle_list_item_des}>创建于{moment(item.createdAt).fromNow()}</p>
                                    </div>
                        }) : <p className={classes.ciddle_item_holder}>亲，没有数据噢!</p>
                    }
                </div>        
            </div>
        )
    }
}
