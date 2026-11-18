# Facility Reservation and Approval System

## Project Description

The **Facility Reservation and Approval System** is a web-based application designed to manage facility reservations, approval requests, and facility schedules. It allows users to request facility reservations while administrators manage facilities and approve or reject reservation requests.

The system uses HTML, CSS, JavaScript, and Supabase for authentication and database management.

## Features

- **User Registration and Login** – Users can create accounts and log in securely.
- **Dashboard** – Displays total facilities, total reservations, pending requests, and approved reservations.
- **Facility Management** – Administrators can add and manage facilities.
- **Reservation Management** – Requesters can submit and cancel reservation requests.
- **Reservation Approval** – Administrators can approve or reject pending reservations.
- **Facility Scheduling** – Administrators can schedule approved reservations.
- **Reservation Status Tracking** – Facility staff can update reservation statuses.
- **User Role Management** – Supports different user roles.
- **Audit Logs** – Provides an audit log section for system activities.

## User Roles

The system supports three user roles:

1. **Administrator**
   - Add new facilities.
   - View and manage reservations.
   - Approve or reject reservation requests.
   - Schedule approved reservations.
   - Access audit logs and user management.

2. **Requester**
   - View available facilities.
   - Submit reservation requests.
   - View personal reservations.
   - Cancel pending reservations.

3. **Facility Staff**
   - View reservations.
   - Start facility usage.
   - Mark reservations as completed.

## Technologies Used

- HTML5 – Webpage structure.
- CSS3 – Website design and layout.
- JavaScript – Application functionality.
- Supabase – Database and user authentication.
- Supabase JavaScript Client – Communication with Supabase.
- GitHub – Source code hosting and deployment.

## Project Structure

```text
Facility-Reservation-System/
│
├── index.html
├── style.css
├── app.js
└── README.md
```

## Installation and Setup

### 1. Download the Project

Download or clone the project repository from GitHub.

### 2. Open the Project

Open the project folder using Visual Studio Code.

### 3. Configure Supabase

1. Visit https://supabase.com/
2. Create a Supabase account.
3. Create a new project.
4. Copy your Supabase Project URL.
5. Copy your Supabase Publishable Key.
6. Open `app.js`.
7. Configure the Supabase credentials.

### 4. Set Up the Database

Create the necessary database tables in Supabase:

- `profiles`
- `facilities`
- `reservations`
- `audit_logs`

Ensure that the database columns and relationships match the application code.

### 5. Run the Application

1. Open the project in Visual Studio Code.
2. Install the Live Server extension.
3. Right-click `index.html`.
4. Select **Open with Live Server**.
5. The Facility Reservation System will open in your browser.

## Reservation Workflow

1. A user creates an account and logs in.
2. The requester selects an available facility.
3. The requester enters the purpose, start time, and end time.
4. The system saves the reservation with a Pending status.
5. The administrator reviews the request.
6. The administrator approves or rejects the reservation.
7. Approved reservations can be scheduled.
8. Facility staff update the reservation to In Use.
9. Facility staff mark the reservation as Completed.

## Reservation Status

| Status | Description |
|---|---|
| Pending | Waiting for administrator approval |
| Approved | Reservation request approved |
| Rejected | Reservation request rejected |
| Scheduled | Reservation scheduled |
| In Use | Facility is currently being used |
| Completed | Reservation is finished |
| Cancelled | Reservation has been cancelled |

## Security

The system uses Supabase Authentication for user login and registration.

Role-based interface permissions are implemented to control access to application features. For production deployment, configure appropriate Supabase Row Level Security (RLS) policies to enforce permissions at the database level.

## Project Information

**Project Title:** Facility Reservation and Approval System  
**Laboratory:** Laboratory 4  
**Section:** B  
**Project Type:** Web-Based Application

## Developers

Developed as an academic project for Laboratory 4 – Section B.

---

**Note:** Make sure that your Supabase database tables, relationships, and RLS policies are properly configured before using the application.