package configs

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

func loadEnv() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}
}

func EnvMongoURL() string {
	loadEnv()
	return os.Getenv("DB_URL")
}

func EnvPORT() string {
	loadEnv()
	return os.Getenv("PORT")
}

func EnvEnviroment() string {
	loadEnv()
	return os.Getenv("ENV")
}
