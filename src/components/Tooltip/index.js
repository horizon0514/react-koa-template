import Tooltip from 'rc-tooltip'
import classes from './index.scss'

export default ({ overlay, children, matchContentWidth }) => (
  <Tooltip
    prefixCls={classes.tooltip}
    placement="top"
    mouseEnterDelay={0.1}
    mouseLeaveDelay={0.1}
    trigger={['hover']}
    overlay={overlay}
    overlayClassName={matchContentWidth ? classes['auto-width'] : ''}
  >
    {children}
  </Tooltip>
)

