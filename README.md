# Ethar - Team Task Manager

A premium, full-stack Team Task Management application built with an Apple/Notion-inspired minimalist aesthetic. This application allows teams to organize projects, assign tasks, manage members, and track real-time progress using a sleek, graphite-themed dashboard.

## 🚀 Features

- **Apple/Notion Minimalist UI**: High-contrast, matte graphite surfaces, soft borders, and premium typography.
- **Secure Authentication**: JWT-based login and signup using either Email or Employee ID.
- **Role-Based Access Control**:
  - **Admins**: Can create/delete projects, manage members, assign tasks, and view full analytics.
  - **Members**: Can join projects via codes, view assigned tasks, and update task statuses.
- **Project Management**: Create workspaces, invite teammates, and securely manage access.
- **Task Workflow**: Assign tasks, set priorities, establish due dates, and track statuses (To Do, In Progress, In Review, Done).
- **Cascading Deletions**: Deleting a project automatically clears all related tasks. Removing a member deletes tasks assigned to them within that project.
- **Dedicated User Profiles**: View employee ID, designation, and roles globally.

---

## 🛠️ Technology Stack

- **Frontend**: React (Vite), Tailwind CSS, Lucide Icons, React Router
- **Backend**: Python, Flask, Flask-JWT-Extended
- **Database**: MongoDB (PyMongo)
- **Styling Architecture**: Custom Tailwind theme overrides prioritizing muted silvers and soft graphite backgrounds.

---

## 💻 Initialization & Setup Guide

This project is separated into a Python Backend and a React Frontend. You will need two terminal windows to run both simultaneously.

### 1. Database Setup
Ensure you have a MongoDB cluster ready. You will need your `MONGO_URI` connection string.

### 2. Backend Setup (Terminal 1)
Open a terminal in the root directory of the project:

```bash
# Navigate to the backend directory
cd backend

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# On Windows:
.\venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install the Python dependencies (You can also use the requirements.txt in the root folder)
pip install -r requirements.txt

# Create a .env file inside the /backend directory and add:
# MONGO_URI=your_mongodb_connection_string
# JWT_SECRET_KEY=your_secure_secret_key

# Start the Flask backend server
python run.py
```
*The backend should now be running on `http://localhost:5000`*

### 3. Frontend Setup (Terminal 2)
Open a new terminal in the root directory:

```bash
# Install Node modules
npm install

# Create a .env file in the root directory and add:
# VITE_API_BASE_URL=http://localhost:5000/api

# Start the Vite development server
npm run dev -- --port 3003
```
*The frontend should now be running on `http://localhost:3003`*

---

## 🔑 Pre-Existing Test Login Details

Use the following credentials to explore the application without needing to create new accounts. 
*(Note: You can use the Email or an Employee ID if one is assigned)*

### 👑 Admin Account
Use this account to create projects, generate join codes, manage team members, and oversee the dashboard.
- **Email**: `Roysinha@gmail.com`
- **Password**: `Roy123`

### 👤 Member Accounts
Use these accounts to join projects created by the Admin, view assigned tasks, and update progress.
- **Email**: `<Nameof member>@gmail.com`  *(e.g., john@gmail.com)*
- **Password**: `<Name of member>123`     *(e.g., John123)*

---

## 📂 Project Structure Highlights
- `/backend/app/routes/`: Contains all Flask API endpoints (Auth, Projects, Tasks, Dashboard).
- `/backend/app/services/`: Core business logic and database interactions.
- `/src/pages/`: Main React views (Dashboard, Login, Signup, Tasks, Profile).
- `/src/components/`: Reusable React UI components (ProjectCard, Sidebar, Navbar).
- `/tailwind.config.js`: Custom styling configuration for the minimal aesthetic.
