



export const imageNode = {
  inline: true,
  
  attrs: {
    src: {},
    width: {default: "80%"},
    alt: {default: null},
    title: {default: null}
  },
  
  group: "inline",
  
  draggable: true,

  parseDOM: [{
    tag: "img[src]", 
    getAttrs(dom) {
      return {
        src: dom.getAttribute("src"),
        title: dom.getAttribute("title"),
        alt: dom.getAttribute("alt"),
        width: dom.getAttribute("width")
      }
    }
  }],
 
  toDOM(node) {
    return ["img", node.attrs];
  }
}