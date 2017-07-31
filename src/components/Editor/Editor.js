import React, { Component } from 'react'
import Codemirror from 'react-codemirror'
import 'react-codemirror/node_modules/codemirror/mode/jsx/jsx'
import 'react-codemirror/node_modules/codemirror/mode/javascript/javascript'
import 'react-codemirror/node_modules/codemirror/mode/css/css'
import 'react-codemirror/node_modules/codemirror/mode/htmlmixed/htmlmixed'
import 'react-codemirror/node_modules/codemirror/mode/markdown/markdown'
import 'react-codemirror/node_modules/codemirror/addon/selection/active-line'
import 'react-codemirror/node_modules/codemirror/addon/edit/matchbrackets'
import 'react-codemirror/node_modules/codemirror/addon/edit/matchtags'
import 'react-codemirror/node_modules/codemirror/addon/edit/closebrackets'
import 'react-codemirror/node_modules/codemirror/addon/edit/closetag'
import 'react-codemirror/node_modules/codemirror/addon/fold/foldcode'
import 'react-codemirror/node_modules/codemirror/addon/fold/foldgutter'
import 'react-codemirror/node_modules/codemirror/addon/fold/brace-fold'
import classes from './Editor.scss'

export default class Editor extends Component {

    constructor(props) {
        super(props)
        this.state = {}
    }

    render (){
        const { code, onSave, mode, actions : { updateCode, setMetaPanelVisible } } = this.props
        const hash = {
            'weex' : 'htmlmixed',
            'js' : 'javascript',
            'html' : 'htmlmixed',
            'md' : 'markdown'
        }

        const options = {
          lineNumbers: true,
          autoSave: true,
          theme: 'neo',
          lineWrapping: 'scroll',
          tabSize: 2,
          styleActiveLine: true,
          matchBrackets: true,
          autoCloseBrackets: true,
          matchTags: true,
          autoCloseTags: true,
          foldGutter: true,
          gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
          mode : hash[mode] || mode,
          extraKeys: {
            'Ctrl-S': onSave,
            'Cmd-S': onSave,
          }
        }

        return (
            <div>
                <Codemirror
                onChange={value => updateCode(value, mode)}
                onFocusChange={focused => {if(focused){setMetaPanelVisible(false)}}}
                value={code}
                options={options} />
            </div>        
        )
    }
}
