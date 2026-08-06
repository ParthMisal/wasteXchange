"""Buyer requests, seller responses, and request chat."""
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.dependencies.auth import get_current_user
from app.models.material import Material
from app.models.message import Message
from app.models.request import Request, REQUEST_STATUSES
from app.models.user import User
from app.services.maps_service import distance_between

router = APIRouter(prefix="/api/requests", tags=["requests"])


class CreateRequestRequest(BaseModel):
    material_id: str
    quantity: Optional[float] = None
    note: Optional[str] = None


class StatusUpdateRequest(BaseModel):
    status: str


class SendMessageRequest(BaseModel):
    content: str


def _status_label(status: str) -> str:
    labels = {
        "pending": "Pending",
        "accepted": "Accepted",
        "in_transit": "In Transit",
        "completed": "Completed",
        "rejected": "Rejected",
    }
    return labels.get(status, status)


async def _request_response(req: Request, current_user: User) -> dict:
    material = await Material.get(req.material_id)
    seller = await User.get(req.seller_id)
    buyer = await User.get(req.buyer_id)
    other = seller if seller and str(seller.id) == str(current_user.id) else buyer

    seller_origin = (
        (seller.latitude, seller.longitude)
        if seller and seller.latitude is not None and seller.longitude is not None
        else None
    )
    buyer_origin = (
        (buyer.latitude, buyer.longitude)
        if buyer and buyer.latitude is not None and buyer.longitude is not None
        else None
    )
    distance = await distance_between(
        seller_origin,
        buyer_origin,
        origin_address=(seller.address or seller.location or "") if seller else "",
        destination_address=(buyer.address or buyer.location or "") if buyer else "",
    )

    return {
        "id": str(req.id),
        "material_id": req.material_id,
        "material": {
            "material_name": material.name if material else None,
            "name": material.name if material else None,
            "category": material.category if material else None,
            "quantity": material.quantity if material else None,
            "unit": material.unit if material else None,
            "price": material.price if material else None,
            "images": material.images if material else [],
            "location": material.location if material else None,
        },
        "quantity": req.quantity,
        "unit": req.unit,
        "price": req.price,
        "status": req.status,
        "status_label": _status_label(req.status),
        "note": req.note,
        "buyer_id": req.buyer_id,
        "seller_id": req.seller_id,
        "buyer": {
            "id": str(buyer.id) if buyer else req.buyer_id,
            "company_name": buyer.company_name if buyer else None,
            "email": buyer.email if buyer else None,
            "phone": buyer.phone if buyer else None,
            "location": buyer.address or buyer.location if buyer else None,
            "latitude": buyer.latitude if buyer else None,
            "longitude": buyer.longitude if buyer else None,
        },
        "seller": {
            "id": str(seller.id) if seller else req.seller_id,
            "company_name": seller.company_name if seller else None,
            "seller_name": seller.full_name if seller else None,
            "email": seller.email if seller else None,
            "phone": seller.phone if seller else None,
            "verified": bool(seller and seller.verified),
            "location": seller.address or seller.location if seller else None,
            "latitude": seller.latitude if seller else None,
            "longitude": seller.longitude if seller else None,
        },
        "counterparty": {
            "id": str(other.id) if other else None,
            "company_name": other.company_name if other else None,
            "email": other.email if other else None,
            "phone": other.phone if other else None,
            "location": other.address or other.location if other else None,
            "latitude": other.latitude if other else None,
            "longitude": other.longitude if other else None,
        },
        "distance_km": distance.get("distance_km"),
        "duration_min": distance.get("duration_min"),
        "created_at": req.created_at,
        "updated_at": req.updated_at,
    }


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_request(
    payload: CreateRequestRequest,
    current_user: User = Depends(get_current_user),
):
    """A buyer sends a request for a seller's material."""
    if current_user.role not in ("buyer",) and "buyer" not in current_user.roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only buyers can send requests",
        )

    material = await Material.get(payload.material_id)
    if not material:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Material not found")
    if material.status != "available":
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Material is no longer available")
    if material.seller_id == str(current_user.id):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "You cannot request your own material")

    duplicate = await Request.find_one(
        Request.material_id == payload.material_id,
        Request.buyer_id == str(current_user.id),
        Request.status == "pending",
    )
    if duplicate:
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            "You already have a pending request for this material",
        )

    req = Request(
        material_id=payload.material_id,
        buyer_id=str(current_user.id),
        seller_id=material.seller_id,
        quantity=payload.quantity or material.quantity,
        unit=material.unit,
        price=material.price,
        note=payload.note,
    )
    await req.insert()
    return await _request_response(req, current_user)


