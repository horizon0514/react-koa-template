import React, { Component } from 'react'
import Button               from 'components/Button'
import classNames           from 'classnames'
import classes              from './Manger.scss'

export default class Manger extends Component {

    componentDidMount (){
        const { actions } = this.props

        actions.fetchVersion()
    }

    handleUpdateCui = (e) => {
        const { actions, disabled } = this.props
        
        if(!disabled){
            actions.updateVersion()
        }
    }

    handleChangeVer = (type, e) => {
        const { actions } = this.props
        const val = e.target.value

        actions.changeVersion(type, val)
    }
    
    render (){
        const { manager : { version : {cui, jquery, seajs, platform}} } = this.props
        
        return (
            <div className={classes.manager_area}>
                <div className={classes.cui_area}>
                    <h3>CUI 版本更新</h3>
                    <div className={classes.cui_list}>
                        <p className={classes.cui_item}>
                            <label>CUI:</label> <input type="text" value={cui} onChange={e => this.handleChangeVer('cui', e)} placeholder="版本号" />
                        </p>
                        <p className={classes.cui_item}>
                            <label>jQuery:</label> <input type="text" value={jquery} onChange={e => this.handleChangeVer('jquery', e)} placeholder="版本号" />
                        </p>
                        <p className={classes.cui_item}>
                            <label>Seajs:</label> <input type="text" value={seajs} onChange={e => this.handleChangeVer('seajs', e)} placeholder="版本号" />
                        </p>
                        <p className={classes.cui_item}>
                            <label>Platform:</label> <input type="text" value={platform} onChange={e => this.handleChangeVer('platform', e)} placeholder="版本号" />
                        </p>
                    </div>
                    <Button primary onClick={this.handleUpdateCui}>更新</Button>
                </div>
            </div>        
        )
    }
}
