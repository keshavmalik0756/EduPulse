/**
 * ========================================
 * 🧹 CLEANUP BAD SECTIONS SCRIPT
 * ========================================
 * Removes sections with null or invalid courseId
 * This fixes the E11000 duplicate key error
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Import models
import Section from "../models/sectionModel.js";
import connectDB from "../config/connectDB.js";

const cleanupBadSections = async () => {
  try {
    console.log("🔗 Connecting to MongoDB...");
    await connectDB();

    console.log("🔍 Finding sections with null or invalid courseId...");
    
    // Find all sections with null course
    const badSections = await Section.find({
      $or: [
        { course: null },
        { course: undefined },
        { course: { $exists: false } }
      ]
    });

    console.log(`Found ${badSections.length} bad sections`);

    if (badSections.length > 0) {
      console.log("📋 Bad sections:");
      badSections.forEach((section) => {
        console.log(`  - ID: ${section._id}, Title: ${section.title}, Course: ${section.course}`);
      });

      // Delete bad sections
      const result = await Section.deleteMany({
        $or: [
          { course: null },
          { course: undefined },
          { course: { $exists: false } }
        ]
      });

      console.log(`✅ Deleted ${result.deletedCount} bad sections`);
    } else {
      console.log("✅ No bad sections found");
    }

    // Also check for duplicate index issues
    console.log("\n🔍 Checking for duplicate sections with same title and course...");
    const duplicates = await Section.aggregate([
      {
        $group: {
          _id: { course: "$course", title: "$title" },
          count: { $sum: 1 },
          ids: { $push: "$_id" }
        }
      },
      {
        $match: { count: { $gt: 1 } }
      }
    ]);

    if (duplicates.length > 0) {
      console.log(`Found ${duplicates.length} duplicate groups:`);
      for (const dup of duplicates) {
        console.log(`  - Course: ${dup._id.course}, Title: ${dup._id.title}, Count: ${dup.count}`);
        console.log(`    IDs: ${dup.ids.join(", ")}`);
        
        // Keep the first one, delete the rest
        const idsToDelete = dup.ids.slice(1);
        const deleteResult = await Section.deleteMany({ _id: { $in: idsToDelete } });
        console.log(`    ✅ Deleted ${deleteResult.deletedCount} duplicate(s)`);
      }
    } else {
      console.log("✅ No duplicate sections found");
    }

    console.log("\n✅ Cleanup completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during cleanup:", error);
    process.exit(1);
  }
};

cleanupBadSections();
