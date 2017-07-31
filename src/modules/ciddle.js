import { updateStatus, updateStatusAutoHide }   from './status'
import { LOCATION_CHANGE, push }                from 'react-router-redux'
import * as ciddleService                       from 'services/ciddle'
import * as otherService                        from 'services/other'
import { actions as managerActions }            from 'modules/manager'
import cssbeautify                              from 'cssbeautify'
import { html as htmlbeautify }                 from 'js-beautify'
import tidymarkdown                             from 'prettify-markdown'
import pick                                     from 'object.pick'
import qs                                       from 'qs'
import {
    initialWeexCode,
    initialCssCode,
    initialMdCode,
    initialJavascriptCode,
    initialHtmlWildCode,
    initialHtmlCode,
    initialReactCode,
    initialWalleMdCode,
    initialWalleCode
} from 'utils/tmpl'
//import versionObj                               from 'utils/cui-version.json'

//import loadScript from 'load-script'
//import { setPersist, getPersist, clearPersist } from 'utils/code-persist'

// ------------------------------------
// Helps 
// ------------------------------------

const { fetchVersion } = managerActions
const masterUsers = ['zhonghao.zzh', 'yabing.zyb']

const initialCode = {
    weex : initialWeexCode,
    html : initialHtmlCode,
    css : initialCssCode,
    md : initialMdCode,
    js : ''
}

const normalInitialCode = (ctype) => {
    if(ctype === 'raw'){
        initialCode.js = initialJavascriptCode
    }else if(ctype === 'react'){
        initialCode.js = initialReactCode
    }else if(ctype === 'html' || ctype === 'cui'){
        initialCode.html = initialHtmlWildCode
    }else if(ctype === 'walle'){
        initialCode.html = initialWalleCode
        initialCode.md = initialWalleMdCode
    }
    
    return initialCode
}



// ------------------------------------
// Constants
// ------------------------------------
const CODE_UPDATE = 'CODE_UPDATE'
const CIDDLE_FETCHED = 'CIDDLE_FETCHED'
const CHANGED_MODE = 'CHANGED_MODE'
const CHANGED_CTYPE = 'CHANGED_CTYPE'
const UPDATED_CODE = 'UPDATED_CODE'
const TRANSFORMED_WEEX = 'TRANSFORMED_WEEX'
const TITLE_MODAL_VISIBLE = 'TITLE_MODAL_VISIBLE'
const CONFIRM_MODAL_VISIBLE = 'CONFIRM_MODAL_VISIBLE'
const CIDDLE_SAVED = 'CIDDLE_SAVED'
const META_PANEL_VISIBLE = 'META_PANEL_VISIBLE'
const STARED_CIDDLE = 'STARED_CIDDLE'
const ERROR_DISPLAY = 'ERROR_DISPLAY'
const PREVIEW_LOADING_SETTED = 'PREVIEW_LOADING_SETTED'


// ------------------------------------
// Actions
// ------------------------------------

// ---------- middleware ---------------
const fetchCiddle = (id) => (dispatch, getState) => {
    if(id === 'new'){
        return new Promise( (resolve, reject) => {

            dispatch(fetchVersion()).then(version => {
                const code = {...initialCode, html : 'function' === typeof initialCode.html ? initialCode.html(version) : initialCode.html}

                dispatch(fetchedCiddle({
                    revisions : [{
                        code : {
                          //...initialCode
                          ...code
                        }
                    }],
                    id
                }))

                resolve()
            })
        })
        
    }

    if (!getState().status) {
        dispatch(updateStatus('fetching'))
    }
    return ciddleService.get(id)
        .then(body => {
          const { status, ciddle } = getState()

          // 这里有bug，这个显示不了
          if (ciddle.id === 'new') {
            dispatch(updateStatusAutoHide('创建成功'))
          }
            
          if (status === 'fetching') {
            dispatch(updateStatus(''))
          }
          dispatch(fetchedCiddle(body))
          dispatch(changeCType(body.ctype))
        }).catch(err => {
            dispatch(updateStatusAutoHide({error : true, message : '搬运片段失败'}))
        })
}

const createCiddle = (ciddle) => (dispatch) => {
    dispatch(updateStatus('fetching'))
    return ciddleService.create(ciddle)
        .then(data => {
          dispatch(savedCiddle())
          // 跳转至 生成后的 riddleid 地址
          dispatch(push(`/ciddles/${data.id}`))
        }).catch(err => {
            dispatch(updateStatusAutoHide({error : true, message : '创建片段失败'}))
        })
}

const changeMode = (mode) => (dispatch) => {
    dispatch(changedMode(mode))
}

