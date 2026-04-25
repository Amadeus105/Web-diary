from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict
import json
from .. import models
from ..auth_utils import get_db, get_current_user, verify_token

router = APIRouter(prefix="/chat", tags=["chat"])


# ── In-memory connection manager ────────────────────────────
class ConnectionManager:
    def __init__(self):
        self.active: Dict[int, WebSocket] = {}  # user_id → websocket

    async def connect(self, user_id: int, ws: WebSocket):
        await ws.accept()
        self.active[user_id] = ws

    def disconnect(self, user_id: int):
        self.active.pop(user_id, None)

    async def send_to(self, user_id: int, data: dict):
        ws = self.active.get(user_id)
        if ws:
            try:
                await ws.send_text(json.dumps(data))
            except Exception:
                self.disconnect(user_id)


manager = ConnectionManager()


# ── WebSocket endpoint ───────────────────────────────────────
@router.websocket("/ws/{token}")
async def websocket_endpoint(websocket: WebSocket, token: str, db: Session = Depends(get_db)):
    # Authenticate via token in URL (headers not available in WS)
    user = verify_token(token, db)
    if not user:
        await websocket.close(code=4001)
        return

    await manager.connect(user.id, websocket)
    try:
        while True:
            raw = await websocket.receive_text()
            data = json.loads(raw)
            receiver_id = data.get("receiver_id")
            content = data.get("content", "").strip()

            if not receiver_id or not content:
                continue

            # Save message to DB
            msg = models.Message(
                sender_id=user.id,
                receiver_id=receiver_id,
                content=content,
            )
            db.add(msg)
            db.commit()
            db.refresh(msg)

            payload = {
                "id": msg.id,
                "sender_id": user.id,
                "sender_username": user.username,
                "receiver_id": receiver_id,
                "content": content,
                "created_at": msg.created_at.isoformat(),
                "is_read": False,
            }

            # Send to receiver if online
            await manager.send_to(receiver_id, payload)
            # Echo back to sender
            await manager.send_to(user.id, payload)

    except WebSocketDisconnect:
        manager.disconnect(user.id)


# ── REST: message history between two users ──────────────────
@router.get("/history/{other_user_id}")
def get_history(
    other_user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    messages = (
        db.query(models.Message)
        .filter(
            (
                (models.Message.sender_id == current_user.id) &
                (models.Message.receiver_id == other_user_id)
            ) | (
                (models.Message.sender_id == other_user_id) &
                (models.Message.receiver_id == current_user.id)
            )
        )
        .order_by(models.Message.created_at.asc())
        .limit(100)
        .all()
    )
    # Mark unread as read
    for m in messages:
        if m.receiver_id == current_user.id and not m.is_read:
            m.is_read = True
    db.commit()

    return [
        {
            "id": m.id,
            "sender_id": m.sender_id,
            "sender_username": m.sender.username,
            "receiver_id": m.receiver_id,
            "content": m.content,
            "is_read": m.is_read,
            "created_at": m.created_at.isoformat(),
        }
        for m in messages
    ]


# ── REST: unread count ───────────────────────────────────────
@router.get("/unread")
def unread_count(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    count = db.query(models.Message).filter(
        models.Message.receiver_id == current_user.id,
        models.Message.is_read == False
    ).count()
    return {"unread": count}


# ── REST: list conversations ─────────────────────────────────
@router.get("/conversations")
def list_conversations(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Return the last message per conversation partner."""
    from sqlalchemy import func, or_, and_

    # Get all message partners
    sent = db.query(models.Message.receiver_id.label("partner_id")).filter(
        models.Message.sender_id == current_user.id
    )
    received = db.query(models.Message.sender_id.label("partner_id")).filter(
        models.Message.receiver_id == current_user.id
    )
    partner_ids = {r.partner_id for r in sent.union(received).all()}

    result = []
    for pid in partner_ids:
        last_msg = (
            db.query(models.Message)
            .filter(
                or_(
                    and_(models.Message.sender_id == current_user.id,
                         models.Message.receiver_id == pid),
                    and_(models.Message.sender_id == pid,
                         models.Message.receiver_id == current_user.id),
                )
            )
            .order_by(models.Message.created_at.desc())
            .first()
        )
        unread = db.query(models.Message).filter(
            models.Message.sender_id == pid,
            models.Message.receiver_id == current_user.id,
            models.Message.is_read == False
        ).count()

        partner = db.query(models.User).get(pid)
        if not partner:
            continue
        result.append({
            "partner_id": pid,
            "partner_username": partner.username,
            "partner_avatar": partner.profile.avatar_url if partner.profile else None,
            "last_message": last_msg.content if last_msg else "",
            "last_time": last_msg.created_at.isoformat() if last_msg else None,
            "unread": unread,
        })

    result.sort(key=lambda x: x["last_time"] or "", reverse=True)
    return result