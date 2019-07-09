

import { EditorState, Plugin, PluginKey, NodeSelection } from "prosemirror-state"
import { EditorView } from "prosemirror-view"
import { Schema } from 'prosemirror-model'

import { history } from "prosemirror-history"
import { keymap } from "prosemirror-keymap"
import { baseKeymap } from "prosemirror-commands"
import { dropCursor } from 'prosemirror-dropcursor'
import { gapCursor } from 'prosemirror-gapcursor'

import { pandocMarks } from './marks'
import { pandocNodes } from './nodes'
import { pandocInputRules } from './inputrules';
import { buildKeymap } from './keymap'
import { EditorCommand, buildCommands } from './commands' 

import { imagePlugin } from "./image/plugin.js";

export default class PandocEditor {

  constructor({ place, options, hooks, marks, nodes, plugins }) {

     // defaults
     options = options || {};
     hooks = hooks || {};
     marks = marks || {};
     plugins = plugins || []; 

     // options
     this._options = {
      autoFocus: false,
      mapKeys: {},
      ...options
    };

    // hooks
    this._hooks = {
      isEditable: () => true,
      onUpdate: () => {},
      onSelectionChanged: () => {},
      onEditLink: Promise.resolve(null),
      onEditImage: Promise.resolve(null),
      ...hooks
    },

    // create schema
    this._schema = new Schema({
      marks: pandocMarks(marks),
      nodes: pandocNodes(nodes)
    });

    // create the editor state
    this._state = EditorState.create({
      schema: this._schema,
      doc: this._emptyDocument(),
      plugins: [...this._basePlugins(), ...plugins]
    })

    // create the editor view
    this._view = new EditorView(place, { 
      state: this._state,
      dispatchTransaction: this._dispatchTransaction.bind(this)
    });

    // create editor commands
    this._commands = buildCommands(this._schema, this._hooks);

    // auto-focus if requested
    if (this._options.autoFocus) {
      setTimeout(() => {
        this.focus()
      }, 10)
    }

    // handle click events below editor
    this._place = place;
    this._onClickBelow = this.focus.bind(this);
    this._place.addEventListener("click", this._onClickBelow);

  }

  destroy() {
    if (this._onClickBelow) {
      this._place.removeEventListener("click", this._onClickBelow);
      this._onClickBelow = null;
    }
    if (this._view) {
      this._view.destroy();
      this._view = null;
    }
  }

  // adapt editor commands to the generic (no arg) command interface, then
  // return an object keyed by command name
  get commands() {
    let commands = this._commands.reduce((commands, command) => ({
      ...commands,
      [command.name]: new EditorCommandAdaptor(command, this)
    }), {});
    return commands;
  }

  getJSON() {
    return this._state.doc.toJSON()
  }

  focus() {
    this._view.focus()
  }

  blur() {
    this._view.dom.blur()
  }


  _basePlugins() {
    return [
      history(),
      pandocInputRules(this._schema),
      keymap(buildKeymap(this._schema, this._options.mapKeys)),
      keymap(baseKeymap),
      dropCursor(),
      gapCursor(),
      new Plugin({
        key: new PluginKey('editable'),
        props: {
          editable: this._hooks.isEditable
        },
      }),
      imagePlugin(this._schema.nodes.image, this._hooks.onEditImage)
    ];
  }

  _emptyDocument() {
    const kEmptyDocument = {
      type: 'doc',
      content: [{
        type: 'paragraph',
      }],
    };
    return this._schema.nodeFromJSON(kEmptyDocument);
  }

  _dispatchTransaction(transaction) {
    
    // apply the transaction
    this._state = this._state.apply(transaction)
    this._view.updateState(this._state)
    
    // notify listeners of selection change
    this._emitSelectionChanged();
   
    // notify listeners of updates
    if (transaction.docChanged) {
      this._emitUpdate(transaction);
    }
  }

  _emitSelectionChanged() {
    if (this._hooks.onSelectionChanged) {
      this._hooks.onSelectionChanged({
        type: (this._state.selection instanceof NodeSelection) ? 'node' : 'text'
      });
    }
  }

  _emitUpdate(transaction) {
    if (this._hooks.onUpdate) {
      this._hooks.onUpdate({
        time: transaction.time,
        getJSON: this.getJSON.bind(this),
      })
    }
  }

}

class EditorCommandAdaptor extends EditorCommand {
      
  constructor(command, editor) {
    super(command.name, command.icon, command.text, command.title)
    this._command = command;
    this._editor = editor;
  }

  isEnabled() {
    return this._command.isEnabled(this._editor._state);
  }

  isLatched() {
    return this._command.isLatched(this._editor._state);
  }

  execute() {
    let editor = this._editor;
    editor._view.focus();
    return this._command.execute(editor._state, editor._view.dispatch, editor._view);
  }
}


