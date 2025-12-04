import Confusion from "../models/confusionModel.js";
import Lecture from "../models/lectureModel.js";
import Course from "../models/courseModel.js";
import mongoose from "mongoose";

// Get confusion data for a specific lecture
export const getLectureConfusionData = async (req, res) => {
  try {
    const { lectureId } = req.params;
    
    // Validate lecture ID
    if (!mongoose.Types.ObjectId.isValid(lectureId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid lecture ID"
      });
    }
    
    // Check if lecture exists
    const lecture = await Lecture.findById(lectureId);
    if (!lecture) {
      return res.status(404).json({
        success: false,
        message: "Lecture not found"
      });
    }
    
    // Get confusion data for this lecture, sorted by timestamp
    const confusionData = await Confusion.find({ lecture: lectureId })
      .sort({ timestamp: 1 })
      .populate("studentInteractions.student", "name email");
    
    res.status(200).json({
      success: true,
      data: confusionData,
      lecture: {
        id: lecture._id,
        title: lecture.title,
        duration: lecture.duration
      }
    });
  } catch (error) {
    console.error("Error fetching lecture confusion data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch confusion data",
      error: error.message
    });
  }
};

// Get confusion data for a specific course
export const getCourseConfusionData = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    // Validate course ID
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID"
      });
    }
    
    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }
    
    // Get top confusion points for this course, sorted by confusion score
    const confusionData = await Confusion.find({ course: courseId })
      .sort({ confusionScore: -1 })
      .limit(20)
      .populate("lecture", "title")
      .populate("studentInteractions.student", "name email");
    
    res.status(200).json({
      success: true,
      data: confusionData,
      course: {
        id: course._id,
        title: course.title
      }
    });
  } catch (error) {
    console.error("Error fetching course confusion data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch confusion data",
      error: error.message
    });
  }
};

// Record student interaction that indicates confusion
export const recordConfusionInteraction = async (req, res) => {
  try {
    const { lectureId, timestamp, interactionType } = req.body;
    const userId = req.user._id;
    
    // Validate inputs
    if (!lectureId || timestamp === undefined || !interactionType) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: lectureId, timestamp, interactionType"
      });
    }
    
    // Validate lecture ID
    if (!mongoose.Types.ObjectId.isValid(lectureId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid lecture ID"
      });
    }
    
    // Validate timestamp
    if (timestamp < 0) {
      return res.status(400).json({
        success: false,
        message: "Timestamp must be a positive number"
      });
    }
    
    // Validate interaction type
    const validInteractionTypes = ["replay", "skip", "pause", "rewind"];
    if (!validInteractionTypes.includes(interactionType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid interaction type"
      });
    }
    
    // Check if lecture exists
    const lecture = await Lecture.findById(lectureId);
    if (!lecture) {
      return res.status(404).json({
        success: false,
        message: "Lecture not found"
      });
    }
    
    // Atomic upsert
    const timeWindow = 10;
    const query = {
      lecture: lectureId,
      timestamp: { $gte: timestamp - timeWindow, $lte: timestamp + timeWindow }
    };
    const update = {
      $inc: { [`${interactionType}Count`]: 1 },
      $push: { studentInteractions: { student: userId, interactionType, timestamp: new Date() } },
      $setOnInsert: { lecture: lectureId, course: lecture.courseId, timestamp }
    };
    const opts = { new: true, upsert: true };

    let confusion = await Confusion.findOneAndUpdate(query, update, opts);

    // update running sums for average watch time (better to store watchTimeSum/watchTimeCount)
    confusion.watchTimeSum = (confusion.watchTimeSum || confusion.averageWatchTime * (confusion.watchTimeCount || 0)) + timestamp;
    confusion.watchTimeCount = (confusion.watchTimeCount || 0) + 1;
    confusion.averageWatchTime = Math.round(confusion.watchTimeSum / confusion.watchTimeCount);

    confusion.calculateConfusionScore();
    await confusion.save();
    
    res.status(200).json({
      success: true,
      message: "Confusion interaction recorded",
      data: confusion
    });
  } catch (error) {
    console.error("Error recording confusion interaction:", error);
    res.status(500).json({
      success: false,
      message: "Failed to record confusion interaction",
      error: error.message
    });
  }
};

