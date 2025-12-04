/**
 * ========================================
 * 📊 RECALCULATE PRODUCTIVITY SCRIPT
 * ========================================
 * Recalculates productivity metrics for all educators
 * This ensures all lecture counts are accurate
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

const recalculateProductivity = async () => {
  try {
    console.log("🔗 Connecting to MongoDB...");
    await connectDB();

    console.log("👨‍🏫 Finding all educators...");
    const educators = await User.find({ role: "educator" });
    console.log(`Found ${educators.length} educators`);

    let totalRecalculated = 0;

    for (const educator of educators) {
      console.log(`\n📊 Processing educator: ${educator.name} (${educator._id})`);

      // Calculate the start of the current week (Monday)
      const userTimezone = educator.timezone || 'UTC';
      const today = moment().tz(userTimezone);
      const dayOfWeek = today.day();
      const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const weekStartMoment = today.clone().subtract(daysToSubtract, 'days').startOf('day');
      const weekStartDate = weekStartMoment.toDate();
      const weekEndDate = new Date(weekStartDate);
      weekEndDate.setDate(weekEndDate.getDate() + 7);

      // Calculate real metrics
      const coursesCreated = await Course.countDocuments({
        creator: educator._id,
        createdAt: { $gte: weekStartDate, $lt: weekEndDate }
      });

      // Get all courses created by this educator
      const educatorCourses = await Course.find({
        creator: educator._id
      }).select('_id');

      const courseIds = educatorCourses.map(course => course._id);

      // Count lectures in educator's courses created during the week
      const lecturesUploaded = await Lecture.countDocuments({
        courseId: { $in: courseIds },
        createdAt: { $gte: weekStartDate, $lt: weekEndDate }
      });

      const notesUploaded = await Note.countDocuments({
        creator: educator._id,
        createdAt: { $gte: weekStartDate, $lt: weekEndDate }
      });

      console.log(`  - Courses: ${coursesCreated}`);
      console.log(`  - Lectures: ${lecturesUploaded}`);
      console.log(`  - Notes: ${notesUploaded}`);

      // Get or create productivity record
      let productivityData = await Productivity.findOne({
        educator: educator._id,
        weekStartDate: weekStartDate
      });

      if (!productivityData) {
        productivityData = new Productivity({
          educator: educator._id,
          weekStartDate: weekStartDate,
          coursesCreated,
          lecturesUploaded,
          notesUploaded,
          assignmentsCreated: 0,
          quizzesAdded: 0
        });
        console.log("  ✅ Created new productivity record");
      } else {
        productivityData.coursesCreated = coursesCreated;
        productivityData.lecturesUploaded = lecturesUploaded;
        productivityData.notesUploaded = notesUploaded;
        console.log("  ✅ Updated existing productivity record");
      }

      // Calculate productivity score and category
      productivityData.calculateProductivityScore();
      productivityData.determineProductivityCategory();
      await productivityData.save();

      totalRecalculated++;
    }

    console.log(`\n✅ Recalculation completed! Updated ${totalRecalculated} educators`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during recalculation:", error);
    process.exit(1);
  }
};

recalculateProductivity();
