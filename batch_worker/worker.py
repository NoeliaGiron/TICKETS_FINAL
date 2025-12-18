import redis
from sqlalchemy.orm import sessionmaker
from backend.database import engine
from backend.models import Ticket
import time

SessionLocal = sessionmaker(bind=engine)

redis_client = redis.Redis(
    host="redis-14630.c114.us-east-1-4.ec2.cloud.redislabs.com",
    port=14630,
    password="TU_PASSWORD_REDIS",
    ssl=True,
    decode_responses=True
)

print("🟢 Batch Worker escuchando cola Redis...")

while True:
    _, ticket_id = redis_client.blpop("cola_tickets")
    db = SessionLocal()

    ticket = db.query(Ticket).filter_by(id_ticket=int(ticket_id)).first()
    if ticket and ticket.estado == "en_proceso":
        time.sleep(5)  # Simula procesamiento
        ticket.estado = "cerrado"
        db.commit()
        print(f"✅ Ticket {ticket_id} cerrado automáticamente")

    db.close()
