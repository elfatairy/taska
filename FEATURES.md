# Taska - Feature Specification

## Project Overview
Taska is a closed company system for managing products, teams, sprints, and tasks with integrated time tracking. Access is controlled by the CTO, with role-based permissions for different user types.

---

## 1. System-Wide Foundations

These features form the skeleton of the application.

### 1.1 Authentication (Admin-Created)
- **No Public Sign-up**: This is a closed company system
- **Login**: Users log in with credentials provided by the CTO
- **Password Reset**: Simple mechanism for users to reset their passwords

### 1.2 Role-Based Navigation (Dynamic Sidebar)
- Sidebar menu changes based on logged-in user's role
- **Examples**:
  - **Developer** sees: "My Tasks", "Board", "Time Logs"
  - **Team Lead** sees: "Team Board", "Task Management", "Sprint Overview"
  - **Product Manager** sees: "Products", "Teams", "Sprint Planning"
  - **CTO** sees: "Manage Users", "Products", "System Overview"

---

## 2. CTO Module (Organization Management)

The CTO sets the organizational foundation. Without this data, no work can happen.

### 2.1 User Management (CRUD)
- **Create User**:
  - Form fields: Name, Email, Default Password
  - Role Selection (Dropdown): Product Manager, Team Lead, Developer
- **Edit User**:
  - Change role (e.g., promote Developer to Team Lead)
  - Update user details (name, email)
- **Deactivate User**:
  - "Soft delete" functionality
  - Historical data (time logs) remains intact
  - User cannot log in after deactivation

### 2.2 Product Architecture
- **Create Product**:
  - Input: Name (e.g., "Mobile App v2")
  - Input: Description
  - Assign PM: Select one Product Manager from existing users to own this product

---

## 3. Product Manager Module (Planning)

The PM bridges the gap between the Product and the Teams.

### 3.1 Team Assembly
- **Create Team**:
  - Name the team (e.g., "Backend Alpha")
  - Assign Leadership: Select one Team Lead
  - Add Members: Multi-select Developers to add to team

### 3.2 Sprint Planning
- **Create Sprint**:
  - Input: Sprint Name
  - Input: Start Date, End Date
  - Input: Goal/Description
  - Assign Team: Link a specific Team to this Sprint
  - Auto-filter: Only Developers from assigned Team can work on Sprint tasks

---

## 4. Team Lead Module (Execution)

The Team Lead translates Sprint goals into actionable items.

### 4.1 Task Creation
- **Create Task** within a specific Sprint
- **Details**:
  - Title
  - Description
  - Priority (High/Medium/Low)
- **Assignment**: Dropdown to assign specific Developer (filtered to show only developers in current Team)

### 4.2 Board Management
- **Move Tasks**: Ability to move tasks between columns
  - Columns: Backlog → To Do → In Progress → Code Review → Done
  - Used when developer gets stuck or needs assistance
- **Dispute/Blocker Flag**:
  - Toggle on task to mark as "Blocked"
  - Highlights task in red on the board

---

## 5. Developer Module (Work & Time)

Day-to-day work happens here.

### 5.1 My Kanban Board
- **Drag-and-Drop** board displaying tasks assigned to current user (or their team)
- **Columns**: To Do, In Progress, Done
- **Card Information**: Task title, description, priority, total time logged

### 5.2 The "Stopwatch" Time Tracker
- **Start Button**:
  - Visible only on tasks in "To Do" or "In Progress"
  - Records `start_timestamp`
  - Optionally moves card to "In Progress"
- **Stop Button**:
  - Visible only when timer is running
  - Captures `end_timestamp`
  - Calculates duration (End - Start)
  - Saves Time Log entry in database
- **Visual Indicator**:
  - Pulsing "Recording..." icon on active task
  - Prevents developer from forgetting running timer
- **Total Time Display**:
  - Task card shows sum of all Time Log entries
  - Format: "Total: 4h 30m"

---

## 6. Visualization & Communication

### 6.1 Calendar View
- **Sprint Timeline**: Displays colored blocks representing Sprint durations
- **Overlap Detection**: Allows PMs and CTOs to see overlaps or gaps between sprints
- **Team Color Coding**: Different colors for different teams

### 6.2 Basic Notification Panel
- **Simple Alert List** showing recent notifications
- **Notification Logic**:
  - Team Lead creates task → Notify Assigned Developer
  - Developer moves task to "Done" → Notify Team Lead
  - Developer marks task as "Blocked" → Notify Team Lead
  - PM creates Sprint → Notify assigned Team Lead

---

## Role Permissions Summary

| Feature | CTO | Product Manager | Team Lead | Developer |
|---------|-----|----------------|-----------|-----------|
| User Management | ✓ | - | - | - |
| Product Management | ✓ | ✓ | - | - |
| Team Assembly | - | ✓ | - | - |
| Sprint Planning | - | ✓ | - | - |
| Task Creation | - | - | ✓ | - |
| Board Management | - | ✓ | ✓ | - |
| Task Assignment | - | - | ✓ | - |
| Time Tracking | - | - | ✓ | ✓ |
| My Tasks View | - | - | ✓ | ✓ |
| Calendar View | ✓ | ✓ | ✓ | ✓ |
| Notifications | ✓ | ✓ | ✓ | ✓ |

---

## Technical Notes

### Database Entities (High-Level)
- **Users**: id, name, email, password_hash, role, is_active
- **Products**: id, name, description, pm_id
- **Teams**: id, name, team_lead_id, product_id
- **Team_Members**: team_id, user_id
- **Sprints**: id, name, start_date, end_date, goal, team_id
- **Tasks**: id, title, description, priority, status, sprint_id, assigned_to, is_blocked
- **Time_Logs**: id, task_id, user_id, start_timestamp, end_timestamp, duration
- **Notifications**: id, user_id, message, type, is_read, created_at

### Time Log Calculation
- Duration stored in minutes
- Display formatted as "Xh Ym"
- Aggregate by task, user, sprint, or team for reporting

