

import { imageDialog } from './dialog.js'

export function imageHandleDoubleClickOn(nodeType, onEditImage) {

  return (view, pos, node) => {
    if (node.type === nodeType) {
      imageDialog(
        node, 
        nodeType, 
        view.state, 
        view.dispatch, 
        onEditImage
      );
      return true;
    } else {
      return false;
    }
  }


}