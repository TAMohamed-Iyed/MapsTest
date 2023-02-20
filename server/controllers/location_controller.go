package controllers

import (
	"boilerplate/configs"
	"boilerplate/models"
	"boilerplate/responses"
	"boilerplate/services"
	"context"
	"net/http"
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

var locationCollection *mongo.Collection = configs.GetCollection(configs.DB, "locations")
var validate = validator.New()

func CreateLocation(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	var location models.Location
	defer cancel()

	//validate the request body
	if err := c.BodyParser(&location); err != nil {
		return c.Status(http.StatusBadRequest).JSON(responses.LocationResponse{Status: http.StatusBadRequest, Message: "error", Data: &fiber.Map{"data": err.Error()}})
	}

	//use the validator library to validate required fields
	if validationErr := validate.Struct(&location); validationErr != nil {
		return c.Status(http.StatusBadRequest).JSON(responses.LocationResponse{Status: http.StatusBadRequest, Message: "error", Data: &fiber.Map{"data": validationErr.Error()}})
	}

	newLocation := models.Location{
		Id:        primitive.NewObjectID(),
		Latitude:  location.Latitude,
		Longitude: location.Longitude,
	}

	result, err := locationCollection.InsertOne(ctx, newLocation)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.LocationResponse{Status: http.StatusInternalServerError, Message: "error", Data: &fiber.Map{"data": err.Error()}})
	}

	return c.Status(http.StatusCreated).JSON(responses.LocationResponse{Status: http.StatusCreated, Message: "success", Data: &fiber.Map{"data": result}})
}

func GetALocation(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	locationId := c.Params("locationId")
	var location models.Location
	defer cancel()

	objId, _ := primitive.ObjectIDFromHex(locationId)

	err := locationCollection.FindOne(ctx, bson.M{"id": objId}).Decode(&location)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.LocationResponse{Status: http.StatusInternalServerError, Message: "error", Data: &fiber.Map{"data": err.Error()}})
	}

	return c.Status(http.StatusOK).JSON(responses.LocationResponse{Status: http.StatusOK, Message: "success", Data: &fiber.Map{"data": location}})
}

func EditALocation(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	locationId := c.Params("locationId")
	var location models.Location
	defer cancel()

	objId, _ := primitive.ObjectIDFromHex(locationId)

	//validate the request body
	if err := c.BodyParser(&location); err != nil {
		return c.Status(http.StatusBadRequest).JSON(responses.LocationResponse{Status: http.StatusBadRequest, Message: "error", Data: &fiber.Map{"data": err.Error()}})
	}

	//use the validator library to validate required fields
	if validationErr := validate.Struct(&location); validationErr != nil {
		return c.Status(http.StatusBadRequest).JSON(responses.LocationResponse{Status: http.StatusBadRequest, Message: "error", Data: &fiber.Map{"data": validationErr.Error()}})
	}

	update := bson.M{"latitude": location.Latitude, "longitude": location.Longitude}

	result, err := locationCollection.UpdateOne(ctx, bson.M{"id": objId}, bson.M{"$set": update})

	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.LocationResponse{Status: http.StatusInternalServerError, Message: "error", Data: &fiber.Map{"data": err.Error()}})
	}
	//get updated location details
	var updatedLocation models.Location
	if result.MatchedCount == 1 {
		err := locationCollection.FindOne(ctx, bson.M{"id": objId}).Decode(&updatedLocation)

		if err != nil {
			return c.Status(http.StatusInternalServerError).JSON(responses.LocationResponse{Status: http.StatusInternalServerError, Message: "error", Data: &fiber.Map{"data": err.Error()}})
		}
	}

	return c.Status(http.StatusOK).JSON(responses.LocationResponse{Status: http.StatusOK, Message: "success", Data: &fiber.Map{"data": updatedLocation}})
}

func DeleteALocation(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	locationId := c.Params("locationId")
	defer cancel()

	objId, _ := primitive.ObjectIDFromHex(locationId)

	result, err := locationCollection.DeleteOne(ctx, bson.M{"id": objId})
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.LocationResponse{Status: http.StatusInternalServerError, Message: "error", Data: &fiber.Map{"data": err.Error()}})
	}

	if result.DeletedCount < 1 {
		return c.Status(http.StatusNotFound).JSON(
			responses.LocationResponse{Status: http.StatusNotFound, Message: "error", Data: &fiber.Map{"data": "location with specified ID not found!"}},
		)
	}

	return c.Status(http.StatusOK).JSON(
		responses.LocationResponse{Status: http.StatusOK, Message: "success", Data: &fiber.Map{"data": "location successfully deleted!"}},
	)
}

func GetAllLocations(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	var locations []models.Location
	defer cancel()

	results, err := locationCollection.Find(ctx, bson.M{})

	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.LocationResponse{Status: http.StatusInternalServerError, Message: "error", Data: &fiber.Map{"data": err.Error()}})
	}

	//reading from the db in an optimal way
	defer results.Close(ctx)
	for results.Next(ctx) {
		var singleLocation models.Location
		if err = results.Decode(&singleLocation); err != nil {
			return c.Status(http.StatusInternalServerError).JSON(responses.LocationResponse{Status: http.StatusInternalServerError, Message: "error", Data: &fiber.Map{"data": err.Error()}})
		}

		locations = append(locations, singleLocation)
	}

	return c.Status(http.StatusOK).JSON(
		responses.LocationResponse{Status: http.StatusOK, Message: "success", Data: &fiber.Map{"data": services.SortLocations(locations)}},
	)
}

// NotFound returns custom 404 page
func NotFound(c *fiber.Ctx) error {
	return c.Status(404).SendFile("./static/404.html")
}