@router.get("")
async def list_requests(
    role: Optional[str] = None,
    current_user: User = Depends(get_current_user),
):
    """Requests where the current user is buyer (role=buyer) or seller (role=seller)."""
    user_id = str(current_user.id)
    if role == "seller" or (role is None and "seller" in current_user.roles and "buyer" not in current_user.roles):
        query = {"seller_id": user_id}
    elif role == "buyer" or (role is None and "buyer" in current_user.roles):
        query = {"buyer_id": user_id}
    else:
        query = {"seller_id": user_id}

    requests: list[Request] = []
    async for r in Request.find(query):
        requests.append(r)
    requests.sort(key=lambda r: r.created_at, reverse=True)

    return {"requests": [await _request_response(r, current_user) for r in requests]}


@router.get("/{request_id}")
async def get_request(request_id: str, current_user: User = Depends(get_current_user)):
    req = await Request.get(request_id)
    if not req:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Request not found")
    if req.buyer_id != str(current_user.id) and req.seller_id != str(current_user.id):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Not your request")
    return await _request_response(req, current_user)


@router.patch("/{request_id}/status")
async def update_request_status(
    request_id: str,
    payload: StatusUpdateRequest,
    current_user: User = Depends(get_current_user),
):
    """Seller advances the request status (pending → accepted → in_transit → completed)."""
    req = await Request.get(request_id)
    if not req:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Request not found")
    if req.seller_id != str(current_user.id):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Only the seller can update status")

    new_status = payload.status.lower()
    if new_status not in REQUEST_STATUSES:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid status")

    material = await Material.get(req.material_id)
    if new_status == "accepted" and material:
        material.status = "reserved"
        await material.save()
    elif new_status == "rejected" and material:
        material.status = "available"
        await material.save()
    elif new_status == "completed" and material:
        material.status = "sold"
        material.quantity = 0
        await material.save()
    elif new_status in ("pending",) and material:
        material.status = "available"
        await material.save()

    req.status = new_status
    req.updated_at = req.updated_at
    await req.save()

    await Message(
        request_id=request_id,
        sender_id=str(current_user.id),
        sender_name=current_user.company_name or current_user.full_name,
        content=f"Status updated to {_status_label(new_status)}",
    ).insert()

    return {"message": f"Request marked as {new_status}"}


@router.get("/{request_id}/messages")
async def list_messages(request_id: str, current_user: User = Depends(get_current_user)):
    req = await Request.get(request_id)
    if not req:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Request not found")
    if req.buyer_id != str(current_user.id) and req.seller_id != str(current_user.id):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Not your request")

    messages: list[Message] = []
    async for m in Message.find(Message.request_id == request_id):
        messages.append(m)
    messages.sort(key=lambda m: m.created_at)

    return {
        "messages": [
            {
                "id": str(m.id),
                "sender_id": m.sender_id,
                "sender_name": m.sender_name,
                "content": m.content,
                "sent": m.sender_id == str(current_user.id),
                "created_at": m.created_at,
            }
            for m in messages
        ]
    }


@router.post("/{request_id}/messages", status_code=status.HTTP_201_CREATED)
async def send_message(
    request_id: str,
    payload: SendMessageRequest,
    current_user: User = Depends(get_current_user),
):
    req = await Request.get(request_id)
    if not req:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Request not found")
    if req.buyer_id != str(current_user.id) and req.seller_id != str(current_user.id):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Not your request")

    content = payload.content.strip()
    if not content:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Message cannot be empty")

    message = Message(
        request_id=request_id,
        sender_id=str(current_user.id),
        sender_name=current_user.company_name or current_user.full_name,
        content=content,
    )
    await message.insert()
    return {
        "id": str(message.id),
        "sender_id": message.sender_id,
        "sender_name": message.sender_name,
        "content": message.content,
        "sent": True,
        "created_at": message.created_at,
    }
