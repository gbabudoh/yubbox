import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IIndustry extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  order: number; // For sorting/ordering
  createdAt: Date;
  updatedAt: Date;
}

const IndustrySchema: Schema<IIndustry> = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Industry name is required'],
      trim: true,
      unique: true,
      maxlength: [100, 'Industry name cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
IndustrySchema.index({ slug: 1 });
IndustrySchema.index({ isActive: 1 });
IndustrySchema.index({ order: 1 });

// Generate slug from name before saving
IndustrySchema.pre('save', function (next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

const Industry: Model<IIndustry> =
  mongoose.models.Industry || mongoose.model<IIndustry>('Industry', IndustrySchema);

export default Industry;

