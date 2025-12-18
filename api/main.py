# main.py
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Enum, ForeignKey
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.exc import SQLAlchemyError
from pydantic import BaseModel
from enum import Enum as PyEnum
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional

# ======================================================
# CONFIGURACIÓN DE FASTAPI
# ======================================================
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ======================================================
# CONFIGURACIÓN DE BASE DE DATOS
# ======================================================
# Nota: Se eliminó ?pgbouncer=true para evitar el error de DSN en psycopg2
DATABASE_URL = "postgresql://postgres.kcmmtuzwdfprxqqgvedk:Pucese_74086477@aws-0-us-west-2.pooler.supabase.com:6543/postgres"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ======================================================
# MODELOS SQLAlchemy
# ======================================================

class RolUsuario(str, PyEnum):
    cliente = 'cliente'
    operador = 'operador'

class PrioridadTicket(str, PyEnum):
    baja = 'baja'
    media = 'media'
    alta = 'alta'

class EstadoTicket(str, PyEnum):
    abierto = 'abierto'
    en_proceso = 'en_proceso'
    cerrado = 'cerrado'

class Usuario(Base):
    __tablename__ = 'usuarios'
    id_usuario = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False)
    rol = Column(Enum(RolUsuario, name='rolusuario'), nullable=False)
    fecha_creacion = Column(DateTime, default=datetime.now)

class Ticket(Base):
    __tablename__ = 'tickets'
    id_ticket = Column(Integer, primary_key=True, index=True)
    id_usuario = Column(Integer, ForeignKey('usuarios.id_usuario'), nullable=False)
    asunto = Column(String(200), nullable=False)
    descripcion = Column(String, default="") 
    estado = Column(Enum(EstadoTicket, name='estadoticket'), default='abierto')
    prioridad = Column(Enum(PrioridadTicket, name='prioridadticket'), nullable=False)
    fecha_creacion = Column(DateTime, default=datetime.now)
    
    usuario = relationship("Usuario")

class Interaccion(Base):
    __tablename__ = 'interacciones'
    id_interaccion = Column(Integer, primary_key=True, index=True)
    id_ticket = Column(Integer, ForeignKey('tickets.id_ticket'), nullable=False)
    autor = Column(Enum(RolUsuario, name='autorinteraccion'), nullable=False)
    mensaje = Column(String, nullable=False)
    fecha_creacion = Column(DateTime, default=datetime.now)

# ======================================================
# ESQUEMAS PYDANTIC
# ======================================================

class UsuarioBase(BaseModel):
    nombre: str
    email: str
    rol: RolUsuario
    
class UsuarioCreate(UsuarioBase):
    pass 

class UsuarioLogin(BaseModel):
    email: str

class TicketCreateOperator(BaseModel):
    client_email: str
    asunto: str
    descripcion: str
    prioridad: PrioridadTicket

# ======================================================
# ENDPOINTS DE AUTENTICACIÓN
# ======================================================

@app.post("/api/auth/register")
def register_user(usuario_data: UsuarioCreate, db: Session = Depends(get_db)):
    existing_user = db.query(Usuario).filter(Usuario.email == usuario_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="El email ya está registrado")
    try:
        usuario = Usuario(nombre=usuario_data.nombre, email=usuario_data.email, rol=usuario_data.rol)
        db.add(usuario)
        db.commit()
        db.refresh(usuario)
        return {"mensaje": "Registro exitoso", "id_usuario": usuario.id_usuario, "rol": usuario.rol}
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=500, detail="Error al registrar usuario en la base de datos")

@app.post("/api/auth/login")
def login_user(usuario_login: UsuarioLogin, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.email == usuario_login.email).first()
    if not usuario:
        raise HTTPException(status_code=401, detail="Credenciales inválidas (Email no encontrado)") 
    return {"mensaje": "Inicio de sesión exitoso", "id": usuario.id_usuario, "nombre": usuario.nombre, "rol": usuario.rol}

@app.get("/api/me")
def get_current_user(email: Optional[str] = None, db: Session = Depends(get_db)):
    """
    Busca un usuario por email. Si no se provee email, devuelve el primero de la DB.
    """
    if email:
        usuario = db.query(Usuario).filter(Usuario.email == email).first()
    else:
        usuario = db.query(Usuario).first() 

    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
    return {
        "id": usuario.id_usuario, 
        "nombre": usuario.nombre, 
        "rol": usuario.rol,
        "email": usuario.email
    }

# ======================================================
# ENDPOINTS DE GESTIÓN DE TICKETS
# ======================================================

@app.get("/api/tickets")
def listar_tickets(user_id: int, user_role: RolUsuario, db: Session = Depends(get_db)):
    try:
        if user_role == RolUsuario.operador:
            return db.query(Ticket).all()
        else:
            return db.query(Ticket).filter(Ticket.id_usuario == user_id).all()
    except SQLAlchemyError:
        raise HTTPException(status_code=500, detail="Error al obtener tickets")

@app.post("/api/tickets")
def crear_ticket(operator_id: int, ticket_data: TicketCreateOperator, db: Session = Depends(get_db)):
    try:
        operator_user = db.query(Usuario).filter(Usuario.id_usuario == operator_id, Usuario.rol == RolUsuario.operador).first()
        if not operator_user:
            raise HTTPException(status_code=403, detail="Acceso denegado")
            
        client_user = db.query(Usuario).filter(Usuario.email == ticket_data.client_email).first()
        if not client_user:
            raise HTTPException(status_code=404, detail="Cliente no encontrado")

        nuevo_ticket = Ticket(
            id_usuario=client_user.id_usuario, 
            asunto=ticket_data.asunto,
            descripcion=ticket_data.descripcion,
            prioridad=ticket_data.prioridad
        )
        db.add(nuevo_ticket)
        db.commit()
        db.refresh(nuevo_ticket)

        interaccion = Interaccion(
            id_ticket=nuevo_ticket.id_ticket,
            autor=RolUsuario.operador, 
            mensaje=f"Ticket creado por {operator_user.nombre} para {client_user.nombre}"
        )
        db.add(interaccion)
        db.commit()
        return {"mensaje": "Ticket creado", "id_ticket": nuevo_ticket.id_ticket}
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=500, detail="Error de base de datos")

@app.put("/api/tickets/{id}/estado")
def cambiar_estado_ticket(id: int, nuevo_estado: EstadoTicket, db: Session = Depends(get_db)):
    ticket = db.query(Ticket).filter(Ticket.id_ticket == id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket no encontrado")
    
    ticket.estado = nuevo_estado
    interaccion = Interaccion(id_ticket=id, autor=RolUsuario.operador, mensaje=f"Estado cambiado a {nuevo_estado}")
    db.add(interaccion)
    db.commit()
    return {"mensaje": "Estado actualizado"}

@app.get("/api/tickets/{id_ticket}/historial")
def historial_ticket(id_ticket: int, db: Session = Depends(get_db)):
    return db.query(Interaccion).filter(Interaccion.id_ticket == id_ticket).order_by(Interaccion.fecha_creacion).all()


# ======================================================
# ENDPOINT DE GESTIÓN DE USUARIOS (Agrégalo al final)
# ======================================================

@app.get("/api/usuarios")
def obtener_todos_los_usuarios(db: Session = Depends(get_db)):
    try:
        # Consultamos todos los usuarios de la tabla
        usuarios = db.query(Usuario).all()
        return usuarios
    except SQLAlchemyError:
        raise HTTPException(status_code=500, detail="Error al consultar la base de datos")