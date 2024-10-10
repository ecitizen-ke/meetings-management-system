from flask import jsonify


def response(message, code):
    """Standard response"""
    return jsonify({"message": message, "code": code}), code


def response_with_data(message, data, code):
    """response with data"""
    return jsonify({"message": message, "data": data, "code": code}), code
