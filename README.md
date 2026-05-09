# 🎓 University Research and Development Services (URDS) System

A web-based system for managing university research proposals, evaluations, endorsements, and development services — built with PHP, MySQL, and vanilla JavaScript.

---

## 📋 Features

### 👤 Researcher / Proponent
- Submit research proposals via step-by-step wizard
- Track proposal status in real-time
- View and respond to revisions
- Manage ongoing and completed research
- Generate and print proposal documents

### 🏫 Dean
- Endorse research proposals from college faculty
- View proposals under their college

### 🔬 TWG (Technical Working Group)
- Evaluate submitted research proposals
- Submit TWG review and recommendations

### 📋 UREC (University Research Ethics Committee)
- Review and evaluate research proposals
- Submit UREC review decisions

### 🧑‍💼 Director
- Review in-house research proposals
- Monitor all proposals across departments

### 👨‍🔬 Evaluator
- View assigned proposals for evaluation
- Submit evaluations and view evaluation history

### 🔧 Admin
- Manage users, roles, and permissions
- Manage colleges and campuses
- View system logs and announcements
- Configure system settings
- Approve or reject pending user registrations

---

## ⚙️ Installation

### Requirements
- PHP 7.4 or higher
- MySQL 5.7 or higher
- Apache / XAMPP 
- Node.js 

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/alexuslax/urds.git
   ```

2. **Move to your server's root directory**
   ```
   XAMPP:   C:/xampp/htdocs/
   ```

3. **Import the database**
   - Open **phpMyAdmin**
   - Create a new database (e.g., `research_management`)
   - Import the provided SQL file

4. **Configure the database connection**
   - Open `backend/db.php`
   - Update with your credentials:
   ```php
   $host = 'localhost';
   $dbname = 'research_management';
   $username = 'root';
   $password = '';
   ```

5. **Run the system**
   - Open your browser and go to:
   ```
   http://localhost/urds/URDS/public/login.html
   ```

---

## 🔐 User Roles

| Role | Access Level |
|------|-------------|
| Admin | Full system control, user management, settings |
| Director | In-house review, proposal monitoring |
| Dean | College-level proposal endorsement |
| TWG Member | Technical evaluation of proposals |
| UREC Member | Ethics review of proposals |
| Evaluator | Assigned proposal evaluation |
| Researcher | Submit and track own proposals |

---

## 📄 Key Pages

| Page | Description |
|------|-------------|
| `login.html` | System entry point |
| `dashboard.html` | User dashboard |
| `submit_proposal_wizard.html` | Multi-step proposal submission |
| `proposal_list.html` | View all proposals |
| `status_tracking.html` | Real-time proposal status tracking |
| `twg_evaluation.html` | TWG evaluation form |
| `urec_review.html` | UREC review form |
| `dean_endorse.html` | Dean endorsement page |
| `admin-dashboard.html` | Admin control panel |

---

## 🛠️ Built With

- **PHP** — Backend API
- **MySQL** — Database
- **HTML / CSS / JavaScript** — Frontend
- **XAMPP** — Local development server

---

## 📄 License

This project is for educational purposes only.
