import React, { Component } from 'react'
import Modal from '../Modal'
import pick from 'object.pick'
import classes from './index.scss'

export default class ModalWrapper extends Component {

    constructor (props){
        super(props)

        this.state = {
            newCiddleTitle : '',
            formError : ''
        }
    }

    get titleModalProps (){
        const { ciddle : { titleModalVisible }, onSaveCiddle } = this.props

        return {
          title: '填写片段标题',
          okText: '保 存',
          onOk: () => {
            const { newCiddleTitle } = this.state
            if (!newCiddleTitle || !newCiddleTitle.trim()) {
              this.setState({
                formError: '请填写片段标题',
              })
              return
            }
            onSaveCiddle()
            this.setTitleModalVisible(false)
          },
          onCancel: () => this.setTitleModalVisible(false),
          visible: titleModalVisible,
          error: this.state.formError
        }
    }

    get confirmModalProps (){
        const { ciddle : { confirmModalVisible }, onSaveCiddle } = this.props

        return {
          title: '要修改此片段?',
          okText: '确认修改',
          onOk: () => {
            onSaveCiddle()
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

    // handleSaveCiddle (){
    //     const { actions, ciddle } = this.props

    //     if (ciddle.id === 'new') {
    //       if (this.state.newCiddleTitle && this.state.newCiddleTitle.trim() !== '') {
    //         ciddle.title = this.state.newCiddleTitle
    //         this.setState({
    //           newCiddleTitle: ''
    //         })
    //       }
    //       actions.saveCiddle(pick(ciddle, ['id', 'code', 'ctype', 'title']))
    //     } else {
    //       // 非new的情况下，不需要再更新ctype, 已经定了，不能修改
    //       actions.saveCiddle(pick(ciddle, ['id', 'code']))
    //     }
    // }

    render (){
        const { ciddle : { id } } = this.props
        const isNotNewCiddle = id !== 'new'
        return (
            <div style={{position: 'absolute'}}>
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
            </div>        
        )
    }
}
