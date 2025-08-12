from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Form, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timedelta
from enum import Enum
import base64
import json

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI(title="Diário de Obra Digital", version="1.0.0")
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer()

# Enums
class UserRole(str, Enum):
    ENCARREGADO = "encarregado"
    ENGENHEIRO = "engenheiro"
    TECNICO_PLANEJAMENTO = "tecnico_planejamento"

class MaterialPriority(str, Enum):
    BAIXA = "baixa"
    MEDIA = "media"
    ALTA = "alta"
    URGENTE = "urgente"

class ServiceStatus(str, Enum):
    INICIADO = "iniciado"
    EM_ANDAMENTO = "em_andamento"
    CONCLUIDO = "concluido"
    PAUSADO = "pausado"

# Models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    role: UserRole
    obra_ids: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)

class UserCreate(BaseModel):
    name: str
    email: str
    role: UserRole
    obra_ids: List[str] = []

class Obra(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    location: str
    description: str
    start_date: datetime
    expected_end_date: datetime
    status: str = "ativa"
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ObraCreate(BaseModel):
    name: str
    location: str
    description: str
    start_date: datetime
    expected_end_date: datetime

class DiaryEntry(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    obra_id: str
    user_id: str
    user_name: str
    date: datetime
    weather: str
    temperature: str
    workers_count: int
    activities: str
    materials_used: str
    equipment_used: str
    incidents: str = ""
    observations: str = ""
    created_at: datetime = Field(default_factory=datetime.utcnow)

class DiaryEntryCreate(BaseModel):
    obra_id: str
    weather: str
    temperature: str
    workers_count: int
    activities: str
    materials_used: str
    equipment_used: str
    incidents: str = ""
    observations: str = ""

class PhotoUpload(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    obra_id: str
    user_id: str
    user_name: str
    title: str
    description: str
    image_data: str  # base64 encoded image
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    created_at: datetime = Field(default_factory=datetime.utcnow)

class PhotoUploadCreate(BaseModel):
    obra_id: str
    title: str
    description: str
    image_data: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class MaterialRequest(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    obra_id: str
    user_id: str
    user_name: str
    material_name: str
    quantity: float
    unit: str
    priority: MaterialPriority
    justification: str
    status: str = "pendente"
    requested_date: datetime = Field(default_factory=datetime.utcnow)
    needed_date: datetime
    created_at: datetime = Field(default_factory=datetime.utcnow)

class MaterialRequestCreate(BaseModel):
    obra_id: str
    material_name: str
    quantity: float
    unit: str
    priority: MaterialPriority
    justification: str
    needed_date: datetime

class ServiceMeasurement(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    obra_id: str
    user_id: str
    user_name: str
    service_name: str
    description: str
    quantity: float
    unit: str
    status: ServiceStatus
    start_date: datetime
    end_date: Optional[datetime] = None
    photos: List[str] = []  # Photo IDs
    signature_data: Optional[str] = None  # base64 encoded signature
    observations: str = ""
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ServiceMeasurementCreate(BaseModel):
    obra_id: str
    service_name: str
    description: str
    quantity: float
    unit: str
    status: ServiceStatus
    start_date: datetime
    end_date: Optional[datetime] = None
    signature_data: Optional[str] = None
    observations: str = ""

class Notification(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    obra_id: str
    user_id: str
    title: str
    message: str
    type: str  # "diary", "photo", "material_request", "service_measurement"
    is_read: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Authentication helper (simplified)
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    # Simplified auth - in production use proper JWT validation
    return "user_123"  # Mock user ID

# Helper function to create notification
async def create_notification(obra_id: str, user_id: str, title: str, message: str, type: str):
    notification = Notification(
        obra_id=obra_id,
        user_id=user_id,
        title=title,
        message=message,
        type=type
    )
    await db.notifications.insert_one(notification.dict())

# Routes - Root
@api_router.get("/")
async def root():
    return {"message": "Diário de Obra Digital API", "status": "running"}

# Routes - Users
@api_router.post("/users", response_model=User)
async def create_user(user: UserCreate):
    user_obj = User(**user.dict())
    await db.users.insert_one(user_obj.dict())
    return user_obj

@api_router.get("/users", response_model=List[User])
async def get_users():
    users = await db.users.find().to_list(1000)
    return [User(**user) for user in users]

@api_router.get("/users/{user_id}", response_model=User)
async def get_user(user_id: str):
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return User(**user)

# Routes - Obras
@api_router.post("/obras", response_model=Obra)
async def create_obra(obra: ObraCreate):
    obra_obj = Obra(**obra.dict())
    await db.obras.insert_one(obra_obj.dict())
    return obra_obj

@api_router.get("/obras", response_model=List[Obra])
async def get_obras():
    obras = await db.obras.find().to_list(1000)
    return [Obra(**obra) for obra in obras]

@api_router.get("/obras/{obra_id}", response_model=Obra)
async def get_obra(obra_id: str):
    obra = await db.obras.find_one({"id": obra_id})
    if not obra:
        raise HTTPException(status_code=404, detail="Obra not found")
    return Obra(**obra)

# Routes - Diary Entries
@api_router.post("/diary-entries", response_model=DiaryEntry)
async def create_diary_entry(entry: DiaryEntryCreate, current_user: str = Depends(get_current_user)):
    # Get user info (simplified)
    user = await db.users.find_one({"id": current_user}) or {"name": "Usuario Mock", "id": current_user}
    
    entry_dict = entry.dict()
    entry_dict["user_id"] = current_user
    entry_dict["user_name"] = user.get("name", "Usuario")
    entry_dict["date"] = datetime.utcnow()
    
    entry_obj = DiaryEntry(**entry_dict)
    await db.diary_entries.insert_one(entry_obj.dict())
    
    # Create notification
    await create_notification(
        entry.obra_id,
        current_user,
        "Novo Diário de Obra",
        f"Diário de obra registrado por {entry_obj.user_name}",
        "diary"
    )
    
    return entry_obj

@api_router.get("/diary-entries/obra/{obra_id}", response_model=List[DiaryEntry])
async def get_diary_entries_by_obra(obra_id: str):
    entries = await db.diary_entries.find({"obra_id": obra_id}).sort("created_at", -1).to_list(1000)
    return [DiaryEntry(**entry) for entry in entries]

# Routes - Photos
@api_router.post("/photos", response_model=PhotoUpload)
async def upload_photo(photo: PhotoUploadCreate, current_user: str = Depends(get_current_user)):
    user = await db.users.find_one({"id": current_user}) or {"name": "Usuario Mock", "id": current_user}
    
    photo_dict = photo.dict()
    photo_dict["user_id"] = current_user
    photo_dict["user_name"] = user.get("name", "Usuario")
    
    photo_obj = PhotoUpload(**photo_dict)
    await db.photos.insert_one(photo_obj.dict())
    
    # Create notification
    await create_notification(
        photo.obra_id,
        current_user,
        "Nova Foto Enviada",
        f"Foto '{photo.title}' enviada por {photo_obj.user_name}",
        "photo"
    )
    
    return photo_obj

@api_router.get("/photos/obra/{obra_id}", response_model=List[PhotoUpload])
async def get_photos_by_obra(obra_id: str):
    photos = await db.photos.find({"obra_id": obra_id}).sort("created_at", -1).to_list(1000)
    return [PhotoUpload(**photo) for photo in photos]

# Routes - Material Requests
@api_router.post("/material-requests", response_model=MaterialRequest)
async def create_material_request(request: MaterialRequestCreate, current_user: str = Depends(get_current_user)):
    user = await db.users.find_one({"id": current_user}) or {"name": "Usuario Mock", "id": current_user}
    
    request_dict = request.dict()
    request_dict["user_id"] = current_user
    request_dict["user_name"] = user.get("name", "Usuario")
    
    request_obj = MaterialRequest(**request_dict)
    await db.material_requests.insert_one(request_obj.dict())
    
    # Create notification
    await create_notification(
        request.obra_id,
        current_user,
        "Nova Solicitação de Material",
        f"Solicitação de {request.material_name} por {request_obj.user_name}",
        "material_request"
    )
    
    return request_obj

@api_router.get("/material-requests/obra/{obra_id}", response_model=List[MaterialRequest])
async def get_material_requests_by_obra(obra_id: str):
    requests = await db.material_requests.find({"obra_id": obra_id}).sort("created_at", -1).to_list(1000)
    return [MaterialRequest(**request) for request in requests]

@api_router.put("/material-requests/{request_id}/status")
async def update_material_request_status(request_id: str, status: str):
    await db.material_requests.update_one(
        {"id": request_id},
        {"$set": {"status": status}}
    )
    return {"message": "Status updated successfully"}

# Routes - Service Measurements
@api_router.post("/service-measurements", response_model=ServiceMeasurement)
async def create_service_measurement(measurement: ServiceMeasurementCreate, current_user: str = Depends(get_current_user)):
    user = await db.users.find_one({"id": current_user}) or {"name": "Usuario Mock", "id": current_user}
    
    measurement_dict = measurement.dict()
    measurement_dict["user_id"] = current_user
    measurement_dict["user_name"] = user.get("name", "Usuario")
    
    measurement_obj = ServiceMeasurement(**measurement_dict)
    await db.service_measurements.insert_one(measurement_obj.dict())
    
    # Create notification
    await create_notification(
        measurement.obra_id,
        current_user,
        "Nova Medição de Serviço",
        f"Medição de {measurement.service_name} por {measurement_obj.user_name}",
        "service_measurement"
    )
    
    return measurement_obj

@api_router.get("/service-measurements/obra/{obra_id}", response_model=List[ServiceMeasurement])
async def get_service_measurements_by_obra(obra_id: str):
    measurements = await db.service_measurements.find({"obra_id": obra_id}).sort("created_at", -1).to_list(1000)
    return [ServiceMeasurement(**measurement) for measurement in measurements]

# Routes - Notifications
@api_router.get("/notifications/obra/{obra_id}", response_model=List[Notification])
async def get_notifications_by_obra(obra_id: str):
    notifications = await db.notifications.find({"obra_id": obra_id}).sort("created_at", -1).to_list(100)
    return [Notification(**notification) for notification in notifications]

@api_router.put("/notifications/{notification_id}/read")
async def mark_notification_as_read(notification_id: str):
    await db.notifications.update_one(
        {"id": notification_id},
        {"$set": {"is_read": True}}
    )
    return {"message": "Notification marked as read"}

# Dashboard stats
@api_router.get("/dashboard/stats/{obra_id}")
async def get_dashboard_stats(obra_id: str):
    diary_count = await db.diary_entries.count_documents({"obra_id": obra_id})
    photo_count = await db.photos.count_documents({"obra_id": obra_id})
    material_requests_count = await db.material_requests.count_documents({"obra_id": obra_id})
    pending_requests = await db.material_requests.count_documents({"obra_id": obra_id, "status": "pendente"})
    service_measurements_count = await db.service_measurements.count_documents({"obra_id": obra_id})
    unread_notifications = await db.notifications.count_documents({"obra_id": obra_id, "is_read": False})
    
    return {
        "diary_entries": diary_count,
        "photos": photo_count,
        "material_requests": material_requests_count,
        "pending_requests": pending_requests,
        "service_measurements": service_measurements_count,
        "unread_notifications": unread_notifications
    }

# Initialize sample data
@api_router.post("/init-sample-data")
async def init_sample_data():
    # Clear existing data
    await db.users.delete_many({})
    await db.obras.delete_many({})
    await db.diary_entries.delete_many({})
    await db.photos.delete_many({})
    await db.material_requests.delete_many({})
    await db.service_measurements.delete_many({})
    await db.notifications.delete_many({})
    
    # Create sample obras
    obra1 = Obra(
        id="obra_001",
        name="Residencial Vista Verde",
        location="Bairro Jardim das Flores, São Paulo - SP",
        description="Construção de condomínio residencial com 120 apartamentos em 4 torres",
        start_date=datetime(2024, 1, 15),
        expected_end_date=datetime(2025, 6, 30)
    )
    
    obra2 = Obra(
        id="obra_002", 
        name="Centro Comercial Plaza",
        location="Av. Principal, 1500 - Rio de Janeiro - RJ",
        description="Centro comercial com 80 lojas e 3 pisos",
        start_date=datetime(2024, 3, 1),
        expected_end_date=datetime(2025, 12, 15)
    )
    
    await db.obras.insert_many([obra1.dict(), obra2.dict()])
    
    # Create sample users
    users = [
        User(id="user_001", name="João Silva", email="joao@rpg.com", role=UserRole.ENCARREGADO, obra_ids=["obra_001"]),
        User(id="user_002", name="Maria Santos", email="maria@rpg.com", role=UserRole.ENGENHEIRO, obra_ids=["obra_001", "obra_002"]),
        User(id="user_003", name="Carlos Oliveira", email="carlos@rpg.com", role=UserRole.TECNICO_PLANEJAMENTO, obra_ids=["obra_001", "obra_002"]),
        User(id="user_004", name="Ana Costa", email="ana@rpg.com", role=UserRole.ENCARREGADO, obra_ids=["obra_002"])
    ]
    
    await db.users.insert_many([user.dict() for user in users])
    
    # Create sample diary entries
    diary_entries = [
        DiaryEntry(
            obra_id="obra_001",
            user_id="user_001",
            user_name="João Silva",
            date=datetime.utcnow() - timedelta(days=1),
            weather="Ensolarado",
            temperature="28°C",
            workers_count=25,
            activities="Concretagem da laje do 3º andar da Torre A. Instalação de tubulações hidráulicas.",
            materials_used="Concreto: 15m³, Vergalhões: 2 toneladas, Tubos PVC: 200m",
            equipment_used="Betoneira, Guincho, Furadeira",
            incidents="",
            observations="Trabalho concluído dentro do prazo previsto."
        ),
        DiaryEntry(
            obra_id="obra_002",
            user_id="user_004",
            user_name="Ana Costa",
            date=datetime.utcnow(),
            weather="Parcialmente nublado",
            temperature="24°C", 
            workers_count=18,
            activities="Execução de alvenaria no 1º piso. Início da instalação elétrica.",
            materials_used="Tijolos: 2000 unidades, Cimento: 50 sacos, Fios elétricos: 500m",
            equipment_used="Furadeira, Martelete, Esquadro",
            incidents="Pequeno atraso devido à chuva matinal",
            observations="Necessário acelerar o ritmo para recuperar o cronograma."
        )
    ]
    
    await db.diary_entries.insert_many([entry.dict() for entry in diary_entries])
    
    # Create sample material requests
    material_requests = [
        MaterialRequest(
            obra_id="obra_001",
            user_id="user_001",
            user_name="João Silva",
            material_name="Cimento Portland",
            quantity=100.0,
            unit="sacos",
            priority=MaterialPriority.ALTA,
            justification="Necessário para concretagem da próxima laje",
            needed_date=datetime.utcnow() + timedelta(days=3)
        ),
        MaterialRequest(
            obra_id="obra_001",
            user_id="user_001",
            user_name="João Silva",
            material_name="Vergalhão 10mm",
            quantity=500.0,
            unit="metros",
            priority=MaterialPriority.MEDIA,
            justification="Armação da estrutura do 4º andar",
            needed_date=datetime.utcnow() + timedelta(days=7),
            status="aprovado"
        )
    ]
    
    await db.material_requests.insert_many([req.dict() for req in material_requests])
    
    return {"message": "Sample data initialized successfully"}

# Include router
app.include_router(api_router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()