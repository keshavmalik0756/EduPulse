/**
 * =========================================
 * 📊 SEED ANALYTICS TEST DATA
 * =========================================
 * This script seeds test data for analytics features
 * Run with: node backend/scripts/seedAnalyticsData.js
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Import models
import User from "../models/userModel.js";
import Course from "../models/courseModel.js";
import Section from "../models/sectionModel.js";
import Lecture from "../models/lectureModel.js";
import Confusion from "../models/confusionModel.js";
import Momentum from "../models/momentumModel.js";
import Dropout from "../models/dropoutModel.js";

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/edupulse");
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    process.exit(1);
  }
};

// Seed data
const seedData = async () => {
  try {
    console.log("🌱 Starting data seeding...\n");

    // 1. Create or find educator
    let educator = await User.findOne({ email: "educator@test.com" });
    if (!educator) {
      educator = await User.create({
        name: "Test Educator",
        email: "educator@test.com",
        password: "password123",
        role: "educator",
        isVerified: true
      });
      console.log("✅ Created educator:", educator.email);
    } else {
      console.log("✅ Found existing educator:", educator.email);
    }

    // 2. Create or find course
    let course = await Course.findOne({ title: "Test Analytics Course" });
    if (!course) {
      course = await Course.create({
        title: "Test Analytics Course",
        description: "A test course for analytics features",
        creator: educator._id,
        category: "Technology",
        level: "beginner",
        price: 0,
        isPublished: true
      });
      console.log("✅ Created course:", course.title);
    } else {
      console.log("✅ Found existing course:", course.title);
    }

    // 3. Create or find section
    let section = await Section.findOne({ title: "Test Section", course: course._id });
    if (!section) {
      section = await Section.create({
        title: "Test Section",
        description: "A test section",
        course: course._id,
        order: 1
      });
      console.log("✅ Created section:", section.title);
    } else {
      console.log("✅ Found existing section:", section.title);
    }

    // 4. Create or find lectures
    let lectures = await Lecture.find({ courseId: course._id });
    if (lectures.length === 0) {
      const lectureData = [
        { title: "Introduction to React", duration: 1200 },
        { title: "React Hooks Deep Dive", duration: 1500 },
        { title: "State Management", duration: 1800 },
        { title: "Advanced Patterns", duration: 2000 }
      ];

      for (let i = 0; i < lectureData.length; i++) {
        const data = lectureData[i];
        const lecture = await Lecture.create({
          title: data.title,
          description: `Learn about ${data.title}`,
          courseId: course._id,
          sectionId: section._id,
          duration: data.duration,
          videoUrl: "https://example.com/video.mp4",
          type: "video",
          difficulty: "beginner",
          order: i + 1
        });
        lectures.push(lecture);
        console.log("✅ Created lecture:", lecture.title);
      }
    } else {
      console.log(`✅ Found ${lectures.length} existing lectures`);
    }

    // 5. Seed confusion data
    console.log("\n📊 Seeding confusion data...");
    await Confusion.deleteMany({ lecture: { $in: lectures.map(l => l._id) } });

    for (const lecture of lectures) {
      const confusionPoints = [];
      const pointsPerLecture = 8;

      for (let i = 0; i < pointsPerLecture; i++) {
        const timestamp = Math.floor((lecture.duration / pointsPerLecture) * i);
        const confusionScore = Math.floor(Math.random() * 100);

        confusionPoints.push({
          lecture: lecture._id,
          course: course._id,
          timestamp,
          confusionScore,
          replayCount: Math.floor(Math.random() * 10),
          skipCount: Math.floor(Math.random() * 5),
          pauseCount: Math.floor(Math.random() * 8),
          averageWatchTime: timestamp + Math.floor(Math.random() * 100),
          studentInteractions: [],
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
        });
      }

      await Confusion.insertMany(confusionPoints);
      console.log(`✅ Created ${pointsPerLecture} confusion points for "${lecture.title}"`);
    }

    // 6. Seed momentum data
    console.log("\n📈 Seeding momentum data...");
    await Momentum.deleteMany({ course: course._id });

    const momentumData = [];
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      momentumData.push({
        course: course._id,
        date: date.toISOString().split('T')[0],
        momentumScore: Math.floor(50 + Math.random() * 50),
        engagementRate: Math.floor(40 + Math.random() * 60),
        enrollments: Math.floor(Math.random() * 20),
        completions: Math.floor(Math.random() * 15),
        reviews: Math.floor(Math.random() * 10),
        questions: Math.floor(Math.random() * 25),
        createdAt: date
      });
    }

    await Momentum.insertMany(momentumData);
    console.log(`✅ Created ${momentumData.length} momentum data points`);

    // 7. Seed dropout data
    console.log("\n📉 Seeding dropout data...");
    await Dropout.deleteMany({ course: course._id });

    const dropoutData = [];
    const validFactors = ["length", "complexity", "prerequisites", "engagement", "assessments", "content_density", "pacing"];
    const validInterventions = ["break_down_content", "add_examples", "include_interactive_elements", "provide_additional_resources", "adjust_pacing", "add_assessment_checkpoint", "offer_peer_support"];
    
    for (let i = 0; i < lectures.length; i++) {
      // Select random factors
      const selectedFactors = [];
      for (let j = 0; j < 3; j++) {
        selectedFactors.push({
          factor: validFactors[Math.floor(Math.random() * validFactors.length)],
          weight: Math.floor(Math.random() * 100)
        });
      }

      // Select random interventions
      const selectedInterventions = [];
      for (let j = 0; j < 2; j++) {
        selectedInterventions.push(validInterventions[Math.floor(Math.random() * validInterventions.length)]);
      }

      dropoutData.push({
        course: course._id,
        lecture: lectures[i]._id,
        position: i + 1,
        dropoffProbability: Math.floor(20 + Math.random() * 60),
        confidence: Math.floor(70 + Math.random() * 30),
        riskFactors: selectedFactors,
        interventions: selectedInterventions,
        predictionMethod: Math.random() > 0.5 ? "polynomial_regression" : "moving_average",
        createdAt: new Date()
      });
    }

    await Dropout.insertMany(dropoutData);
    console.log(`✅ Created ${dropoutData.length} dropout predictions`);

    console.log("\n✅ Data seeding completed successfully!");
    console.log("\n📋 Summary:");
    console.log(`   - Educator: ${educator.email}`);
    console.log(`   - Course: ${course.title}`);
    console.log(`   - Lectures: ${lectures.length}`);
    console.log(`   - Confusion points: ${lectures.length * 8}`);
    console.log(`   - Momentum records: 31`);
    console.log(`   - Dropout predictions: ${lectures.length}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    process.exit(1);
  }
};

// Run seeding
connectDB().then(() => seedData());
