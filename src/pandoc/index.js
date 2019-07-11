

// We currently use the pandoc-markdown package to get a default 
// implementation of commonmark markdown editing. What we will 
// ultimately want to do though is use the Pandoc parser directly
// (via the json respresetnation of the AST) and then map between
// the AST and ProseMirror.

import { 
  schema, 
  defaultMarkdownParser, 
  defaultMarkdownSerializer
} from "prosemirror-markdown"

import axios from 'axios'


// create initial empty document for editor
export function pandocEmptyDoc() {
  return schema.nodeFromJSON({
    type: 'doc',
    content: [{
      type: 'paragraph',
    }],
  });
}

// parse pandoc markdown into PM doc
export function pandocToDoc(markdown) {
  return pandocMarkdown2Ast(markdown)
    .then(() => {
      return defaultMarkdownParser.parse(markdown);
    })
}

// get pandoc markdown from PM doc
export function pandocFromDoc(doc) {
  return pandocAst2Markdown(doc)
    .then(() => {
      return defaultMarkdownSerializer.serialize(doc);
    })
}

// schema
export function pandocSchema() {
  return schema;
}

// input rules (transform > to blockquote, etc.)
export { default as pandocInputRules } from './inputrules'


function pandocMarkdown2Ast(markdown) {
  return axios.post("/pandoc/ast", { markdown })
    .then(result => {
      console.log(result);
    })
}

function pandocAst2Markdown(ast) {
  return axios.post("/pandoc/markdown", { ast })
    .then(result => {
      console.log(result);
    })
}
