# Package react-leaflet-map-editor

## Usage
To use react-leaflet-map-editor component in your own project first,

import {EditableMap}   from "react-leaflet-map-editor";

To use the component you will need to specify a few parameters, as shown here.

&lt; EditableMap fetchUrl={"https://editablemapbackend.onrender.com/api/features"}
deleteUrl={"https://editablemapbackend.onrender.com/api/features/"}
saveUrl={"https://editablemapbackend.onrender.com/react/api/features"}
putUrl={"https://editablemapbackend.onrender.com/api/features/"}
maptiler_api_key={"b59pIgoNGnhNHBDuQlry"} /&gt;

For a sample express app which has the above endpoints see 
**https://github.com/sanjeevdg/editableMapBackend/tree/main/src**

This app is built with leaflet and leaflet-draw.

![alt text](https://github.com/sanjeevdg/rn-mathquiz/blob/main/react-leaflet-editable-map-app-.png?raw=true)

You may raise any issues you have on Githib.



