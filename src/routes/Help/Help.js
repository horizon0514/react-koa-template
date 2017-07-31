import React, { Component } from 'react'
import ReactMarkdown        from 'react-markdown'
import DocumentTitle        from 'react-document-title'
import HelpMd               from './Help.md'
import classes              from './Help.scss'

export default class Help extends Component {
    
    render (){
        return (
            <DocumentTitle title="Help中心">
                <div className="md-area readme-style">
                    <ReactMarkdown source={HelpMd} />
                </div>        
            </DocumentTitle>
        )
    }
}
