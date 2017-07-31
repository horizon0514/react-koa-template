import React, { Component } from 'react'
import { IndexLink, Link }  from 'react-router'
import classNames           from 'classnames'
import Button               from '../../components/Button'
import Editor               from '../../components/Editor'
import Preview              from '../../components/Preview'
import MdPreview            from '../../components/Preview/MdPreview'
import RawPreview           from '../../components/Preview/RawPreview'
import HtmlPreview          from '../../components/Preview/HtmlPreview'
import WeexPreview          from '../../components/Preview/WeexPreview'
import MDFullScreen         from '../../components/MDFullScreen'
import CopyToClipboard      from 'react-copy-to-clipboard'
import Tooltip              from '../../components/Tooltip'
import DocumentTitle        from 'react-document-title'
import { Icon }             from 'react-fa'
import classes              from './Ciddle.scss'
import pick                 from 'object.pick'
import QRCode               from 'qrcode.react'


export default class Ciddle extends Component {
    constructor (props){
        super(props)
        this.state = {
            showEditor : false,
            bMobile : true,
            //bMdFullScreen : false,

            canRunweex : false,
            cuiDoc : true 
        }
    }

    componentWillMount (){
        const { actions, location : { query : {ctype, fullscreen} } } = this.props    

        // 这里不给默认值，是希望一开始不闪现weex
        if(ctype){
            actions.initCiddleWithCtype(ctype)
        }

        // if('undefined' !== typeof fullscreen){
        //     actions.initCiddleWithCtype('md')
        //     this.setState({bMdFullScreen : true})
        // }
    }

    componentDidMount (){
        const { actions, id, mode } = this.props

        if(id){
            actions.fetchCiddle(id).then(res => this.setState({canRunWeex : true}))
        }

        this.showEditorTimeout = setTimeout(() => {
            this.setState({ showEditor: true })
        })

        window.addEventListener('beforeunload', this.confirmBeforeExit)
    }

    componentDidUpdate(prevProps) {
        if (prevProps.id !== this.props.id) {
          this.componentDidMount()
        }
    }

    componentWillUnmount() {
        this.showEditorTimeout && clearTimeout(this.showEditorTimeout)
        this.runWeexTimer && clearTimeout(this.runWeexTimer)

        window.removeEventListener('beforeunload', this.confirmBeforeExit)
    }

    confirmBeforeExit = (e) => {
        const { modified, ctype } = this.props
        const isAnyModified = ctype === 'weex' ? modified.weex : 
                            ctype === 'md' ? modified.md : 
                            ctype === 'html' || ctype === 'cui' || ctype === 'walle' ? (modified.html || modified.md) :
                            (modified.js || modified.css || modified.html)

        if (isAnyModified) {
          e.returnValue = isAnyModified
          return isAnyModified
        }
        return undefined 
    }

    handleSaveCiddle = () => {
        const { actions, ...ciddle } = this.props

        actions.saveCiddle(pick(ciddle, ['id', 'code', 'ctype', 'mode']))
    }


    changeMode = (mode) => {
        const { actions, location : {pathname, query} } = this.props

        //actions.changeMode(mode)
        actions.changeModeAndQuery(mode, pathname, query)
    }

    runWeex = () => {
        const { actions, code } = this.props

        return actions.transformWeex(code.weex)
    }

    handleBeautyCode = () => {
        const { actions, code, mode } = this.props

        actions.beautifyCode(code[mode], mode)
    }

    handleToMobile = (flag) => {
        
        this.setState({bMobile : flag})
    }

    handleToggleMDScreen = (flag) => {
        //this.setState({bMdFullScreen : flag})
        
    }

    // handleChangeCuiMode = (flag) => {
    //     this.setState({cuiDoc : flag})
    // }

    get qrcode (){
        return ( 
            <div>
                <p className={classes.qrcode_des}>使用<a href="https://itunes.apple.com/ca/app/weex-playground/id1130862662?mt=8" target="_blank">WP</a>扫码</p>
                <QRCode value={`${window.location.protocol}//${window.location.host}/demo.js`} size={72} />
            </div>
        )
    }

