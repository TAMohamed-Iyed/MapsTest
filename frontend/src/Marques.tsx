import {
  LatLng,
  LeafletEvent,
  LocationEvent,
  LeafletMouseEvent,
  polyline,
} from "leaflet";
import { useCallback, useEffect, useState } from "react";
import { Marker, Popup, useMapEvents } from "react-leaflet";
import { BACKEND_URL } from "./config";

interface Position {
  latitude: number;
  longitude: number;
  _id: string;
}

const Marques = () => {
  const [positions, setPositions] = useState<Position[]>([]);

  const addPosition = useCallback(async (newPosition: LatLng) => {
    const response = await fetch(`${BACKEND_URL}/locations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        latitude: newPosition.lat,
        longitude: newPosition.lng,
      }),
    });

    const { data } = await response.json();

    if (response.status.toString().startsWith("2")) {
      setPositions((prev) => [...prev, data]);
    }
  }, []);

  const deletePosition = useCallback(
    (id: Position["_id"]) => async (e: LeafletMouseEvent) => {
      const isShiftPressed = e.originalEvent.shiftKey;
      if (!isShiftPressed) {
        return;
      }

      const response = await fetch(`${BACKEND_URL}locations/${id}`, {
        method: "DELETE",
      });

      if (response.status.toString().startsWith("2")) {
        setPositions((prev) => prev.filter((p) => p._id !== id));
      }
    },
    []
  );

  const updatePosition = useCallback(
    (id: Position["_id"]) => async (e: LeafletEvent) => {
      const newPosition = (e as LocationEvent).target._latlng;
      const response = await fetch(`${BACKEND_URL}/locations/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          latitude: newPosition.lat,
          longitude: newPosition.lng,
        }),
      });

      if (response.status.toString().startsWith("2")) {
        setPositions((prev) => {
          const position = prev.find((p) => p._id === id);
          if (position) {
            position.latitude = newPosition.lat;
            position.longitude = newPosition.lng;
          }

          return [...prev];
        });
      }
    },
    []
  );

  const map = useMapEvents({
    click(e) {
      const isShiftPressed = e.originalEvent.shiftKey;
      if (isShiftPressed) {
        addPosition(e.latlng);
      }
    },
    load() {
      map.locate();
    },
    locationfound(e) {
      console.log("location found !");
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  const getPositions = useCallback(async () => {
    const response = await fetch(`${BACKEND_URL}/locations`);
    const { data } = await response.json();

    setPositions(data);
  }, []);

  useEffect(() => {
    getPositions();
  }, []);

  return (
    <>
      {positions.map((pos, index) => (
        <Marker
          position={{ lat: pos.latitude, lng: pos.longitude }}
          key={index}
          riseOnHover
          draggable
          eventHandlers={{
            click: deletePosition(pos._id),
            dragend: updatePosition(pos._id),
          }}
        >
          <Popup>
            latitude : {pos.latitude}, longitude : {pos.longitude}
          </Popup>
        </Marker>
      ))}
    </>
  );
};

export default Marques;
