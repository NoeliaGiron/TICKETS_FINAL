from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = (
    "postgresql+psycopg2://"
    "rol_api.kcmmtuzwdfprxqqgvedk:"
    "api_segura@"
    "aws-0-us-west-2.pooler.supabase.com:6543/"
    "postgres"
)

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()
