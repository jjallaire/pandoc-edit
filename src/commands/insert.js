


import { canInsert } from '../utils'

export function insertCommand(nodeType, attrs = {}) {

  return (state, dispatch) => {

    if (!canInsert(state, nodeType))
      return false;

    if (dispatch) 
      dispatch(state.tr.replaceSelectionWith(nodeType.create(attrs)))

    return true;
  }
}


