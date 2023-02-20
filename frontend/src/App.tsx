import { MutableRefObject, useRef, useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import Marques from "./Marques";

function Map() {
  const [options, setOptions] = useState({
    maxDistance: 0,
    maxDuration: 0,
    maxTrips: 0,
    algorithm: "local",
  });

  const maxDistanceRef = useRef() as MutableRefObject<HTMLInputElement>;
  const maxDurationeRef = useRef() as MutableRefObject<HTMLInputElement>;
  const maxTripsRef = useRef() as MutableRefObject<HTMLInputElement>;

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 90,
          left: 0,
          zIndex: 99999,
          background: "white",
          padding: 10,
          borderRadius: 10,
          display: " flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <div>
          maxDistance (kilometer) :
          <input type={"number"} ref={maxDistanceRef} />
          <button
            onClick={() =>
              setOptions((prev) => ({
                ...prev,
                maxDistance: parseInt(maxDistanceRef.current.value),
              }))
            }
          >
            apply
          </button>
        </div>
        <div>
          maxDuration (seconds) :
          <input type={"number"} ref={maxDurationeRef} />
          <button
            onClick={() =>
              setOptions((prev) => ({
                ...prev,
                maxDuration: parseInt(maxDurationeRef.current.value),
              }))
            }
          >
            apply
          </button>
        </div>
        <div>
          maxTrips :
          <input type={"number"} ref={maxTripsRef} />
          <button
            onClick={() =>
              setOptions((prev) => ({
                ...prev,
                maxTrips: parseInt(maxTripsRef.current.value),
              }))
            }
          >
            apply
          </button>
        </div>
        <div>
          algorithm :
          <select
            onChange={(e) =>
              setOptions((prev) => ({ ...prev, algorithm: e.target.value }))
            }
          >
            <option value="local">local</option>
            <option value="OSRM">OSRM</option>
          </select>
        </div>
      </div>
      <MapContainer center={[35, 10]} zoom={13} boxZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marques
          options={
            options as {
              maxDistance: number;
              maxDuration: number;
              maxTrips: number;
              algorithm: "OSRM" | "local";
            }
          }
        />
      </MapContainer>
    </>
  );
}

export default Map;
