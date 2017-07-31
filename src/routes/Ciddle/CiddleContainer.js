import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { actions as ciddleActions } from 'modules/ciddle'
import { actions as statusActions } from 'modules/status'

import Ciddle from './Ciddle'

const mapStateToProps = (state, ownProps) => ({
  ...state.ciddle,
  //status: state.status,
  loginUser: state.user.login,
  id: ownProps.params.ciddleId,
  location: ownProps.location
})

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    ...ciddleActions,
    ...statusActions
  }, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(Ciddle)
