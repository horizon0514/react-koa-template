import * as userService from 'services/user'
import { LOCATION_CHANGE, push } from 'react-router-redux'
import { updateStatus, updateStatusAutoHide } from './status'

// ------------------------------------
// Constants
// ------------------------------------
export const USER_FATCHED = 'USER_FATCHED'
export const LOGIN_USER_FATCHED = 'LOGIN_USER_FATCHED'

// ------------------------------------
// Actions
// ------------------------------------
const fetchedUser = value => ({
  type: USER_FATCHED,
  payload: value
})

const fetchedLoginUser = value => ({
  type: LOGIN_USER_FATCHED,
  payload: value
})

const fetchUser = (id) => {
  if (!id) {
    return (dispatch) => {
      dispatch(updateStatus('fetching'))
      userService.getLogin()
        .then(data => {
          dispatch(updateStatus(''))
          dispatch(fetchedLoginUser(data))
        })
    }
  }
  return (dispatch) => {
    dispatch(updateStatus('fetching'))
    userService.get(id)
      .then(data => {
        dispatch(updateStatus(''))
        dispatch(fetchedUser(data))
      })
  }
}

export const actions = {
  fetchUser
}

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [USER_FATCHED]: (state, action) => ({
    ...state,
    current: {
      ...state.current,
      ...action.payload,
    },
  }),
  [LOGIN_USER_FATCHED]: (state, action) => ({
    ...state,
    login: {
      ...state.login,
      ...action.payload,
    },
  }),

  // [LOCATION_CHANGE]: (state, action) => {
  //   if (/^\/users\/.*$/.test(action.payload.pathname)) {
  //     return state
  //   }
  //   return initialState
  // }
}

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {
  login: {},
  current: {}
}

export function userReducer(state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
