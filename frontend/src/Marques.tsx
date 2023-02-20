import { useCallback, useEffect, useState } from "react";
import { BACKEND_URL } from "./config";
import Router, { createWaypointsFromLocations } from "./routingMachine";
import randomRGB from "./utils/randomRGB";
import { ILocation } from "./routingMachine";
import {
  latLng,
  LatLng,
  LeafletEvent,
  LeafletMouseEvent,
  LocationEvent,
  Routing,
} from "leaflet";
import { Marker, useMapEvents } from "react-leaflet";

interface Props {
  options: {
    maxDistance: number;
    maxDuration: number;
    maxTrips: number;
    algorithm: "local" | "OSRM";
  };
}

const Marques = ({ options }: Props) => {
  const [positions, setPositions] = useState<ILocation[]>([]);
  const [router, setRouter] = useState<Routing.Control | null>(null);

  const getPositions = useCallback(async () => {
    const response = await fetch(
      `${BACKEND_URL}locations?algorithm=${options.algorithm}${
        options.maxDistance > 0 ? "&maxDistance=" + options.maxDistance : ""
      }${options.maxDuration > 0 ? "&maxDuration=" + options.maxDuration : ""}${
        options.maxTrips > 0 ? "&maxTrips=" + options.maxTrips : ""
      }`
    );
    const { data } = await response.json();
    setPositions(data);
    return data;
  }, [options]);

  const updateRoutes = useCallback(async () => {
    if (!router) {
      return;
    }
    const newWayPoints = createWaypointsFromLocations(await getPositions());
    router.setWaypoints(newWayPoints);
    const r = router.getRouter();
    r.route(newWayPoints, () => null);
  }, [getPositions, router]);

  const addPosition = useCallback(
    async (newPosition: LatLng) => {
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

      if (response.status.toString().startsWith("2")) {
        if (positions.length === 0) {
          return setPositions(await getPositions());
        }

        await updateRoutes();
      }
    },
    [positions, updateRoutes, getPositions]
  );

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
        await updateRoutes();
      }
    },
    [updateRoutes]
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
        await updateRoutes();
      }
    },
    [updateRoutes]
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
          eventHandlers={{
            click: deletePosition(positions[0]._id),
            dragend: updatePosition(positions[0]._id),
          }}
        />
      ) : (
        positions.length > 1 && (
          <Router
            route={positions}
            deletePosition={deletePosition}
            updatePosition={updatePosition}
            onLoad={(router) => setRouter(router)}
          />
        )
      )}
    </>
  );
};

export default Marques;
