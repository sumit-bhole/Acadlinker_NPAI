from flask import Blueprint, jsonify, request # Added request
from flask_login import login_required, current_user
from app import db
from app.models import Notification

notifications_bp = Blueprint('notifications', __name__, url_prefix='/api/notifications')

# 1. Get All Notifications
@notifications_bp.route('/', methods=['GET'])
@login_required
def get_notifications():
    notifications = (
        Notification.query.filter_by(user_id=current_user.id)
        .order_by(Notification.timestamp.desc())
        .all()
    )

    data = [
        {
            "id": n.id,
            "message": n.message,
            "link": n.link,
            "is_read": n.is_read,
            "timestamp": n.timestamp.isoformat(),
        }
        for n in notifications
    ]

    # Optimized: Mark all as read in one query instead of a loop
    Notification.query.filter_by(user_id=current_user.id, is_read=False).update({"is_read": True})
    db.session.commit()

    return jsonify(data), 200

# 2. Get Unread Count (For Navbar Badge)
@notifications_bp.route('/unread_count', methods=['GET'])
@login_required
def get_unread_count():
    count = Notification.query.filter_by(user_id=current_user.id, is_read=False).count()
    return jsonify({"unread_count": count}), 200

# 3. Mark Single as Read
@notifications_bp.route('/mark_read/<int:notification_id>', methods=['PATCH']) # Changed to PATCH (semantic)
@login_required
def mark_as_read(notification_id):
    notif = Notification.query.get_or_404(notification_id)
    if notif.user_id != current_user.id:
        return jsonify({"error": "Unauthorized"}), 403

    notif.is_read = True
    db.session.commit()
    return jsonify({"message": "Read"}), 200

# 4. Delete
@notifications_bp.route('/delete/<int:notification_id>', methods=['DELETE'])
@login_required
def delete_notification(notification_id):
    notif = Notification.query.get_or_404(notification_id)
    if notif.user_id != current_user.id:
        return jsonify({"error": "Unauthorized"}), 403

    db.session.delete(notif)
    db.session.commit()
    return jsonify({"message": "Deleted"}), 200