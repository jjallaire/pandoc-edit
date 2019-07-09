

import { NodeSelection } from "prosemirror-state"

import { canInsert } from '../utils.js'

import { imageDialog } from './dialog.js'

export function imageCommand(nodeType, onEditImage) {

  return (state, dispatch) => {

    if (!canInsert(state, nodeType))
      return false;

    if (dispatch) {

      // see if we are editing an existing node
      let node = null;
      if (state.selection instanceof NodeSelection && state.selection.node.type === nodeType)
        node = state.selection.node;

      // show dialog
      imageDialog(node, nodeType, state, dispatch, onEditImage);
    }
    
    return true;
  }

}


