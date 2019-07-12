

import axios from 'axios'

import { pandocSchema } from "./schema"

import { Mark } from "prosemirror-model"

// pandoc schema:
//  https://github.com/jgm/pandoc-types/blob/master/Text/Pandoc/Definition.hs#L94
// pandoc markdown-it processor:
//  https://github.com/ProseMirror/prosemirror-markdown/blob/master/src/from_markdown.js

// TODO: more things dyanamic based on presence in schema
// TODO: pass the schema through to handlers


export function pandocMarkdownToDoc(markdown) {

  return pandocMarkdown2Ast(markdown)
    .then(ast => {
      
      // create handlers that map between pandoc AST and prosemirror doc
      let handlers = tokenHandlers({
        "Para": { block: "paragraph" },
        "Emph": { mark: "em" },
        "Strong": { mark: "strong" },
        "Link": { mark: "link", 
          getAttrs: tok => ({
            href: tok.c[2][0],
            title: tok.c[2][1] || null
          }),
          getChildren: tok => tok.c[1]
        },
        "Str": { text: true, getText: tok => tok.c },
        "Space": { text: true, getText: () => " "}
      });

      // create object to track current state of conversion 
      // (stack of block level nodes, active marks, etc.)
      let state = new ConversionState(handlers);

      


      parseTokens(state, ast.blocks, handlers);
    
      return state.topNode();
    });

}

// call backend pandoc handler to convert markdown into 
// a JSON version of the pandoc AST
function pandocMarkdown2Ast(markdown) {
  return axios.post("/pandoc/ast", { format: 'commonmark', markdown })
    .then(result => {
      return result.data.ast;
    })
}

function parseTokens(state, tokens, handlers) {
  for (let tok of tokens) {
    let handler = handlers[tok.t];
    handler(state, tok);
  }
}


class ConversionState {

  constructor(tokenHandlers) {

    // save references to schema and token handlers
    this._schema = pandocSchema;
    this._tokenHandlers = tokenHandlers;

    // initialize state
    this._stack = [{type: this._schema.topNodeType, content: []}]
    this._marks = Mark.none    
  }

  top() {
    return this._stack[this._stack.length - 1]
  }

  topNode() {
    return this.top().type.createAndFill(null, this.top().content);
  }

  push(elt) {
    if (this._stack.length) 
      this.top().content.push(elt)
  }

  // Adds the given text to the current position in the document,
  // using the current marks as styling.
  addText(text) {
    if (!text) 
      return
    let nodes = this.top().content
    let last = nodes[nodes.length - 1]
    let node = this._schema.text(text, this._marks), merged
    if (last && (merged = this.maybeMerge(last, node))) 
      nodes[nodes.length - 1] = merged
    else 
      nodes.push(node)
  }

  maybeMerge(a, b) {
    if (a.isText && b.isText && Mark.sameSet(a.marks, b.marks))
      return a.withText(a.text + b.text)
  }

  // : (Mark)
  // Adds the given mark to the set of active marks.
  openMark(mark) {
    this._marks = mark.addToSet(this._marks)
  }

  // : (Mark)
  // Removes the given mark from the set of active marks.
  closeMark(mark) {
    this._marks = mark.removeFromSet(this._marks)
  }

  // : (NodeType, ?Object, ?[Node]) → ?Node
  // Add a node at the current position.
  addNode(type, attrs, content) {
    let node = type.createAndFill(attrs, content, this._marks)
    if (!node) 
      return null
    this.push(node)
    return node
  }

  // : (NodeType, ?Object)
  // Wrap subsequent content in a node of the given type.
  openNode(type, attrs) {
    this._stack.push({type: type, attrs: attrs, content: []})
  }

  // : () → ?Node
  // Close and return the node that is currently on top of the stack.
  closeNode() {
    if (this._marks.length) 
      this._marks = Mark.none
    let info = this._stack.pop()
    return this.addNode(info.type, info.attrs, info.content)
  }
}

function tokenHandlers(tokenSpecs) {
  let schema = pandocSchema;
  let handlers = Object.create(null);
  for (let type in tokenSpecs) {
    let spec = tokenSpecs[type];
    let getChildren = spec.getChildren || (tok => tok.c);
    let getAttrs = spec.getAttrs || (() => {});
    if (spec.text) {
      handlers[type] = (state, tok) => {
        let text = spec.getText(tok);
        state.addText(text);
      }
    } else if (spec.mark) {
      handlers[type] = (state, tok) => {
        let markType = schema.marks[spec.mark];
        let mark = markType.create(getAttrs(tok));
        state.openMark(mark);
        parseTokens(state, getChildren(tok), handlers);
        state.closeMark(mark);
      } 
    } else if (spec.block) {
      let nodeType = schema.nodeType(spec.block);
      handlers[type] = (state, tok) => {
        state.openNode(nodeType, getAttrs(tok));
        parseTokens(state, getChildren(tok), handlers);
        state.closeNode();
      };
    }
  }
  return handlers;
}

