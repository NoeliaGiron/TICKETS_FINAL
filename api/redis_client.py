import redis
import json

redis_client = redis.Redis(
    host="redis-14630.c114.us-east-1-4.ec2.cloud.redislabs.com",
    port=14630,
    password="TU_PASSWORD_REDIS",
    ssl=True,
    decode_responses=True
)

def cache_usuario(id_usuario, data):
    redis_client.setex(
        f"usuario:{id_usuario}",
        3600,
        json.dumps(data)
    )

def enviar_tarea(id_ticket):
    redis_client.rpush("cola_tickets", id_ticket)
