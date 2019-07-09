


import { schema } from "prosemirror-schema-basic"

export function pandocMarks(extra) {

  // default for extra
  extra = extra || {};

  let marks = {
    underline: {
      parseDOM: [
        {
          tag: 'u',
        },
        {
          style: 'text-decoration',
          getAttrs: value => value === 'underline',
        },
      ],
      toDOM: () => ['u', 0],
    },
    strikethrough: {
      parseDOM: [
        {
          tag: 's',
        },
        {
          tag: 'del',
        },
        {
          tag: 'strike',
        },
        {
          style: 'text-decoration',
          getAttrs: value => value === 'line-through',
        },
      ],
      toDOM: () => ['s', 0],
    },
    ...extra,
  }

  // schema.spec.marks is an OrderedMap (https://github.com/marijnh/orderedmap)
  return Object.keys(marks).reduce((schemaMarks, mark) => {
    return schemaMarks.update(mark, marks[mark]);
  }, schema.spec.marks);
}
