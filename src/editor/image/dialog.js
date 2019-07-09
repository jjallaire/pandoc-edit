


import { insertAndSelectNode } from '../utils'

export function imageDialog(node, nodeType, state, dispatch, onEditImage) {

  // if we are being called with an existing node then read it's attributes 
  let image = { src: null, title: null };
  if (node && node.type === nodeType) {
    image = { 
      src: node.attrs.src,
      title: node.attrs.title,
      alt: node.attrs.alt,
      width: node.attrs.width
    }
  } else {
    image = nodeType.create(image).attrs;
  }

   // edit the image
   onEditImage(image)
    .then(result => {
      if (result) {
        const image = nodeType.createAndFill(result);
        insertAndSelectNode(image, state, dispatch);
      }
    });

}

