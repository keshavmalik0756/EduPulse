import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Import models
import Course from '../models/courseModel.js';
import Section from '../models/sectionModel.js';
import User from '../models/userModel.js';

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB Connected Successfully');
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error.message);
        process.exit(1);
    }
};

// Sample course data - simplified to match actual schema
const sampleCourseData = {
    title: "Complete Full-Stack Web Development Bootcamp",
    subTitle: "Master React, Node.js, MongoDB, and modern web development from scratch",
    description: `🚀 Transform Your Career with Full-Stack Web Development

This comprehensive bootcamp will take you from complete beginner to job-ready full-stack developer. You'll learn the most in-demand technologies used by top companies worldwide.

What You'll Build:
- 5+ Real-world projects including an e-commerce platform
- Personal portfolio website
- Social media application
- Task management system
- RESTful APIs and microservices

Why This Course?
✅ Project-based learning approach
✅ Industry best practices and modern tools
✅ Career guidance and interview preparation
✅ Lifetime access and updates
✅ Active community support

Technologies Covered:
- Frontend: React.js, HTML5, CSS3, JavaScript ES6+
- Backend: Node.js, Express.js, RESTful APIs
- Database: MongoDB, Mongoose ODM
- Tools: Git, GitHub, VS Code, Postman
- Deployment: Heroku, Netlify, AWS basics

Perfect for beginners, career changers, and developers looking to upgrade their skills!`,

    category: "Web Development",
    subCategory: "Full-Stack Development",
    tags: [
        "web development", "full-stack", "react", "nodejs", "mongodb",
        "javascript", "html", "css", "express", "bootcamp", "beginner-friendly",
        "career-change", "portfolio-projects", "job-ready"
    ],

    price: 4999,
    discount: 37,
    originalPrice: 7999,

    totalDurationMinutes: 720, // 12 hours
    estimatedDuration: "12 weeks",

    thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800",
    previewVideo: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",

    level: "Beginner",
    language: "English",
    hasCertificate: true,

    prerequisites: [
        "Basic computer literacy and internet browsing skills",
        "No prior programming experience required",
        "Willingness to learn and practice coding daily",
        "Computer with at least 8GB RAM (recommended)"
    ],

    learningOutcomes: [
        "Build responsive websites using HTML5, CSS3, and JavaScript",
        "Create dynamic user interfaces with React.js and modern hooks",
        "Develop RESTful APIs using Node.js and Express.js",
        "Implement user authentication and authorization systems",
        "Work with MongoDB database and Mongoose ODM",
        "Deploy applications to cloud platforms like Heroku and Netlify",
        "Use Git and GitHub for version control and collaboration",
        "Apply industry best practices and coding standards",
        "Debug and troubleshoot web applications effectively",
        "Build a complete full-stack application from scratch"
    ],

    requirements: [
        "Complete beginners who want to start a career in web development",
        "Career changers looking to transition into tech",
        "Students studying computer science or related fields",
        "Freelancers wanting to expand their skill set",
        "Entrepreneurs who want to build their own web applications",
        "Anyone interested in learning modern web development technologies"
    ],

    enrollmentStatus: "open",
    isFeatured: true,
    isPublished: true,
    publishedDate: new Date(),

    metaTitle: "Full-Stack Web Development Bootcamp | React & Node.js",
    metaDescription: "Master full-stack web development with our comprehensive bootcamp. Learn React, Node.js, MongoDB, and build 5+ real projects. Get job-ready in 12 weeks!"
};

