import React, { PropTypes, Component } from 'react'
import { findDOMNode } from 'react-dom'
import classes from './index.scss'
import classNames from 'classnames'
import Button from 'components/Button'

class Modal extends Component {
  static propTypes = {
    onOk: PropTypes.func,
    onCancel: PropTypes.func,
    onCon : PropTypes.func,
    visible: PropTypes.bool,
    okText: PropTypes.string,
    cancelText: PropTypes.string,
    conText : PropTypes.string,
    className: PropTypes.string,
    width: PropTypes.number,
    error: PropTypes.node,
    extra : PropTypes.element
  }
  static defaultProps = {
    onOk() {},
    onCancel() {},
    okText: '确 定',
    cancelText: '取 消',
    visible: false,
    error: '',
  }
  constructor(props) {
    super(props)
    this.state = {
      initialRendered: false,
    }
  }
  componentWillReceiveProps(nextProps) {
    if (!this.props.visible && nextProps.visible &&
        !this.state.initialRendered) {
      this.setState({ initialRendered: true })
    }
  }
  clickMask = (e) => {
    if (findDOMNode(this) !== e.target) {
      return
    }
    this.props.onCancel(e)
  }
  render() {
    const { visible, children, onOk, onCancel, onCon, title, okText, cancelText, conText, error, extra, className, width } = this.props
    const modalClassName = classNames({
      [className]: !!className,
      [classes.modal]: true,
      [`${classes.modal} ${classes.show}`]: visible,
    })
    return (
      <div
        className={classes.wrapper}
        style={{
          opacity: visible ? 1 : 0,
          pointerEvents: visible ? 'auto' : 'none',
        }}
        onClick={this.clickMask}
      >
        <div
          className={modalClassName}
          style={{
            transition: this.state.initialRendered ? '' : 'none',
            width: width || '',
          }}
        >
          <div className={classes.header}>{title}</div>
          <div className={classes.content}>{children}</div>
          {error ? <div className={classes.error}>{error}</div> : null}
          <div className={classes.footer}>
            {
              !cancelText ? null :
                <Button onClick={onCancel}>{cancelText}</Button>
            }
            {
              !okText ? null :
                <Button primary onClick={onOk}>{okText}</Button>
            }
            {
              !conText ? null :
                  <Button onClick={onCon}>{conText}</Button>
            }
            {
                !extra ? null : extra
            }
          </div>
        </div>
      </div>
    )
  }
}

export default Modal

