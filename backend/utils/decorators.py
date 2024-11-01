from functools import wraps
from flask_jwt_extended import get_jwt, get_jwt_identity
from utils.responses import response
from app.v1.models import User


def roles_required(required_roles=None):
    def wrapper(func):
        @wraps(func)
        def decorated_view(*args, **kwargs):
            current_user_role = get_jwt()["role"]["name"]
            if current_user_role not in required_roles:
                return response("You do not have the permission to perform this action", 403)
            return func(*args, **kwargs)

        return decorated_view

    return wrapper


def permission_required(required_permission=None):
    def wrapper(func):
        @wraps(func)
        def decorated_view(*args, **kwargs):
            user_permissions = User().get_permissions(get_jwt_identity())
            if required_permission not in user_permissions:
                return response("You do not have the permission to perform this action", 403)
            return func(*args, **kwargs)

        return decorated_view

    return wrapper
