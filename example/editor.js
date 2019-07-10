

let place = document.getElementById('pandoc-editor');
let content = "**here** we go _again_ And again and again";
let editor = new PandocEditor.Editor( { place, content });

document.getElementById('pandoc-get-content').addEventListener('click', function() {
  let output = document.getElementById('pandoc-markdown');
  output.innerText = editor.content;
});

