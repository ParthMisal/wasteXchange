"""Seed demo data: 2 users (seller + dual-role) and realistic material listings.

Usage (from backend/):
    .venv/Scripts/python.exe -m app.seed
"""
import asyncio
from datetime import datetime, timezone

from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient

from app.core.config import get_settings
from app.core.security import hash_password
from app.models.material import Material
from app.models.message import Message
from app.models.request import Request
from app.models.saved import SavedMaterial
from app.models.user import User

DEMO_MATERIALS = [
    # (name, category, subcategory, quantity, unit, price, purity, description, location, lat, lng)
    ("Recycled PET Flakes (Food Grade)", "Plastic", "PET", 2500, "kg", 48, "98% pure, food grade", "Washed, dried and graded. Ready for immediate pickup.", "Mumbai, Maharashtra", 19.0760, 72.8777),
    ("HDPE Regrind - Natural", "Plastic", "HDPE", 1200, "kg", 62, "Clean natural regrind", "Consistent 8mm regrind from bottle scrap.", "Pune, Maharashtra", 18.5204, 73.8567),
    ("LDPE Film Scrap - White", "Plastic", "LDPE", 800, "kg", 38, "White, printed-free", "Baled loose film, dry and compacted.", "Mumbai, Maharashtra", 19.0760, 72.8777),
    ("Copper Shavings - High Grade", "Metal", "Copper", 5, "tonnes", 620000, "99.5% copper", "Clean machining swarf, no oils, laboratory tested.", "Ahmedabad, Gujarat", 23.0225, 72.5714),
    ("Aluminium Scrap - Extrusion", "Metal", "Aluminium", 3, "tonnes", 175000, "6063 alloy", "Clean extrusion scrap, sorted and baled.", "Chennai, Tamil Nadu", 13.0827, 80.2707),
    ("MS Steel Offcuts", "Metal", "Steel", 12, "tonnes", 42500, "Mild steel", "Structural offcuts, 0.5-3m lengths, cut list available.", "Nagpur, Maharashtra", 21.1458, 79.0882),
    ("Zinc Ash (Die Casting)", "Metal", "Zinc", 2, "tonnes", 95000, "60% metallic zinc", "Byproduct of galvanising lines, bagged in 1T jumbo bags.", "Ludhiana, Punjab", 30.9010, 75.8573),
    ("Toluene Recovered Solvent", "Chemical", "Solvent", 1500, "litres", 90, "95% purity", "Recovered from printing process, drums and IBCs available.", "Surat, Gujarat", 21.1702, 72.8311),
    ("Textile Offcuts - Cotton", "Textile", "Cotton", 500, "kg", 28, "Pre-consumer", "Garment factory cuttings, sorted by colour.", "Tiruppur, Tamil Nadu", 11.1085, 77.3411),
    ("Jute Yarn Waste", "Textile", "Jute", 300, "kg", 35, "Clean fibre", "Spinning waste, excellent for recycling.", "Kolkata, West Bengal", 22.5726, 88.3639),
    ("Industrial Wood Pallets", "Wood", "Pallet", 50, "units", 300, "Reusable grade", "Heat-treated, stackable, some repair needed.", "Bengaluru, Karnataka", 12.9716, 77.5946),
    ("Sawdust - Kiln Dried", "Wood", "Sawdust", 4, "tonnes", 3500, "Dry, no bark", "Bulk in 25kg bags or loose load.", "Jaipur, Rajasthan", 26.9124, 75.7873),
    ("PCB Scrap (Populated)", "E-waste", "PCBs", 1, "tonnes", 210000, "Gold-bearing", "Computer motherboards, sorted.", "Delhi NCR", 28.6139, 77.2090),
    ("Copper Wire - Scrapped", "E-waste", "Wire", 700, "kg", 580, "Insulated copper", "Mixed gauge, insulated, from cable recycling.", "Hyderabad, Telangana", 17.3850, 78.4867),
    ("Cardboard Bales (OCC)", "Paper", "Corrugated", 8, "tonnes", 11000, "Dry, clean OCC", "Compressed bales, moisture < 8%.", "Indore, Madhya Pradesh", 22.7196, 75.8577),
    ("Glass Cullet - Clear", "Glass", "Cullet", 2, "tonnes", 6500, "Clear, colour-sorted", "Crushed, metal-free.", "Kochi, Kerala", 9.9312, 76.2673),
    ("Rubber Tyre Buffings", "Rubber", "Tyre", 1.5, "tonnes", 9500, "Clean rubber crumb", "Fine crumb from truck tyres.", "Chandigarh", 30.7333, 76.7794),
    ("Concrete Rubble (Crushed)", "Construction", "Aggregate", 20, "tonnes", 900, "20-40mm aggregate", "Crushed demolition concrete, suitable for fill.", "Bhopal, Madhya Pradesh", 23.2599, 77.4126),
]


async def main() -> None:
    settings = get_settings()
    client = AsyncIOMotorClient(settings.MONGO_URI)
    db = client[settings.MONGO_DB_NAME]
    await db.command("ping")

    await init_beanie(
        database=db,
        document_models=[User, Material, Request, Message, SavedMaterial],
    )

    if await User.find_one(User.email == "seller@ecosync.in"):
        print("Seed data already present - skipping.")
        return

    seller = User(
        full_name="Rajesh Kumar",
        company_name="EcoPlastics Recyclers",
        email="seller@ecosync.in",
        hashed_password=hash_password("password123"),
        role="seller",
        roles=["seller"],
        phone="+91 98200 12345",
        address="Mumbai, Maharashtra",
        location="Mumbai, Maharashtra",
        latitude=19.0760,
        longitude=72.8777,
        verified=True,
    )
    await seller.insert()

    dual = User(
        full_name="Priya Sharma",
        company_name="GreenCircle Industries",
        email="both@ecosync.in",
        hashed_password=hash_password("password123"),
        role="buyer",
        roles=["buyer", "seller"],
        phone="+91 98765 43210",
        address="Pune, Maharashtra",
        location="Pune, Maharashtra",
        latitude=18.5204,
        longitude=73.8567,
        verified=True,
    )
    await dual.insert()

    for name, category, subcategory, quantity, unit, price, purity, description, location, lat, lng in DEMO_MATERIALS:
        await Material(
            seller_id=str(seller.id),
            name=name,
            category=category,
            subcategory=subcategory,
            quantity=quantity,
            unit=unit,
            price=price,
            purity=purity,
            description=description,
            location=location,
            latitude=lat,
            longitude=lng,
            status="available",
        ).insert()

    print(f"Seeded {len(DEMO_MATERIALS)} materials and 2 users:")
    print("  seller@ecosync.in / password123  (Seller, Mumbai)")
    print("  both@ecosync.in  / password123  (Buyer + Seller, Pune)")
    client.close()


if __name__ == "__main__":
    asyncio.run(main())
