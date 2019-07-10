

//import { Schema } from "prosemirror-model"

import { 
  schema, 
  defaultMarkdownParser, 
  defaultMarkdownSerializer
} from "prosemirror-markdown"

//import { imageNode } from './nodes/image'


// parse pandoc markdown into PM doc
export function docFromPandoc(markdown) {
  return defaultMarkdownParser.parse(markdown);
}

// get pandoc markdown from PM doc
export function docToPandoc(doc) {
  return defaultMarkdownSerializer.serialize(doc);
}


// schema
export function pandocSchema() {
  
  return schema;

  /*
  // start with default schema
  let schemaSpec = schema.spec;

  // swap in our image node
  schemaSpec.nodes = schemaSpec.nodes.update("image", imageNode);

  // return schema
  return new Schema(schemaSpec);
  */
}

// input rules (transform > to blockquote, etc.)
export { default as pandocInputRules } from './inputrules'
