// Script to fix course level values in the database
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from '../models/courseModel.js';
import User from '../models/userModel.js'; // Import User model

dotenv.config();

const fixCourseLevels = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Find all courses with invalid level values
    const courses = await Course.find({}).select('_id title level'); // Only select needed fields
    console.log(`🔍 Found ${courses.length} courses to check`);

    let fixCount = 0;

    for (const course of courses) {
      // Check if level is invalid
      const currentLevel = course.level;
      const validLevels = ["beginner", "intermediate", "advanced", "all-levels"];
      
      // If level is not in valid levels, try to fix it
      if (!validLevels.includes(currentLevel)) {
        // Try to convert to lowercase and check again
        const lowerLevel = typeof currentLevel === 'string' ? currentLevel.toLowerCase().trim() : 'beginner';
        
        // If still not valid, default to beginner
        const fixedLevel = validLevels.includes(lowerLevel) ? lowerLevel : 'beginner';
        
        if (currentLevel !== fixedLevel) {
          console.log(`🔧 Fixing course "${course.title}" - Level: "${currentLevel}" -> "${fixedLevel}"`);
          course.level = fixedLevel;
          await course.save();
          fixCount++;
        }
      }
    }

    console.log(`✅ Fixed ${fixCount} courses with invalid level values`);

    // Final statistics
    const totalCourses = await Course.countDocuments();
    const beginnerCourses = await Course.countDocuments({ level: 'beginner' });
    const intermediateCourses = await Course.countDocuments({ level: 'intermediate' });
    const advancedCourses = await Course.countDocuments({ level: 'advanced' });
    const allLevelsCourses = await Course.countDocuments({ level: 'all-levels' });

    console.log('\n📊 FINAL STATISTICS:');
    console.log(`📚 Total Courses: ${totalCourses}`);
    console.log(`-BEGINNER Courses: ${beginnerCourses}`);
    console.log(`-INTERMEDIATE Courses: ${intermediateCourses}`);
    console.log(`-ADVANCED Courses: ${advancedCourses}`);
    console.log(`-ALL-LEVELS Courses: ${allLevelsCourses}`);

    console.log('\n✅ Course level fix completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing course levels:', error);
    process.exit(1);
  }
};

// Run the script
fixCourseLevels();