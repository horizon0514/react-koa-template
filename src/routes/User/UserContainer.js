import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { actions as userActions } from 'modules/user'

import User from './User'

const mapStateToProps = (state, ownProps) => ({
  user: state.user,
  //status: state.status,
  userid: ownProps.params.userid,
})

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(userActions, dispatch),
})

export default connect(mapStateToProps, mapDispatchToProps)(User)
