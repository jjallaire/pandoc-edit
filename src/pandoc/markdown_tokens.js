

// pandoc schema:
//  https://github.com/jgm/pandoc-types/blob/master/Text/Pandoc/Definition.hs#L94
// pandoc markdown-it processor:
//  https://github.com/ProseMirror/prosemirror-markdown/blob/master/src/from_markdown.js

/*
const ATTR_ID = 0;
const ATTR_CLASSES = 1;
const ATTR_KEYVALUE = 2;
*/

const TARGET_URL = 0;
const TARGET_TITLE = 1;

const HEADER_CHILDREN = 2;

const CODE_BLOCK_ATTR = 0;
const CODE_BLOCK_TEXT = 1;

const LIST_ORDER = 0;
const LIST_CHILDREN = 1;

const IMAGE_ALT = 1;
const IMAGE_TARGET = 2;

const LINK_CHILDREN = 1;
const LINK_TARGET = 2;

const CODE_TEXT = 1;

export const pandocTokens = {
  "Header": { block: "heading", 
    getAttrs: tok => ({
      level: tok.c[0]
    }),
    getChildren: tok => tok.c[HEADER_CHILDREN]
  },
  "Para": { block: "paragraph" },
  // TODO: do we need a special 'plain' type in the proesemirror schema?
  // this is currently use within lists to indicate list items that are
  // tightly packed together (i.e. don't have paragraphs). However, the 
  // list_item in the schema currently requires paragraphs or blocks
  "Plain": { block: "paragraph" },
  "BlockQuote": { block: "blockquote" },
  "CodeBlock": { block: "code_block", 
    getAttrs: tok => ({
      // TODO: this doesn't seem to capture {} style params 
      params: [].concat(...tok.c[CODE_BLOCK_ATTR]).filter(param => !!param).join(' ')
    }),
    getText: tok => tok.c[CODE_BLOCK_TEXT]
  },
  "HorizontalRule": { node: "horizontal_rule" },
  "LineBreak": { node: "hard_break" },
  "BulletList": { list: "bullet_list" },
  "OrderedList": { list: "ordered_list",
    getAttrs: tok => ({
      order: tok.c[LIST_ORDER],
    }),
    getChildren: tok => tok.c[LIST_CHILDREN]
  },
  // TODO: in pandoc alt is allowed to include arbitrary markup,
  // when there is text in the alt then a 'figure' is created
  // rather than an image. 
  "Image": { node: "image", 
    getAttrs: tok => { 
      let target = tok.c[IMAGE_TARGET];
      return {
        src: target[TARGET_URL],
        title: target[TARGET_TITLE] || null,
        alt: collectText(tok.c[IMAGE_ALT])
      }
    }
  },
  "Emph": { mark: "em" },
  "Strong": { mark: "strong" },
  "Link": { mark: "link", 
    getAttrs: tok => {
      let target = tok.c[LINK_TARGET];
      return {
        href: target[TARGET_URL],
        title: target[TARGET_TITLE] || null
      }
    },
    getChildren: tok => tok.c[LINK_CHILDREN]
  },
  "Code": { mark: "code", 
    getText: tok => tok.c[CODE_TEXT]
  },
  "Str": { text: true, 
    getText: tok => tok.c 
  },
  "Space": { text: true, 
    getText: () => " "
  }
};

// collect the text from a collection of pandoc ast
// elements (ignores marks, useful for ast elements
// that support marks but whose prosemirror equivalent
// does not, e.g. image alt text)
function collectText(c) {
  return c.map(elem => {
    if (elem.t === "Str")
      return elem.c;
    else if (elem.t === "Space")
      return " ";
    else if (elem.c)
      return collectText(elem.c)
    else
      return ""
  }).join("");
}