    render (){
        const { id, /*mode,*/ title, error, code, ctype, previewLoading, actions,
                transformedWeex, creator, loginUser, location : { query : {m, fullscreen}, pathname } } = this.props
        const pageTitle = id === 'new' ? '新片段' : title
        const bPcOrMobile = ctype === 'react' || ctype === 'raw' || ctype === 'html'
        //const isThreeCol = creator && loginUser.userid && creator.userid !== loginUser.userid && ctype === 'cui'
        const isNotCreator = creator && loginUser.userid && creator.userid !== loginUser.userid && (ctype === 'cui' || ctype === 'walle')

        const mode = m || this.props.mode

        const previewAreaClass = classNames({
            [classes.preview_area] : true,
            [classes.weex_preview_area] : mode === 'weex' || (bPcOrMobile && this.state.bMobile),
            //[classes.cui_preview_area] : isThreeCol
        })

        const badgeClass = classNames({
            [classes.ctype_badge] : true,
            [classes.ctype_badge_weex] : ctype === 'weex',
            [classes.ctype_badge_react] : ctype === 'react',
            [classes.ctype_badge_raw] : ctype === 'raw',
            [classes.ctype_badge_md] : ctype === 'md',
            [classes.ctype_badge_html] : ctype === 'html' || ctype === 'cui',
            [classes.ctype_badge_walle] : ctype === 'walle'
        })

        const middleBarClass = classNames({
            [classes.middle_bar] : true,
            //[classes.cui_middle_bar] : isThreeCol
        })

        const ctypeMaps = {
            weex : 'WX',
            react : 'RE',
            raw : 'JS',
            md : 'MD',
            html : 'HTML',
            cui : 'CUI',
            walle : 'WLE'
        }

        return (
            <DocumentTitle title={ pageTitle || '读取中...' }>
            <div className={classes.ciddle_area}>
                <div className={classes.editor_area}>

                    {
                        error ?
                        <Tooltip
                            overlay={<div className={classes.error_console}>{error}</div>}
                            matchContentWidth>
                            <Icon name="exclamation-circle" className={classes.error_icon} />
                          </Tooltip>
                        : null
                    }

                    <div className={classes.editor_bar}>
                        <div className={badgeClass}>{ctypeMaps[ctype] || ctype}</div>
                        <div className={classes.weex_toggle_bar}>
                            {
                            !isNotCreator || (isNotCreator && (ctype === 'cui' || ctype === 'walle') && mode === 'html') ?
                            <CopyToClipboard text={code[mode]} onCopy={() => actions.updateStatusAutoHide('复制成功')}>
                                <Button
                                className={classes.editor_copy}
                                icon="clipboard"
                                title="copy代码到粘贴板"></Button>
                            </CopyToClipboard> : null
                            }

                            {
                                !isNotCreator || (isNotCreator && (ctype === 'cui' || ctype === 'walle') && mode === 'html') ?
                                <Button
                                className={classes.editor_format}
                                onClick={this.handleBeautyCode}
                                icon="align-left"
                                title="美化代码"></Button> : null
                            }

                            {
                                mode === 'weex' ? 
                                    <Button
                                    className={classes.weex_play}
                                    onClick={this.runWeex}
                                    icon="play-circle"
                                    title="执行weex"></Button> : null
                            }
                        </div>

                        {
                            ctype === 'react' || ctype === 'raw' ? 
                                <div className={classes.mode_bar}>
                                    { ctype === 'raw' ? <span className={classNames({[classes.mode_active] : mode === 'html'})} onClick={e => this.changeMode('html')}>HTML</span> : null}
                                    <span className={classNames({[classes.mode_active] : mode === 'js'})} onClick={e => this.changeMode('js')}>JavaScript</span>    
                                    <span className={mode === 'css' ? classes.mode_active : ''} onClick={e => this.changeMode('css')}>CSS</span>
                                </div> : null
                        }

                        {
                            ctype === 'html' || ctype === 'cui' || ctype === 'walle' ?
                                <div className={classes.mode_bar}>
                                    <span className={classNames({[classes.mode_active] : mode === 'html'})} onClick={e => this.changeMode('html')}>HTML</span>
                                    <span className={classNames({[classes.mode_active] : mode === 'md'})} onClick={e => this.changeMode('md')}>文档</span>
                                </div> : null
                        }

                        {
                            ctype === 'md' ?
                                <div className={classes.mode_bar}>
                                    <span className={classes.mode_active}>MarkDown</span>
                                </div> : null
                        }

                        {
                            ctype === 'weex' ?
                                <div className={classes.mode_bar}>
                                    <span className={classes.mode_active}>WEEX</span>
                                </div> : null
                        }
                    </div>

                    {
                        this.state.showEditor ? 
                        <div className={classes.pure_editor_area}>
                            {
                                mode === 'html' ?
                                <Editor
                                mode="html"
                                onSave={this.handleSaveCiddle}
                                code={code.html}
                                actions={actions} /> : null
                            }

                            {
                                mode === 'js' ?
                                <Editor
                                mode="js"
                                onSave={this.handleSaveCiddle}
                                code={code.js}
                                actions={actions} /> : null
                            }

                            {
                                mode === 'css' ?
                                <Editor
                                mode="css"
                                onSave={this.handleSaveCiddle}
                                code={code.css}
                                actions={actions} /> : null
                            }

                            {
                                mode === 'weex' ?
                                <Editor
                                mode="weex"
                                onSave={this.handleSaveCiddle}
                                code={code.weex}
                                actions={actions} /> : null
                            }

                            {
                                !isNotCreator && mode === 'md' ?
                                <Editor
                                mode="md"
                                onSave={this.handleSaveCiddle}
                                code={code.md}
                                actions={actions} /> : null
                            }

                            {
                                isNotCreator && mode === 'md' ?
                                <MdPreview code={code.md} actions={actions} bUnLoad></MdPreview> : null
                            }
                        </div> : null
                    }
                    
                </div>

                <div className={middleBarClass}></div>

                <div className={previewAreaClass}>
                    <div className={classes.preview_bar}>
                        <span>预览区</span>
                        <div className={classes.preview_action_bar}>
                            {
                                !bPcOrMobile ? null : !this.state.bMobile ?
                                    <Button icon="mobile" title="Mobile视口" onClick={e => this.handleToMobile(true)} /> :
                                        <Button icon="laptop" title="PC视口" onClick={e => this.handleToMobile(false)} />
                            }         
                            {
                                ctype === 'weex' && __PROD__ ? 
                                    <span className={classes.qrcode}><Button icon="qrcode" title={this.qrcode} /></span> : null
                            }
                            {
                                ctype !== 'md' ? null :
                                    <Link to={`${pathname}?fullscreen`}>
                                        <Button icon="window-maximize" title="全屏显示" />   
                                    </Link>
                            }

                            { 
                                // ctype === 'cui' && isNotCreator ? 
                                //     (!this.state.cuiDoc ?
                                //      <Button icon="book" title="看文档" onClick={e => this.handleChangeCuiMode(true)} /> :
                                //         <Button icon="photo" title="看效果" dot onClick={e => this.handleChangeCuiMode(false)} />) : null
                            }
                        </div>
                    </div>
                    {
                        previewLoading ?
                        <div className={classes.preview_loading}>
                            <Icon name="circle-o-notch" spin></Icon>
                        </div> : null
                    }

                    {
                        ctype === 'weex' ? <WeexPreview code={transformedWeex} actions={actions} runWeex={this.runWeex} canRunWeex={this.state.canRunWeex}></WeexPreview> : null
                    }
                    {
                        ctype === 'md' ? <MdPreview code={code.md} actions={actions}></MdPreview> : null
                    }
                    {
                        ctype === 'react' ? <Preview code={code} actions={actions} error={error} id={id} ctype={ctype} /> : null
                    }
                    {
                        ctype === 'raw' ? <RawPreview code={code} actions={actions} error={error} id={id} ctype={ctype} /> : null
                    }

                    {
                        ctype === 'html' || ctype === 'cui' || ctype === 'walle' ?
                            <div>
                                <div style={{display : !isNotCreator && mode === 'md' ? '' : 'none'}}>
                                    <MdPreview code={code.md} actions={actions}></MdPreview>
                                </div>
                                <div style={{display : !isNotCreator ? (mode === 'html' ? '' : 'none') : ''}}>
                                    <HtmlPreview code={code.html} actions={actions}></HtmlPreview>
                                </div>
                            </div> : null
                    }

                </div>

                {
                    ctype === 'md' ?
                        <MDFullScreen
                         code={code.md}
                         pathname={pathname}
                         visible={fullscreen} /> : null
                }
            </div>        
            </DocumentTitle>
        )
    }
}
