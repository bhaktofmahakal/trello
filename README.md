# Trello Clone with Smart Recommendations

A feature-rich Trello-like task board application with an intelligent recommendation system that suggests due dates, list movements, and related cards based on card content analysis.

## Architecture Overview

### Tech Stack
- **Frontend**: Next.js 14 (React 18) with TypeScript
- **Backend**: Next.js API Routes (full-stack approach)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with httpOnly cookies
- **Styling**: Tailwind CSS
- **Drag & Drop**: Native HTML5 Drag and Drop API
- **Form Validation**: Zod
- **Password Hashing**: bcryptjs

### Project Structure

```
trello/
├── app/                          # Next.js app router
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── boards/               # Board management
│   │   ├── cards/                # Card operations
│   │   ├── invitations/          # Invitation system
│   │   └── lists/                # List management
│   ├── auth/                     # Authentication page
│   ├── boards/[id]/              # Board detail page
│   ├── dashboard/                # Dashboard page
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home redirect
│   └── providers.tsx             # Client providers
├── components/
│   └── board/                    # Board components
│       ├── BoardView.tsx         # Main board layout
│       ├── Card.tsx              # Card component
│       ├── CardModal.tsx         # Card edit modal
│       ├── ListColumn.tsx        # List column
│       └── RecommendationsPanel.tsx  # Recommendations panel
├── lib/
│   ├── api.ts                    # API utilities
│   ├── auth.ts                   # Authentication helpers
│   ├── db.ts                     # Prisma client
│   ├── recommendations.ts        # Smart recommendations logic
│   └── context/
│       └── auth.tsx              # Auth context provider
├── prisma/
│   └── schema.prisma             # Database schema
├── styles/
│   └── globals.css               # Global styles
├── public/                        # Static assets
├── next.config.js                # Next.js config
├── tsconfig.json                 # TypeScript config
├── tailwind.config.ts            # Tailwind config
├── postcss.config.js             # PostCSS config
├── .env.example                  # Environment template
├── .env.local                    # Local environment
└── package.json                  # Dependencies
```

## Database Schema

### User
- `id`: Primary key (CUID)
- `email`: Unique email address
- `name`: User's display name
- `password`: Hashed password
- `createdAt`: Timestamp
- `updatedAt`: Timestamp

### Board
- `id`: Primary key
- `title`: Board name
- `description`: Optional description
- `ownerId`: Reference to User
- `createdAt`: Timestamp
- `updatedAt`: Timestamp

### List
- `id`: Primary key
- `title`: List name
- `position`: Display order
- `boardId`: Reference to Board
- `createdAt`: Timestamp
- `updatedAt`: Timestamp

### Card
- `id`: Primary key
- `title`: Card title
- `description`: Optional description
- `position`: Display order within list
- `listId`: Reference to List
- `dueDate`: Optional due date
- `priority`: Optional priority level (low/medium/high)
- `label`: Optional label/tag
- `assignedTo`: Optional user assignment
- `createdAt`: Timestamp
- `updatedAt`: Timestamp

### Collaboration
- `id`: Primary key
- `userId`: Reference to User
- `boardId`: Reference to Board
- `role`: Role (member/editor/admin)
- `createdAt`: Timestamp
- Unique constraint on (userId, boardId)

### Invitation
- `id`: Primary key
- `email`: Invited email address
- `boardId`: Reference to Board
- `invitedBy`: Reference to User
- `status`: Invitation status (pending/accepted/rejected)
- `token`: Unique invitation token
- `createdAt`: Timestamp
- `expiresAt`: Expiration date (7 days)

## Smart Recommendations Logic

The recommendation system analyzes card content and suggests improvements:

### 1. Due Date Suggestions
Analyzes card title and description for keywords:
- **Urgent Keywords** (1 day): "urgent", "asap", "critical", "emergency", "deadline"
- **High Priority Keywords** (3 days): "soon", "quickly", "important"
- **Temporal Keywords**: "today", "tomorrow", "next week", "next month"

### 2. List Movement Suggestions
Detects when cards should move to different lists:
- **In Progress Keywords**: "started", "in progress", "working on", "begun"
- **Done Keywords**: "done", "completed", "finished", "deployed", "ready"
- Suggests moving cards to appropriate list columns

