from functools import wraps
from flask_jwt_extended import get_jwt_identity, get_jwt
from app.v1.models import User
from utils.responses import response

def verify_role( required_permission=None):
    def wrapper(func):
        @wraps(func)
        def decorated_view(*args, **kwargs):
            user = User()
            user_email = get_jwt_identity()
            role_name = get_jwt()["role"]["name"]
            user_has_role = user.has_role(user_email, role_name)
            if not user_has_role:
                return response("You do not have the required role to perform this action", 403)
            
            if required_permission:
                role_has_permission = user.has_permission(user_email, required_permission)
                if not role_has_permission:
                    return response("You do not have the required permission to perform this action", 403)

            # If all checks pass, proceed to the function
            return func(*args, **kwargs)
        
        return decorated_view
    return wrapper


    
