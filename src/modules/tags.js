//import { updateStatus } from './status'
import * as tagsService from 'services/tags'

// ------------------------------------
// Helps
// ------------------------------------
const normalizeTags = (list) => {
    const ret = Array.from(list)
    const cuis = ret.filter(tag => /cui/i.test(tag.name)).sort((a, b) => a.name.length > b.name.length)
    const notCuis = ret.filter(tag => !/cui/i.test(tag.name))
    
    return cuis.concat(notCuis)
}


// ------------------------------------
// Constants
// ------------------------------------
export const TAGS_FATCH = 'TAGS_FATCH'
export const TAGS_FATCHED = 'TAGS_FATCHED'

// ------------------------------------
// Actions
// ------------------------------------
const fetchedTags = value => ({
  type: TAGS_FATCHED,
  payload: value,
})

const fetchTags = (query) => (dispatch) =>
  tagsService.getAll(query).then(data => {
    dispatch(fetchedTags({...data, list : normalizeTags(data.list)}))
  })

const createTag = (tag) => (dispatch) => {
  //dispatch(updateStatus('fetching'))
  return tagsService.create(tag)
    .then(() => {
      //dispatch(updateStatus())
      dispatch(fetchTags())
    })
}

const removeTag = (tag) => (dispatch) => {
  //dispatch(updateStatus('fetching'))
  return tagsService.remove(tag)
    .then(() => {
      //dispatch(updateStatus())
      dispatch(fetchTags())
    })
}

const saveTag = (tag) => (dispatch) => {
  //dispatch(updateStatus('fetching'))
  return tagsService.update(tag)
    .then(() => {
      //dispatch(updateStatus())
      dispatch(fetchTags())
    })
}

export const actions = {
  fetchTags,
  createTag,
  removeTag,
  saveTag,
}

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [TAGS_FATCHED]: (state, action) => ({
    ...state,
    ...action.payload,
  }),
}

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {}

export function tagsReducer(state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}