const changeModeAndQuery = (mode, pathname, query) => (dispatch) => {
    const params = {...query, m : mode}
    
    dispatch(push(`${pathname}?${qs.stringify(params)}`))
    dispatch(changedMode(mode))
}

const changeCType = (ctype) => (dispatch, getState) => {
    const { ciddle : {mode, creator}, user : {login} } = getState()
    const isNotCreator = creator && creator.userid !== login.userid
    const maps = {
        'weex' : 'weex',
        'react' : 'js',
        'raw' : 'html',
        'md' : 'md',
        'html' : 'html',
        'cui' : !!creator && isNotCreator ? 'md' : 'html',
        'walle' : !!creator && isNotCreator ? 'md' : 'html'
    }

    dispatch(changedCType(ctype))

    if(!mode || ( (ctype === 'cui' || ctype === 'walle') && isNotCreator)){
        dispatch(changedMode(maps[ctype] || 'js'))
    }
}

const updateCode = (code, mode) => (dispatch) => {
    dispatch(updatedCode(code, mode))
}

const transformWeex = (weex) => (dispatch) => {
    dispatch(setPreviewLoading(true))
    return otherService.transformWeex(weex).then(res => {
        dispatch(transformedWeex(res.result))
        dispatch(setPreviewLoading(false))
    }).catch(err => dispatch(setPreviewLoading(false)))
}


const saveCiddle = (target) => (dispatch, getState) => {
    const { ciddle, user: { login } } = getState()
    
    if( 'code' in target){
        // 检查代码，是否出错，是否被改变过
        const { modified, error, confirmModalVisible, creator, ctype } = ciddle
        const isAnyCodeModified = modified && (modified.js || modified.css || modified.html || modified.md || modified.weex)

        if (!isAnyCodeModified || error) {
          dispatch(updateStatusAutoHide({error : true, message : '出错了或者没有代码修改'}))
          return null
        }

        // 对非创建者进行二次确认
        // if (creator && creator.userid !== login.userid && !confirmModalVisible) {
        //   dispatch(setConfirmModalVisible(true))
        //   return null
        // }

        if(creator && creator.userid !== login.userid){
            if(ctype === 'cui' && masterUsers.indexOf(login.userid) === -1){
                dispatch(updateStatusAutoHide({error : true, message : '抱歉，cui模式中只有创建者可以修改噢!'}))
                return null
            }

            if(!confirmModalVisible){
               dispatch(setConfirmModalVisible(true))
               return null 
            }
        }
    }

    // 创建一个新ciddle
    if(target.id === 'new'){
        if (!target.title && !ciddle.titleModalVisible) {
          dispatch(setTitleModalVisible(true))
          return null
        }
        // 复制一份
        const newCiddle = { ...target }
        // 去掉 id = new
        delete newCiddle.id
        // 创建一个新的ciddle
        // @TODO 成功之后是否要跳转至ciddle/ciddleid
        dispatch(createCiddle(newCiddle))
        return null
    }

    // 更新一个已经存在的ciddle
    dispatch(updateStatus('fetching'))
    return ciddleService.update(target)
        .then(() => {
          dispatch(savedCiddle())
          dispatch(updateStatusAutoHide('操作成功'))
          dispatch(fetchCiddle(target.id))
        })
}


const starCiddle = (ciddleId, stared) => (dispatch) => {
    dispatch(staredCiddle(stared))
    ciddleService.star(ciddleId, stared)
}

const initCiddleWithCtype = (ctype) => (dispatch) => {
    normalInitialCode(ctype)
    dispatch(changeCType(ctype))
}

const displayError = error => ({
  type: ERROR_DISPLAY,
  payload: error
})

const setPreviewLoading = (value) => ({
  type: PREVIEW_LOADING_SETTED,
  payload: value
})

const beautifyCode = (code, mode) => (dispatch) => {
    if(mode === 'css'){
        const newCode = cssbeautify(code, {
          indent: '  ',
          autosemicolon: true,
        })
        return dispatch(updateCode(newCode, mode))
    }

    if( mode === 'md' ){
        return dispatch(updateCode(tidymarkdown(code), mode))
    }

    if( mode === 'html' || mode === 'weex'){
        return dispatch(updateCode(htmlbeautify(code), mode))
    }

    if( mode === 'js'){
        otherService.beautifyCode(code, mode).then(res => {
            return dispatch(updateCode(res.code, res.mode))
        })
    }
}

const goToHelp = () => (dispatch) => {
    dispatch(push('/help'))
}

