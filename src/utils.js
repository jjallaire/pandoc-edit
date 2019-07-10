import { NodeSelection } from "prosemirror-state"

import { findParentNode, findSelectedNodeOfType } from 'prosemirror-utils'


export function getMarkAttrs(state, type) {
  const { from, to } = state.selection
  let marks = []

  state.doc.nodesBetween(from, to, node => {
    marks = [...marks, ...node.marks]
  })

  const mark = marks.find(markItem => markItem.type.name === type.name)

  if (mark) {
    return mark.attrs
  }

  return {}
}

export function getMarkRange($pos = null, type = null) {

  if (!$pos || !type) {
    return false
  }

  const start = $pos.parent.childAfter($pos.parentOffset)

  if (!start.node) {
    return false
  }

  const link = start.node.marks.find(mark => mark.type === type)
  if (!link) {
    return false
  }

  let startIndex = $pos.index()
  let startPos = $pos.start() + start.offset
  let endIndex = startIndex + 1
  let endPos = startPos + start.node.nodeSize

  while (startIndex > 0 && link.isInSet($pos.parent.child(startIndex - 1).marks)) {
    startIndex -= 1
    startPos -= $pos.parent.child(startIndex).nodeSize
  }

  while (endIndex < $pos.parent.childCount && link.isInSet($pos.parent.child(endIndex).marks)) {
    endPos += $pos.parent.child(endIndex).nodeSize
    endIndex += 1
  }

  return { from: startPos, to: endPos }

}

export function markIsActive(state, type) {
  const {
    from,
    $from,
    to,
    empty,
  } = state.selection

  if (empty) {
    return !!type.isInSet(state.storedMarks || $from.marks())
  }

  return !!state.doc.rangeHasMark(from, to, type)
}


export function nodeIsActive(state, type, attrs = {}) {
  const predicate = node => node.type === type
  const node = findSelectedNodeOfType(type)(state.selection)
    || findParentNode(predicate)(state.selection)

  if (!Object.keys(attrs).length || !node) {
    return !!node
  }

  return node.node.hasMarkup(type, attrs)
}



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

