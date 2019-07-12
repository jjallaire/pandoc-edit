

import axios from 'axios'

import { pandocSchema } from "./schema"

import { Mark } from "prosemirror-model"

// pandoc schema:
//  https://github.com/jgm/pandoc-types/blob/master/Text/Pandoc/Definition.hs#L94
// pandoc markdown-it processor:
//  https://github.com/ProseMirror/prosemirror-markdown/blob/master/src/from_markdown.js

// TOOD: error handling
// TODO: more things dyanamic based on presence in schema


export function pandocMarkdownToDoc(markdown) {
  return pandocMarkdownToAst(markdown)
    .then(pandocAstToDoc);
}

function pandocMarkdownToAst(markdown) {
  return axios.post("/pandoc/ast", { format: 'commonmark', markdown })
    .then(result => {
      return result.data.ast;
    })
}

function pandocAstToDoc(ast) {
  let parser = new PandocParser(pandocSchema, pandocTokenSpecs);
  return parser.parse(ast);
}

let pandocTokenSpecs = {
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
};

class PandocParser {

  constructor(schema, tokenSpecs) {
    this._schema = schema;
    this._handlers = this._parseHandlers(tokenSpecs);
  }

  parse(ast) {
    let state = new PandocParserState(this._schema);
    this._parseTokens(state, ast.blocks);
    return state.topNode();
  }

  _parseTokens(state, tokens) {
    for (let tok of tokens) {
      let handler = this._handlers[tok.t];
      handler(state, tok);
    }
  }

  _parseHandlers(tokenSpecs) {
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
          let markType = this._schema.marks[spec.mark];
          let mark = markType.create(getAttrs(tok));
          state.openMark(mark);
          this._parseTokens(state, getChildren(tok));
          state.closeMark(mark);
        } 
      } else if (spec.block) {
        let nodeType = this._schema.nodeType(spec.block);
        handlers[type] = (state, tok) => {
          state.openNode(nodeType, getAttrs(tok));
          this._parseTokens(state, getChildren(tok));
          state.closeNode();
        };
      }
    }
    return handlers;
  }
}

class PandocParserState {

  constructor(schema) {
    this._schema = schema;
    this._stack = [{type: this._schema.topNodeType, content: []}]
    this._marks = Mark.none    
  }

  topNode() {
    return this._top().type.createAndFill(null, this._top().content);
  }

  // Adds the given text to the current position in the document,
  // using the current marks as styling.
  addText(text) {
    if (!text) 
      return
    let nodes = this._top().content
    let last = nodes[nodes.length - 1]
    let node = this._schema.text(text, this._marks), merged
    if (last && (merged = this._maybeMerge(last, node))) 
      nodes[nodes.length - 1] = merged
    else 
      nodes.push(node)
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
    return this._addNode(info.type, info.attrs, info.content)
  }


  _top() {
    return this._stack[this._stack.length - 1]
  }

  // : (NodeType, ?Object, ?[Node]) → ?Node
  // Add a node at the current position.
  _addNode(type, attrs, content) {
    let node = type.createAndFill(attrs, content, this._marks)
    if (!node) 
      return null
    if (this._stack.length) 
      this._top().content.push(node)
    return node
  }

  _maybeMerge(a, b) {
    if (a.isText && b.isText && Mark.sameSet(a.marks, b.marks))
      return a.withText(a.text + b.text)
  }
}



