import Header from './Header'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { actions as ciddleActions } from 'modules/ciddle'
import { actions as ciddlesActions } from 'modules/ciddles'
import { actions as userActions } from 'modules/user'
import { actions as statusActions } from 'modules/status'
import { actions as tagsActions } from 'modules/tags'

const mapStateToProps = (state) => ({
  ciddle: state.ciddle,
  ciddles : state.ciddles,
  loginUser: state.user.login,
  status: state.status,
})

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    ...ciddleActions,
    ...userActions,
    ...statusActions,
    ...tagsActions,
    fetchSearchInfos : ciddlesActions.fetchSearchInfos,
    fetchedSearchInfos : ciddlesActions.fetchedSearchInfos,
  }, dispatch),
})

export default connect(mapStateToProps, mapDispatchToProps)(Header)
