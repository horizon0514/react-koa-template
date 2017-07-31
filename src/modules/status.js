import { LOCATION_CHANGE } from 'react-router-redux'

// ------------------------------------
// Constants
// ------------------------------------
const STATUS_UPDATED = 'STATUS_UPDATED'

let timer

// ------------------------------------
// Actions
// ------------------------------------
export const updateStatus = value => (dispatch) => {
    if(timer) clearTimeout(timer)
    dispatch(updatedStatus(value))
}

export const updateStatusAutoHide = (value, delay = 2e3) => (dispatch) => {
    dispatch(updatedStatus(value))
    if(timer) clearTimeout(timer)
    timer = setTimeout(() => dispatch(updatedStatus('')), delay) 
}

export const updatedStatus = value => ({
   type: STATUS_UPDATED,
   payload: value
})

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [STATUS_UPDATED]: (state, action) => {
    // if (state.error) {
    //   return state
    // }
    // if (state !== action.payload) {
    //   return action.payload || ''
    // }
    // return state
    
    /**
     * @payload  {error : true, message : ''} || 'fetching' || String || '' 
     */
    return action.payload 
  },
  [LOCATION_CHANGE]: () => '',
}

export const actions = {
  updateStatus,
  updateStatusAutoHide
}

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = ''

export function statusReducer(state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}

