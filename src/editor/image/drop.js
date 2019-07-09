

export function imageHandleDrop(nodeType) {

  return (view, event) => {

    // ensure we have data transfer
    if (!event.dataTransfer)
      return;

    // see if this is a drag of image uris
    const uriList = event.dataTransfer.getData("text/uri-list");
    const html = event.dataTransfer.getData("text/html");
    if (!uriList || !html)
      return;       

    // see if we can pull an image out of the html
    let regex = /<img.*?src=["'](.*?)["']/;  
    let match = regex.exec(html);
    if (!match)
      return;

    // indicate that we can handle this drop
    event.preventDefault();

    // insert the images
    uriList.split("\r?\n").forEach(src => {
      // insert the image
      const coordinates = view.posAtCoords({ 
        left: event.clientX, 
        top: event.clientY 
      });
      const node = nodeType.create({ src });
      const transaction = view.state.tr.insert(coordinates.pos, node);
      view.dispatch(transaction);
    });

  };

  
}