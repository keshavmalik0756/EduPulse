import mongoose from "mongoose";
import dotenv from "dotenv";
import Course from "../models/courseModel.js";
import Section from "../models/sectionModel.js";
import connectDB from "../config/connectDB.js";

dotenv.config();

// Connect to database
connectDB();

console.log("🔍 Verifying course-section relationships...");

const verifyCourseSections = async () => {
  try {
    // Find the specific course mentioned in the issue
    const course = await Course.findOne({ title: "Mastering React and Redux" });
    
    if (!course) {
      console.log("❌ Course 'Mastering React and Redux' not found");
      process.exit(1);
    }
    
    console.log(`\n📘 Course: ${course.title}`);
    console.log(`   Course ID: ${course._id}`);
    console.log(`   Sections in course array: ${course.sections.length}`);
    
    // Find all sections that belong to this course
    const sections = await Section.find({ course: course._id });
    console.log(`   Actual sections found: ${sections.length}`);
    
    if (sections.length > 0) {
      console.log("\n📋 Sections:");
      for (const section of sections) {
        console.log(`   - ${section.title} (ID: ${section._id})`);
        console.log(`     Lessons: ${section.lessons.length}`);
        console.log(`     Duration: ${section.totalDuration} minutes`);
      }
    }
    
    // Check if the relationship is now consistent
    if (course.sections.length === sections.length) {
      console.log("\n✅ Course-section relationship is now consistent!");
    } else {
      console.log("\n❌ Course-section relationship is still inconsistent.");
      console.log(`   Expected: ${sections.length}, Got: ${course.sections.length}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error verifying course-section relationships:", error);
    process.exit(1);
  }
};

verifyCourseSections();