// Get confusion summary for a course
export const getCourseConfusionSummary = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    // Validate course ID
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID"
      });
    }
    
    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }
    
    // Aggregate confusion data for the course
    const confusionStats = await Confusion.aggregate([
      { $match: { course: new mongoose.Types.ObjectId(courseId) } },
      {        $group: {
          _id: null,
          totalConfusionPoints: { $sum: 1 },
          averageConfusionScore: { $avg: "$confusionScore" },
          maxConfusionScore: { $max: "$confusionScore" },
          minConfusionScore: { $min: "$confusionScore" },
          totalReplays: { $sum: "$replayCount" },
          totalSkips: { $sum: "$skipCount" },
          totalPauses: { $sum: "$pauseCount" }
        }
      }
    ]);
    
    // Get top 5 confusion points
    const topConfusionPoints = await Confusion.find({ course: courseId })
      .sort({ confusionScore: -1 })
      .limit(5)
      .populate("lecture", "title");
    
    res.status(200).json({
      success: true,
      data: {
        stats: confusionStats[0] || {},
        topConfusionPoints
      },
      course: {
        id: course._id,
        title: course.title
      }
    });
  } catch (error) {
    console.error("Error fetching course confusion summary:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch confusion summary",
      error: error.message
    });
  }
};

// Get confusion timeline for a lecture (for UI heatmap)
export const getLectureConfusionTimeline = async (req, res) => {
  try {
    const { lectureId } = req.params;
    const { windowSeconds = 10, start = 0, end } = req.query;
    
    // Validate lecture ID
    if (!mongoose.Types.ObjectId.isValid(lectureId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid lecture ID"
      });
    }
    
    // Check if lecture exists
    const lecture = await Lecture.findById(lectureId);
    if (!lecture) {
      return res.status(404).json({
        success: false,
        message: "Lecture not found"
      });
    }
    
    // Build query for confusion data within the specified time range
    const query = { 
      lecture: lectureId,
      timestamp: { 
        $gte: parseInt(start),
        ...(end && { $lte: parseInt(end) })
      }
    };
    
    // Get confusion data for this lecture, sorted by timestamp
    const confusionData = await Confusion.find(query)
      .sort({ timestamp: 1 });
    
    // Group data into time buckets for the heatmap
    const bucketSize = parseInt(windowSeconds);
    const timeline = [];
    
    // Create buckets
    const startTime = parseInt(start);
    const endTime = end ? parseInt(end) : lecture.duration || 0;
    
    if (endTime > 0) {
      for (let time = startTime; time <= endTime; time += bucketSize) {
        const bucketEnd = Math.min(time + bucketSize, endTime);
        
        // Find confusion points in this bucket
        const bucketPoints = confusionData.filter(point => 
          point.timestamp >= time && point.timestamp < bucketEnd
        );
        
        if (bucketPoints.length > 0) {
          // Calculate aggregate metrics for this bucket
          const bucketData = {
            timestamp: time,
            confusionScore: Math.round(bucketPoints.reduce((sum, point) => sum + point.confusionScore, 0) / bucketPoints.length),
            replayCount: bucketPoints.reduce((sum, point) => sum + (point.replayCount || 0), 0),
            skipCount: bucketPoints.reduce((sum, point) => sum + (point.skipCount || 0), 0),
            pauseCount: bucketPoints.reduce((sum, point) => sum + (point.pauseCount || 0), 0),
            studentCount: new Set(bucketPoints.flatMap(point => 
              point.studentInteractions.map(interaction => interaction.student.toString())
            )).size
          };
          
          timeline.push(bucketData);
        } else {
          // Add empty bucket
          timeline.push({
            timestamp: time,
            confusionScore: 0,
            replayCount: 0,
            skipCount: 0,
            pauseCount: 0,
            studentCount: 0
          });
        }
      }
    }
    
    res.status(200).json({
      success: true,
      data: timeline,
      lecture: {
        id: lecture._id,
        title: lecture.title,
        duration: lecture.duration
      }
    });
  } catch (error) {
    console.error("Error fetching lecture confusion timeline:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch confusion timeline",
      error: error.message
    });
  }
};

