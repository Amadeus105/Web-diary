from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import models
from ..auth_utils import get_db, get_current_user

router = APIRouter(prefix="/stats", tags=["stats"])


@router.get("/")
def get_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    items = db.query(models.Item).filter(
        models.Item.user_id == current_user.id,
        models.Item.status == "completed"
    ).all()

    total = len(items)
    by_type = {}
    all_ratings = []
    by_month = {}

    for item in items:
        t = item.type
        if t not in by_type:
            by_type[t] = {"count": 0, "total_rating": 0, "rated_count": 0}
        by_type[t]["count"] += 1
        if item.rating:
            by_type[t]["total_rating"] += item.rating
            by_type[t]["rated_count"] += 1
            all_ratings.append(item.rating)

        if item.finished_date:
            key = str(item.finished_date)[:7]
            by_month[key] = by_month.get(key, 0) + 1

    avg_rating = round(sum(all_ratings) / len(all_ratings), 2) if all_ratings else None

    type_stats = [
        {
            "type": t,
            "count": d["count"],
            "avg_rating": round(d["total_rating"] / d["rated_count"], 2) if d["rated_count"] else None,
        }
        for t, d in by_type.items()
    ]

    monthly = [{"month": k, "count": v} for k, v in sorted(by_month.items())]

    return {
        "total": total,
        "avg_rating": avg_rating,
        "by_type": type_stats,
        "by_month": monthly,
    }