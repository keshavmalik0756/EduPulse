/**
 * Check Course Details Script
 * Checks specific course details for debugging
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

import connectDB from '../config/connectDB.js';
import Course from '../models/courseModel.js';
import User from '../models/userModel.js';

async function checkCourseDetails() {
  try {
    console.log('Connecting to MongoDB...\n');
    await connectDB();
    console.log('✓ Connected\n');

    // Check the specific course
    const courseId = '690b448be5b49d9b82151551';
    console.log(`Checking course: ${courseId}\n`);

    const course = await Course.findById(courseId);
    
    if (!course) {
      console.log('✗ Course not found');
      process.exit(1);
    }

    console.log('Course Details:');
    console.log(`  Title: ${course.title}`);
    console.log(`  Price: ₹${course.price}`);
    console.log(`  Discount: ${course.discount}%`);
    console.log(`  Final Price: ₹${course.finalPrice}`);
    console.log(`  Status: ${course.enrollmentStatus}`);
    console.log(`  Published: ${course.isPublished}`);
    console.log(`  Total Enrolled: ${course.totalEnrolled}`);
    console.log(`  Enrolled Students: ${course.enrolledStudents.length}\n`);

    // Check if finalPrice is valid for payment
    if (course.finalPrice === 0) {
      console.log('⚠ WARNING: Course is free (finalPrice = 0)');
      console.log('  Free courses should use direct enrollment, not payment\n');
    } else if (course.finalPrice === undefined || course.finalPrice === null) {
      console.log('✗ ERROR: finalPrice is undefined or null');
      console.log('  This will cause payment creation to fail\n');
    } else {
      console.log(`✓ Course has valid price: ₹${course.finalPrice}\n`);
    }

    // Check Razorpay credentials
    console.log('Razorpay Configuration:');
    console.log(`  Key ID: ${process.env.RAZORPAY_KEY_ID ? '✓ Set' : '✗ Not set'}`);
    console.log(`  Key Secret: ${process.env.RAZORPAY_KEY_SECRET ? '✓ Set' : '✗ Not set'}\n`);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

checkCourseDetails();
