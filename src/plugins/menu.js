

import { menuBar, MenuItem, Dropdown, icons } from "prosemirror-menu"

export function menuBarPlugin(commands) {

  function addMenu(parent, cmd) {
    let command = commands.find(c => c.name === cmd);
    if (command)
      parent.push(new MenuItem({
        title: command.title,
        icon: icons[command.icon],
        label: command.text || command.title,
        enable: (state) => {
          return command.isEnabled(state);
        },
        active: (state) => {
          return command.isActive(state);
        },
        run: (state, dispatch, view) => {
          command.execute(state, dispatch, view);
        }
      }
    ));
  }

  let undo = [];
  addMenu(undo, "undo");
  addMenu(undo, "redo");

  let marks = [];
  addMenu(marks, "strong");
  addMenu(marks, "em");
  addMenu(marks, "code");
  addMenu(marks, "link");

  let bullets = [];
  addMenu(bullets, "bullet_list");
  addMenu(bullets, "ordered_list");
  addMenu(bullets, "blockquote");

  let blocks = [];
  addMenu(blocks, "paragraph");
  addMenu(blocks, "code_block");
  addMenu(blocks, "heading1");
  addMenu(blocks, "heading2");
  addMenu(blocks, "heading3");
  addMenu(blocks, "heading4");

  let insert = [];
  addMenu(insert, "image");
  addMenu(insert, "horizontal_rule");

  let menuContent = [];
  function addGroup(group) {
    if (group.length)
      menuContent.push(group);
  }
  function addDropdown(items, label) {
    if (items.length)
      menuContent.push([new Dropdown(items, { label: label })]);
  }

  addGroup(undo);
  addGroup(marks);
  addGroup(bullets);
  addDropdown(blocks, "Type...");
  addDropdown(insert, "Insert...");

  return menuBar({
    floating: false,
    content: menuContent
  });
}


