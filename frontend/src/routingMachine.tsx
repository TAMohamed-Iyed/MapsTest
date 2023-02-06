import {
  latLng,
  ControlOptions,
  Routing,
  marker,
  divIcon,
  LeafletMouseEvent,
  LeafletEventHandlerFn,
} from "leaflet";
import { createControlComponent } from "@react-leaflet/core";
import "leaflet-routing-machine";
import randomRGB from "./utils/randomRGB";

export interface ILocation {
  latitude: number;
  longitude: number;
  _id: string;
}

interface Props extends ControlOptions {
  route: ILocation[];
  deletePosition: (id: string) => (e: LeafletMouseEvent) => void;
  updatePosition: (id: string) => (e: LeafletMouseEvent) => void;
  onLoad: (router: Routing.Control) => void;
}

export const createWaypointsFromLocations = (locations: ILocation[]) => {
  if (locations.length === 0) {
    return [];
  }

  return locations
    .slice()
    .sort((a, b) => ((a as any).position > (b as any).position ? 1 : -1))
    .map((location) => {
      if (location instanceof Routing.Waypoint) {
        return location;
      }

      const { latitude, longitude, _id } = location;
      const waypoint = new Routing.Waypoint(latLng(latitude, longitude), "", {
        allowUTurn: false,
      });
      (waypoint as any)._id = _id;
      return waypoint;
    });
};

const createRoutineMachineLayer = ({
  route,
  updatePosition,
  deletePosition,
  onLoad,
}: Props) => {
  const waypoints = createWaypointsFromLocations(route);
  const instance = Routing.control({
    waypoints,
    lineOptions: {
      extendToWaypoints: false,
      missingRouteTolerance: 0,
      styles: [
        {
          color: randomRGB(),
          weight: 4,
        },
      ],
    },
    plan: new Routing.Plan(waypoints, {
      createMarker(waypointIndex, waypoint) {
        return marker(waypoint.latLng, {
          icon: divIcon({
            html: `<div class="marker">
              <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAApCAYAAADAk4LOAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAN1wAADdcBQiibeAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAUlSURBVFjDrZdLiBxVFIb/e289uqt6kkx6zIiIoKgLRReKuMhCcaOIAUEIiCCE4CIPggZ8kBjooPgM0TiYEUUjqBGchZqAQlyYRTA+kJiJQiJGMjN5zYzT3dP1rrr3HBeTjDGTSfc8Dvyruud89Z9z6kIJdBj31763MivsJXKuZYF6dak5++2mh7NOcsXVHq6sHbhOK/24kOJJMO4AE1vKygwZhxlKSHGKiD+RSu09vOXB43OCrHz96y6T2lsh+OmKXzFdlbLne2UopSAupBhjECcZgjDMgiiSxPhcK/nCr1sfOtcWcm/tq9uEsL4rl0vdK67pKVu2jUwTMk0wBBAzpBCQAnAtiZIlwWQwPlHPglZQAFj1Y23VwVkh92zbd59U+Kanp+p2L12mooKQ5AbcpuclS6LiKoRhxOfHzhXMcs3PtVV7Z0DufXH/LSzpSG9vr1/p6kIz0dDUrvx/IYXAsrJCkWc4e/Z0Zpgf+KX26A/TkNtrXziesY9Xq8tvWNZdVfVYg7hzwKVv3O3ZiKMWj46OTrq5fdOh1x5pSADwjdzo2nbv0u6qqkca2jCIMGcZAuqRhu8vEX7ZK2V2WgMAcXdtvyeKbPS662+osCohzMycHVweniNREoShoZO5KYobpciSh23bFq7rIUgNiLFghRkBlg2v7GlpiccsCHrcryzxUk3zmsNskeYGvt/lxVH4hMWEu9xSWaQFYQ7L1B6iGZ5bBoy+zWKiHiltFHpqeIsVhWaosg1iqlgg4wAAEYEXsV3EmNppJmExMFYUxfVSuIs6E0sI5FkBBhLJzH9laQxLSjBj0WQJgSJPweDTkknvS4JGbCuxKOt7UY4lEQfNnAu9TzLxN2nUdAQTLAEw8YIlAVgAkmDCSBL75eCutSeY+GTUqqNkqUVxUbIl4qgJo4vWzecrhyQAMJldYf1MXLLl1EIsYBZgoGwpRI2zMTPtGBhYbSQAlJF9lieRzNMIriVBzPOWawvoIkYaNC0u9IcAIAHgp75NLQl8ENbPZJ6jgAU48RyFqHEuZyE+Pda/vjENAQBD5s209Y+kPJlyM4+r3lUS0AWSyVEhpHnjYu1pyO+7N4ywwPvhxHDiuwo8j1b5rkQwMZIziYHBXetPzIAAgIV8exZOSMoieI6aU5vKtgR0jqw1JtiYbZfW/R/kSN+mcWbxdtwYjn1XTd9B7cQAfNdCWB/OhBR7jvWv/3tWCAAoO3ktjyZZJ0HHbsq2AooERVQXzPKly2vOgPz29jNNBr+e1IcSz5YAM4hmFzPDtyWS+lDK4N2DfU+dbgsBAFHyd+oszE3agt/GjWcrUBEjj5sQBb96pXpXhAzueDJi4u1p41TsuQpCiFln4bkKeXMoJeadg++tG+sYAgBBXOo3RRrruAnfkWDmGfIdCeQhiiQgQbxjtlqzQk59vCZlNluL5lDiORLyMjcA4DsKeXM4AfDKxa97ThAAqPaMfaR1Nq6jOiqOAhOm5TsKJg1QZGGRedY7V6tzVcjBWk1D0JZ8cigt2RJSimkXnqOgW8MxQLUTb6wN5g0BgGPV0c9BekTH41xx5YXrQ8FkTRgdpxU7ea9djbYQ1GokmJ43wUhWtgRcS04tQjAcw9CWw29tThYOAXD03XVfMps/TTTOy30blDZgiqxFK6p7OsnvCDJ1UD9LyUjORoPDkUQyPfdHbXW+qJCjfRsOwOAoNY4z6Xz01rHq3k5zO4ZMHTabYSIhJD87MLB64f8Ys8WdG/tfBljMJedfwY+s/2P4Pv8AAAAASUVORK5CYII=" />
              <span>${waypointIndex}</span>
            </div>`,
          }),
        })
          .on(
            "dragend",
            updatePosition((waypoint as any)._id) as LeafletEventHandlerFn
          )
          .on("click", deletePosition((waypoint as any)._id));
      },
    }),
    containerClassName: "itinerary",
    waypointMode: "connect",
    fitSelectedRoutes: true,
    showAlternatives: false,
  });

  onLoad(instance);
  return instance;
};

const RoutingMachine = createControlComponent(createRoutineMachineLayer);

export default RoutingMachine;
