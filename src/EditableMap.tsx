import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-draw"; // Import Draw plugin
import { createRoot } from "react-dom/client";
import ReactDOM from "react-dom/client";


import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

import type { Geometry } from "geojson";

// removed - @maplibre/maplibre-gl-leaflet mapbox-gl-leaflet maplibre-gl @react-leaflet/core  react-leaflet react-leaflet-draw

// Type augmentations for leaflet-draw
/*
declare module "leaflet" {
  namespace Control {
    class Draw extends Control {
      constructor(options?: any);
    }
  }

    namespace Draw {
    namespace Event {
      const CREATED: string;
      const EDITED: string;
      const DELETED: string;
      const EDITSTART: string;
      const DRAWSTART: string;
  const DRAWSTOP: string;
  const EDITSTOP: string;
  const DELETEMODE: string;
  const DELETEMODESTOP: string;
//      const DELETEMODESTART: string;
    }
  }
}
*/


interface Feature {
  id: string | number;
  type: "Feature";
  geometry: Geometry;
  properties: Record<string, any>;
}

interface FeatureCollection {
  type: "FeatureCollection";
  features: Feature[];
}


type Props = {
  fetchUrl: string;
  saveUrl: string;
  putUrl: string;
  deleteUrl: string;
  maptiler_api_key: string;  
};






//export default function EditableMap() {

export default function EditableMap ({ fetchUrl, saveUrl, putUrl,deleteUrl, maptiler_api_key }) {


  const mapRef = useRef<L.Map | null>(null);
  const [features, setFeatures] = useState<Feature[]>([]);
const drawControlRef = useRef<L.Control.Draw | null>(null);
const drawModeRef = useRef<"draw" | "edit" | "delete" | null>(null);

const [drawMode, setDrawMode] = useState<"none" | "draw" | "edit" | "delete">("none");

const openPopupRef = useRef<L.Popup | null>(null);



L.Icon.Default.mergeOptions({
  iconUrl: icon,
  shadowUrl: iconShadow,
});

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow
});



L.Marker.prototype.options.icon = DefaultIcon;


 const reloadFeatures = () => {
  if (!mapRef.current) return;

  // Remove all previous layers
  mapRef.current.eachLayer((layer: any) => {
    if (layer.feature) mapRef.current?.removeLayer(layer);
  });



  fetch(fetchUrl)
    .then(res => res.json())
    .then((data) => {
      const features = data.features; // full GeoJSON with id & properties

      const layerGroup = L.geoJSON(features, {
        onEachFeature: (feature, layer) => bindPopupToLayer(feature, layer),
      });

      layerGroup.addTo(mapRef.current!);
    });
};


