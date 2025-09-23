import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true },
    courseId: { type: String, required: true },
    completion: { type: Number, min: 0, max: 100, default: 0 },
    lastAccessedModuleId: { type: String },
    quizScores: [
      {
        moduleId: String,
        score: Number,
        takenAt: Date,
      },
    ],
  },
  { timestamps: true }
);

progressSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

export const ProgressSnapshot = mongoose.models.ProgressSnapshot ||
  mongoose.model('ProgressSnapshot', progressSchema);
