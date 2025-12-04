import mongoose from "mongoose";
import dotenv from "dotenv";
import Course from "../models/courseModel.js";
import Section from "../models/sectionModel.js";
import connectDB from "../config/connectDB.js";

dotenv.config();

// Connect to database
connectDB();

console.log("🔧 Starting course-section relationship repair...");

const repairCourseSections = async () => {
  try {
    // Find all courses
    const courses = await Course.find({});
    console.log(`🔍 Found ${courses.length} courses to check`);
    
    let repairedCount = 0;
    
    for (const course of courses) {
      // Find all sections that belong to this course
      const sections = await Section.find({ course: course._id });
      
      if (sections.length > 0) {
        // Get current section IDs in course
        const currentSectionIds = course.sections.map(id => id.toString());
        
        // Check if all section IDs are properly linked
        const missingSections = sections.filter(section => 
          !currentSectionIds.includes(section._id.toString())
        );
        
        if (missingSections.length > 0) {
          console.log(`\n🛠️ Repairing course: ${course.title}`);
          console.log(`   Current sections in course array: ${currentSectionIds.length}`);
          console.log(`   Actual sections found: ${sections.length}`);
          console.log(`   Missing sections: ${missingSections.length}`);
          
          // Add missing section IDs to course
          const sectionIdsToAdd = missingSections.map(section => section._id);
          await Course.findByIdAndUpdate(
            course._id,
            { $addToSet: { sections: { $each: sectionIdsToAdd } } }
          );
          
          console.log(`   ✅ Added ${sectionIdsToAdd.length} missing sections`);
          repairedCount++;
        }
      }
    }
    
    console.log(`\n✅ Repair complete! Fixed ${repairedCount} courses.`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error repairing course-section relationships:", error);
    process.exit(1);
  }
};

repairCourseSections();