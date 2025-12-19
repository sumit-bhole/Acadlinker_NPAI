from app import db
from app.models import Notification

def notify(user_id, message, link="/"): # Pass user_id instead of user object for flexibility
    """
    Utility function to create a notification.
    """
    notif = Notification(
        user_id=user_id,
        message=message,
        link=link,
        is_read=False
    )
    db.session.add(notif)
    db.session.commit()
    return notif