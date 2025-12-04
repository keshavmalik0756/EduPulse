/**
 * Fix Courses Pricing Script
 * Ensures all courses have proper finalPrice set
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
import Section from '../models/sectionModel.js';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
};

async function fixCoursesPricing() {
  try {
    log.info('Starting course pricing fix...\n');

    // Connect to database
    await connectDB();
    log.success('Connected to MongoDB');

    // Find all courses
    const courses = await Course.find({});
    log.info(`Found ${courses.length} courses\n`);

    let fixedCount = 0;
    let errorCount = 0;

    // Fix each course
    for (const course of courses) {
      try {
        let needsUpdate = false;
        let reason = '';

        // Check if finalPrice is missing or invalid
        if (course.finalPrice === undefined || course.finalPrice === null) {
          needsUpdate = true;
          reason = 'finalPrice is undefined/null';
        }

        // Check if price is set but finalPrice is not calculated
        if (course.price > 0 && !course.finalPrice) {
          needsUpdate = true;
          reason = 'price set but finalPrice not calculated';
        }

        if (needsUpdate) {
          // Calculate finalPrice
          let newFinalPrice;
          if (course.price === 0) {
            newFinalPrice = 0;
          } else if (course.discount > 0) {
            newFinalPrice = Math.round(
              course.price - (course.price * course.discount) / 100
            );
          } else {
            newFinalPrice = course.price;
          }

          // Update course
          course.finalPrice = newFinalPrice;
          await course.save();

          log.success(
            `Fixed: ${course.title} (${reason}) - finalPrice: ₹${newFinalPrice}`
          );
          fixedCount++;
        } else {
          log.info(`OK: ${course.title} - finalPrice: ₹${course.finalPrice}`);
        }
      } catch (error) {
        log.error(`Error fixing course ${course.title}: ${error.message}`);
        errorCount++;
      }
    }

    console.log('\n' + colors.green + '═══════════════════════════════════════════════════════════' + colors.reset);
    log.success(`Fixed ${fixedCount} courses`);
    if (errorCount > 0) {
      log.error(`${errorCount} courses had errors`);
    }
    console.log(colors.green + '═══════════════════════════════════════════════════════════' + colors.reset + '\n');

  } catch (error) {
    log.error(`Script failed: ${error.message}`);
    console.error(error);
  } finally {
    await mongoose.connection.close();
    log.success('Database connection closed');
    process.exit(0);
  }
}

// Run script
fixCoursesPricing();
