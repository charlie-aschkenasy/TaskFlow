# TaskFlow - Advanced Task Management Application

A modern, feature-rich task management application built with React, TypeScript, and Supabase. TaskFlow helps you organize your life with powerful task management features, real-time synchronization, and an intuitive user interface.

## 🌟 Features

### 📝 Task Management
- **Create Tasks**: Add tasks with rich descriptions, due dates, priorities, and more
- **Rich Text Editor**: Format task descriptions with bold, italic, lists, and links
- **Task Completion**: Click checkboxes to mark tasks complete - completed tasks automatically move to the bottom
- **Subtasks**: Break down complex tasks into manageable subtasks
- **Drag & Drop**: Reorder tasks with intuitive drag-and-drop functionality

### 🏷️ Organization & Categorization
- **Custom Lists**: Create personalized task lists with custom icons and colors
- **Projects**: Organize tasks by projects with color-coded badges
- **Tags**: Add multiple tags to tasks for flexible categorization
- **Time Frames**: Organize tasks by Daily, Weekly, Monthly, or Yearly goals
- **Priority Levels**: Set High, Medium, or Low priority for better task management

### 📅 Time Management
- **Due Dates**: Set specific due dates for tasks
- **Calendar View**: Visual calendar showing all tasks with due dates
- **Overdue Detection**: Automatically identifies and highlights overdue tasks
- **Recurring Tasks**: Set up tasks that repeat daily, weekly, monthly, or yearly
- **Custom Recurrence**: Configure complex recurring patterns with specific days

### 🔔 Reminders & Notifications
- **Multiple Reminder Types**: Set absolute time or relative reminders
- **Browser Notifications**: Get desktop notifications for task reminders
- **Custom Messages**: Add personalized reminder messages
- **Smart Scheduling**: Reminders relative to due dates (e.g., "30 minutes before")

### 📎 Attachments & Links
- **File Attachments**: Upload and attach files to tasks
- **Link Management**: Add web links with custom display names
- **File Preview**: View file types and sizes
- **Easy Access**: Quick download and open functionality

### 📊 Dashboard & Analytics
- **Overview Dashboard**: See all your tasks at a glance
- **Task Statistics**: Track total, completed, pending, and overdue tasks
- **Timeframe Breakdown**: Visual breakdown of tasks by time periods
- **Progress Tracking**: Monitor your productivity over time

### 🔍 Advanced Filtering & Sorting
- **Smart Search**: Search tasks by title, description, or tags
- **Multiple Filters**: Filter by time frame, project, status, priority, and tags
- **Flexible Sorting**: Sort by creation date, due date, priority, title, or project
- **Collapsible Filters**: Clean interface with expandable filter options

### 👥 User Management
- **Secure Authentication**: Email and password authentication via Supabase
- **User Accounts**: Personal task spaces with secure data isolation
- **Real-time Sync**: Changes sync instantly across all your devices

### 📱 Modern Interface
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Dark/Light Themes**: Clean, modern interface design
- **Intuitive Navigation**: Easy-to-use navigation between different views
- **Progressive Web App**: Install on your device for app-like experience

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Supabase account (for backend services)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd taskflow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Fill in your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:4321`

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL database, Authentication, Real-time)
- **Build Tool**: Vite
- **Drag & Drop**: react-beautiful-dnd
- **Rich Text**: ReactQuill
- **Icons**: Lucide React

### Database Schema
- **tasks**: Main tasks table with hierarchical support
- **task_lists**: Custom user lists
- **projects**: Project organization
- **Row Level Security**: Secure data isolation per user

### Key Components
- **App.tsx**: Main application shell and routing
- **Dashboard.tsx**: Overview and statistics
- **TaskList.tsx**: Main task management interface
- **TimeframeView.tsx**: Daily/Weekly/Monthly/Yearly views
- **CalendarView.tsx**: Calendar-based task visualization
- **TaskForm.tsx**: Comprehensive task creation/editing
- **TaskItem.tsx**: Individual task display and interaction

## 📖 How to Use

### Creating Your First Task
1. Click "Add new task" button
2. Enter a title (required)
3. Add description, due date, priority, and tags
4. Select a list and project
5. Set up reminders if needed
6. Click "Create Task"

### Managing Lists
1. Use the list selector dropdown
2. Click "Add New List" to create custom lists
3. Choose an icon and color for your list
4. Edit or delete lists using the action buttons

### Setting Up Recurring Tasks
1. When creating a task, check "Make this a recurring task"
2. Choose frequency (daily, weekly, monthly, yearly)
3. Set specific days for weekly/custom patterns
4. Optionally set an end date
5. The app will automatically create new instances

### Using the Calendar
1. Navigate to Calendar view
2. Click on any date to see tasks due that day
3. Use navigation arrows to browse months
4. Click "Today" to jump to current date

### Managing Reminders
1. In task form, go to Reminders section
2. Choose absolute time or relative to due date
3. Add custom reminder messages
4. Enable browser notifications for alerts

## 🔧 Configuration

### Notification Settings
- Enable browser notifications for reminder alerts
- Test notifications to ensure they're working
- Reminders check every minute for due alerts

### Customization
- Create custom lists with personalized icons and colors
- Set up projects for better organization
- Use tags for flexible categorization
- Adjust time frames based on your planning style

## 🚀 Deployment

The application is deployed on Bolt Hosting and can be accessed at:
**https://advanced-todo-list-a-y48n.bolt.host**

### Building for Production
```bash
npm run build
```

### Environment Setup
Ensure all environment variables are properly configured for production deployment.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues or have questions:
1. Check the browser console for error messages
2. Ensure your Supabase configuration is correct
3. Verify browser notification permissions are enabled
4. Try refreshing the page or clearing browser cache

## 🎯 Roadmap

Future enhancements planned:
- [ ] Team collaboration features
- [ ] Advanced analytics and reporting
- [ ] Mobile app versions
- [ ] Integration with external calendars
- [ ] Advanced automation rules
- [ ] Export/import functionality
- [ ] Offline support

---

**TaskFlow** - Organize your life, one task at a time. ✅