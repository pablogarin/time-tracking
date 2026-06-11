import asyncio
import os
import psycopg2
from datetime import datetime
from psycopg2.extras import RealDictCursor
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager, contextmanager
from pydantic import BaseModel, Field
from typing import List, Optional

DB_HOST = "postgres"
DB_NAME = os.getenv("DB_NAME", "")
DB_PORT = os.getenv("DB_PORT", 5432)
DB_USER = os.getenv("DB_USER", "")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")

DB_PARAMS = {
    "host": DB_HOST,
    "port": int(DB_PORT),
    "user": DB_USER,
    "password": DB_PASSWORD,
    "database": DB_NAME,
}


class TimeEntry(BaseModel):
    id: Optional[int]
    start_time: int
    end_time: int
    is_current: bool


class Project(BaseModel):
    id: Optional[int] = Field(default=None)
    name: str
    status: Optional[str] = Field(default=None)
    time_entries: List[TimeEntry] = Field(default=[])


@contextmanager
def get_db_cursor():
    conn = psycopg2.connect(**DB_PARAMS, cursor_factory=RealDictCursor)
    cursor = conn.cursor()
    try:
        yield cursor
        conn.commit()
    except Exception as e:
        conn.rollback()
        print(f"{e}")
    finally:
        cursor.close()
        conn.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.lock = asyncio.Lock()
    yield


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["http://localhost:3001"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/projects")
async def create_projects(project: Project):
    result = None
    async with app.state.lock:
        with get_db_cursor() as cur:
            cur.execute(
                "INSERT INTO project(name, status) VALUES(%s, %s) RETURNING *;",
                (
                    project.name,
                    project.status,
                ),
            )
            result = cur.fetchone()
    return result


@app.get("/projects")
async def get_all_projects():
    rows = []
    async with app.state.lock:
        with get_db_cursor() as cur:
            cur.execute("SELECT * FROM project;")
            rows = cur.fetchall()
    return rows


@app.get("/projects/{id}")
async def get_project(id: int):
    row = None
    async with app.state.lock:
        with get_db_cursor() as cur:
            cur.execute("SELECT * FROM project WHERE id = %s;", (id,))
            row = cur.fetchone()
            if row is None:
                return None
            cur.execute(
                "SELECT id, start_time, end_time, is_current FROM time_entry WHERE project_id = %s",
                (id,),
            )
            time_entries = cur.fetchall()
            row["time_entries"] = time_entries
    return row


@app.get("/projects/{id}/entries")
async def get_entries_for_project(id: int):
    rows = None
    async with app.state.lock:
        with get_db_cursor() as cur:
            cur.execute(
                "SELECT id, start_time, end_time, is_current FROM time_entry WHERE project_id = %s",
                (id,),
            )
            rows = cur.fetchall()
    return rows


@app.post("/projects/{id}/entries")
async def create_entry_for_project(id: int):
    row = None
    async with app.state.lock:
        with get_db_cursor() as cur:
            cur.execute(
                "INSERT INTO time_entry(project_id, start_time) VALUES(%s, %s) RETURNING *",
                (id, datetime.now()),
            )
            row = cur.fetchone()
    return row


@app.put("/projects/{id}/entries/{entry_id}")
async def update_entry_for_project(id: int, entry_id: int):
    row = None
    async with app.state.lock:
        with get_db_cursor() as cur:
            cur.execute(
                "UPDATE time_entry SET end_time = %s, is_current = FALSE WHERE id = %s AND project_id = %s RETURNING *",
                (datetime.now(), entry_id, id),
            )
            row = cur.fetchone()
    return row


@app.get("/")
def home():
    return "Home"
