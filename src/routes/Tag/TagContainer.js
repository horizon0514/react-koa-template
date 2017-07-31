import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { actions as tagsActions } from 'modules/tags'

import Tag from './Tag'

const mapStateToProps = (state, ownProps) => ({
  tags: state.tags,
  //status: state.status,
})

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    ...tagsActions
  }, dispatch),
})

export default connect(mapStateToProps, mapDispatchToProps)(Tag)
