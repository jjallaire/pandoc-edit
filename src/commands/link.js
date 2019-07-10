

import { markIsActive, getMarkAttrs, getMarkRange } from '../utils'

export function linkCommand(markType, onEditLink) {

  return (state, dispatch, view) => {

    // if there is no contiguous selection and no existing link mark active
    // then the command should be disabled (unknown what the link target is)
    if (!markIsActive(state, markType) && state.selection.empty)
      return false;

    if (dispatch) {

      // get link attributes if we have them
      let link = { href: null, title: null };
      if (markIsActive(state, markType))
        link = getMarkAttrs(state, markType);

      // show edit ui
      onEditLink(link)

        .then(result => {

          if (result) {

            // determine the range we will edit (if the selection is empty 
            // then expand from the cursor to discover the mark range, 
            // otherwise just use the selection itself)
            let range = state.selection.empty ?
              getMarkRange(state.selection.$head, markType) :
              { from: state.selection.from, to: state.selection.to };

            // action: edit the link
            if (result.action === 'edit') {
              
              let tr = state.tr;
              tr.removeMark(range.from, range.to, markType);
              tr.addMark(range.from, range.to, markType.create(result.link));
              dispatch(tr);

            // action: remove the link
            } else if (result.action === 'remove') {

              dispatch(state.tr.removeMark(range.from, range.to, markType));

            }
          }
              
          view.focus();
        });
    }

    return true;
  }
}