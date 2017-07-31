import TagList from './TagList'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { actions as tagsActions } from 'modules/tags'

const mapStateToProps = (state) => ({
  allTags: state.tags.list,
})

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(tagsActions, dispatch),
})

export default connect(mapStateToProps, mapDispatchToProps)(TagList)

