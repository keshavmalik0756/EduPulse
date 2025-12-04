// Test script to verify enrollment functionality
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from '../models/courseModel.js';
import User from '../models/userModel.js';

dotenv.config();

const testEnrollment = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Find a sample student and course
    const student = await User.findOne({ role: 'student' });
    const course = await Course.findOne({ isPublished: true });

    if (!student) {
      console.log('❌ No student found');
      process.exit(1);
    }

    if (!course) {
      console.log('❌ No published course found');
      process.exit(1);
    }

    console.log(`\n📝 Testing with:`);
    console.log(`Student: ${student.name} (${student.email})`);
    console.log(`Course: ${course.title}`);

    // Check current enrollment status
    const isEnrolledInCourse = course.enrolledStudents.includes(student._id);
    const isCourseInUser = student.enrolledCourses.includes(course._id);

    console.log(`\n📊 Current Status:`);
    console.log(`Course has student: ${isEnrolledInCourse}`);
    console.log(`User has course: ${isCourseInUser}`);

    // Test enrollment
    console.log(`\n🚀 Testing enrollment...`);
    
    // Add student to course if not already enrolled
    if (!isEnrolledInCourse) {
      course.enrolledStudents.push(student._id);
      course.totalEnrolled += 1;
      await course.save();
      console.log('✅ Added student to course enrolledStudents array');
    }

    // Add course to student if not already there
    if (!isCourseInUser) {
      student.enrolledCourses.push(course._id);
      await student.save();
      console.log('✅ Added course to student enrolledCourses array');
    }

    // Verify consistency
    const updatedCourse = await Course.findById(course._id);
    const updatedStudent = await User.findById(student._id);

    const isNowEnrolledInCourse = updatedCourse.enrolledStudents.includes(student._id);
    const isNowCourseInUser = updatedStudent.enrolledCourses.includes(course._id);

    console.log(`\n✅ Final Status:`);
    console.log(`Course has student: ${isNowEnrolledInCourse}`);
    console.log(`User has course: ${isNowCourseInUser}`);

    if (isNowEnrolledInCourse && isNowCourseInUser) {
      console.log('\n🎉 Enrollment system is working correctly!');
    } else {
      console.log('\n❌ Enrollment system has issues!');
    }

    console.log('\n✅ Test completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error testing enrollment:', error);
    process.exit(1);
  }
};

// Run the test
testEnrollment();