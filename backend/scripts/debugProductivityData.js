/**
 * ========================================
 * 🔍 DEBUG PRODUCTIVITY DATA SCRIPT
 * ========================================
 * Shows detailed information about productivity data
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import moment from "moment-timezone";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Import models
import User from "../models/userModel.js";
import Course from "../models/courseModel.js";
import Lecture from "../models/lectureModel.js";
import Note from "../models/noteModel.js";
import Productivity from "../models/productivityModel.js";
import connectDB from "../config/connectDB.js";

const debugProductivityData = async () => {
  try {
    console.log("🔗 Connecting to MongoDB...");
    await connectDB();

    console.log("👨‍🏫 Finding all educators...");
    const educators = await User.find({ role: "educator" });
    console.log(`Found ${educators.length} educators\n`);

    for (const educator of educators) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`📊 EDUCATOR: ${educator.name} (${educator._id})`);
      console.log(`${'='.repeat(60)}`);

      // Get current week dates
      const userTimezone = educator.timezone || 'UTC';
      const today = moment().tz(userTimezone);
      const dayOfWeek = today.day();
      const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const weekStartMoment = today.clone().subtract(daysToSubtract, 'days').startOf('day');
      const weekStartDate = weekStartMoment.toDate();
      const weekEndDate = new Date(weekStartDate);
      weekEndDate.setDate(weekEndDate.getDate() + 7);

      console.log(`\n📅 Week: ${weekStartDate.toISOString()} to ${weekEndDate.toISOString()}`);

      // Get courses
      const courses = await Course.find({ creator: educator._id }).select('_id title createdAt');
      console.log(`\n📚 Total Courses: ${courses.length}`);
      courses.forEach(course => {
        console.log(`  - ${course.title} (${course._id}) - Created: ${course.createdAt.toISOString()}`);
      });

      const coursesThisWeek = await Course.countDocuments({
        creator: educator._id,
        createdAt: { $gte: weekStartDate, $lt: weekEndDate }
      });
      console.log(`  📊 This Week: ${coursesThisWeek}`);

      // Get lectures
      const courseIds = courses.map(c => c._id);
      const lectures = await Lecture.find({ courseId: { $in: courseIds } }).select('_id title courseId createdAt');
      console.log(`\n🎬 Total Lectures: ${lectures.length}`);
      lectures.forEach(lecture => {
        console.log(`  - ${lecture.title} (${lecture._id}) - Course: ${lecture.courseId} - Created: ${lecture.createdAt.toISOString()}`);
      });

      const lecturesThisWeek = await Lecture.countDocuments({
        courseId: { $in: courseIds },
        createdAt: { $gte: weekStartDate, $lt: weekEndDate }
      });
      console.log(`  📊 This Week: ${lecturesThisWeek}`);

      // Get notes
      const notes = await Note.find({ creator: educator._id }).select('_id title createdAt');
      console.log(`\n📝 Total Notes: ${notes.length}`);
      notes.forEach(note => {
        console.log(`  - ${note.title} (${note._id}) - Created: ${note.createdAt.toISOString()}`);
      });

      const notesThisWeek = await Note.countDocuments({
        creator: educator._id,
        createdAt: { $gte: weekStartDate, $lt: weekEndDate }
      });
      console.log(`  📊 This Week: ${notesThisWeek}`);

      // Get productivity record
      const productivity = await Productivity.findOne({
        educator: educator._id,
        weekStartDate: weekStartDate
      });

      console.log(`\n📈 Productivity Record:`);
      if (productivity) {
        console.log(`  - Courses: ${productivity.coursesCreated}`);
        console.log(`  - Lectures: ${productivity.lecturesUploaded}`);
        console.log(`  - Notes: ${productivity.notesUploaded}`);
        console.log(`  - Score: ${productivity.productivityScore}`);
        console.log(`  - Category: ${productivity.productivityCategory}`);
      } else {
        console.log(`  ❌ No productivity record found`);
      }
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log("✅ Debug completed!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during debug:", error);
    process.exit(1);
  }
};

debugProductivityData();
