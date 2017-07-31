import React, { Component } from 'react'
import { IndexLink, Link } from 'react-router'
import { Icon } from 'react-fa'
import CopyToClipboard from 'react-copy-to-clipboard'
import pick from 'object.pick'
import moment from 'moment'
import Button from '../Button'
import TagList from '../TagList'
import TitleInput from '../TitleInput'
import SearchBar from '../SearchBar'
import Modal from '../Modal'
//import ModalWrapper from '../ModalWrapper'
import classes from './Header.scss'

export default class Header extends Component {
  constructor (props){
    super(props)

    this.state = {
        newCiddleTitle : '',
        formError : '',
        isShowInHome : true
    }
  }

  componentDidMount() {
    const { actions } = this.props
    
    actions.fetchUser() 
  }

  toggleMetas (){
    const { actions, ciddle : { metaPanelVisible } } = this.props   

    actions.setMetaPanelVisible(!metaPanelVisible)
  }

  get metaEls (){
    const { ciddle, actions} = this.props
    const { modifier, creator, modifiedAt, createdAt } = ciddle
            
    return (
       <span className={classes.meta_area}>
        <Icon
          title="点击查看片段详细信息"
          name="info-circle"
          onClick={() => this.toggleMetas()}
        />
        {
            ciddle.metaPanelVisible ? 
                <div className={classes.meta_content}>
                    <div>
                        标签 (不超过三个) : 
                        <TagList
                         onAdd={this.handleAddTag}
                         onRemove={this.handleRemoveTag}
                         searchable={true}
                         inline={true}
                         data={ciddle.tags}></TagList>
                    </div>
                    <div>
                         {
                          modifier && modifier.cname ? 
                            <span>{modifier.cname} 修改于 {moment(modifiedAt).fromNow()} | </span> : null
                         }
                         {creator.cname} 创建于 {moment(createdAt).format("YYYY-MM-DD HH:MM")}
                    </div>
                    <Icon
                      title="关闭片段详细信息"
                      className={classes.meta_close}
                      name="close"
                      onClick={() => actions.setMetaPanelVisible(false)}
                    />
                </div> : null
        }
       </span>                
    )
  }

  handleAddTag = (tag) => {
    const { actions, ciddle } = this.props
    ciddle.tags = ciddle.tags || []

    // @TODO 这里可以去除，在tagMenu里已经过滤了这些，没有机会增加
    const isTagExists = ciddle.tags.some(item => item.objectId === tag.objectId)
    if (isTagExists) {
      return
    }

    ciddle.tags.push(tag)
    actions.saveCiddle(pick(ciddle, ['id', 'tags'])) 
  }

  handleRemoveTag = (tag) => {
    const { actions, ciddle } = this.props
    ciddle.tags = ciddle.tags || []

    const isTagExistsIndex = ciddle.tags.findIndex(
      item => item.objectId === tag.objectId
    )
    if (!isTagExistsIndex < 0) {
      return
    }
    ciddle.tags.splice(isTagExistsIndex, 1)
    actions.saveCiddle(pick(ciddle, ['id', 'tags'])) 
  }

  toggleCiddleStared = () => {
      const { ciddle : { id }, actions} = this.props
    
      actions.starCiddle(id, !this.isStared)
  }

  handleSaveCiddle = (obj = {}) => {
    const { actions, ciddle } = this.props

    const newCiddle = {...ciddle, ...obj}
    //ciddle.isPrivate = isPrivate
    
    if (newCiddle.id === 'new') {
      if (this.state.newCiddleTitle && this.state.newCiddleTitle.trim() !== '') {
        newCiddle.title = this.state.newCiddleTitle
        this.setState({
          newCiddleTitle: ''
        })
      }
      actions.saveCiddle(pick(newCiddle, ['id', 'code', 'ctype', 'mode', 'title', 'isPrivate', 'isShowInHome']))
    } else {
      // 非new的情况下，不需要再更新ctype, 已经定了，不能修改
      actions.saveCiddle(pick(newCiddle, ['id', 'code', 'mode']))
    }
  }

  handleGotoHelp = () => {
      const { actions } = this.props
    
      actions.goToHelp()
  }

  handleChangeShowInHome = (e) => {
    this.setState({isShowInHome : !this.state.isShowInHome})
  }

  get isStared (){
    const { ciddle : { stared }} = this.props

    return stared
  }

  get titleMenu (){
    const types =[{name : 'Weex', ctype : 'weex'},
                  {name : 'React', ctype : 'react'},
                  {name : 'Web', ctype : 'raw'},
                  {name : 'MarkDown', ctype : 'md'},
                  {name : 'CUI社区组件', ctype : 'cui'},
                  {name : 'Walle', ctype : 'walle'},
                  {name : 'H5', ctype : 'html'}]

    return (
        <ul className={classes.new_list}>
            {
            types.map( (item, i) => <li key={i} className={classes[`new_list_item_${item.ctype}`]}><Link to={`/ciddles/new?ctype=${item.ctype}`} target="_blank">{item.name}</Link></li>)
            }    
        </ul>        
        )
  }

  get statusEl (){
      const { status } = this.props
      let statusText, statusType

      if( status === 'fetching'){
        statusText = <Icon name="circle-o-notch" spin />
        statusType = 'icon'
      }else if(status && status.error){
        statusType = 'error'  
        statusText = status.message
      }else{
        statusText = status
      }
    
      return (
        <div className={`${classes.status} ${classes[statusType]}`}>{statusText}</div>        
      )
  }

