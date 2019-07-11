

import axios from 'axios'

import { schema } from "./markdown_schema"

import { Mark } from "prosemirror-model"

// pandoc schema:
//  https://github.com/jgm/pandoc-types/blob/master/Text/Pandoc/Definition.hs#L94

export function markdownToDoc(markdown) {

  return pandocMarkdown2Ast(markdown)
    .then(ast => {

      let nodes = ast.blocks.map(blockToNode);
      return schema.node("doc", null, nodes);
    });

}

function blockToNode(block) {
  let typeName = null;
  if (block.t === "Para")
    typeName = "paragraph";
  else
    throw new Error(`Unepxected block type: ${block.t}`);

  let marks =  Mark.none;
  let content = [];

  function maybeMerge(a, b) {
    if (a.isText && b.isText && Mark.sameSet(a.marks, b.marks))
      return a.withText(a.text + b.text)
  }

  function addText(text) {
    if (!text) return;
    let last = content[content.length - 1];
    let node = schema.text(text, marks), merged;
    if (last && (merged = maybeMerge(last, node)))
      content[content.length - 1] = merged;
    else
      content.push(node);
  }

  function addInline(inline) {
    if (inline.t === "Str")
      addText(inline.c);
    else if (inline.t === "Space")
      addText(" ");
    else if (inline.t === "Strong") {
      let markType = schema.marks["strong"];
      let mark = markType.create();
      marks = mark.addToSet(marks);
      inline.c.forEach(addInline);
      marks = mark.removeFromSet(marks);
    }
    else if (inline.t === "Emph") {
      let markType = schema.marks["em"];
      let mark = markType.create();
      marks = mark.addToSet(marks);
      inline.c.forEach(addInline);
      marks = mark.removeFromSet(marks);
    } else if (inline.t === "Link") {
      let href = inline.c[2][0];
      let title = inline.c[2][1];
      let markType = schema.marks["link"];
      let mark = markType.create({ href, title });
      marks = mark.addToSet(marks);
      inline.c[1].forEach(addInline);
      marks = mark.removeFromSet(marks);
    }
  }

  block.c.forEach(addInline);

  let node = schema.node(typeName, null, content);
  return node;
}





function pandocMarkdown2Ast(markdown) {
  return axios.post("/pandoc/ast", { format: 'commonmark', markdown })
    .then(result => {
      return result.data.ast;
    })
}



