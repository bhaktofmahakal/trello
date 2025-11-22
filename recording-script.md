# Trello Clone Demo Recording Script

## Duration: 2-5 minutes
## Structure: Continuous narration while demonstrating features

---

## Introduction (0:00 - 0:30)
**Show:** Open browser to https://trello-dd3qux4zf-utsavs-projects-5c4e1539.vercel.app

**Say:** "Hello! I'm demonstrating my Trello clone project with a smart AI recommendations engine. This is a full-featured task board application built with Next.js, React, TypeScript, Tailwind CSS, and PostgreSQL. Let me walk you through the architecture, features, and the innovative recommendation system."

---

## Architecture Explanation (0:30 - 1:00)
**Show:** Briefly show the project structure in VS Code or GitHub repo

**Say:** "The architecture uses Next.js 14 with App Router for server-side rendering and API routes. Frontend is React with TypeScript for type safety, styled with Tailwind CSS. Backend is handled through Next.js API routes with Prisma ORM connecting to PostgreSQL database hosted on Neon. Authentication uses JWT with httpOnly cookies for security. The app is deployed on Vercel for seamless CI/CD."

---

## Authentication Demo (1:00 - 1:30)
**Show:** Register a new account, then login

**Say:** "Let's start with authentication. Users can register and login securely. The system uses bcrypt for password hashing and JWT tokens stored in httpOnly cookies to prevent XSS attacks."

---

## Dashboard & Board Creation (1:30 - 2:00)
**Show:** Create a new board, add title and description

**Say:** "After login, users see their dashboard with all boards. Here I can create a new board with title and description. The database schema includes User, Board, List, Card, and Collaboration models for full relational data management."

---

## Board View & Lists/Cards (2:00 - 2:30)
**Show:** Enter board, create lists (To Do, In Progress, Done), add cards with drag-and-drop

**Say:** "Inside the board, we have lists and cards. I can create lists like To Do, In Progress, Done. Cards can be added to lists and dragged between them using native HTML5 drag-and-drop for smooth performance without heavy libraries."

---

## Smart Recommendations Demo (2:30 - 3:30)
**Show:** Add cards with keywords like "urgent", "started", "review needed", show recommendations panel

**Say:** "Now for the smart recommendations engine - my custom implementation. The system analyzes card content for keywords. For example, if I add a card with 'urgent deadline', it suggests moving to In Progress. Cards with 'started' get suggestions to move forward. The engine also groups related cards - like all 'review' tasks together. This is rule-based logic I designed, analyzing title, description, and labels for patterns."

---

## Collaboration Features (3:30 - 4:00)
**Show:** Invite another user via email, show invitation acceptance

**Say:** "Collaboration is key. I can invite team members by email. The system sends secure invitation links with tokens. Invited users can accept and join the board with appropriate permissions."

---

## Database Schema Explanation (4:00 - 4:30)
**Show:** Briefly show Prisma schema or ER diagram

**Say:** "The database schema is relational: Users own Boards, Boards have Lists, Lists have Cards. Collaboration table handles multi-user access. Cards include due dates, priorities, labels, and assignments for full project management."

---

## Conclusion (4:30 - 5:00)
**Show:** Final board view with all features

**Say:** "This demonstrates clean code architecture, thoughtful feature implementation, and creative problem-solving. The recommendation engine shows independent thinking beyond basic CRUD. Code is modular, secure, and production-ready. Thank you for watching!"

---

## Tips for Recording:
- Speak clearly and continuously
- Demonstrate each feature smoothly
- Keep camera on screen showing actions
- Time transitions to fit 2-5 minutes
- Show both UI and code snippets if possible
- End with GitHub repo link: https://github.com/bhaktofmahakal/trello