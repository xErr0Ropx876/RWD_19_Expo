# Admin Panel - User Role Management

## 🎯 Features Added

### Discord-Inspired Member List View
- **Member View**: Discord-style grouped member list with role categories
- **Table View**: Traditional table view with inline role dropdowns
- **Toggle Switch**: Easily switch between views

### Role Assignment Modal
- Click on any user's name in Member View to open a beautiful role assignment modal
- Visual role selection with icons and descriptions
- Three roles available:
  - **Student** (user): Basic access to resources and community
  - **Tech Team** (tech): Can upload resources and moderate content
  - **Administrator** (admin): Full access including user management

### Features
- Search users by name or email
- Real-time role statistics in dashboard cards
- Grouped by role in Member View (Administrators, Tech Team, Students)
- Visual indicators for current user (prevents self-modification)
- Instant role updates with loading states
- Refresh button to sync latest data

## 🔐 Test Credentials

All accounts use the password: **`password123`**

### Admin Account
- **Email**: admin@university.edu
- **Password**: password123
- **Role**: Administrator
- **Access**: Full admin panel access

### Tech Team Account
- **Email**: tech@university.edu
- **Password**: password123
- **Role**: Tech Team
- **Access**: Can upload resources

### Student Accounts

1. **Sarah Chen**
   - Email: sarah@university.edu
   - Password: password123
   - Role: Student

2. **Michael Park**
   - Email: michael@university.edu
   - Password: password123
   - Role: Student

3. **Emily Rodriguez**
   - Email: emily@university.edu
   - Password: password123
   - Role: Student

## 📍 How to Access

1. **Login**: Navigate to http://localhost:3000/login
2. **Use Admin Credentials**: admin@university.edu / password123
3. **Access Admin Panel**: You'll be redirected to the dashboard, then navigate to the admin panel
4. **Manage Roles**: 
   - Switch to "Member View" for Discord-style interface
   - Click any user's name to open the role assignment modal
   - Select the new role and click "Save Changes"

## 🎨 UI Highlights

- **Color-coded roles**:
  - 🔴 Administrators: Red theme
  - 🔵 Tech Team: Blue theme
  - ⚫ Students: Gray theme
  
- **Interactive elements**:
  - Avatar circles with first letter
  - Hover effects on clickable items
  - Smooth transitions and animations
  - Modal with gradient header

## 🚀 Quick Start

```bash
# If you need to reset the database and seed again:
npx tsx scripts/seed.ts

# Start the development server:
npm run dev
```

Visit http://localhost:3000 and login as admin to start managing user roles!
