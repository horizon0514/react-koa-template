import React from 'react'
import classes from './button.scss'
import { Icon } from 'react-fa'
import classNames from 'classnames'

export default ({ children, icon, dot, title, stared, primary, ...restProps }) => {
  const buttonClassName = classNames({
    [classes.button]: true,
    [classes.dot]: dot,
    [classes.icon]: icon,
    [classes.stared]: stared,
    [classes.primary]: primary,
  })

  let iconName = icon || ''
  if (iconName.indexOf('star') >= 0) {
    if (stared) {
      iconName = iconName.replace(/^star-o$/, 'star')
    } else {
      iconName = iconName.replace(/^star$/, 'star-o')
    }
  }

  return (
    <div {...restProps} className={buttonClassName}>
      {icon ? <Icon name={iconName} className={classes.fa} /> : null}
      {children}
      {title ? <div className="popover">{title}</div> : null}
    </div>
  )
}