// Update confusion data (for manual adjustments)
export const updateConfusionData = async (req, res) => {
  try {
    const { confusionId } = req.params;
    const updateData = req.body;
    
    // Validate confusion ID
    if (!mongoose.Types.ObjectId.isValid(confusionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid confusion ID"
      });
    }
    
    // Remove fields that shouldn't be updated manually
    delete updateData.lecture;
    delete updateData.course;
    delete updateData.timestamp;
    delete updateData.confusionScore;
    delete updateData.createdAt;
    delete updateData.updatedAt;
    
    // Update confusion record
    const updatedConfusion = await Confusion.findByIdAndUpdate(
      confusionId,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedConfusion) {
      return res.status(404).json({
        success: false,
        message: "Confusion record not found"
      });
    }
    
    // Recalculate confusion score
    updatedConfusion.calculateConfusionScore();
    await updatedConfusion.save();
    
    res.status(200).json({
      success: true,
      message: "Confusion data updated successfully",
      data: updatedConfusion
    });
  } catch (error) {
    console.error("Error updating confusion data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update confusion data",
      error: error.message
    });
  }
};

// Get detailed confusion analysis for a lecture
export const getLectureConfusionAnalysis = async (req, res) => {
  try {
    const { lectureId } = req.params;
    
    // Validate lecture ID
    if (!mongoose.Types.ObjectId.isValid(lectureId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid lecture ID"
      });
    }
    
    // Check if lecture exists
    const lecture = await Lecture.findById(lectureId);
    if (!lecture) {
      return res.status(404).json({
        success: false,
        message: "Lecture not found"
      });
    }
    
    // Get all confusion data for this lecture
    const confusionData = await Confusion.find({ lecture: lectureId })
      .sort({ timestamp: 1 })
      .populate("studentInteractions.student", "name email");
    
    // Calculate detailed metrics
    const totalPoints = confusionData.length;
    const avgConfusionScore = confusionData.reduce((sum, point) => sum + point.confusionScore, 0) / (totalPoints || 1);
    
    // Interaction type breakdown
    const interactionBreakdown = {
      replays: confusionData.reduce((sum, point) => sum + (point.replayCount || 0), 0),
      skips: confusionData.reduce((sum, point) => sum + (point.skipCount || 0), 0),
      pauses: confusionData.reduce((sum, point) => sum + (point.pauseCount || 0), 0)
    };
    
    // High confusion segments (>70% confusion score)
    const highConfusionSegments = confusionData.filter(point => point.confusionScore > 70);
    
    // Student engagement analysis
    const studentInteractions = {};
    confusionData.forEach(point => {
      point.studentInteractions.forEach(interaction => {
        const studentId = interaction.student._id.toString();
        if (!studentInteractions[studentId]) {
          studentInteractions[studentId] = {
            student: interaction.student,
            interactions: 0,
            confusionPoints: 0
          };
        }
        studentInteractions[studentId].interactions++;
        studentInteractions[studentId].confusionPoints += point.confusionScore;
      });
    });
    
    // Top confused students
    const topConfusedStudents = Object.values(studentInteractions)
      .sort((a, b) => b.confusionPoints - a.confusionPoints)
      .slice(0, 5);
    
    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalPoints,
          avgConfusionScore: Math.round(avgConfusionScore * 100) / 100,
          highConfusionSegments: highConfusionSegments.length,
          interactionBreakdown
        },
        highConfusionPoints: highConfusionSegments.map(point => ({
          timestamp: point.timestamp,
          confusionScore: point.confusionScore,
          replayCount: point.replayCount,
          skipCount: point.skipCount,
          pauseCount: point.pauseCount
        })),
        topConfusedStudents: topConfusedStudents.map(student => ({
          student: student.student,
          interactions: student.interactions,
          avgConfusionScore: Math.round((student.confusionPoints / student.interactions) * 100) / 100
        }))
      },
      lecture: {
        id: lecture._id,
        title: lecture.title,
        duration: lecture.duration
      }
    });
  } catch (error) {
    console.error("Error fetching lecture confusion analysis:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch detailed confusion analysis",
      error: error.message
    });
  }
};

