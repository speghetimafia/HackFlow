# Hackathon Nexus

Hackathon Nexus is a platform that helps hackathon participants manage their projects, find ideas, build teams, and get mentorship. It brings everything you need for a hackathon into one place.

## Features

### AI Mentorship
- **Smart Advice**: Chat with an AI mentor (powered by Grok and Gemini) to get help with your project.
- **Real-time Chat**: Ask questions and get answers instantly to solve coding problems or brainstorm ideas.

### Idea Management
- **Generate Ideas**: Use AI to come up with new project ideas based on topics you like.
- **Save and Share**: Keep track of your ideas and share them with others to find teammates.

### Team Collaboration
- **Find Teammates**: Connect with other participants who are looking for a team.
- **Manage Team**: Accept or reject requests to join your team.
- **Notifications**: Get notified when someone wants to join your team or when your request is accepted.
- **Leave Team**: You can leave a team if you change your mind.

### Project Management
- **Tasks**: Create to-do lists and track what needs to be done.
- **Deadlines**: Keep track of important times, like submission deadlines.
- **Focus Timer**: Use a built-in timer to stay focused on your work.

### Resources
- **Library**: Find helpful resources for your hackathon track.
- **Dashboard**: See everything happening with your project in one view.

## Technology Used

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Google Sign-In
- **AI**: OpenRouter (Grok) and Google Gemini

## How to Start

### Prerequisites
You need to have Node.js installed on your computer.

### Installation Steps

1. **Download the code:**
   Clone this repository to your computer.

2. **Install libraries:**
   Run `npm install` in the project folder.

3. **Set up keys:**
   Create a `.env` file and add your database URL and API keys (Google, Gemini, OpenRouter).

4. **Setup Database:**
   Run `npx prisma db push` to set up the database.

5. **Run the app:**
   Run `npm run dev` to start the server.

6. **Open in browser:**
   Go to `http://localhost:3000` to see the app.

## User Test Cases

Here are the tests we use to make sure everything works correctly.

### 1. Login & Profile

| Test ID | Description | Steps | Result |
| :--- | :--- | :--- | :--- |
| **AUTH-01** | **Sign In** | Click "Sign in with Google" on the login page. | You are logged in and taken to the Dashboard. |
| **AUTH-02** | **Sign Out** | Click the "Sign Out" button in the sidebar or menu. | You are logged out and taken back to the home page. |
| **AUTH-03** | **Update Profile** | Go to Profile settings and change your details. | Your profile info is updated. |

### 2. Dashboard

| Test ID | Description | Steps | Result |
| :--- | :--- | :--- | :--- |
| **DASH-01** | **View Dashboard** | Go to the Dashboard page. | You see your ideas, tasks, and deadlines. |
| **DASH-02** | **Navigation** | Click links in the sidebar. | You go to the correct page. |

### 3. Ideas

| Test ID | Description | Steps | Result |
| :--- | :--- | :--- | :--- |
| **IDEA-01** | **Create Idea** | Click "New Idea" and fill in the form. | A new idea is created. |
| **IDEA-02** | **Generate Ideas** | Use the AI tool to generate ideas for a topic. | You get a list of idea suggestions. |
| **IDEA-03** | **Share Idea** | Click the "Share" button on an idea. | A link to the idea is copied. |

### 4. AI Mentor

| Test ID | Description | Steps | Result |
| :--- | :--- | :--- | :--- |
| **MENTOR-01** | **Chat** | Send a message to the AI mentor. | The AI replies with helpful advice. |
| **MENTOR-02** | **Context** | Ask a follow-up question. | The AI remembers what you just talked about. |

### 5. Teams

| Test ID | Description | Steps | Result |
| :--- | :--- | :--- | :--- |
| **TEAM-01** | **Join Request** | Click "Request to Join" on someone's idea. | A request is sent to the owner. |
| **TEAM-02** | **Accept Request** | Click "Accept" on a notification for a team request. | The person is added to the team. |
| **TEAM-03** | **Leave Team** | Click "Leave" in the team members list. | You are removed from the team. |

### 6. Tasks & Deadlines

| Test ID | Description | Steps | Result |
| :--- | :--- | :--- | :--- |
| **TASK-01** | **Add Task** | Create a new task in the task board. | The task appears on the board. |
| **DEAD-01** | **Add Deadline** | Add a new deadline. | It shows up in your list of deadlines. |
| **FOCUS-01** | **Focus Timer** | Start the focus timer. | The timer starts counting down. |

### 7. General UI

| Test ID | Description | Steps | Result |
| :--- | :--- | :--- | :--- |
| **UI-01** | **Mobile View** | Open the app on a phone. | The layout adjusts to fit the screen. |
| **UI-02** | **Dark Mode** | Toggle the theme switch. | The app switches between light and dark colors. |
