#!/bin/bash

# Wait for Kafka to be ready
echo "Waiting for Kafka to be ready..."
sleep 30

# Create topics
echo "Creating Kafka topics..."

docker exec kafka kafka-topics --create --topic stock-event --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1
docker exec kafka kafka-topics --create --topic order-event --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1
docker exec kafka kafka-topics --create --topic invoice-event --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1
docker exec kafka kafka-topics --create --topic shipment-event --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1
docker exec kafka kafka-topics --create --topic warranty-event --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1
docker exec kafka kafka-topics --create --topic sensor-event --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1
docker exec kafka kafka-topics --create --topic tenant-event --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1
docker exec kafka kafka-topics --create --topic retread-event --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1
docker exec kafka kafka-topics --create --topic alert-event --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1
docker exec kafka kafka-topics --create --topic pricing-event --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1

echo "Kafka topics created successfully!"

# List topics to verify
echo "Current topics:"
docker exec kafka kafka-topics --list --bootstrap-server localhost:9092
