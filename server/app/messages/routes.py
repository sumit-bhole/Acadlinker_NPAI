import os
import secrets
from flask import Blueprint, jsonify, request, current_app, url_for
from flask_login import login_required, current_user
from app.models import User, Message
from app import db
from werkzeug.datastructures import FileStorage
import cloudinary.uploader # <-- Need this import

# Define the blueprint
messages_bp = Blueprint('messages', __name__)

# --- Utility: File Saving (Updated for Cloudinary) ---

def save_message_file(file: FileStorage) -> str:
    """
    Uploads file to Cloudinary if enabled,
    otherwise saves locally in /static/uploads.
    Returns the Cloudinary URL or the local filename.
    """
    
    # 1. Cloudinary Upload
    if current_app.config.get("UPLOAD_PROVIDER") == "cloudinary":
        # Check for file size or type limits before upload if needed
        
        upload_result = cloudinary.uploader.upload(
            file,
            folder="acadlinker/messages" # Use a dedicated folder for messages
        )
        return upload_result["secure_url"]  # Return Cloudinary URL

    # 2. Local Storage Fallback
    random_hex = secrets.token_hex(8)
    _, f_ext = os.path.splitext(file.filename)
    filename = random_hex + f_ext

    upload_folder = os.path.join(current_app.root_path, "static/uploads")
    os.makedirs(upload_folder, exist_ok=True)

    path = os.path.join(upload_folder, filename)
    file.save(path)

    return filename # Return filename only for local storage


# --- Utility: Message Serialization ---

def serialize_message(msg: Message):
    """Converts a Message object into a serializable dictionary."""
    file_url = None
    
    # Logic to generate file_url based on storage type (local vs. Cloudinary)
    if msg.file_name:
        # If Cloudinary URL (starts with http/https)
        if msg.file_name.startswith("http"):
            file_url = msg.file_name
        # If local filename
        else:
            file_url = url_for(
                "static",
                filename=f"uploads/{msg.file_name}",
                _external=False
            )

    return {
        'id': msg.id,
        'sender_id': msg.sender_id,
        'receiver_id': msg.receiver_id,
        'content': msg.content,
        'timestamp': msg.timestamp.isoformat(), 
        'file_url': file_url,
        # Add this helper field
        'is_sender': msg.sender_id == current_user.id 
    }


# --- API Endpoints ---

## 1. Get List of Friends (For Chat Sidebar)
@messages_bp.route('/friends', methods=['GET'])
@login_required
def get_friends():
    """
    Returns a list of the current user's friends.
    """
    friends = current_user.friends.all()
    friends_data = [{
    'id': friend.id,
    'username': getattr(friend, 'name', 'Unknown'), # Change 'username' to 'name' if that's what's in your model
    'profile_pic_url': getattr(friend, 'image_file', None) 
    } for friend in friends]

    return jsonify(friends_data), 200

## 2. Get Chat History
@messages_bp.route('/chat/<int:user_id>', methods=['GET'])
@login_required
def get_chat_history(user_id):
    """
    Returns the message history between the current user and the specified friend.
    """
    friend = User.query.get(user_id)
    if not friend:
        return jsonify({"error": "User not found"}), 404
        
    if not current_user.friends.filter_by(id=friend.id).first():
        return jsonify({"error": "You can only chat with your friends."}), 403 

    # Fetch messages
    msgs = Message.query.filter(
        ((Message.sender_id == current_user.id) & (Message.receiver_id == friend.id)) |
        ((Message.sender_id == friend.id) & (Message.receiver_id == current_user.id))
    ).order_by(Message.timestamp.asc()).all()

    messages_data = [serialize_message(msg) for msg in msgs]

    return jsonify({
    "friend": {
        "id": friend.id,
        "username": getattr(friend, 'name', 'Unknown'), # Fix this line
        "profile_pic_url": getattr(friend, 'image_file', None)
    },
    "messages": messages_data
    }), 200

## 3. Send New Message (POST) - Uses updated file saving
@messages_bp.route('/send/<int:user_id>', methods=['POST'])
@login_required
def send_message(user_id):
    """
    Handles sending a new message (text and/or file) to the specified friend.
    Accepts multipart/form-data.
    """
    friend = User.query.get(user_id)
    if not friend:
        return jsonify({"error": "User not found"}), 404
        
    if not current_user.friends.filter_by(id=friend.id).first():
        return jsonify({"error": "You can only chat with your friends."}), 403
    
    # Get data from request.form (for text content)
    content = request.form.get('content') 
    file_data = request.files.get('file') # From multipart form data

    if not content and not file_data:
        return jsonify({"error": "Message content or file is required."}), 400

    file_name_or_url = None
    if file_data and file_data.filename != '':
        # Simple file validation for messages (optional)
        allowed_extensions = {'png', 'jpg', 'jpeg', 'pdf', 'doc', 'docx'}
        if not ('.' in file_data.filename and file_data.filename.rsplit('.', 1)[1].lower() in allowed_extensions):
             return jsonify({"error": "Invalid file type. Allowed: png, jpg, jpeg, pdf, doc, docx."}), 400

        try:
            # Use the updated save function
            file_name_or_url = save_message_file(file_data)
        except Exception as e:
            return jsonify({"error": f"File upload failed: {str(e)}"}), 500
    
    # Create and save message
    msg = Message(
        sender_id=current_user.id,
        receiver_id=friend.id,
        content=content,
        file_name=file_name_or_url # This stores EITHER the Cloudinary URL or the local filename
    )
    db.session.add(msg)
    db.session.commit()
    
    # Return the new message using the updated serializer
    return jsonify(serialize_message(msg)), 201