  get titleModalProps (){
        const { ciddle : { titleModalVisible } } = this.props
        const { isShowInHome } = this.state

        return {
          title: '填写片段标题',
          okText: '创建私有片段',
          onOk: () => {
            const { newCiddleTitle } = this.state
            if (!newCiddleTitle || !newCiddleTitle.trim()) {
              this.setState({
                formError: '请填写片段标题',
              })
              return
            }
            this.handleSaveCiddle({
                isPrivate : true,
                isShowInHome : isShowInHome
            })
            this.setTitleModalVisible(false)
            this.setState({isShowInHome : true})
          },
          conText: '创建公开片段',
          onCon: () => {
            const { newCiddleTitle } = this.state
            if (!newCiddleTitle || !newCiddleTitle.trim()) {
              this.setState({
                formError: '请填写片段标题',
              })
              return
            }
            this.handleSaveCiddle({
                isPrivate : false,
                isShowInHome : isShowInHome
            })
            this.setTitleModalVisible(false)
            this.setState({isShowInHome : true})
          },
          onCancel: () => {this.setTitleModalVisible(false); this.setState({isShowInHome : true})},
          visible: titleModalVisible,
          error: this.state.formError,
          extra : (
            <label className={classes.home_checkbox}>
                <input type="checkbox" onChange={this.handleChangeShowInHome} checked={isShowInHome} /> 展示在首页
            </label>
          )
        }
    }

    get confirmModalProps (){
        const { ciddle : { confirmModalVisible } } = this.props

        return {
          title: '要修改此片段?',
          okText: '确认修改',
          onOk: () => {
            this.handleSaveCiddle()
            this.setConfirmModalVisible(false)
          },
          onCancel: () => this.setConfirmModalVisible(false),
          visible: confirmModalVisible
        }
    }

    setTitleModalVisible (flag){
        const { actions } = this.props

        actions.setTitleModalVisible(flag)
    }

    setConfirmModalVisible (flag){
        const { actions } = this.props

        actions.setConfirmModalVisible(flag)
    }

    handleNewCiddleTitleChange = (e) => {
        this.setState({
          newCiddleTitle: e.target.value,
          formError : ''
        })
    }

  handleSaveTitle = (value) => {
    const { actions, ciddle } = this.props
    ciddle.title = value
    actions.saveCiddle(pick(ciddle, ['id', 'title']))
  }

  get shareUrl (){
    //const { ciddle : { ctype }} = this.props

    //return `${location.protocol}//${location.host}${location.pathname}${ctype === 'md' ? '?fullscreen' : ''}`
    return `${location.href}`
  }

  render (){
    const { loginUser, actions, ciddle } = this.props
    const { id, title, modified, mode, ctype } = ciddle
    const isNotNewCiddle = id && id !== 'new'
    const isAnyModified = ctype === 'weex' ? modified.weex : 
                            ctype === 'md' ? modified.md : 
                            ctype === 'html' || ctype === 'cui' ? (modified.html || modified.md) :
                            (modified.js || modified.css || modified.html) 

    return (
     <div className={classes.header}>
        <h1 className={classes.header_title}><Link to='/'>片儿</Link></h1>
        {
            isNotNewCiddle ? this.metaEls : null
        }
        {
            isNotNewCiddle ? null :
                <span className={classes.des}>{`菜鸟全栈社区`}</span>
        }

        {
            isNotNewCiddle ? <TitleInput value={title} onConfirm={value => this.handleSaveTitle(value)} /> : null
        }

        { this.statusEl }
        <div className={classes.info}>
            {
                !id || id !== 'new' ?
                    <span className={classes.create_btn}><Button icon="plus" title={this.titleMenu} primary>创建片段</Button></span> : null
            }

            {
                !id ? <SearchBar {...this.props} /> : null   
            }

            {
                id && isNotNewCiddle ?
                     <Button
                      icon="star-o"
                      stared={this.isStared}
                      title={this.isStared ? '取消收藏':'收藏'}
                      onClick={this.toggleCiddleStared}></Button> : null
            }
            
            {
                id ? <Button
                      icon="save"
                      dot={isAnyModified}
                      onClick={e => this.handleSaveCiddle()}
                      disabled={!isAnyModified}></Button> : null
            }
            
            {
                id && isNotNewCiddle ?
                    <CopyToClipboard text={this.shareUrl} onCopy={() => actions.updateStatusAutoHide('复制成功')}>
                        <Button
                        title="分享链接"
                        icon="share-alt"></Button>
                    </CopyToClipboard> : null
            }
            <Button icon="question-circle-o" title="帮助" onClick={this.handleGotoHelp} />
            <Link to='/users/$' className={classes.account} title="进入个人页面">
                <img alt={loginUser.cname} src={loginUser.avatar_url} />
            </Link>
        </div>

        {
            isNotNewCiddle ? null :
            <Modal {...this.titleModalProps}>
                <p>保存新片段前需要填写一个有意义的标题：</p>
                <p>
                  <input
                    type="text"
                    placeholder="此处填写"
                    value={this.state.newCiddleTitle}
                    onChange={this.handleNewCiddleTitleChange}
                  />
                </p>
            </Modal>
        }

        {
            isNotNewCiddle ? 
                 <Modal {...this.confirmModalProps}>
                    <p className={classes.warning}>您不是片段的创建者，需要您确认操作。</p>
                    <p>您将修改和保存这个片段，所有用户都将看到这次修改。如果您不确定在做什么，请点击取消。</p>
                  </Modal> : null
        }

        {
        //<ModalWrapper actions={actions} ciddle={ciddle} onSaveCiddle={this.handleSaveCiddle}></ModalWrapper>
        }
      </div>       
    ) 
  }
}
