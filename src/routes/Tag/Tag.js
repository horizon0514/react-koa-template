import React, { Component } from 'react'
import TagList from '../../components/TagList'
import Modal from '../../components/Modal'
import classes from './Tag.scss'
import DocumentTitle from 'react-document-title'

export default class Tag extends Component {

    constructor (props){
        super(props)

        this.state = {
            tagPanelNewVisible : false,
            tagPanelEditVisible : false,
            tagPanelRemoveVisible : false,

            formData : {},
            formError : ''
        }
    }

    componentDidMount (){
        const { actions } = this.props

        actions.fetchTags()
    }

    setModalVisible = (type, flag, tag) => {
        this.setState({
            [`tagPanel${type}Visible`] : flag,
            formError : '',
            formData : tag ? {
                name : tag.name,
                objectId : tag.objectId
            } : {}
        })
    }

    getModalProps (type){
        return {
          onOk: () => {
              const { formData : { name } } = this.state
              if(!name || !name.trim()){
                this.setState({formError : '请填写标签名'})
                return
              }

              this[`on${type}Tag`]()
              this.setModalVisible(type, false)
          },
          onCancel: () => this.setModalVisible(type, false),
          visible: this.state[`tagPanel${type}Visible`],
          error: this.state.formError
        }
    }

    getTagNameProps = (key, valueName = 'value') => {
        return {
            [valueName] : this.state.formData[key],
            onChange : (e) => {
                const formData = {...this.state.formData}
                formData[key] = e.target[valueName]
                this.setState({formData})
            }
        }
    }

    onNewTag (){
        const { actions } = this.props
        
        actions.createTag(this.state.formData)
    }

    onEditTag (){
        const { actions } = this.props
        
        actions.saveTag(this.state.formData)
    }

    onRemoveTag (){
        const { actions } = this.props
        
        actions.removeTag(this.state.formData)
    }

    render (){
        const { formData : { name } } = this.state
        const { tags } = this.props
        const tagNameProps = this.getTagNameProps('name')

        return (
            <DocumentTitle title='标签管理'>        
                <div className={classes.tag_area}>
                    <TagList
                    data={tags.list}
                    onAdd={tag => this.setModalVisible('New', true, tag)}
                    onClick={tag => this.setModalVisible('Edit', true, tag)}
                    onRemove={tag => this.setModalVisible('Remove', true, tag)}></TagList>

                    <Modal title="新增标签" okText="保 存" {...this.getModalProps('New')}>
                        <p>
                          <label>标签名：</label>
                          <input type="text" placeholder="处填写标签名" {...tagNameProps} />
                        </p>
                      </Modal>

                      <Modal title="编辑标签" okText="保 存" {...this.getModalProps('Edit')}>
                        <p>
                          <label>标签名：</label>
                          <input type="text" placeholder="此处填写标签名" {...tagNameProps} />
                        </p>
                      </Modal>

                      <Modal title="删除标签" {...this.getModalProps('Remove')}>
                        <div>
                          <span style={{ color: '#f50' }}>是否要删除标签</span>
                          <span> #{this.state.formData.name} </span>
                          <span style={{ color: '#f50' }}>？</span>
                        </div>
                      </Modal>
                </div>
            </DocumentTitle>
        )
    }
}
