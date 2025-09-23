import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true },
    courseId: { type: String, required: true },
    completedLessons: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.models.Progress || mongoose.model('Progress', progressSchema);
