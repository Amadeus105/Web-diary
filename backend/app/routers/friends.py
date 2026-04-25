from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas
from ..auth_utils import get_db, get_current_user

router = APIRouter(prefix="/friends", tags=["friends"])


def _enrich(f: models.Friendship, current_user_id: int) -> dict:
    """Add username/avatar of the OTHER person in the friendship."""
    other = f.addressee if f.requester_id == current_user_id else f.requester
    profile = other.profile
    return {
        "id": f.id,
        "requester_id": f.requester_id,
        "addressee_id": f.addressee_id,
        "status": f.status,
        "created_at": f.created_at,
        "username": other.username,
        "avatar_url": profile.avatar_url if profile else None,
    }


# ── Search users by username ─────────────────────────────────
@router.get("/search")
def search_users(
    q: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    users = (
        db.query(models.User)
        .filter(
            models.User.username.ilike(f"%{q}%"),
            models.User.id != current_user.id
        )
        .limit(10)
        .all()
    )
    result = []
    for u in users:
        # Check existing friendship status
        friendship = db.query(models.Friendship).filter(
            (
                (models.Friendship.requester_id == current_user.id) &
                (models.Friendship.addressee_id == u.id)
            ) | (
                (models.Friendship.requester_id == u.id) &
                (models.Friendship.addressee_id == current_user.id)
            )
        ).first()
        result.append({
            "id": u.id,
            "username": u.username,
            "avatar_url": u.profile.avatar_url if u.profile else None,
            "friendship_status": friendship.status if friendship else None,
            "friendship_requester": friendship.requester_id if friendship else None,
        })
    return result


# ── Send friend request ──────────────────────────────────────
@router.post("/request/{username}")
def send_request(
    username: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    target = db.query(models.User).filter(models.User.username == username).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    if target.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot add yourself")

    existing = db.query(models.Friendship).filter(
        (
            (models.Friendship.requester_id == current_user.id) &
            (models.Friendship.addressee_id == target.id)
        ) | (
            (models.Friendship.requester_id == target.id) &
            (models.Friendship.addressee_id == current_user.id)
        )
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Request already exists")

    f = models.Friendship(requester_id=current_user.id, addressee_id=target.id, status="pending")
    db.add(f)
    db.commit()
    return {"message": f"Friend request sent to {username}"}


# ── Accept request ───────────────────────────────────────────
@router.post("/accept/{friendship_id}")
def accept_request(
    friendship_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    f = db.query(models.Friendship).filter(
        models.Friendship.id == friendship_id,
        models.Friendship.addressee_id == current_user.id,
        models.Friendship.status == "pending"
    ).first()
    if not f:
        raise HTTPException(status_code=404, detail="Request not found")
    f.status = "accepted"
    db.commit()
    return {"message": "Friend request accepted"}


# ── Decline / remove ─────────────────────────────────────────
@router.delete("/{friendship_id}")
def remove_friend(
    friendship_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    f = db.query(models.Friendship).filter(
        models.Friendship.id == friendship_id,
        (models.Friendship.requester_id == current_user.id) |
        (models.Friendship.addressee_id == current_user.id)
    ).first()
    if not f:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(f)
    db.commit()
    return {"message": "Removed"}


# ── List accepted friends ────────────────────────────────────
@router.get("/")
def list_friends(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    friends = db.query(models.Friendship).filter(
        (
            (models.Friendship.requester_id == current_user.id) |
            (models.Friendship.addressee_id == current_user.id)
        ),
        models.Friendship.status == "accepted"
    ).all()
    return [_enrich(f, current_user.id) for f in friends]


# ── Incoming pending requests ────────────────────────────────
@router.get("/requests")
def list_requests(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    pending = db.query(models.Friendship).filter(
        models.Friendship.addressee_id == current_user.id,
        models.Friendship.status == "pending"
    ).all()
    return [_enrich(f, current_user.id) for f in pending]


@router.get("/user/{user_id}")
def get_user_by_id(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get basic public info about a user by id (for chat partner info)."""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    profile = db.query(models.UserProfile).filter(
        models.UserProfile.user_id == user_id
    ).first()
    return {
        "id": user.id,
        "username": user.username,
        "avatar_url": profile.avatar_url if profile else None,
    }

# ── Activity feed from friends ───────────────────────────────
@router.get("/feed")
def friends_feed(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Get accepted friend IDs
    friendships = db.query(models.Friendship).filter(
        (
            (models.Friendship.requester_id == current_user.id) |
            (models.Friendship.addressee_id == current_user.id)
        ),
        models.Friendship.status == "accepted"
    ).all()
    friend_ids = []
    for f in friendships:
        other_id = f.addressee_id if f.requester_id == current_user.id else f.requester_id
        friend_ids.append(other_id)

    if not friend_ids:
        return []

    activities = (
        db.query(models.ActivityFeed)
        .filter(models.ActivityFeed.user_id.in_(friend_ids))
        .order_by(models.ActivityFeed.created_at.desc())
        .limit(50)
        .all()
    )

    result = []
    for a in activities:
        profile = a.owner.profile
        result.append({
            "id": a.id,
            "user_id": a.user_id,
            "username": a.owner.username,
            "avatar_url": profile.avatar_url if profile else None,
            "action_type": a.action_type,
            "item_name": a.item_name,
            "item_type": a.item_type,
            "item_cover": a.item_cover,
            "rating": a.rating,
            "created_at": a.created_at,
        })
    return result


# ── Public profile ───────────────────────────────────────────
@router.get("/profile/{username}")
def public_profile(
    username: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Check friendship for private accounts
    is_friend = False
    if user.id != current_user.id:
        f = db.query(models.Friendship).filter(
            (
                (models.Friendship.requester_id == current_user.id) &
                (models.Friendship.addressee_id == user.id)
            ) | (
                (models.Friendship.requester_id == user.id) &
                (models.Friendship.addressee_id == current_user.id)
            ),
            models.Friendship.status == "accepted"
        ).first()
        is_friend = f is not None

    profile = user.profile
    items = None
    if not user.is_private or is_friend or user.id == current_user.id:
        items = db.query(models.Item).filter(
            models.Item.user_id == user.id,
            models.Item.status == "completed"
        ).order_by(models.Item.id.desc()).all()

    return {
        "user_id": user.id,
        "username": user.username,
        "is_private": user.is_private,
        "is_friend": is_friend,
        "name": profile.name if profile else None,
        "avatar_url": profile.avatar_url if profile else None,
        "title": profile.title if profile else None,
        "handle": profile.handle if profile else None,
        "items": [
            {
                "id": i.id, "name": i.name, "type": i.type,
                "cover_url": i.cover_url, "rating": i.rating,
                "finished_date": str(i.finished_date) if i.finished_date else None,
            }
            for i in (items or [])
        ],
    }