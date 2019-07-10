

import { menuBar, MenuItem, Dropdown, icons } from "prosemirror-menu"

export function menuBarPlugin(commands) {

  function menu(cmd) {
    let command = commands.find(c => c.name === cmd);
    return new MenuItem({
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
    });
  }

  return menuBar({
    floating: false,
    content: [
      [menu("undo"), menu("redo")],
      [menu("strong"), menu("em"), menu("code"), menu("link")],
      [menu("bullet_list"), menu("ordered_list"), menu("blockquote")],
      [new Dropdown([menu("paragraph"), menu("code_block"), 
                     menu("heading1"), menu("heading2"), menu("heading3"), menu("heading4")],
                    { label: "Type..." })],
      [new Dropdown([menu("image"), menu("horizontal_rule")], { label: "Insert..."})]
    ]
  })
}


