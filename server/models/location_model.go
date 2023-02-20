package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type Location struct {
	Id        primitive.ObjectID `json:"id,omitempty"`
	Latitude  float32            `json:"latitude" validate:"required"`
	Longitude float32            `json:"longitude" validate:"required"`
}
