# Notebook — Feature Documentation

## A Google Keep–style note-taking web app with real-time collaboration, sharing, and profile management. Built on the MERN stack (MongoDB, Express, React, Node.js) with Socket.io for live updates.

## Table of Contents

   - Authentication

   - Notes

   - Real-Time Collaboration

   - Sharing & Permissions

   - Invite Links

   - Trash & Restore

   - Tags

   - Search

   - User Profile

   - Notifications

   - Tech Stack

   - Project Structure

   - Environment Variables

   - Running Locally

## Authentication

   - Register with name, email, and password

   - Login with email and password

   - Logout clears the session

   - Passwords hashed with bcryptjs

   - JWT issued on login/register, stored in:

        an httpOnly cookie (secure)

        localStorage as a fallback for browsers that block cookies

  - Session persists across page reloads via GET /api/auth/me

   - Show/hide password toggle on all password fields

   - All note, share, and profile routes are protected behind auth

## Notes

   - Create notes with title, content, and a color

   - Edit notes inline with a modal editor

   - Delete notes (soft delete — see Trash & Restore)

   - Color labels — six preset colors selectable at creation or edit time

     Pin notes — pinned notes sort to the top of the list

   - Masonry grid layout (responsive columns, Keep-style)

   - Auto-save — the editor saves 1.5 s after you stop typing, with an inline "Saving…/Saved" indicator

   - Owner avatar displayed on each card (shows the note's author on shared notes)

## Powered by Socket.io. Every user joins a private room on connect, and note changes broadcast instantly to everyone with access.

   - Live note updates — when a collaborator edits and saves, other viewers see changes without refreshing

   - Instant share notifications — a shared note appears in the recipient's dashboard immediately

   - Live revoke — removing access closes the note in the other user's editor

   - Presence indicators — see who else is currently viewing the same note (avatars + "X is viewing")

   - Multi-tab sync — changes in one tab reflect in your other open tabs

   - Connection indicator — a dot in the navbar shows socket connection state (green = live, grey = reconnecting)

## Trash & Restore

   - Soft delete — deleting a note moves it to Trash instead of erasing it

   - Trash view in the sidebar shows all deleted notes

   - Restore a note to bring it back into your active list

   - Delete forever to permanently remove a note and all its shares

   - Trash is sorted by deletion time (newest first)

## Tags

   - Add custom tags to any note from the editor

   - Tags display as chips on the note card

   - Tag sidebar lists all your unique tags

   - Click a tag to filter notes by it

   - Click again or hit Clear to remove the filter

   - Tags auto-save with the note

## Search

   - Search bar in the navbar filters notes by title and content

   - Debounced server-side search for large note collections

   - Case-insensitive matching

   - Works across both owned and shared notes

   - Clear the input to return to the full list

## User Profile

   - Editable name and bio (up to 200 characters)

   - Avatar upload — drag, click, or pick from disk

        Supports PNG, JPG, WEBP, and GIF

        2 MB size limit

        Old avatar automatically deleted on replacement

   - Remove avatar to revert to the initial-letter fallback

   - Avatar appears in:

        the navbar

        the profile dropdown

        presence indicators in the note editor

        note cards (owner avatars)

   - Profile dropdown in the navbar with quick access to Edit profile and Sign out

   - ImageKit integration — avatars served from a global CDN for fast delivery

## Notifications

### Toast notifications (via react-hot-toast) for every meaningful action:

    ✅ Note created, deleted, restored, permanently deleted

    ✅ Pinned / unpinned

    ✅ Shared with a user

    ✅ Access revoked

    ✅ Invite link created / copied

    ✅ Profile saved

    ✅ Avatar uploaded / removed

    ✅ Login, registration, logout

    ✅ Invite accepted

    ⚠️ Errors — failed requests, expired sessions, validation issues

    🔔 Real-time events — "X shared a note with you", "Access removed"

## Tech Stack
- Backend
- Technology	Purpose
- Node.js	Runtime
- Express	Web framework
- MongoDB	Database
- Mongoose	ODM
- Socket.io	Real-time communication
- JWT	Authentication tokens
- bcryptjs	Password hashing
- Multer	File upload handling
- ImageKit	Cloud image storage & CDN
- cookie-parser	Cookie parsing
- CORS	Cross-origin config
- Frontend
- Technology	Purpose
- React 18	UI library
- Vite	Build tool
- React Router	Client-side routing
- Axios	HTTP client
- Tailwind CSS v4	Styling
- socket.io-client	Real-time client
- react-hot-toast	Toast notifications
- Project Structure
- text

## open this as "Text Editor" mode

notebook-app/
├── server/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js
│   │   │   ├── imagekit.js
│   │   │   └── upload.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   └── checkAccess.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Note.js
│   │   │   ├── Share.js
│   │   │   └── Invite.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── notes.js
│   │   │   ├── shares.js
│   │   │   └── users.js
│   │   ├── socket/
│   │   │   └── socket.js
│   │   ├── utils/
│   │   │   ├── generateToken.js
│   │   │   └── noteEvents.js
│   │   └── app.js
│   ├── server.js
│   └── .env
│
└── client/
    ├── src/
    │   ├── api/
    │   │   └── axios.js
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── Sidebar.jsx
    │   │   ├── CreateNote.jsx
    │   │   ├── NoteCard.jsx
    │   │   ├── NoteEditor.jsx
    │   │   ├── ShareModal.jsx
    │   │   └── PasswordInput.jsx
    │   ├── context/
    │   │   ├── AuthContext.jsx
    │   │   └── SocketContext.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Profile.jsx
    │   │   └── InviteAccept.jsx
    │   ├── utils/
    │   │   └── toast.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    └── .env

## Environment Variables
backend/.env

- PORT=3000
- MONGO_URI=mongodb://127.0.0.1:27017/notebook
- JWT_SECRET=your_long_random_secret
- JWT_EXPIRES_IN=7d
- CLIENT_URL=http://localhost:5173
- NODE_ENV=development

### ImageKit
- IMAGEKIT_PUBLIC_KEY=your_public_key
- IMAGEKIT_PRIVATE_KEY=your_private_key
- IMAGEKIT_URL=https://ik.imagekit.io/your_id

### frontend/.env

- VITE_API_URL=http://localhost:3000/api

### Running Locally Prerequisites

   - Node.js 18+

   - MongoDB (local or Atlas)

   - ImageKit account (optional, for avatar uploads)

## Setup
### bash

## Clone
- git clone https://github.com/zerocodin/notebook-frontend.git

- git clone https://github.com/zerocodin/notebook-backend.git
- cd notebook-app

## Backend
- cd backend
- npm install
# create .env with the variables above
npm run dev

## Frontend (in a new terminal)
- cd frontend
 -npm install
### create .env with VITE_API_URL
npm run dev

## Testing Real-Time Features

   - Register two accounts (one in a normal window, one in incognito)

   - Share a note from user A to user B via email

   - User B should see the note appear instantly in "Shared with me"

   - Both open the same note — each sees the other's avatar in the presence bar

   - User A edits and saves — User B sees the update without refreshing

## Known Limitations

   - No character-level co-editing — simultaneous edits use last-write-wins. True CRDT-based co-editing (Yjs) is not implemented.

   - Trash has no auto-cleanup — notes stay in Trash until manually deleted forever.

   - Profile broadcasts are global — fine for small apps, but should be scoped for scale.

   - Search uses regex, not the Mongo text index — fast enough for moderate datasets.

### License

Free to use for personal and educational projects.

Last updated: 2026

# If this is helpful to you, don't forget to give a star