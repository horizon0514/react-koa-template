import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { actions as managerActions } from 'modules/manager'

import Manger from './Manger'

const mapStateToProps = (state, ownProps) => ({
  manager : state.manager
})

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    ...managerActions,
  }, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(Manger)
