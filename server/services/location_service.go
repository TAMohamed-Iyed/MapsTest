package services

import (
	"boilerplate/models"
	"math"
	"sort"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

func degressToRadius(degree float32) float32 {
	return (degree * math.Pi) / 180
}

func calculateDistance(startCoord models.Location, destCoord models.Location) float64 {
	var startLat float32 = degressToRadius(startCoord.Latitude)
	var startLong float32 = degressToRadius(startCoord.Longitude)
	var destLat float32 = degressToRadius(destCoord.Latitude)
	var destLong float32 = degressToRadius(destCoord.Longitude)

	var radius float64 = 6571

	return math.Acos(
		math.Sin(float64(startLat))*math.Sin(float64(destLat))+
			math.Cos(float64(startLat))*math.Cos(float64(destLat))*math.Cos(float64(startLong)-float64(destLong)),
	) * radius
}

func calculateRoadDistance(locations []models.Location) float64 {
	var sum float64
	var length int = len(locations)

	if length == 0 || length == 1 {
		return 0
	}

	for index, location := range locations {
		if index != 0 && index%2 != 0 {
			sum += calculateDistance(location, locations[index-1])
		}
	}

	if length%2 != 0 {
		sum += calculateDistance(locations[length-2], locations[length-1])
	}

	return sum
}

type Graph = map[models.Location][]models.Location

func constructGraph(locations []models.Location) Graph {
	var graph Graph = make(Graph, 0)

	if len(locations) == 0 {
		return graph
	}

	for _, source := range locations {
		for _, destination := range locations {
			if source == destination {
				continue
			}

			if existingLocations, exist := graph[source]; exist {
				graph[source] = append(existingLocations, destination)
			} else {
				graph[source] = make([]models.Location, 0)
				graph[source] = append(graph[source], destination)
			}
		}
	}

	return graph
}

func includes[T comparable](arr []T, elem T) bool {
	for _, e := range arr {
		if e == elem {
			return true
		}
	}

	return false
}

func findRoad(road *[]models.Location, destinations []models.Location) *[]models.Location {
	if road == nil {
		val := make([]models.Location, 0)
		return &val
	}

	for _, destination := range destinations {
		if !includes(*road, destination) {
			newArr := append(*road, destination)
			road = &newArr
			findRoad(road, destinations)
		}
	}

	return road
}

func findAllRoads(source models.Location, destinations []models.Location) [][]models.Location {
	var roads [][]models.Location = (make([][]models.Location, 0))

	for _, destination := range destinations {
		road := make([]models.Location, 2)
		road = append(road, source, destination)
		roads = append(roads, *findRoad(&road, destinations))
	}

	return roads
}

type sortedLocation struct {
	position  int
	Id        primitive.ObjectID `json:"id,omitempty"`
	Latitude  float32            `json:"latitude" validate:"required"`
	Longitude float32            `json:"longitude" validate:"required"`
}

func formatSorted(locations []models.Location) []sortedLocation {
	var sortedLocations []sortedLocation = make([]sortedLocation, len(locations))

	for i := 0; i < len(locations); i++ {
		sortedLocation := sortedLocation{
			Latitude:  locations[i].Latitude,
			Longitude: locations[i].Longitude,
			Id:        locations[i].Id,
			position:  i,
		}

		sortedLocations[i] = sortedLocation
	}

	return sortedLocations
}

func SortLocations(locations []models.Location) []sortedLocation {
	if len(locations) == 1 {
		return formatSorted(locations)
	}

	var graph Graph = constructGraph(locations)
	var roads [][]models.Location = (make([][]models.Location, 0))

	for source, destinations := range graph {
		allRoads := findAllRoads(source, destinations)

		for _, road := range allRoads {
			roads = append(roads, road)
		}
	}

	sort.Slice(roads, func(i, j int) bool {
		return calculateRoadDistance(roads[i]) < calculateRoadDistance(roads[j])
	})

	return formatSorted(roads[0])
}
