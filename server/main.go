package main

import (
	"boilerplate/configs"
	"boilerplate/controllers"
	"boilerplate/routes"

	"flag"
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
)

func main() {
	// Parse command-line flags
	flag.Parse()

	// Connected with database
	configs.ConnectDB()

	isProd := false
	if enviroment := configs.EnvEnviroment(); enviroment == "production" {
		isProd = true
	}

	// Create fiber app
	app := fiber.New(fiber.Config{
		Prefork: isProd, // go run app.go -prod
	})

	// Middleware
	app.Use(recover.New())
	app.Use(logger.New())

	routes.LocationRoute(app)
	// Handle not founds
	app.Use(controllers.NotFound)

	// Listen on port 3000
	log.Fatal(app.Listen(configs.EnvPORT())) // go run app.go -port=:3000
}
