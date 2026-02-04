import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProductType extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  type: 'service' | 'physical'; // Service product or Physical product
  description?: string;
  isActive: boolean;
  order: number; // For sorting/ordering
  createdAt: Date;
  updatedAt: Date;
}

const ProductTypeSchema: Schema<IProductType> = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Product type name is required'],
      trim: true,
      unique: true,
      maxlength: [100, 'Product type name cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['service', 'physical'],
      required: [true, 'Product type (service/physical) is required'],
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
ProductTypeSchema.index({ slug: 1 });
ProductTypeSchema.index({ type: 1 });
ProductTypeSchema.index({ isActive: 1 });
ProductTypeSchema.index({ order: 1 });

// Generate slug from name before saving
ProductTypeSchema.pre('save', function (next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

const ProductType: Model<IProductType> =
  mongoose.models.ProductType || mongoose.model<IProductType>('ProductType', ProductTypeSchema);

export default ProductType;

