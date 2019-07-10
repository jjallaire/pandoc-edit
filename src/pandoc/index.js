

import { Schema } from "prosemirror-model"

import { 
  schema, 
  //defaultMarkdownParser, 
  //defaultMarkdownSerializer
} from "prosemirror-markdown"

import { imageNode } from './nodes/image'

// schema
export function pandocSchema() {
  
  // start with default schema
  let schemaSpec = schema.spec;

  // swap in our image node
  schemaSpec.nodes = schemaSpec.nodes.update("image", imageNode);

  // return schema
  return new Schema(schemaSpec);
}

// input rules (transform > to blockquote, etc.)
export { default as pandocInputRules } from './inputrules'
