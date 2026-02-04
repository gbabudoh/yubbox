import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAnalytics extends Document {
  _id: mongoose.Types.ObjectId;
  adId: mongoose.Types.ObjectId;
  eventType: 'view' | 'click' | 'impression';
  country?: string;
  ipAddress?: string;
  userAgent?: string;
  referrer?: string;
  timestamp: Date;
  userId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AnalyticsSchema: Schema<IAnalytics> = new Schema(
  {
    adId: {
      type: Schema.Types.ObjectId,
      ref: 'Ad',
      required: true,
      index: true,
    },
    eventType: {
      type: String,
      enum: ['view', 'click', 'impression'],
      required: true,
    },
    country: {
      type: String,
      default: null,
    },
    ipAddress: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
    referrer: {
      type: String,
      default: null,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for analytics queries
AnalyticsSchema.index({ adId: 1, eventType: 1 });
AnalyticsSchema.index({ adId: 1, timestamp: -1 });
AnalyticsSchema.index({ adId: 1, country: 1 });

const Analytics: Model<IAnalytics> =
  mongoose.models.Analytics ||
  mongoose.model<IAnalytics>('Analytics', AnalyticsSchema);

export default Analytics;

