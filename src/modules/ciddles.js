import { updateStatus } from './status'
import * as ciddleService from 'services/ciddle'

// ------------------------------------
// Constants
// ------------------------------------
export const CIDDLES_FATCHING = 'CIDDLES_FATCHING'
export const CIDDLES_FATCHED = 'CIDDLES_FATCHED'
export const CIDDLES_COUNT_FATCHED = 'CIDDLES_COUNT_FATCHED'
export const SEARCH_INFOS = 'SEARCH_INFOS'

// ------------------------------------
// Actions
// ------------------------------------
const fetchingCiddles = value => ({
  type: CIDDLES_FATCHING,
  payload: value,
})

const fetchedCiddles = value => ({
  type: CIDDLES_FATCHED,
  payload: value,
})

const fetchedCiddlesCount = value => ({
  type: CIDDLES_COUNT_FATCHED,
  payload: value,
})

const fetchedSearchInfos = result => ({
    type : SEARCH_INFOS,
    payload : result
})

const fetchCiddles = (type, query) => (dispatch) => {
  dispatch(updateStatus('fetching'))
  dispatch(fetchingCiddles({ type, query }))
  return ciddleService.getAll(type, query)
    .then(data => {
      dispatch(updateStatus(''))
      dispatch(fetchedCiddles({ type, data }))
    })
}

const fetchCiddlesCount = () => (dispatch) => {
  dispatch(updateStatus('fetching'))
  return ciddleService.getCount()
    .then(data => {
      dispatch(updateStatus(''))
      dispatch(fetchedCiddlesCount(data.count))
    })
}

const fetchSearchInfos = (keyword) => (dispatch) => {
  dispatch(updateStatus('fetching'))

  return ciddleService.search({key : keyword}).then(resp => {
    dispatch(updateStatus(''))
    dispatch(fetchedSearchInfos(resp))
  }).catch(err => console.log('search errors'))
}

export const actions = {
  fetchCiddles,
  fetchCiddlesCount,
  fetchSearchInfos,
  fetchedSearchInfos
}

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [CIDDLES_FATCHING]: (state, action) => {
    const { type, query = {} } = action.payload
    return {
      ...state,
      [type]: {
        ...state[type],
        fetching: true,
        current: query.page,
      },
    }
  },
  [CIDDLES_FATCHED]: (state, action) => {
    const { type, data } = action.payload
    return {
      ...state,
      [type]: {
        ...state[type],
        ...data,
        fetching: false,
      },
    }
  },
  [CIDDLES_COUNT_FATCHED]: (state, action) => ({
    ...state,
    count: action.payload,
  }),

  [SEARCH_INFOS] : (state, action) => {
    return {
        ...state,
        searchResult : action.payload
    }
  }
}

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {
  recently: {},
  // mostStared: {},
  // latestStared: {},
  search: {},
  count: '',

  searchResult : {}
}

export function ciddlesReducer(state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}

