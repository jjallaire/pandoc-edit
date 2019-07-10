

import { undo, redo } from "prosemirror-history"

import { markIsActive, nodeIsActive } from '../utils'

import { toggleMark } from "prosemirror-commands"

import toggleList from './toggle-list'
import toggleBlockType from './toggle-blocktype'
import toggleWrap from './toggle-wrap'

import { linkCommand } from './link'
import { imageCommand } from './image'

import { insertCommand } from './insert'

export class EditorCommand {

  constructor(name, icon, text, title) {
    this.name = name;
    this.icon = icon;
    this.text = text;
    this.title = title;
  }

  // eslint-disable-next-line
  isEnabled(state) {
    throw new Error('Commands must implement isEnabled');
  }

  // eslint-disable-next-line
  isActive(state) {
    return false;
  }

  // eslint-disable-next-line
  execute(state, dispatch, view) {
    throw new Error('Commands must implement execute');
  }
}

class ProsemirrorCommand extends EditorCommand {

  constructor(name, icon, text, title, command) {
    super(name, icon, text, title);
    this._command = command;
  }

  isEnabled(state) {
    return this._command(state);
  }

  execute(state, dispatch, view) {
    return this._command(state, dispatch, view);
  }
}

class MarkCommand extends ProsemirrorCommand {
  
  constructor(name, icon, text, title, markType, attrs = {}) {
    super(name, icon, text, title, toggleMark(markType, attrs));
    this._markType = markType;
    this._attrs = attrs;
  }

  isActive(state) {
    return markIsActive(state, this._markType, this._attrs);
  }
}

class NodeCommand extends ProsemirrorCommand {

  constructor(name, icon, text, title, nodeType, attrs, command) {
    super(name, icon, text, title, command);
    this._nodeType = nodeType;
    this._attrs = attrs;
  }

  isActive(state) {
    return nodeIsActive(state, this._nodeType, this._attrs);
  }

}

class ListCommand extends NodeCommand {

  constructor(name, icon, text, title, schema, listType) {
    super(name, icon, text, title, listType, {}, toggleList(listType, schema.nodes.list_item));
  }

}

class BlockCommand extends NodeCommand {

  constructor(name, text, title, blockType, toggleType, attrs = {}) {
    super(name, null, text, title, blockType, attrs, toggleBlockType(blockType, toggleType, attrs));
  }

}

class HeadingCommand extends BlockCommand {
  constructor(schema, level) {
    super(
      "heading" + level,
      null,
      "Heading " + level, 
      schema.nodes.heading, 
      schema.nodes.paragraph,
      { level }
    )
  }
}

class WrapCommand extends NodeCommand {
  constructor(name, icon, text, title, wrapType, toggleType, attrs = {}) {
    super(name, icon, text, title, wrapType, {}, toggleWrap(wrapType, toggleType, attrs));
  }
}

export function buildCommands(schema, hooks) {
 
  let commands = [
    new ProsemirrorCommand("undo", "undo", null, "Undo", undo),
    new ProsemirrorCommand("redo", "redo", null, "Redo", redo),
    new MarkCommand("strong", "strong", null, "Bold", schema.marks.strong),
    new MarkCommand("em", "em", null, "Italics", schema.marks.em),
    new MarkCommand("code", "code", null, "Code", schema.marks.code),
    new ListCommand("bullet_list", "bulletList", null, "Bullet List", schema, schema.nodes.bullet_list),
    new ListCommand("ordered_list", "orderedList", null, "Numbered List", schema, schema.nodes.ordered_list),
    new WrapCommand("blockquote", "blockquote", null, "Blockquote", schema.nodes.blockquote, schema.nodes.paragraph),
    new BlockCommand("paragraph", null, "Normal", schema.nodes.paragraph, schema.nodes.paragraph, {}),
    new BlockCommand("code_block", null, "Code", schema.nodes.code_block, schema.nodes.paragraph, {}),
    new HeadingCommand(schema, 1),
    new HeadingCommand(schema, 2),
    new HeadingCommand(schema, 3),
    new HeadingCommand(schema, 4),
    new ProsemirrorCommand("link", "link", null,  "Hyperlink", 
                           linkCommand(schema.marks.link, hooks.onEditLink)),
    new ProsemirrorCommand("horizontal_rule", null, null, "Horizontal Rule", 
                           insertCommand(schema.nodes.horizontal_rule)),
    new ProsemirrorCommand("image", null, null, "Image", 
                           imageCommand(schema.nodes.image, hooks.onEditImage))
  ];

  return commands;
}

