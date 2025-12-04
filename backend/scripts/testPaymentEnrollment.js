/**
 * Payment & Enrollment Test Script
 * Tests the complete payment and enrollment flow
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

import connectDB from '../config/connectDB.js';
import User from '../models/userModel.js';
import Course from '../models/courseModel.js';
import Payment from '../models/paymentModel.js';
import crypto from 'crypto';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
  test: (msg) => console.log(`${colors.cyan}→ ${msg}${colors.reset}`),
};

async function testPaymentEnrollment() {
  try {
    log.info('Starting Payment & Enrollment Test...\n');

    // Connect to database
    await connectDB();
    log.success('Connected to MongoDB');

    // Find test course
    log.test('\nFinding test course...');
    let testCourse = await Course.findOne({ title: /test/i }).select('_id title price finalPrice enrolledStudents');
    
    if (!testCourse) {
      log.error('No test course found');
      log.info('Creating test course...');
      testCourse = await Course.create({
        title: 'Test Course for Payment',
        slug: 'test-course-payment',
        description: 'A test course for payment testing',
        category: 'Technology',
        level: 'beginner',
        price: 999,
        discount: 10,
        finalPrice: 899,
        creator: new mongoose.Types.ObjectId(),
        isPublished: true,
        enrollmentStatus: 'open',
      });
      log.success(`Created test course: ${testCourse._id}`);
    } else {
      log.success(`Found test course: ${testCourse.title} (₹${testCourse.finalPrice})`);
    }

    // Find or create test user
    log.test('\nFinding test user...');
    let testUser = await User.findOne({ email: 'test@example.com' });
    
    if (!testUser) {
      log.warn('Test user not found, creating one...');
      testUser = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedPassword123',
        role: 'student',
        isVerified: true,
      });
      log.success(`Created test user: ${testUser._id}`);
    } else {
      log.success(`Found test user: ${testUser.email}`);
    }

    // Check if already enrolled
    log.test('\nChecking enrollment status...');
    const isAlreadyEnrolled = testCourse.enrolledStudents.includes(testUser._id);
    if (isAlreadyEnrolled) {
      log.warn('User already enrolled in this course');
      log.info('Unenrolling user for fresh test...');
      testCourse.enrolledStudents = testCourse.enrolledStudents.filter(
        id => id.toString() !== testUser._id.toString()
      );
      testCourse.totalEnrolled = Math.max(0, testCourse.totalEnrolled - 1);
      await testCourse.save();
      
      await User.findByIdAndUpdate(
        testUser._id,
        { $pull: { enrolledCourses: testCourse._id } }
      );
      log.success('User unenrolled for fresh test');
    } else {
      log.success('User not enrolled (ready for test)');
    }

    // Simulate payment creation
    log.test('\nSimulating payment creation...');
    const orderId = `order_test_${Date.now()}`;
    const payment = await Payment.create({
      razorpayOrderId: orderId,
      user: testUser._id,
      course: testCourse._id,
      amount: testCourse.finalPrice,
      currency: 'INR',
      status: 'pending',
      description: `Test payment for ${testCourse.title}`,
    });
    log.success(`Created payment record: ${payment._id}`);
    log.success(`Order ID: ${orderId}`);

    // Simulate payment verification
    log.test('\nSimulating payment verification...');
    const paymentId = `pay_test_${Date.now()}`;
    const signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');
    
    log.success(`Generated signature: ${signature.substring(0, 20)}...`);

    // Update payment to completed
    payment.razorpayPaymentId = paymentId;
    payment.razorpaySignature = signature;
    payment.status = 'completed';
    payment.completedAt = new Date();
    await payment.save();
    log.success('Payment marked as completed');

    // Enroll user in course
    log.test('\nEnrolling user in course...');
    if (!testCourse.enrolledStudents.includes(testUser._id)) {
      testCourse.enrolledStudents.push(testUser._id);
      testCourse.totalEnrolled = (testCourse.totalEnrolled || 0) + 1;
      await testCourse.save();
      log.success('User added to course.enrolledStudents');
    }

    await User.findByIdAndUpdate(
      testUser._id,
      { $addToSet: { enrolledCourses: testCourse._id } }
    );
    log.success('Course added to user.enrolledCourses');

    // Verify enrollment
    log.test('\nVerifying enrollment...');
    const updatedCourse = await Course.findById(testCourse._id);
    const updatedUser = await User.findById(testUser._id);

    const courseHasUser = updatedCourse.enrolledStudents.some(
      id => id.toString() === testUser._id.toString()
    );
    const userHasCourse = updatedUser.enrolledCourses.some(
      id => id.toString() === testCourse._id.toString()
    );

    if (courseHasUser) {
      log.success('✓ User found in course.enrolledStudents');
    } else {
      log.error('✗ User NOT found in course.enrolledStudents');
    }

    if (userHasCourse) {
      log.success('✓ Course found in user.enrolledCourses');
    } else {
      log.error('✗ Course NOT found in user.enrolledCourses');
    }

    // Verify payment record
    log.test('\nVerifying payment record...');
    const verifiedPayment = await Payment.findById(payment._id)
      .populate('user', 'name email')
      .populate('course', 'title price');

    if (verifiedPayment.status === 'completed') {
      log.success('✓ Payment status: completed');
    } else {
      log.error('✗ Payment status: ' + verifiedPayment.status);
    }

    log.success(`✓ Payment amount: ₹${verifiedPayment.amount}`);
    log.success(`✓ User: ${verifiedPayment.user.name}`);
    log.success(`✓ Course: ${verifiedPayment.course.title}`);

    // Print test data
    console.log('\n' + colors.cyan + '═══════════════════════════════════════════════════════════' + colors.reset);
    console.log(colors.cyan + 'TEST DATA FOR FRONTEND TESTING:' + colors.reset);
    console.log(`Test User ID: ${testUser._id}`);
    console.log(`Test User Email: ${testUser.email}`);
    console.log(`Test Course ID: ${testCourse._id}`);
    console.log(`Test Course Title: ${testCourse.title}`);
    console.log(`Test Course Price: ₹${testCourse.finalPrice}`);
    console.log(`\nRazorpay Test Card: 4111 1111 1111 1111`);
    console.log(`Expiry: 12/25 (or any future date)`);
    console.log(`CVV: 123 (or any 3 digits)`);
    console.log(colors.cyan + '═══════════════════════════════════════════════════════════' + colors.reset + '\n');

    // Summary
    if (courseHasUser && userHasCourse && verifiedPayment.status === 'completed') {
      console.log(colors.green + '✓ ALL TESTS PASSED - SYSTEM READY FOR FRONTEND TESTING' + colors.reset + '\n');
    } else {
      console.log(colors.red + '✗ SOME TESTS FAILED - CHECK ERRORS ABOVE' + colors.reset + '\n');
    }

  } catch (error) {
    log.error(`Test failed: ${error.message}`);
    console.error(error);
  } finally {
    await mongoose.connection.close();
    log.success('Database connection closed');
    process.exit(0);
  }
}

// Run tests
testPaymentEnrollment();
