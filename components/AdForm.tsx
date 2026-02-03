'use client';

import React, { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Input from './ui/Input';
import Button from './ui/Button';
import CountrySelector from './CountrySelector';
import { useI18n } from '@/lib/i18n-context';
import { IAd } from '@/types/models';
import { publicService, PublicCategory, PublicIndustry } from '@/services/publicService';

interface AdFormProps {
  initialData?: IAd;
  onSubmit: (data: FormData) => Promise<void>;
}

interface FormDataType {
  title: string;
  description: string;
  imageUrl: string;
  imageFile: File | null;
  webLink: string;
  countries: string[];
  type: 'product' | 'service' | '';
  productCategoryId: string;
  serviceCategoryId: string;
  industryId: string;
  ownerName: string;
  location: string;
  companyName: string;
}

const AdForm: React.FC<AdFormProps> = ({ initialData, onSubmit }) => {
  const router = useRouter();
  const { t } = useI18n();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<FormDataType>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    imageUrl: initialData?.imageUrl || '',
    imageFile: null as File | null,
    webLink: initialData?.webLink || '',
    countries: (initialData?.countries || initialData?.targetLocations || []) as string[],
    type: (initialData?.categoryId as unknown as PublicCategory)?.type || '',
    productCategoryId: initialData?.categoryId ? String(initialData.categoryId) : '',
    serviceCategoryId: '',
    industryId: initialData?.industryId ? String(initialData.industryId) : '',
    ownerName: initialData?.ownerName || '',
    location: initialData?.location || '',
    companyName: initialData?.companyName || '',
  });
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.imageUrl || null
  );
  const [isUploading, setIsUploading] = useState(false);
  const [categories, setCategories] = useState<PublicCategory[]>([]);
  const [industries, setIndustries] = useState<PublicIndustry[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [cats, inds] = await Promise.all([
          publicService.getCategories(),
          publicService.getIndustries(),
        ]);
        setCategories(cats);
        setIndustries(inds);
      } catch (error) {
        console.error('Failed to load options:', error);
      } finally {
        setLoadingOptions(false);
      }
    };
    loadOptions();
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    // Validation
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) {
      newErrors.title = t('validation.titleRequired');
    }
    if (!formData.description.trim()) {
      newErrors.description = t('validation.descriptionRequired');
    } else if (formData.description.trim().length < 50) {
      newErrors.description = t('validation.descriptionMinLength') || 'Description must be at least 50 characters';
    } else if (formData.description.trim().length > 500) {
      newErrors.description = t('validation.descriptionMaxLength') || 'Description cannot exceed 500 characters';
    }
    if (!formData.imageFile && !formData.imageUrl) {
      newErrors.image = t('ad.pleaseUploadImage');
    }
    if (!formData.webLink.trim()) {
      newErrors.webLink = t('validation.webLinkRequired');
    }
    if (!formData.ownerName.trim()) {
      newErrors.ownerName = 'Owner name is required';
    }
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }
        if (formData.countries.length === 0) {
          newErrors.countries = t('validation.selectAtLeastOneCountry');
        }
        // Validate type is selected
        if (!formData.type) {
          newErrors.type = 'Type is required';
        }
        // Validate either product or service option is selected
        if (!formData.productCategoryId && !formData.serviceCategoryId) {
          newErrors.category = 'Please select either a product option or a service option';
        }
        if (!formData.industryId) {
          newErrors.industryId = t('validation.industryRequired') || 'Industry is required';
        }

        if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      let finalImageUrl = formData.imageUrl;

      // Upload image if a new file was selected
      if (formData.imageFile) {
        setIsUploading(true);
        const uploadFormData = new FormData();
        uploadFormData.append('image', formData.imageFile);

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData,
        });

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(errorData.error || t('errors.uploadError'));
        }

        const uploadData = await uploadResponse.json();
        finalImageUrl = uploadData.data.imageUrl;
        setIsUploading(false);
      }

      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('imageUrl', finalImageUrl);
      data.append('webLink', formData.webLink);
      data.append('ownerName', formData.ownerName);
      data.append('location', formData.location);
      data.append('companyName', formData.companyName);
      formData.countries.forEach((countryCode) => {
        data.append('countries', countryCode);
      });
      // Handle category selection
      if (formData.productCategoryId) {
        data.append('categoryId', formData.productCategoryId);
      } else if (formData.serviceCategoryId) {
        data.append('categoryId', formData.serviceCategoryId);
      }
      if (formData.industryId) {
        data.append('industryId', formData.industryId);
      }

      await onSubmit(data);
      router.push('/dashboard');
    } catch (error) {
      setIsUploading(false);
      setErrors({
        submit: error instanceof Error ? error.message : t('errors.failedToSave'),
      });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label={t('ad.title')}
        value={formData.title}
        onChange={(e) =>
          setFormData({ ...formData, title: e.target.value })
        }
        error={errors.title}
        placeholder={t('ad.title')}
        maxLength={100}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('ad.description')}
        </label>
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={5}
          placeholder={t('ad.descriptionPlaceholder') || 'Describe your product or service (50-500 characters)'}
          minLength={50}
          maxLength={500}
        />
        <div className="mt-1 flex justify-between items-center">
          <p className="text-xs text-gray-500">
            {formData.description.length < 50 ? (
              <span className="text-orange-600">
                {50 - formData.description.length} more characters required
              </span>
            ) : (
              <span className="text-green-600">Minimum length met</span>
            )}
          </p>
          <p className="text-xs text-gray-500">
            {formData.description.length} / 500 characters
          </p>
        </div>
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('ad.uploadImage')}
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              setFormData({ ...formData, imageFile: file, imageUrl: '' });
              // Create preview
              const reader = new FileReader();
              reader.onloadend = () => {
                setImagePreview(reader.result as string);
              };
              reader.readAsDataURL(file);
            }
          }}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
        />
        {imagePreview && (
          <div className="mt-2">
            <Image
              src={imagePreview}
              alt="Preview"
              width={500}
              height={300}
              unoptimized
              className="w-full h-48 object-cover rounded-lg border border-gray-200"
            />
          </div>
        )}
        {initialData?.imageUrl && !formData.imageFile && (
          <div className="mt-2">
            <p className="text-xs text-gray-500 mb-1">{t('ad.currentImage')}</p>
            <Image
              src={initialData.imageUrl}
              alt="Current"
              width={500}
              height={300}
              unoptimized
              className="w-full h-48 object-cover rounded-lg border border-gray-200"
            />
          </div>
        )}
        {errors.image && (
          <p className="mt-1 text-sm text-red-600">{errors.image}</p>
        )}
      </div>

      <Input
        label={t('ad.webLink') || 'Web Link / Product - Service URL'}
        type="url"
        value={formData.webLink}
        onChange={(e) =>
          setFormData({ ...formData, webLink: e.target.value })
        }
        error={errors.webLink}
        placeholder="https://yourwebsite.com"
      />

      {/* Product Owner Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Product Owner Information</h3>
        
        <Input
          label="Owner Name"
          value={formData.ownerName}
          onChange={(e) =>
            setFormData({ ...formData, ownerName: e.target.value })
          }
          error={errors.ownerName}
          placeholder="Enter your full name"
          required
        />

        <Input
          label="Location"
          value={formData.location}
          onChange={(e) =>
            setFormData({ ...formData, location: e.target.value })
          }
          error={errors.location}
          placeholder="City, Country"
          required
        />

        <Input
          label="Company Name"
          value={formData.companyName}
          onChange={(e) =>
            setFormData({ ...formData, companyName: e.target.value })
          }
          error={errors.companyName}
          placeholder="Your company name"
          required
        />
      </div>

      {/* Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Type <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.type}
          onChange={(e) => {
            setFormData({ 
              ...formData, 
              type: e.target.value as 'product' | 'service' | '', 
              productCategoryId: '', 
              serviceCategoryId: '' 
            });
          }}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.type ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
          }`}
          required
        >
          <option value="">Select type</option>
          <option value="product">Product</option>
          <option value="service">Service</option>
        </select>
        {errors.type && (
          <p className="mt-1 text-sm text-red-600">{errors.type}</p>
        )}
      </div>

      {/* Product Category Selection */}
      {(formData.type === 'product' || !formData.type) && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product Option Selector <span className="text-red-500">*</span>
          </label>
          {loadingOptions ? (
            <div className="text-sm text-gray-500">Loading options...</div>
          ) : (
            <select
              value={formData.productCategoryId}
              onChange={(e) =>
                setFormData({ ...formData, productCategoryId: e.target.value, serviceCategoryId: '' })
              }
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.category ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select a product option</option>
              {categories.filter((cat: PublicCategory) => cat.type === 'product').map((category: PublicCategory) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          )}
          {errors.category && (
            <p className="mt-1 text-sm text-red-600">{errors.category}</p>
          )}
        </div>
      )}

      {/* Service Category Selection */}
      {(formData.type === 'service' || !formData.type) && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Service Option Selector <span className="text-red-500">*</span>
          </label>
          {loadingOptions ? (
            <div className="text-sm text-gray-500">Loading options...</div>
          ) : (
            <select
              value={formData.serviceCategoryId}
              onChange={(e) =>
                setFormData({ ...formData, serviceCategoryId: e.target.value, productCategoryId: '' })
              }
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.category ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select a service option</option>
              {categories.filter((cat: PublicCategory) => cat.type === 'service').map((category: PublicCategory) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          )}
          {errors.category && (
            <p className="mt-1 text-sm text-red-600">{errors.category}</p>
          )}
        </div>
      )}

      {/* Industry Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('ad.industry') || 'Industry'} <span className="text-red-500">*</span>
        </label>
        {loadingOptions ? (
          <div className="text-sm text-gray-500">Loading industries...</div>
        ) : (
          <select
            value={formData.industryId}
            onChange={(e) =>
              setFormData({ ...formData, industryId: e.target.value })
            }
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.industryId ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
            }`}
            required
          >
            <option value="">{t('ad.selectIndustry') || 'Select an industry'}</option>
            {industries.map((industry: PublicIndustry) => (
              <option key={industry._id} value={industry._id}>
                {industry.name}
              </option>
            ))}
          </select>
        )}
        {errors.industryId && (
          <p className="mt-1 text-sm text-red-600">{errors.industryId}</p>
        )}
      </div>


      <CountrySelector
        selectedCountries={formData.countries}
        onChange={(countries) =>
          setFormData({ ...formData, countries })
        }
        className="mb-4"
      />
      {errors.countries && (
        <p className="mt-1 text-sm text-red-600">{errors.countries}</p>
      )}

      {errors.submit && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{errors.submit}</p>
        </div>
      )}

      <div className="flex gap-4">
        <Button type="submit" variant="logo" isLoading={isLoading || isUploading}>
          {isUploading ? t('ad.uploadingImage') : initialData ? t('ad.updateAd') : t('ad.createAd')}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          {t('common.cancel')}
        </Button>
      </div>
    </form>
  );
};

export default AdForm;

