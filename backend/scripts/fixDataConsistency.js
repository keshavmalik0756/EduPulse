// Script to fix data consistency between Course and User models
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from '../models/courseModel.js';
import User from '../models/userModel.js';

dotenv.config();

const fixDataConsistency = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Fix courses - ensure enrolledStudents array is consistent
    console.log('🔍 Checking course enrollments...');
    const courses = await Course.find({});
    let courseFixCount = 0;

    for (const course of courses) {
      // Remove duplicate student entries
      const uniqueStudents = [...new Set(course.enrolledStudents.map(id => id.toString()))];
      if (uniqueStudents.length !== course.enrolledStudents.length) {
        console.log(`🔧 Fixing duplicates in course: ${course.title}`);
        course.enrolledStudents = uniqueStudents.map(id => new mongoose.Types.ObjectId(id));
        course.totalEnrolled = uniqueStudents.length;
        await course.save();
        courseFixCount++;
      }
    }
    console.log(`✅ Fixed ${courseFixCount} courses with duplicate enrollments`);

    // Fix users - ensure enrolledCourses array is consistent
    console.log('🔍 Checking user enrollments...');
    const users = await User.find({ role: 'student' });
    let userFixCount = 0;

    for (const user of users) {
      // Remove duplicate course entries
      const uniqueCourses = [...new Set(user.enrolledCourses.map(id => id.toString()))];
      if (uniqueCourses.length !== user.enrolledCourses.length) {
        console.log(`🔧 Fixing duplicates in user: ${user.name}`);
        user.enrolledCourses = uniqueCourses.map(id => new mongoose.Types.ObjectId(id));
        await user.save();
        userFixCount++;
      }
    }
    console.log(`✅ Fixed ${userFixCount} users with duplicate enrollments`);

    // Cross-reference consistency check
    console.log('🔍 Performing cross-reference consistency check...');
    let crossReferenceFixes = 0;

    // For each course, ensure all enrolled students have the course in their enrolledCourses
    for (const course of courses) {
      for (const studentId of course.enrolledStudents) {
        const student = await User.findById(studentId);
        if (student && !student.enrolledCourses.some(courseId => courseId.toString() === course._id.toString())) {
          console.log(`🔧 Adding course ${course.title} to user ${student.name}'s enrolled courses`);
          // Use findByIdAndUpdate to avoid version conflicts
          await User.findByIdAndUpdate(
            studentId,
            { $addToSet: { enrolledCourses: course._id } }
          );
          crossReferenceFixes++;
        }
      }
    }

    // For each user, ensure all enrolled courses have the user in their enrolledStudents
    for (const user of users) {
      for (const courseId of user.enrolledCourses) {
        const course = await Course.findById(courseId);
        if (course && !course.enrolledStudents.some(studentId => studentId.toString() === user._id.toString())) {
          console.log(`🔧 Adding user ${user.name} to course ${course.title}'s enrolled students`);
          // Use findByIdAndUpdate to avoid version conflicts
          await Course.findByIdAndUpdate(
            courseId,
            { $addToSet: { enrolledStudents: user._id } }
          );
          crossReferenceFixes++;
        }
      }
    }

    console.log(`✅ Made ${crossReferenceFixes} cross-reference fixes`);

    // Final statistics
    const totalCourses = await Course.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalEnrollments = await Course.aggregate([
      { $unwind: '$enrolledStudents' },
      { $count: 'total' }
    ]);

    console.log('\n📊 FINAL STATISTICS:');
    console.log(`📚 Total Courses: ${totalCourses}`);
    console.log(`👥 Total Students: ${totalStudents}`);
    console.log(`🎓 Total Enrollments: ${totalEnrollments[0]?.total || 0}`);

    console.log('\n✅ Data consistency fix completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing data consistency:', error);
    process.exit(1);
  }
};

// Run the script
fixDataConsistency();