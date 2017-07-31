import React, { Component } from 'react'
import DocumentTitle from 'react-document-title'
import CiddleHozList from '../../components/CiddleList/CiddleHozList'
import { Icon } from 'react-fa'
import classNames from 'classnames'

import classes from './User.scss'

export default class User extends Component {

  constructor (props){
    super(props)
    this.state = {
        mode : 0          // 0 --创建的 1 --收藏的
    }
  }

  componentDidMount() {
    const { actions, userid } = this.props
    
    actions.fetchUser(userid)
  }

  handleToggleMode = (mode) => {
    this.setState({mode : mode})
  }

  render (){
      const { user : { current, login }, userid } = this.props
      const selfUser = userid === '$'
      const user = selfUser ? { ...login, ...current } : current
      const title = user.cname ? user.cname : '加载中'
      //const name = selfUser ? 'WO' : 'TA'
      const name = 'TA'
      const { createdCiddles, staredCiddles } = user
      const { mode } = this.state

      const createdName = classNames({[classes.user_ciddles_item] : true, [classes.user_ciddles_item_active] : mode === 0})
      const staredName = classNames({[classes.user_ciddles_item] : true, [classes.user_ciddles_item_active] : mode === 1})

      const createdNum = createdCiddles && createdCiddles.length ? createdCiddles.length : 0
      const staredNum = staredCiddles && staredCiddles.length ? staredCiddles.length : 0

      return (
            <DocumentTitle title={`${title}-Ciddle`}>
            {
                user.cname ? 
                    <div className={classes.main_user}>
                        <div className={classes.user_profile}>
                            <div className={classes.user_info}>
                                <img className={classes.user_img} src={user.avatar_url} alt={user.cname} />
                                <h3 className={classes.user_name}>{user.cname}</h3>
                                <p>ID：{user.userid}</p>
                            </div>
                            <div className={classes.user_ciddles}>
                                <span className={createdName} onClick={e => this.handleToggleMode(0)}>
                                    <span className={classes.user_ciddles_num}>{createdNum}</span><br/>{name}的创建
                                </span>
                                <span className={staredName} onClick={e => this.handleToggleMode(1)}>
                                    <span className={classes.user_ciddles_num}>{staredNum}</span><br/>{name}的收藏
                                </span>
                            </div>
                        </div>

                        <div className={classes.user_list}>
                            {
                                mode === 1 ? <CiddleHozList header={`${name}的收藏`} ciddles={staredCiddles} userid={login.userid}></CiddleHozList> : null
                            }
                            
                            {
                                mode === 0 ? <CiddleHozList header={`${name}的创建`} ciddles={createdCiddles} userid={login.userid}></CiddleHozList> : null
                            }
                        </div>
                    </div> :
                    <div className={classes.main_user}>玩命加载用户信息中...</div>
            }
            </DocumentTitle>
      )
  }

}