// Get confusion trend over time for a course
export const getConfusionTrend = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { days = 30 } = req.query;
    
    // Validate course ID
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID"
      });
    }
    
    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }
    
    // Get lectures for this course
    const lectures = await Lecture.find({ courseId: courseId });
    const lectureIds = lectures.map(lecture => lecture._id);
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    // Aggregate confusion data by day
    const confusionTrend = await Confusion.aggregate([
      {
        $match: {
          lecture: { $in: lectureIds.map(id => new mongoose.Types.ObjectId(id)) },
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt"
            }
          },
          confusionPoints: { $sum: 1 },
          avgConfusionScore: { $avg: "$confusionScore" },
          totalReplays: { $sum: "$replayCount" },
          totalSkips: { $sum: "$skipCount" },
          totalPauses: { $sum: "$pauseCount" }
        }
      },
      {
        $sort: { "_id": 1 }
      }
    ]);
    
    // Format the results
    const formattedTrend = confusionTrend.map(day => ({
      date: day._id,
      confusionPoints: day.confusionPoints,
      avgConfusionScore: Math.round(day.avgConfusionScore * 100) / 100,
      totalReplays: day.totalReplays,
      totalSkips: day.totalSkips,
      totalPauses: day.totalPauses
    }));
    
    res.status(200).json({
      success: true,
      data: formattedTrend,
      course: {
        id: course._id,
        title: course.title
      },
      period: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        days: parseInt(days)
      }
    });
  } catch (error) {
    console.error("Error fetching confusion trend:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch confusion trend",
      error: error.message
    });
  }
};

// Get recommendations for improving confusing content
export const getRecommendations = async (req, res) => {
  try {
    const { lectureId } = req.params;
    
    // Validate lecture ID
    if (!mongoose.Types.ObjectId.isValid(lectureId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid lecture ID"
      });
    }
    
    // Check if lecture exists
    const lecture = await Lecture.findById(lectureId);
    if (!lecture) {
      return res.status(404).json({
        success: false,
        message: "Lecture not found"
      });
    }
    
    // Get all confusion data for this lecture
    const confusionData = await Confusion.find({ lecture: lectureId });
    
    const recommendations = [];
    
    if (confusionData.length === 0) {
      return res.status(200).json({
        success: true,
        data: [{
          type: "info",
          priority: "low",
          message: "No confusion data available yet",
          action: "Wait for students to interact with this lecture"
        }],
        lecture: {
          id: lecture._id,
          title: lecture.title
        }
      });
    }
    
    // Calculate metrics
    const totalPoints = confusionData.length;
    const avgConfusionScore = confusionData.reduce((sum, point) => sum + point.confusionScore, 0) / totalPoints;
    
    // High overall confusion
    if (avgConfusionScore > 60) {
      recommendations.push({
        type: "content",
        priority: "high",
        message: "This lecture has high overall confusion. Consider breaking it into smaller segments.",
        action: "Review lecture structure and simplify complex concepts"
      });
    }
    
    // High replay count indicates difficult content
    const highReplayPoints = confusionData.filter(p => (p.replayCount || 0) > 5);
    if (highReplayPoints.length > 0) {
      recommendations.push({
        type: "content",
        priority: "medium",
        message: `Found ${highReplayPoints.length} sections with high replay counts.`,
        action: "Add supplementary examples or visual aids to these sections"
      });
    }
    
    // High skip rate indicates boring or irrelevant content
    const highSkipPoints = confusionData.filter(p => (p.skipCount || 0) > 3);
    if (highSkipPoints.length > 0) {
      recommendations.push({
        type: "engagement",
        priority: "medium",
        message: `Found ${highSkipPoints.length} sections with high skip rates.`,
        action: "Review content relevance and add interactive elements"
      });
    }
    
    // High pause rate indicates difficult content
    const highPausePoints = confusionData.filter(p => (p.pauseCount || 0) > 4);
    if (highPausePoints.length > 0) {
      recommendations.push({
        type: "content",
        priority: "medium",
        message: `Found ${highPausePoints.length} sections with high pause rates.`,
        action: "Add checkpoints or knowledge checks in these sections"
      });
    }
    
    // Low confusion - positive feedback
    if (avgConfusionScore < 30 && totalPoints > 5) {
      recommendations.push({
        type: "success",
        priority: "low",
        message: "Great job! This lecture has low confusion scores.",
        action: "Consider using this as a template for other lectures"
      });
    }
    
    res.status(200).json({
      success: true,
      data: recommendations.length > 0 ? recommendations : [{
        type: "info",
        priority: "low",
        message: "No specific recommendations at this time",
        action: "Continue monitoring student interactions"
      }],
      lecture: {
        id: lecture._id,
        title: lecture.title
      }
    });
  } catch (error) {
    console.error("Error generating recommendations:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate recommendations",
      error: error.message
    });
  }
};