const bindPopupToLayer = (feature: any, layer: L.Layer) => {
  const popupContainer = document.createElement("div");

  const onSave = (updatedProps: Record<string, any>) => {
    fetch(putUrl + `${feature.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ properties: updatedProps }),
    }).then(() => reloadFeatures());
  };

  const onDelete = () => {

console.log('delete fir;ed');
    fetch(deleteUrl + `${feature.id}`, {
      method: "DELETE",
    }).then(() => reloadFeatures());
  };

 const root = ReactDOM.createRoot(popupContainer);
root.render(<PopupEditor feature={feature} onSave={onSave} onDelete={onDelete} />);

  const popup = L.popup().setContent(popupContainer);

  layer.bindPopup(popup);


layer.on("popupclose", () => {
  root.unmount();
});


  layer.on("click", () => {
    // Close any previously open popup
    if (openPopupRef.current && openPopupRef.current !== popup) {
      openPopupRef.current.remove();
    }

    // Suppress popup if in draw/edit mode
    if (drawModeRef.current) return;

    layer.openPopup();
    openPopupRef.current = popup;
  });
};


  useEffect(() => {




    const map = L.map("map", {
      center: [15.5, 75],
      zoom: 3,
    });
    mapRef.current = map;

    L.tileLayer(
      "https://api.maptiler.com/maps/streets/256/{z}/{x}/{y}.png?key=" + maptiler_api_key,
      {
        attribution: '&copy; <a href="https://www.maptiler.com/">MapTiler</a>',
      }
    ).addTo(map);

    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    const drawControl = new L.Control.Draw({
      edit: { featureGroup: drawnItems,remove: true },
      draw: { polygon: true, polyline: true, rectangle: true, circle: false, marker: true },
    });
    map.addControl(drawControl);
    drawControlRef.current = drawControl;
    // On create
	
	mapRef.current?.on(L.Draw.Event.DRAWSTART, () => drawModeRef.current= "draw");
  mapRef.current?.on(L.Draw.Event.DRAWSTOP, () => drawModeRef.current = null);
  mapRef.current?.on(L.Draw.Event.EDITSTART, () => drawModeRef.current= "edit");
  mapRef.current?.on(L.Draw.Event.EDITSTOP, () => drawModeRef.current = null);
 // mapRef.current?.on(L.Draw.Event.DELETEMODESTART, () => drawModeRef.current= "delete"); // pseudo-event
  //mapRef.current.on(L.Draw.Event.DELETEMODESTOP, () => setDrawMode("none")); // pseudo-event




    map.on(L.Draw.Event.CREATED, (e: any) => {
      const layer = e.layer;
      drawnItems.addLayer(layer);
      const geojson = layer.toGeoJSON();
      
console.log('got geojson===',geojson);

      fetch(saveUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(geojson),
      }).then((res) => res.json())
    .then((data) => {
      // Assign DB id to layer.feature so delete knows what to remove
     // layer.feature.id = data.id;
    	alert('saved to PostGis!')
      reloadFeatures();
    });
    });

map.on("click", (e) => {
  // Only show popup if NOT in edit/delete mode

console.log('mydrawmode==',drawModeRef);

  if (drawMode === "delete" || drawMode === "edit") return;

/*
  const layer = e.target; // or however you get the clicked layer
  if (layer) {
    layer.bindPopup(createPopupContent(layer.feature, onSave)).openPopup();
  } */
});


//deleteUrl="https://editablemapbackend.onrender.com/api/features/"
map.on(L.Draw.Event.DELETED, (e: any) => {
  const layers = e.layers;
  layers.eachLayer(async (layer: any) => {
    if (!layer.feature?.id) return;
    await fetch(deleteUrl + `${layer.feature.id}`, { method: "DELETE" });
  });
  reloadFeatures();
});



map.on("draw:editstart", () => {console.log('editstart');map.closePopup();return;} );
map.on("draw:deletestart", () => {console.log('deletestart');map.closePopup();return;} );

    return () => {
      map.remove();
    };
  }, []);


useEffect(() => {
  if (!mapRef.current) return;
//fetchUrl="https://editablemapbackend.onrender.com/api/features"
  fetch(fetchUrl)
    .then(res => res.json())
    .then((data) => {
      // Normalize features: extract geojson from your nested structure
      const features = data.features.map((f: any) => f);

      const layerGroup = L.geoJSON(features, {
        onEachFeature: (f: Feature, layer) => {
          // bind popup, etc.

          const properties = f.properties || {};
          const id = f.id as string | number;

          layer.bindPopup(createPopupContent( {
      id,
      properties
    }, (updatedProps) => {
            fetch(putUrl + `${f.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ properties: updatedProps }),
            }).then(() => reloadFeatures());
          }));
         }
      });
    if (mapRef.current) {
      layerGroup.addTo(mapRef.current);
    }
    });
}, [mapRef.current]);


  return <div id="map" style={{ height: "100vh", width: "100%" }} />;
}

// ------------------ Popup Component ------------------

function PopupEditor({ feature, onSave, onDelete }: any) {
  const [localProps, setLocalProps] = useState({ ...feature.properties });

   
const updateValue = (key: string, value: string) =>
  setLocalProps((prev: Record<string, any>) => ({ ...prev, [key]: value }));

const updateKey = (oldKey: string, newKey: string) => {
  setLocalProps((prev: Record<string, any>) => {
    const newProps = { ...prev };
    const value = newProps[oldKey];
    delete newProps[oldKey];
    newProps[newKey] = value;
    return newProps;
  });
};


  const addField = () => setLocalProps({ ...localProps, "": "" });

  return (
    <div style={{ width: "300px", padding: "8px" }}>
      <h4>Feature ID: {feature.id}</h4>

      {Object.entries(localProps).map(([key, value], i) => (
        <div key={i} style={{ marginBottom: "6px" }}>
          <input
            type="text"
            defaultValue={key}
            style={{ width: "40%", marginRight: "4px" }}
            onBlur={(e) => updateKey(key, e.target.value)}
          />
          <input
            type="text"
            defaultValue={value as string | number | undefined}
            style={{ width: "50%" }}
            onBlur={(e) => updateValue(key, e.target.value)}
          />
        </div>
      ))}

      <button onClick={addField}>+ Add field</button>
      <button style={{ marginLeft: "10px" }} onClick={() => onSave(localProps)}>
        Save
      </button>
      <button style={{ marginLeft: "10px", color: "red" }} onClick={onDelete}>
        Delete
      </button>
    </div>
  );
}


function createPopupContent(
  feature: { id: string | number; properties: Record<string, any> },
  onSave: (props: Record<string, any>) => void
) {

//console.log('mfeaturem==',feature);
//console.log('monsavem==',onSave);

  const container = document.createElement("div");
  const root = createRoot(container);
  root.render(<PopupEditor feature={feature} onSave={onSave} />);
  return container;
}

