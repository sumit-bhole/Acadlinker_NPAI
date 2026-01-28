from index import app, db
from app.models import User

with app.app_context():
    print("--- Fetching Users ---")
    users = User.query.all()
    
    for user in users:
        print("\n----------------")
        # This prints ALL columns and their values for this user
        data = vars(user)
        # Remove internal SQLAlchemy state for cleaner output
        data.pop('_sa_instance_state', None) 
        print(data)