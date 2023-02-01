import { MapContainer, TileLayer } from "react-leaflet";
import Marques from "./Marques";

function Map() {
  return (
    <MapContainer center={[35, 10]} zoom={13} boxZoom={false}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marques />
    </MapContainer>
  );
}

export default Map;
