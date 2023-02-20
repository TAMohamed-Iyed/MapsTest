package routes

import (
	"boilerplate/controllers"

	"github.com/gofiber/fiber/v2"
)

func LocationRoute(app *fiber.App) {
	//All routes related to the locations comes here
	group := app.Group("/api/locations")

	group.Post("", controllers.CreateLocation)
	group.Delete("/:locationId", controllers.DeleteALocation)
	group.Put("/:locationId", controllers.EditALocation)
	group.Get("/:locationId", controllers.GetALocation)
	group.Get("", controllers.GetAllLocations)

}
