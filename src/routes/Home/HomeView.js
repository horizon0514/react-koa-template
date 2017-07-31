import React, { Component } from 'react'
import { Link }             from 'react-router'
import CiddleList           from '../../components/CiddleList'
import DocumentTitle        from 'react-document-title'
import classNames           from 'classnames'
import { Icon }             from 'react-fa'
import isEqualShallow       from 'is-equal-shallow'
import moment               from 'moment'
import classes              from './HomeView.scss'

export default class HomeView extends Component {

    constructor (props){
        super(props)

        this.state = {
            page : 1
        }
    }

    componentDidMount (){
        const { actions, ciddles, query } = this.props

        Object.keys(ciddles).forEach( key => {
           if (key === 'count' || key === 'searchResult') {
            return
           } else if (key === 'search') {
            if (Object.keys(query).length !== 0) {
              actions.fetchCiddles('search', query)
            }
           } else {
            actions.fetchCiddles(key)
           } 
        })
           
        actions.fetchTags({withCiddleCount : true})
        actions.fetchCiddlesCount()
    }

    shouldComponentUpdate(nextProps) {
        const { ciddles, query } = this.props

        return !isEqualShallow(query, nextProps.query) || !isEqualShallow(ciddles, nextProps.ciddles)
    }

    componentDidUpdate(prevProps) {
        const { actions, query } = this.props
        const bSearch = Object.keys(query).length !== 0

        if(!isEqualShallow(query, prevProps.query)){
          this.setState({page : 1})
          actions.fetchCiddles(bSearch ? 'search':'recently', query)
        }
    }

    handleGoToPages = (type, page) => {
        const { actions, query } = this.props

        actions.fetchCiddles(type, {...query, page : page})

        this.setState({page : page})
    }

    get pageEls(){
        const { query, ciddles : {recently, search} } = this.props
        const bSearch = Object.keys(query).length !== 0
        const isCui = query.tag && /cui(社区)组件/i.test(query.tag)
        const { page } = this.state

        const count = bSearch ? search.count : recently.count
        const denominator = bSearch && !isCui ? 12 : 9
        const pages = Math.ceil(count/denominator) 
        const type = bSearch ? 'search' : 'recently'

        return (
            <div className={classes.page_arae}>
                {
                page > 1 ?
                <div className={classes.page_prev} onClick={e => this.handleGoToPages(type, page - 1)}><Icon name="angle-left" />Prev</div> : null
                }
                <div className={classes.page_fake}></div>
                {
                page < pages ? 
                <div className={classes.page_next} onClick={e => this.handleGoToPages(type, page + 1)}>Next<Icon name="angle-right" /></div> : null
                }
            </div>
        )
    }
    
    render (){
        const { tags, ciddles : { recently, search, count }, query, actions, loginUser : {userid}} = this.props
        const bSearch = Object.keys(query).length !== 0
        const cuiReg = /cui(社区)?组件/i
        const isCui = query.tag && cuiReg.test(query.tag)
        const allTagItemClass = classNames({
            [classes.tag_link_all] : true,
            [classes.tag_link_all_active] : !bSearch
        })

        return (
            <DocumentTitle title="片儿--代码片段分享">
			<div>
		        <div className={classes.home_wrapper}>
		            <div className={classes.tag_sider}>
		                <h3 className={classes.tag_sider_title}>热门标签</h3>
		                <Link to="/" className={allTagItemClass}>全部</Link>
		                <ul className={classes.tag_list}>
		                    {
		                        (tags.list || []).map( (tag, i) =>{
		                            const tagListItemClass = classNames({
		                                [classes.tag_list_item] : true,
		                                [classes.tag_list_item_active] : tag.name === query.tag
		                            })
		                            return <li key={i} className={tagListItemClass}>
		                                    <Link to={{query : {...query, tag : tag.name}}}>
		                                        {tag.name}
		                                        <span className={classes.tag_count}>({tag.ciddleCount || 0})</span>
		                                    </Link>
		                                  </li>   
		                        })
		                    }
		                </ul>
		            </div>
		            <div className={classes.content}>
		            {
		                bSearch && !isCui ?
                            <CiddleList
                             ciddles={search.list}
                             goToCiddles={actions.goToCiddles}
                             userid={userid}
                             updateStatusAutoHide={actions.updateStatusAutoHide} /> : 
                                                            
		                    <div>
		                        <div className={classes.content_header}>
                                    {
                                    !isCui ?
		                                <h2>"Duplication is better than the wrong abstraction"</h2> : 
                                        <h2 className={classes.content_header_cui_title}>"开放你的代码，开放你的心"</h2>
                                    }
		                            <p>目前片儿上收录了
                                        <span className={classes.content_header_count}>
                                         {!isCui ? count : tags && tags.list && tags.list.filter(tag => cuiReg.test(tag.name))[0].ciddleCount}
                                        </span> 个{isCui ? 'CUI社区组件' : '代码片段'}
                                    </p>
		                        </div>
		                        <CiddleList
                                 ciddles={isCui ? search.list : recently.list}
                                 goToCiddles={actions.goToCiddles}
                                 userid={userid}
                                 updateStatusAutoHide={actions.updateStatusAutoHide} />
		                    </div>
		            }
                    {this.pageEls}
		            </div>                 				
		        </div>
				<div className={classes.footer}>
					<p>
						<span className={classes.footer_logo}>片儿</span><b>·</b>
						<span className={classes.footer_links}>
							<a target="_blank" href="http://gitlab.alibaba-inc.com/mcn/app-ciddle/issues">意见反馈</a>
							<a href="#">帮助文档</a>
							<a href="#">关于我们</a>														
						</span>
					</p>
				</div>	  
			</div>
            </DocumentTitle>
        )
    }
}