### 3. Related Cards Grouping
Finds semantically related cards:
- Extracts keywords from card title and description
- Matches keywords across all board cards
- Suggests grouping cards with high relevance scores
- Helps identify tasks that should be tackled together

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Boards
- `GET /api/boards` - List user's boards
- `POST /api/boards` - Create board
- `GET /api/boards/[id]` - Get board details
- `PUT /api/boards/[id]` - Update board
- `DELETE /api/boards/[id]` - Delete board
- `GET /api/boards/[id]/recommendations` - Get board recommendations
- `POST /api/boards/[id]/invitations` - Invite user
- `GET /api/boards/[id]/invitations` - List invitations

### Lists
- `POST /api/boards/[id]/lists` - Create list

### Cards
- `POST /api/lists/[listId]/cards` - Create card
- `GET /api/cards/[id]` - Get card details
- `PUT /api/cards/[id]` - Update card
- `DELETE /api/cards/[id]` - Delete card

### Invitations
- `GET /api/invitations/[token]` - Get invitation details
- `POST /api/invitations/[token]` - Accept invitation

## Setup Instructions

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd trello
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
# Edit .env.local with your database credentials
```

4. **Set up PostgreSQL database**
```bash
# Create database
createdb trello_db

# Or use Docker
docker run --name trello-postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:15
```

5. **Run database migrations**
```bash
npm run db:push
```

6. **Start development server**
```bash
npm run dev
```

7. **Open application**
Navigate to `http://localhost:3000`

## Running Tests

```bash
# Placeholder for test commands
npm run test
npm run test:watch
```

## Building for Production

```bash
npm run build
npm run start
```

## Features

### Core Features
- ✅ User authentication (register/login/logout)
- ✅ Create, read, update, delete boards
- ✅ Create, read, update, delete lists
- ✅ Create, read, update, delete cards
- ✅ Drag and drop cards between lists
- ✅ Set card properties (title, description, due date, priority, labels)
- ✅ Invite collaborators to boards
- ✅ Accept/reject invitations

### Smart Recommendations
- ✅ AI-powered due date suggestions
- ✅ Automatic list movement recommendations
- ✅ Related cards grouping
- ✅ Priority-based recommendation display
- ✅ One-click recommendation application

### User Interface
- ✅ Responsive design
- ✅ Dark-friendly color scheme
- ✅ Smooth animations
- ✅ Intuitive drag and drop
- ✅ Modal dialogs for card editing
- ✅ Real-time board updates

## Security Features

- JWT-based authentication with httpOnly cookies
- Password hashing with bcryptjs
- CORS protection
- Input validation with Zod
- Authorization checks on all endpoints
- SQL injection prevention via Prisma ORM
- XSS protection via React

## Development Guidelines

### Code Style
- TypeScript for type safety
- Functional components with hooks
- CSS Tailwind for styling
- ESLint for code quality

### Naming Conventions
- PascalCase for React components
- camelCase for functions and variables
- SCREAMING_SNAKE_CASE for constants

### Component Guidelines
- Keep components focused and single-responsibility
- Use TypeScript interfaces for props
- Implement error handling
- Add loading states

## Performance Optimizations

- Server-side rendering with Next.js
- Lazy loading for components
- Optimized database queries with Prisma
- CSS minification with Tailwind
- Image optimization

## Future Enhancements

- [ ] Socket.io for real-time collaboration
- [ ] User avatars and profiles
- [ ] Card comments and activity feed
- [ ] Advanced filtering and search
- [ ] Card templates
- [ ] Team workspaces
- [ ] Analytics dashboard
- [ ] Mobile app
- [ ] Dark mode toggle
- [ ] Keyboard shortcuts

## Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Render
1. Push code to GitHub
2. Create new Web Service on Render
3. Connect GitHub repository
4. Set environment variables
5. Deploy

### Railway
1. Push code to GitHub
2. Create new project on Railway
3. Add PostgreSQL plugin
4. Deploy

## Troubleshooting

### Database connection issues
- Verify PostgreSQL is running
- Check DATABASE_URL in .env.local
- Run `npm run db:push` to create schema

### Port 3000 already in use
```bash
npm run dev -- -p 3001
```

### Build errors
```bash
npm run build
# Check for TypeScript errors
npx tsc --noEmit
```

## Support

For issues or questions, please open a GitHub issue or contact the development team.
