import { ILocation } from '../core/db/models/Location';
import { Axios } from 'axios';

const axios = new Axios({
  baseURL: 'http://router.project-osrm.org',
});

interface SortedLocation extends ILocation {
  position: number;
}

interface SortOptions {
  maxDistance?: string;
  maxTrips?: string;
  maxDuration?: string;
  algorithm: 'local' | 'OSRM';
}

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

  static formatSorted(locations: ILocation[]): SortedLocation[] {
    locations.forEach((location, index) => ((location as SortedLocation).position = index));
    return locations as SortedLocation[];
  }

  static async sortLocations(locations: ILocation[] | null, options: any): Promise<SortedLocation[]> {
    if (!locations || locations.length === 0) {
      return [];
    }

    if (locations.length === 1) {
      return this.formatSorted(locations);
    }

    if ((options as SortOptions).algorithm === 'OSRM') {
      const response = await axios.get(
        `/table/v1/car/${locations.map(({ latitude, longitude }) => `${longitude},${latitude}`).join(';')}`,
      );
      const data = JSON.parse(response.data);
      // const roads = Object.fromEntries(
      //   data.durations.map((duration: number[], index: number) => [locations[index], duration.filter((e) => e !== 0)]),
      // );

      const graph = new Map<ILocation, [ILocation, number][]>(
        data.durations.map((duration: number[], i: number) => [
          locations[i],
          duration.map((distance, j) => [locations[j], distance]).filter((e) => e[1] !== 0),
        ]),
      );

      console.log({ graph });
    }

    const graph = this.constructGraph(locations);
    const roads: ILocation[][] = [];

    for (const [source, destinations] of graph.entries()) {
      roads.push(...this.findAllRoads(source, destinations));
    }

    const sorted = roads
      .slice()
      .sort((a, b) => (this.calculateRoadDistance(a) > this.calculateRoadDistance(b) ? 1 : -1));

    return this.formatSorted(sorted[0]);
  }
}

export default LocationsService;
