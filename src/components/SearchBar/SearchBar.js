import React, { Component } from 'react'
import { IndexLink, Link }  from 'react-router'
import { Icon }             from 'react-fa'
import Button               from '../Button'
import classnames           from 'classnames'
import classes              from './SearchBar.scss'

export default class SearchBar extends Component {

    constructor (props){
        super(props)

        this.state = {
            val : '',
            bSearch : false
        }
    }

    componentWillUnmount (){
        this._timer && clearTimeout(this._timer)
    }

    handleClickSearch = (e) => {
        const { bSearch } = this.state    

        if(bSearch) return

        this.setState({
            bSearch : true
        })

        this.input.focus()
    }

    handleBlur = (e) => {
        const { actions } = this.props

        this.setState({
            bSearch : false,
            val : ''
        })

        setTimeout(() => {
            actions.fetchedSearchInfos({})
        }, 3e2)
    }

    handleChange = (e) => {
        const v = e.target.value.trim()
        const { actions } = this.props


        this.setState({
            val : v
        })

        this._timer && clearTimeout(this._timer)

        this._timer = setTimeout( () => {
            v && actions.fetchSearchInfos(v)
        }, 3e2)
    }

    render (){
        const { bSearch, val } = this.state
        const { ciddles : { searchResult : { ciddles } } } = this.props
        const inputClass = classnames({
            [classes.search_bar_input] : true,
            [classes.active] : bSearch
        })

        const resultClass = classnames({
            [classes.search_bar_result] : true,
            [classes.search_bar_result_show] : bSearch
        })

        return (
            <div className={classes.search_bar}>
                <span>
                    <span className={classes.search_bar_icon}><Button icon="search" title="搜索" onClick={this.handleClickSearch} /></span>
                    <input
                     type="text"
                     value={val}
                     className={inputClass}
                     onBlur={this.handleBlur}
                     onChange={this.handleChange}
                     ref={(node) => this.input = node} />
                </span>

                <div className={resultClass}>
                    {
                        ciddles && ciddles.length ?
                            <ul className={classes.result_list}>
                                {
                                    ciddles.map((item, i) => 
                                        <li key={i} title={item.title}><Link to={`/ciddles/${item.id}`} target="_blank">{item.title}</Link></li>        
                                    )   
                                }
                            </ul> : null
                    }
                </div>
            </div>        
        )
    }
}
