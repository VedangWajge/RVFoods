# RV Foods

**Pure. Traditional. Delivered.**

Full-stack Indian food e-commerce platform for traditional products — masale (spices), ghee, anarase, and more.

## Tech Stack

| Layer    | Technologies |
|----------|--------------|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS v3, Shadcn/UI, Zustand, React Router v6, Axios, Framer Motion |
| Backend  | Node.js, Express, TypeScript, MongoDB, Mongoose, JWT, Razorpay, Cloudinary |

## Project Structure

```
rv-foods/
├── client/     # React frontend (port 5173)
├── server/     # Express API (port 5000)
└── docs/       # API documentation
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account
- Razorpay, Cloudinary, and email credentials (see `.env.example` files)

### Client

```bash
cd client
cp .env.example .env
npm install
npm run dev
```

### Server

```bash
cd server
cp .env.example .env
npm install
npm run dev
```

## Environment Variables

Copy `client/.env.example` and `server/.env.example` to `.env` and fill in your values.

## License

Private — RV Foods
