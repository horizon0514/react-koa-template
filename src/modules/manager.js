import * as managerService from 'services/manager'
import { updateStatus, updateStatusAutoHide } from './status'
//import versionObj from 'utils/cui-version.json'

// ------------------------------------
// Constants
// ------------------------------------
const VERSION_FETCHED = 'VERSION_FETCHED'
const VERSION_CHANGED = 'VERSION_CHANGED'
const DISABLED_TOGGLE = 'DISABLED_TOGGLE'

// ------------------------------------
// Actions
// ------------------------------------
const fetchedVersion = (value) => ({
    type : VERSION_FETCHED,
    payload : value
})

const changeVersion = (type, value) => ({
    type : VERSION_CHANGED,
    payload : value,
    m : type
})

const toggleDisabled = (flag) => ({
    type : DISABLED_TOGGLE,
    payload : flag
})

// const fetchVersion = () => (dispatch) => {
//     managerService.getCuiVersion().then(resp => {
//         dispatch(fetchedVersion(resp))    
//     }).catch(err => {
//         console.log(err)
//     })
// }

const updateVersion = () => (dispatch, getState) => {
    const { manager : { version }, user : {login} } = getState()

    // if(login.userid !== 'yabing.zyb'){
    //     dispatch(updateStatusAutoHide({'error' : true, message : '请联系 @蒂夫 修改版本'}))
    //     return
    // }

    for ( let i in version){
        if(version[i].trim() === ''){
            dispatch(updateStatusAutoHide({'error' : true, message : '版本号不要为空噢'}))
            return
        }
    }

    dispatch(updateStatus('fetching'))
    dispatch(toggleDisabled(true))
    managerService.updateCuiVersion(version).then(resp => {
        dispatch(fetchedVersion(resp.version))
        dispatch(updateStatusAutoHide('更新成功'))
        dispatch(toggleDisabled(false))
    }).catch(err => {
        dispatch(toggleDisabled(false))
        dispatch(updateStatusAutoHide({error : true, message : '更新失败，请稍后再试'}))
    })
}

const fetchVersion = () => (dispatch, getState) => {
    const { manager : {version}} = getState()
    
    return new Promise((resolve, reject) => {
        if(version.cui){
            resolve(version)
        }else{
            managerService.getCuiVersion().then(resp => {
                dispatch(fetchedVersion(resp))    
                resolve(resp)
            }).catch(err => {
                console.log(err)
                reject(err)
            })
        }
    })
    
}


export const actions = {
    fetchVersion,
    changeVersion,
    updateVersion
}

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [VERSION_FETCHED]: (state, action) => ({
    ...state,
    version : {
        ...action.payload
    }
  }),

  [VERSION_CHANGED] : (state, action) => {
    return {
        ...state,
        version : {
            ...state.version,
            [action.m] : action.payload
        }
    }
  },

  [DISABLED_TOGGLE] : (state, action) => {
    return {
        ...state,
        disabled : action.payload
    }
  }
}

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {
    version : {
        cui : '',
        jquery : '',
        seajs : '',
        platform : ''
    },
    
    disabled : false
}

export function managerReducer(state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
