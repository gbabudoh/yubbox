import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAd extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  imageUrl: string;
  webLink: string;
  ownerName: string;
  location: string;
  companyName: string;
  countries: string[]; // Array of country codes (e.g., ['US', 'GB', 'CA'])
  targetLocations?: string[]; // Legacy field for backward compatibility
  categoryId: mongoose.Types.ObjectId; // Reference to Category
  industryId: mongoose.Types.ObjectId; // Reference to Industry
  userId: mongoose.Types.ObjectId;
  isActive: boolean;
  isPaid: boolean; // Payment status
  paymentDate?: Date; // When payment was made
  expiryDate: Date; // Ad expires after 14 days from payment
  topLensExpiry?: Date;
  storiesExpiry?: Date;
  yubboxCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const AdSchema: Schema<IAd> = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
      trim: true,
      minlength: [50, 'Description must be at least 50 characters'],
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    imageUrl: {
      type: String,
      required: [true, 'Please provide an image URL'],
    },
    webLink: {
      type: String,
      required: [true, 'Please provide a web link'],
      trim: true,
    },
    ownerName: {
      type: String,
      required: [true, 'Please provide owner name'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Please provide location'],
      trim: true,
    },
    companyName: {
      type: String,
      required: [true, 'Please provide company name'],
      trim: true,
    },
    countries: {
      type: [String],
      required: [true, 'Please select at least one country'],
      default: [],
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Please select a category'],
    },
    industryId: {
      type: Schema.Types.ObjectId,
      ref: 'Industry',
      required: [true, 'Please select an industry'],
    },
        userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paymentDate: {
      type: Date,
      default: null,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    topLensExpiry: {
      type: Date,
      default: null,
    },
    storiesExpiry: {
      type: Date,
      default: null,
    },
    yubboxCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
AdSchema.index({ userId: 1 });
AdSchema.index({ isActive: 1 });
AdSchema.index({ isPaid: 1 });
AdSchema.index({ expiryDate: 1 });
AdSchema.index({ countries: 1 });
AdSchema.index({ categoryId: 1 });
AdSchema.index({ industryId: 1 });
AdSchema.index({ productTypeId: 1 });
AdSchema.index({ topLensExpiry: 1 });
AdSchema.index({ storiesExpiry: 1 });
AdSchema.index({ yubboxCount: -1 });

const Ad: Model<IAd> = mongoose.models.Ad || mongoose.model<IAd>('Ad', AdSchema);

export default Ad;

