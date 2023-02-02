import { ILocation } from '../core/db/models/Location';

class LocationsService {
  static degreesToRadians(degrees: number) {
    var radians = (degrees * Math.PI) / 180;
    return radians;
  }
  static calculateDistance(startCoords: ILocation, destCoords: ILocation) {
    const startingLat = this.degreesToRadians(startCoords.latitude);
    const startingLong = this.degreesToRadians(startCoords.longitude);
    const destinationLat = this.degreesToRadians(destCoords.latitude);
    const destinationLong = this.degreesToRadians(destCoords.longitude);

    // Radius of the Earth in kilometers
    const radius = 6571;

    // Haversine equation
    return (
      Math.acos(
        Math.sin(startingLat) * Math.sin(destinationLat) +
          Math.cos(startingLat) * Math.cos(destinationLat) * Math.cos(startingLong - destinationLong),
      ) * radius
    );
  }

  static calculateRoadDistance(locations: ILocation[]) {
    return locations
      .map((location, index, arr) => (arr[index + 1] ? [location, arr[index + 1]] : [location]))
      .reduce(
        (acc: number, curr: ILocation[]) => (curr.length === 2 ? acc + this.calculateDistance(curr[0], curr[1]) : acc),
        0,
      );
  }
  static constructGraph(locations: ILocation[]) {
    const graph = new Map<ILocation, ILocation[]>();
    for (const source of locations) {
      for (const destination of locations) {
        if (source === destination) {
          continue;
        }
        if (graph.has(source)) {
          const existingLocations = graph.get(source);
          graph.set(source, [...(existingLocations as ILocation[]), destination]);
        } else {
          graph.set(source, [destination]);
        }
      }
    }
    return graph;
  }

  static findRoad(road: ILocation[], destinations: ILocation[]) {
    for (const destination of destinations) {
      if (!road.includes(destination)) {
        road.push(destination);
        this.findRoad(road, destinations);
      }
    }
    return road;
  }
  static findAllRoads(source: ILocation, destinations: ILocation[]) {
    const roads: ILocation[][] = [];
    for (const destination of destinations) {
      roads.push(this.findRoad([source, destination], destinations));
    }

    return roads;
  }

  static sortLocations(locations: ILocation[] | null) {
    if (!locations) {
      return [];
    }

    if (locations.length === 1 || locations.length === 0) {
      return locations;
    }

    const graph = this.constructGraph(locations);
    const roads: ILocation[][] = [];

    for (const [source, destinations] of graph.entries()) {
      roads.push(...this.findAllRoads(source, destinations));
    }

    return roads.slice().sort((a, b) => (this.calculateRoadDistance(a) > this.calculateRoadDistance(b) ? 1 : -1))[0];
  }
}

export default LocationsService;