// Create sample course function
const createSampleCourse = async () => {
    try {
        console.log('🔍 Looking for an educator user...');

        // Find an educator user to assign as instructor
        let instructor = await User.findOne({ role: 'educator' });

        if (!instructor) {
            console.log('📝 No educator found, creating sample educator...');

            // Create a sample educator if none exists
            instructor = await User.create({
                name: "Dr. Sarah Johnson",
                email: "sarah.johnson@edupulse.com",
                password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password: "password123"
                role: "educator",
                description: "Full-Stack Web Development Expert with 8+ years of industry experience. Former Senior Developer at Google and Microsoft. Passionate about teaching and helping students launch their tech careers.",
                photoUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400",
                accountVerified: true,
                settings: {
                    notifications: true,
                    publicProfile: true,
                    allowMessages: true
                }
            });

            console.log('✅ Sample educator created:', instructor.name);
        }

        // Set the creator/instructor for the course
        sampleCourseData.creator = instructor._id;
        sampleCourseData.instructor = instructor._id;

        // Check if course already exists
        const existingCourse = await Course.findOne({ title: sampleCourseData.title });

        if (existingCourse) {
            console.log('✅ Sample course already exists in database!');
            console.log('� Coursie Details:');
            console.log(`   Title: ${existingCourse.title}`);
            console.log(`   Instructor: ${instructor.name}`);
            console.log(`   Price: ₹${existingCourse.price || 0} (${existingCourse.discount || 0}% off)`);
            console.log(`   Duration: ${existingCourse.estimatedDuration || 'Not set'}`);
            console.log(`   Category: ${existingCourse.category}`);
            console.log(`   Level: ${existingCourse.level}`);
            console.log(`   Status: ${existingCourse.isPublished ? 'Published' : 'Draft'}`);
            console.log(`   Course ID: ${existingCourse._id}`);
            return existingCourse;
        }

        // Create new course
        console.log('🚀 Creating new sample course...');
        const course = await Course.create(sampleCourseData);

        // Create sample sections for the course
        console.log('📚 Creating sample sections...');
        const sampleSections = [
            {
                title: "Getting Started",
                description: "Introduction to web development and setting up your development environment",
                order: 1,
                course: course._id,
                lessons: [
                    {
                        title: "Welcome to the Course",
                        description: "Course overview and what you'll learn",
                        duration: 15,
                        order: 1,
                        isPreview: true
                    },
                    {
                        title: "Setting Up Your Development Environment",
                        description: "Install VS Code, Node.js, and other essential tools",
                        duration: 30,
                        order: 2
                    }
                ],
                isPublished: true
            },
            {
                title: "HTML & CSS Fundamentals",
                description: "Learn the building blocks of web development",
                order: 2,
                course: course._id,
                lessons: [
                    {
                        title: "HTML Basics",
                        description: "Understanding HTML structure and elements",
                        duration: 45,
                        order: 1
                    },
                    {
                        title: "CSS Styling",
                        description: "Styling your HTML with CSS",
                        duration: 60,
                        order: 2
                    },
                    {
                        title: "Responsive Design",
                        description: "Making your websites mobile-friendly",
                        duration: 50,
                        order: 3
                    }
                ],
                isPublished: true
            },
            {
                title: "JavaScript Essentials",
                description: "Master JavaScript programming fundamentals",
                order: 3,
                course: course._id,
                lessons: [
                    {
                        title: "JavaScript Basics",
                        description: "Variables, functions, and control structures",
                        duration: 75,
                        order: 1
                    },
                    {
                        title: "DOM Manipulation",
                        description: "Interacting with HTML elements using JavaScript",
                        duration: 60,
                        order: 2
                    }
                ],
                isPublished: true
            }
        ];

        const createdSections = await Section.create(sampleSections);
        
        // Update the course with section references
        course.sections = createdSections.map(section => section._id);
        course.totalLectures = createdSections.reduce((total, section) => total + section.lessons.length, 0);
        course.totalDurationMinutes = createdSections.reduce((total, section) => total + section.totalDuration, 0);
        await course.save();

        console.log(`✅ Created ${createdSections.length} sections with ${course.totalLectures} total lessons`);
        console.log('✅ Sample course created successfully!');
        console.log('📊 Course Details:');
        console.log(`   Title: ${course.title}`);
        console.log(`   Instructor: ${instructor.name}`);
        console.log(`   Price: ₹${course.price || 0} (${course.discount || 0}% off)`);
        console.log(`   Duration: ${course.estimatedDuration || 'Not set'}`);
        console.log(`   Category: ${course.category}`);
        console.log(`   Level: ${course.level}`);
        console.log(`   Status: ${course.isPublished ? 'Published' : 'Draft'}`);
        console.log(`   Course ID: ${course._id}`);

        return course;

    } catch (error) {
        console.error('❌ Error creating sample course:', error.message);
        throw error;
    }
};

// Main execution function
const main = async () => {
    try {
        await connectDB();
        const course = await createSampleCourse();

        console.log('\n🎉 Sample course creation completed!');
        console.log('🌐 You can now view this course in your application');
        console.log('📱 Frontend URL: http://localhost:5173/educator/courses');
        console.log('🔗 API URL: https://edupulse-ko2w.onrender.com/api/courses');

        process.exit(0);
    } catch (error) {
        console.error('❌ Script failed:', error.message);
        process.exit(1);
    }
};

// Run the script
main();