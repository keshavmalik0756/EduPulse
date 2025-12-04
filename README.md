# EduPulse 🎓

![EduPulse Banner](https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800)

A comprehensive educational platform built with the MERN stack, featuring advanced analytics, payment processing, and gamification elements.

## 🌟 Features

### User Management
- Multi-role system (Student, Educator, Admin)
- Email verification and secure authentication
- Profile management with avatars
- Role-based dashboards

### Course Management
- Create, edit, and publish courses
- Section-based organization
- Lecture content management (videos, documents, quizzes)
- Pricing and discount system
- Enrollment management

### Learning Experience
- Video lecture playback with progress tracking
- Interactive notes system
- Discussion forums
- Resource downloads
- Completion certificates

### Analytics & Insights
- Student engagement tracking
- Course performance metrics
- Dropout prediction algorithms
- Productivity tracking
- Leaderboards
- Detailed dashboards with charts

### Payments & Monetization
- Razorpay integration for course purchases
- Payment history tracking
- Revenue analytics for educators

### Gamification
- Progress tracking and completion percentages
- Achievement systems
- Leaderboards
- Productivity scoring

## 🛠️ Tech Stack

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication and authorization
- **Cloudinary** - Media file storage
- **Razorpay** - Payment processing
- **Redis** - Caching layer
- **Swagger** - API documentation

### Frontend
- **React 19** - JavaScript library for UI
- **Vite** - Build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Redux Toolkit** - State management
- **React Router** - Client-side routing
- **Framer Motion** - Animations
- **Recharts** - Data visualization

## 📁 Project Structure

```
EduPulse/
├── backend/
│   ├── config/          # Database and service configurations
│   ├── controllers/     # Business logic handlers
│   ├── middleware/      # Authentication, validation, error handling
│   ├── models/          # Mongoose schemas and models
│   ├── routes/          # API endpoint definitions
│   ├── services/        # External service integrations
│   ├── utils/           # Helper functions and utilities
│   ├── scripts/         # Maintenance and utility scripts
│   ├── public/          # Static files
│   └── index.js         # Entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Route-level components
│   │   ├── redux/       # State management
│   │   ├── services/    # API service layers
│   │   ├── utils/       # Helper functions
│   │   ├── Layout/      # Page layouts and navigation
│   │   ├── assets/      # Images and static assets
│   │   └── App.jsx      # Main application component
│   ├── public/          # Public assets
│   └── index.html       # HTML template
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- Cloudinary account
- Razorpay account (for payment features)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/edupulse.git
cd edupulse
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

4. Create environment files:

Backend `.env` file:
```env
NODE_ENV=development
PORT=8080
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

Frontend `.env` file:
```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

5. Start the development servers:

Backend:
```bash
cd backend
npm run dev
```

Frontend:
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8080
- API Docs: http://localhost:8080/api-docs

## 📖 API Documentation

API documentation is available through Swagger UI at `/api-docs` when the backend server is running.

## 🧪 Testing

Run backend tests:
```bash
cd backend
npm test
```

## 📦 Deployment

### Backend
1. Set environment variables for production
2. Run `npm start`

### Frontend
1. Build the production bundle:
```bash
cd frontend
npm run build
```
2. Deploy the `dist/` folder to your hosting provider

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Thanks to all contributors who have helped shape EduPulse
- Inspired by modern e-learning platforms and educational technology trends

## 📞 Support

For support, email support@edupulse.com or open an issue in the repository.