def check_missing_fields(data, fields):
    return [field for field in fields if field not in data]
