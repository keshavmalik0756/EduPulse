/**
 * ========================================
 * 🔧 REBUILD SECTION INDEXES SCRIPT
 * ========================================
 * Drops and recreates all indexes on the sections collection
 * This fixes index naming mismatches
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

const rebuildIndexes = async () => {
  try {
    console.log("🔗 Connecting to MongoDB...");
    await connectDB();

    console.log("📋 Current indexes on sections collection:");
    const currentIndexes = await Section.collection.getIndexes();
    console.log(JSON.stringify(currentIndexes, null, 2));

    console.log("\n🔧 Dropping all indexes (except _id)...");
    try {
      await Section.collection.dropIndexes();
      console.log("✅ Indexes dropped");
    } catch (err) {
      console.log("⚠️ Error dropping indexes (may be normal):", err.message);
    }

    console.log("\n🔨 Rebuilding indexes from schema...");
    try {
      // Use syncIndexes to rebuild indexes properly
      await Section.syncIndexes();
      console.log("✅ Indexes rebuilt");
    } catch (err) {
      console.log("⚠️ Error rebuilding indexes:", err.message);
    }

    console.log("\n📋 New indexes on sections collection:");
    const newIndexes = await Section.collection.getIndexes();
    console.log(JSON.stringify(newIndexes, null, 2));

    console.log("\n✅ Index rebuild completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during index rebuild:", error);
    process.exit(1);
  }
};

rebuildIndexes();
