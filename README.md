# BoardRoom-Management-System

## API

The Meetings Management System with QR Code Integration is a web-based application designed to simplify the process of scheduling and managing meetings. This system uses QR codes to make attendance tracking more efficient, allowing participants to check into meetings by scanning a QR code. It is ideal for organizations looking to modernize their meeting processes by utilizing a quick and easy way to verify attendance.

## Prerequisite Technologies

The following tools should be preinstalled in the target host

- [x] MySQL version 8.0.36
- [x] Python version 3.12.3
- [x] Pip version 24.1.2

## Installation

1. Clone the repository
2. Launch terminal and navigate to the root directory of the cloned folder
3. Create and activate a virtual environment
4. Navigate to `backend` folder

`$ cd backend`

5. Install project dependencies

`$ pip install -r requirements.txt`

#### Database Setup

Create the database `your-development-db` in the host machine

#### Configuring environment variables

1. Create an `.env` file in the `backend` directory
2. Add the following variables

```
MYSQL_HOST = "localhost"
MYSQL_USER = "root"
MYSQL_PASSWORD = "your-password"
MYSQL_DB = "your-development-db"
SECRET_KEY = "your-secret-key"
SERVER = "http://localhost:5173"
```
#### Running the application

`$ python3 run.py`

## v1 API Endpoints

| Method | Endpoint            | Functionality |
| ------ | ------------------------------- | ------------------------------------------- |
| `POST` | `/api/v1/auth/register` | Creates a new user |
| `POST` | `/api/v1/attendees` | Creates a new attendee |
| `GET` | `/api/v1/boardrooms` | Creates a new boardroom |
| `POST` | `/api/v1/meetings` | Creates a new meeting |
| `POST` | `/api/v1/organizations` | Creates a new organization |
| `GET` | `/api/v1/reports/excel/<int:id` | Regenerates reports in excel form |
| `GET` | `/api/v1/reports/pdf/<int:id` | Regenerates reports in pdf form |
| `POST` | `/api/v1/roles` | Creates a new role |


#### Server Requests and Responses

##### Sample user registration request body

```json
{
"first_name":"your_first_name",
"last_name":"your_last_name",
"organization":"your_organization",
"designation":"your_designation",
"email":"your_email",
"phone":"your_phone_number",
"password":"your_password"
}
```

##### Sample user registration success response body

```json
{
    "code": 201,
    "message": "User added successfully"
}
```

##### Sample same user registration response body
```json
{
    "code": 409,
    "message": "You're already registered!"
}
```
##### Sample attendee addition request body

```json
{
"first_name":"your_first_name",
"last_name":"your_last_name",
"organization":"your_organization",
"designation":"your_designation",
"email":"your_email",
"phone":"your_phone_number",
"meeting_id":"existing_meeting _id"
}
```

##### Sample attendee addition response body
```json
{
    "code": 201,
    "msg": "Attendee added successfully"
}
```
##### Sample same attendee addition response body
```json
{
    "code": 409,
    "msg": "You cannot register twice"
}
```

##### Sample boadroom creation request body

```json
{
"name":"boardroom_name", 
"capacity":"its_capacity", 
"location":"where_its_located", 
"description":"its_description",
}
```

##### Sample boardroom creation response body
```json
{
    "code": 201,
    "msg": "Boardroom created successfully"
}
```

##### Sample meeting creation request body

```json
{
     "title":"meeting_title",
     "description":"meeting_description",
     "start_time":"meeting_start_time",
     "end_time":"meeting_end_time",
     "organization_id":"meeting_organization_id",
     "location":"meeting_location",
     "meeting_date":"meeting_date",
     "boardroom_id":"meeting_boardroom_id"
}
```

##### Sample meeting creation response body
```json
{    
    "code": 201,
    "msg": "Meeting added successfully"
}
```
##### Sample organization creation request body

```json
{
"name":"name_of_organization",
"description":"its_description"
}
```

##### Sample organization creation response body
```json
{
    "code": 201,
    "msg": "organization created successfully"
}
```
##### Sample role creation request body

```json
{
"name":"name_of_role",
"description":"its_description"
}
```

##### Sample role creation response body
```json
{
    "code": 201,
    "msg": "Role created successfully"
}
```
##### Sample resource creation request body

```json
{
"name":"name_of_resource",
"description":"its_description",
"quantity":"required_quantity"
}
```

##### Sample resource creation response body
```json
{
  "code": 201,
  "msg": "Resource created successfully"
}
```
