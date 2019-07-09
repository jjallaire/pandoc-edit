import { NodeSelection } from "prosemirror-state"

export function canInsert(state, nodeType) {
  let $from = state.selection.$from
  for (let d = $from.depth; d >= 0; d--) {
    let index = $from.index(d)
    if ($from.node(d).canReplaceWith(index, index, nodeType)) 
      return true
  }
  return false
}

export function insertAndSelectNode(node, state, dispatch) {

  // create new transaction
  const tr = state.tr;

  // insert the node over the existing selection
  tr.replaceSelectionWith(node);

  // select node
  // (https://discuss.prosemirror.net/t/how-to-select-a-node-immediately-after-inserting-it/1566)
  const resolvedPos = tr.doc.resolve(
    tr.selection.anchor - tr.selection.$anchor.nodeBefore.nodeSize
  );
  tr.setSelection(new NodeSelection(resolvedPos));
  
  // dispatch transaction
  dispatch(tr);
}

