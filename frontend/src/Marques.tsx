import { useCallback, useEffect, useState } from "react";
import { BACKEND_URL } from "./config";
import Routing from "./routingMachine";
import randomRGB from "./utils/randomRGB";
import { ILocation } from "./routingMachine";
import {
  LatLng,
  LeafletEvent,
  LeafletMouseEvent,
  LocationEvent,
} from "leaflet";
import { Marker, useMapEvents } from "react-leaflet";

const Marques = () => {
  const [positions, setPositions] = useState<ILocation[]>([]);

  const getPositions = useCallback(async () => {
    const response = await fetch(`${BACKEND_URL}locations`);
    const { data } = await response.json();
    setPositions(data);
  }, []);

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
    (id: ILocation["_id"]) => async (e: LeafletMouseEvent) => {
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
    (id: ILocation["_id"]) => async (e: LeafletEvent) => {
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
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  useEffect(() => {
    getPositions();
  }, []);

  return (
    <>
      {positions.length === 0 ? undefined : positions.length === 1 ? (
        <Marker
          position={{ lat: positions[0].latitude, lng: positions[0].longitude }}
          key={1}
          riseOnHover
          draggable
          eventHandlers={{
            click: deletePosition(positions[0]._id),
            dragend: updatePosition(positions[0]._id),
          }}
        />
      ) : (
        positions.length > 1 && (
          <Routing
            route={positions}
            deletePosition={deletePosition}
            updatePosition={updatePosition}
          />
        )
      )}
      {/* {positions.map((pos, index) => (
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
      ))} */}
    </>
  );
};

export default Marques;
