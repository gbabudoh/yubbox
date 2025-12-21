import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBannerAd extends Document {
  title: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
  cost: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  displayOrder: number;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BannerAdSchema: Schema<IBannerAd> = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    imageUrl: {
      type: String,
      required: [true, 'Please provide an image URL'],
    },
    linkUrl: {
      type: String,
      required: [true, 'Please provide a link URL'],
      trim: true,
    },
    cost: {
      type: Number,
      required: [true, 'Please provide a cost'],
      min: [0, 'Cost cannot be negative'],
    },
    startDate: {
      type: Date,
      required: [true, 'Please provide a start date'],
    },
    endDate: {
      type: Date,
      required: [true, 'Please provide an end date'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

BannerAdSchema.index({ isActive: 1 });
BannerAdSchema.index({ startDate: 1, endDate: 1 });
BannerAdSchema.index({ displayOrder: 1 });

const BannerAd: Model<IBannerAd> = mongoose.models.BannerAd || mongoose.model<IBannerAd>('BannerAd', BannerAdSchema);

export default BannerAd;
