// Script to fix course metaTitle values that are too long
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from '../models/courseModel.js';
import User from '../models/userModel.js'; // Import User model

dotenv.config();

const fixCourseMetaTitles = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Find all courses with metaTitle longer than 60 characters
    const courses = await Course.find({ 
      $expr: { $gt: [{ $strLenCP: "$metaTitle" }, 60] }
    }).select('_id title metaTitle');
    
    console.log(`🔍 Found ${courses.length} courses with metaTitle longer than 60 characters`);

    let fixCount = 0;

    for (const course of courses) {
      const currentMetaTitle = course.metaTitle;
      const currentLength = currentMetaTitle.length;
      
      if (currentLength > 60) {
        // Truncate to 60 characters
        const fixedMetaTitle = currentMetaTitle.substring(0, 60);
        console.log(`🔧 Fixing course "${course.title}" - MetaTitle length: ${currentLength} -> ${fixedMetaTitle.length}`);
        console.log(`   Original: "${currentMetaTitle}"`);
        console.log(`   Fixed:    "${fixedMetaTitle}"`);
        
        course.metaTitle = fixedMetaTitle;
        await course.save();
        fixCount++;
      }
    }

    console.log(`✅ Fixed ${fixCount} courses with metaTitle values longer than 60 characters`);

    // Final statistics
    const totalCourses = await Course.countDocuments();
    const validMetaTitles = await Course.countDocuments({
      $or: [
        { metaTitle: { $exists: false } },
        { metaTitle: { $eq: null } },
        { $expr: { $lte: [{ $strLenCP: "$metaTitle" }, 60] } }
      ]
    });
    const invalidMetaTitles = await Course.countDocuments({
      metaTitle: { $exists: true, $ne: null },
      $expr: { $gt: [{ $strLenCP: "$metaTitle" }, 60] }
    });

    console.log('\n📊 FINAL STATISTICS:');
    console.log(`📚 Total Courses: ${totalCourses}`);
    console.log(`✅ Courses with valid metaTitle: ${validMetaTitles}`);
    console.log(`❌ Courses with invalid metaTitle: ${invalidMetaTitles}`);

    console.log('\n✅ Course metaTitle fix completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing course metaTitles:', error);
    process.exit(1);
  }
};

// Run the script
fixCourseMetaTitles();