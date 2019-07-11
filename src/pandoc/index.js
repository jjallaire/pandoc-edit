

import { schema } from './markdown_schema'

import { markdownToDoc } from './markdown_to_doc'


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
  return markdownToDoc(markdown);
}

// get pandoc markdown from PM doc
export function pandocFromDoc() {
  return Promise.resolve('');
}

// schema
export function pandocSchema() {
  return schema;
}

// input rules (transform > to blockquote, etc.)
export { default as pandocInputRules } from './inputrules'



