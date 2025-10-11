import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-draw";
export default function EditableMap({ fetchUrl, saveUrl, putUrl, deleteUrl, maptiler_api_key }: {
    fetchUrl: any;
    saveUrl: any;
    putUrl: any;
    deleteUrl: any;
    maptiler_api_key: any;
}): import("react/jsx-runtime").JSX.Element;
