
import { Plugin, PluginKey } from "prosemirror-state"

import { imageHandleDrop } from './drop.js'
import { imageHandleDoubleClickOn } from './dblclick'

export function imagePlugin(nodeType, onEditImage) {
  return new Plugin({
    key: new PluginKey('image'),
    props: {
      handleDoubleClickOn: imageHandleDoubleClickOn(nodeType, onEditImage),
      handleDOMEvents: {
        drop: imageHandleDrop(nodeType)
      }
    },
  })
}