const goToCiddles = (id, ctype) => (dispatch) => {
    //dispatch(changeCType(ctype))
    dispatch(push(`/ciddles/${id}`))
}

// ---------- pure action -----------
const fetchedCiddle = ciddle => {
    return {
        type : CIDDLE_FETCHED,
        payload : ciddle
    }
}

const changedMode = mode => {
    return {
        type : CHANGED_MODE,
        mode : mode
    }
}

const changedCType = ctype => {
    return {
        type : CHANGED_CTYPE,
        payload : ctype
    }
}

const updatedCode = (code, mode) => {
    return {
        type : UPDATED_CODE,
        payload : {
            code : code,
            mode : mode
        }
    }
}

const savedCiddle = () => ({
    type : CIDDLE_SAVED 
})

const transformedWeex = (code) => {
    return {
        type : TRANSFORMED_WEEX,
        payload : code
    }
}

const setTitleModalVisible = (flag) => {
    return {
        type : TITLE_MODAL_VISIBLE,
        payload : flag
    }
}

const setMetaPanelVisible = (flag) => {
    return {
        type : META_PANEL_VISIBLE,
        payload : flag
    }
}

const setConfirmModalVisible = (flag) => {
    return {
        type : CONFIRM_MODAL_VISIBLE,
        payload : flag
    }
}

const staredCiddle = (stared) => {
    return {
        type : STARED_CIDDLE,
        payload : stared
    }
}


export const actions = {
    fetchCiddle,
    saveCiddle,
    starCiddle,
    changeMode,
    changeModeAndQuery,
    updateCode,
    beautifyCode,
    initCiddleWithCtype,
    transformWeex,
    setTitleModalVisible,
    setMetaPanelVisible,
    setConfirmModalVisible,
    displayError,
    setPreviewLoading,
    goToHelp,
    goToCiddles
}


// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {

  [CIDDLE_FETCHED]: (state, action) => {
    const ciddleData = action.payload
    const rev = (ciddleData.revisions || [])[0]
    return {
      ...state,
      ...ciddleData,
      ...pick(rev, ['code', 'modifier', 'modifiedAt']),
      lastSavedCode: rev.code
    }
  },

  [CIDDLE_SAVED] : (state, action) => {
    return {
        ...state,
        modified : {},                  // 清空修改状态
        lastSavedCode : state.code      // 设置上次修改得的代码为保存成功后的这次
    }  
  },

  [CHANGED_MODE] : (state, action) => {
    return {
        ...state,
        mode : action.mode
    }
  },

  [CHANGED_CTYPE] : (state, action) => {
    return {
        ...state,
        ctype : action.payload
    }
  },

  [UPDATED_CODE] : (state, action) => {
    const { code, mode } = action.payload
    return {
        ...state,
        code : {
            ...state.code,
            [mode] : code
        },
        modified : {
            ...state.modified,
            [mode] : (state.lastSavedCode[mode] || '').trim() !== code.trim()
        }
    }
  },

  [LOCATION_CHANGE]: (state, action) => {
    if (/^\/ciddles\/.*$/.test(action.payload.pathname)) {
      return state
    }
    return initialState
  },

  [TRANSFORMED_WEEX] : (state, action) => {
    return {
        ...state,
        transformedWeex : action.payload
    }
  },

  [TITLE_MODAL_VISIBLE] : (state, action) => {
    return {
        ...state,
        titleModalVisible : action.payload
    }
  },

  [CONFIRM_MODAL_VISIBLE] : (state, action) => {
    return {
        ...state,
        confirmModalVisible : action.payload
    }
  },

  [META_PANEL_VISIBLE] : (state, action) => {
    return {
        ...state,
        metaPanelVisible : action.payload
    }
  },

  [STARED_CIDDLE] : (state, action) => {
    return {
        ...state,
        stared : action.payload
    }
  },

  [ERROR_DISPLAY]: (state, action) => ({
    ...state,
    error: action.payload,
    previewLoading: false
  }),

  [PREVIEW_LOADING_SETTED]: (state, action) => ({
    ...state,
    previewLoading: action.payload,
  })

}




const initialState = {
    ctype : '',         // 模式切换，目前就weex, react, raw, md

    mode : '',          // 代码类型
    code : {
        js : '',
        css : '',
        html : '',        
        md : '',
        weex : ''
    }, 

    // transformedWeex

    /*
     *@ {js : Boolean, css : Boolean, weex : Boolean}
     */
    modified : {},
    lastSavedCode : {},

    previewLoading : true
}

// ------------------------------------
// Reducer
// ------------------------------------
export function ciddleReducer(state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
