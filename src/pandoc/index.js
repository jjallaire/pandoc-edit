

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
  return Promise.resolve(defaultMarkdownParser.parse(markdown));
}

// get pandoc markdown from PM doc
export function pandocFromDoc(doc) {
  return Promise.resolve(defaultMarkdownSerializer.serialize(doc));
}

// schema
export function pandocSchema() {
  return schema;
}

// input rules (transform > to blockquote, etc.)
export { default as pandocInputRules } from './inputrules'
