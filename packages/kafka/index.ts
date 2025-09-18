import { Kafka, Producer, Consumer } from 'kafkajs'
import Redis from 'ioredis'

// Kafka client
const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID || 'tire-distributor',
  brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
  ...(process.env.KAFKA_USERNAME && {
    sasl: {
      mechanism: 'plain',
      username: process.env.KAFKA_USERNAME,
      password: process.env.KAFKA_PASSWORD || '',
    },
  }),
})

// Redis client for real-time updates
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')

// Topics
export const TOPICS = {
  STOCK_EVENT: 'stock-event',
  ORDER_EVENT: 'order-event',
  INVOICE_EVENT: 'invoice-event',
  SHIPMENT_EVENT: 'shipment-event',
  WARRANTY_EVENT: 'warranty-event',
  SENSOR_EVENT: 'sensor-event',
  TENANT_CREATED: 'tenant-created',
  PRICE_UPDATE: 'price-update',
} as const

// Event types
export interface StockEvent {
  tenantId: string
  tireId: string
  sku: string
  oldQuantity: number
  newQuantity: number
  warehouse?: string
  timestamp: string
}

export interface OrderEvent {
  tenantId: string
  orderId: string
  orderNumber: string
  status: string
  customerId?: string
  total: number
  items: Array<{
    tireId: string
    sku: string
    quantity: number
    unitPrice: number
  }>
  timestamp: string
}

export interface SensorEvent {
  deviceId: string
  vehicleId: string
  position: string
  pressure: number
  temperature: number
  batteryLevel: number
  timestamp: string
}

export interface PriceUpdateEvent {
  tenantId: string
  tireId: string
  sku: string
  oldPrice: number
  newPrice: number
  reason: string
  timestamp: string
}

// Producer class
export class KafkaProducer {
  private producer: Producer

  constructor() {
    this.producer = kafka.producer()
  }

  async connect() {
    await this.producer.connect()
  }

  async disconnect() {
    await this.producer.disconnect()
  }

  async sendStockEvent(event: StockEvent) {
    await this.producer.send({
      topic: TOPICS.STOCK_EVENT,
      messages: [{
        key: event.tireId,
        value: JSON.stringify(event),
        timestamp: Date.now().toString(),
      }],
    })

    // Also publish to Redis for real-time updates
    await redis.publish(`stock:${event.sku}`, JSON.stringify(event))
  }

  async sendOrderEvent(event: OrderEvent) {
    await this.producer.send({
      topic: TOPICS.ORDER_EVENT,
      messages: [{
        key: event.orderId,
        value: JSON.stringify(event),
        timestamp: Date.now().toString(),
      }],
    })
  }

  async sendSensorEvent(event: SensorEvent) {
    await this.producer.send({
      topic: TOPICS.SENSOR_EVENT,
      messages: [{
        key: event.deviceId,
        value: JSON.stringify(event),
        timestamp: Date.now().toString(),
      }],
    })

    // Real-time sensor data via Redis
    await redis.publish(`sensor:${event.deviceId}`, JSON.stringify(event))
  }

  async sendPriceUpdate(event: PriceUpdateEvent) {
    await this.producer.send({
      topic: TOPICS.PRICE_UPDATE,
      messages: [{
        key: event.tireId,
        value: JSON.stringify(event),
        timestamp: Date.now().toString(),
      }],
    })
  }
}

// Consumer class
export class KafkaConsumer {
  private consumer: Consumer

  constructor(groupId: string) {
    this.consumer = kafka.consumer({ groupId })
  }

  async connect() {
    await this.consumer.connect()
  }

  async disconnect() {
    await this.consumer.disconnect()
  }

  async subscribeToStockEvents(handler: (event: StockEvent) => Promise<void>) {
    await this.consumer.subscribe({ topic: TOPICS.STOCK_EVENT })

    await this.consumer.run({
      eachMessage: async ({ message }) => {
        if (message.value) {
          const event: StockEvent = JSON.parse(message.value.toString())
          await handler(event)
        }
      },
    })
  }

  async subscribeToOrderEvents(handler: (event: OrderEvent) => Promise<void>) {
    await this.consumer.subscribe({ topic: TOPICS.ORDER_EVENT })

    await this.consumer.run({
      eachMessage: async ({ message }) => {
        if (message.value) {
          const event: OrderEvent = JSON.parse(message.value.toString())
          await handler(event)
        }
      },
    })
  }

  async subscribeToSensorEvents(handler: (event: SensorEvent) => Promise<void>) {
    await this.consumer.subscribe({ topic: TOPICS.SENSOR_EVENT })

    await this.consumer.run({
      eachMessage: async ({ message }) => {
        if (message.value) {
          const event: SensorEvent = JSON.parse(message.value.toString())
          await handler(event)
        }
      },
    })
  }
}

// Singleton instances
export const producer = new KafkaProducer()
export const redis as RedisClient = redis

export { kafka, redis }
