from sqlalchemy import Column, Integer, String, Text, ForeignKey, TIMESTAMP
from database import Base
from sqlalchemy.sql import func

class Usuario(Base):
    __tablename__ = "usuarios"

    id_usuario = Column(Integer, primary_key=True)
    nombre = Column(String(100), nullable=False)
    email = Column(String(150), nullable=False, unique=True)
    rol = Column(String(20), nullable=False)
    fecha_creacion = Column(TIMESTAMP(timezone=True), server_default=func.now())


class Ticket(Base):
    __tablename__ = "tickets"

    id_ticket = Column(Integer, primary_key=True)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario"))
    asunto = Column(String(200), nullable=False)
    estado = Column(String(20), nullable=False)
    prioridad = Column(String(10), nullable=False)
    fecha_creacion = Column(TIMESTAMP(timezone=True), server_default=func.now())


class Interaccion(Base):
    __tablename__ = "interacciones"

    id_interaccion = Column(Integer, primary_key=True)
    id_ticket = Column(Integer, ForeignKey("tickets.id_ticket"))
    autor = Column(String(20), nullable=False)
    mensaje = Column(Text, nullable=False)
    fecha_creacion = Column(TIMESTAMP(timezone=True), server_default=func.now())
