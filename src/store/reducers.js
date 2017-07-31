import { combineReducers } from 'redux'
import { routerReducer as router } from 'react-router-redux'
import { userReducer as user } from '../modules/user'
import { statusReducer as status } from '../modules/status'
import { ciddleReducer as ciddle } from '../modules/ciddle'
import { ciddlesReducer as ciddles } from '../modules/ciddles'
import { tagsReducer as tags } from '../modules/tags'
import { managerReducer as manager } from '../modules/manager'

export default () => combineReducers({
    router,
    status,
    user,
    ciddle,
    ciddles,
    tags,
    manager
})
