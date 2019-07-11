

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
  return axios.post("/pandoc/ast", { format: 'commonmark', markdown })
    .then(result => {
      console.log(result);
    })
}



const demoAst = JSON.parse(`{"blocks":[{"t":"Para","c":[{"t":"Str","c":"It's"},{"t":"Space"},{"t":"Str","c":"very"},{"t":"Space"},{"t":"Str","c":"easy"},{"t":"Space"},{"t":"Str","c":"to"},{"t":"Space"},{"t":"Str","c":"make"},{"t":"Space"},{"t":"Str","c":"some"},{"t":"Space"},{"t":"Str","c":"words"},{"t":"Space"},{"t":"Strong","c":[{"t":"Str","c":"bold"}]},{"t":"Space"},{"t":"Str","c":"and"},{"t":"Space"},{"t":"Str","c":"other"},{"t":"Space"},{"t":"Str","c":"words"},{"t":"Space"},{"t":"Emph","c":[{"t":"Str","c":"italic"}]},{"t":"Space"},{"t":"Str","c":"with"},{"t":"Space"},{"t":"Str","c":"Markdown."},{"t":"SoftBreak"},{"t":"Str","c":"You"},{"t":"Space"},{"t":"Str","c":"can"},{"t":"Space"},{"t":"Str","c":"even"},{"t":"Space"},{"t":"Link","c":[["",[],[]],[{"t":"Str","c":"link"},{"t":"Space"},{"t":"Str","c":"to"},{"t":"Space"},{"t":"Str","c":"Google!"}],["http://google.com",""]]},{"t":"Str","c":"."}]},{"t":"Para","c":[{"t":"Str","c":"Sometimes"},{"t":"Space"},{"t":"Str","c":"you"},{"t":"Space"},{"t":"Str","c":"want"},{"t":"Space"},{"t":"Str","c":"numbered"},{"t":"Space"},{"t":"Str","c":"lists:"}]},{"t":"OrderedList","c":[[1,{"t":"DefaultStyle"},{"t":"Period"}],[[{"t":"Plain","c":[{"t":"Str","c":"One"}]}],[{"t":"Plain","c":[{"t":"Str","c":"Two"}]}],[{"t":"Plain","c":[{"t":"Str","c":"Three"}]}]]]},{"t":"Para","c":[{"t":"Str","c":"Sometimes"},{"t":"Space"},{"t":"Str","c":"you"},{"t":"Space"},{"t":"Str","c":"want"},{"t":"Space"},{"t":"Str","c":"bullet"},{"t":"Space"},{"t":"Str","c":"points:"}]},{"t":"BulletList","c":[[{"t":"Plain","c":[{"t":"Str","c":"Start"},{"t":"Space"},{"t":"Str","c":"a"},{"t":"Space"},{"t":"Str","c":"line"},{"t":"Space"},{"t":"Str","c":"with"},{"t":"Space"},{"t":"Str","c":"a"},{"t":"Space"},{"t":"Str","c":"star"}]}],[{"t":"Plain","c":[{"t":"Str","c":"Profit!"}]}]]},{"t":"Header","c":[3,["",[],[]],[{"t":"Str","c":"This"},{"t":"Space"},{"t":"Str","c":"is"},{"t":"Space"},{"t":"Str","c":"a"},{"t":"Space"},{"t":"Str","c":"third-tier"},{"t":"Space"},{"t":"Str","c":"heading"}]]},{"t":"Para","c":[{"t":"Str","c":"You"},{"t":"Space"},{"t":"Str","c":"can"},{"t":"Space"},{"t":"Str","c":"use"},{"t":"Space"},{"t":"Str","c":"one"},{"t":"Space"},{"t":"Code","c":[["",[],[]],"#"]},{"t":"Space"},{"t":"Str","c":"all"},{"t":"Space"},{"t":"Str","c":"the"},{"t":"Space"},{"t":"Str","c":"way"},{"t":"Space"},{"t":"Str","c":"up"},{"t":"Space"},{"t":"Str","c":"to"},{"t":"Space"},{"t":"Code","c":[["",[],[]],"######"]},{"t":"Space"},{"t":"Str","c":"six"},{"t":"Space"},{"t":"Str","c":"for"},{"t":"Space"},{"t":"Str","c":"different"},{"t":"Space"},{"t":"Str","c":"heading"},{"t":"Space"},{"t":"Str","c":"sizes."}]},{"t":"Para","c":[{"t":"Str","c":"If"},{"t":"Space"},{"t":"Str","c":"you'd"},{"t":"Space"},{"t":"Str","c":"like"},{"t":"Space"},{"t":"Str","c":"to"},{"t":"Space"},{"t":"Str","c":"quote"},{"t":"Space"},{"t":"Str","c":"someone,"},{"t":"Space"},{"t":"Str","c":"use"},{"t":"Space"},{"t":"Str","c":"the"},{"t":"Space"},{"t":"Str","c":">"},{"t":"Space"},{"t":"Str","c":"character"},{"t":"Space"},{"t":"Str","c":"before"},{"t":"Space"},{"t":"Str","c":"the"},{"t":"Space"},{"t":"Str","c":"line:"}]},{"t":"BlockQuote","c":[{"t":"Para","c":[{"t":"Str","c":"Coffee."},{"t":"Space"},{"t":"Str","c":"The"},{"t":"Space"},{"t":"Str","c":"finest"},{"t":"Space"},{"t":"Str","c":"organic"},{"t":"Space"},{"t":"Str","c":"suspension"},{"t":"Space"},{"t":"Str","c":"ever"},{"t":"Space"},{"t":"Str","c":"devised..."},{"t":"Space"},{"t":"Str","c":"I"},{"t":"Space"},{"t":"Str","c":"beat"},{"t":"Space"},{"t":"Str","c":"the"},{"t":"Space"},{"t":"Str","c":"Borg"},{"t":"Space"},{"t":"Str","c":"with"},{"t":"Space"},{"t":"Str","c":"it."}]},{"t":"BulletList","c":[[{"t":"Plain","c":[{"t":"Str","c":"Captain"},{"t":"Space"},{"t":"Str","c":"Janeway"}]}]]}]}],"pandoc-api-version":[1,17,5,1],"meta":{}}`);

function pandocAst2Markdown() {
  return axios.post("/pandoc/markdown", { format: 'commonmark', ast: demoAst })
    .then(result => {
      console.log(result);
    })
}


