import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { actions as ciddleActions } from 'modules/ciddle'
import { actions as ciddlesActions } from 'modules/ciddles'
import { actions as tagsActions } from 'modules/tags'
import { actions as statusActions } from 'modules/status'

import HomeView from './HomeView'

const mapStateToProps = (state, ownProps) => ({
  ciddles: state.ciddles,
  tags: state.tags,
  loginUser: state.user.login,
  //status: state.status,
  query: ownProps.location.query,
})

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    ...ciddlesActions,
    ...tagsActions,
    ...statusActions,
    goToCiddles : ciddleActions.goToCiddles
  }, dispatch),
})

export default connect(mapStateToProps, mapDispatchToProps)(HomeView)

