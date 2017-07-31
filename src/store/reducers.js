import { combineReducers } from 'redux'
import { routerReducer as router } from 'react-router-redux'
import { counterReducer as counter } from 'modules/counter'

export default () => combineReducers({
    router,
    counter
})
