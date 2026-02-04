import React, { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Flame, Star, Info } from 'lucide-react';
import Input from './ui/Input';
import CountrySelector from './CountrySelector';
import { useI18n } from '@/lib/i18n-context';
import { IAd } from '@/types/models';
import { publicService, PublicCategory, PublicIndustry } from '@/services/publicService';
import { AD_PRICE, TOP_LENS_PRICE, STORIES_PRICE } from '@/lib/stripe-shared';

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
  isTopLens: boolean;
  isStories: boolean;
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
    isTopLens: initialData?.topLensExpiry ? new Date(initialData.topLensExpiry) > new Date() : false,
    isStories: initialData?.storiesExpiry ? new Date(initialData.storiesExpiry) > new Date() : false,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.imageUrl || null
  );
  const [isUploading, setIsUploading] = useState(false);
  const [categories, setCategories] = useState<PublicCategory[]>([]);
  const [industries, setIndustries] = useState<PublicIndustry[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const totalPrice = AD_PRICE + 
    (formData.isTopLens ? TOP_LENS_PRICE : 0) + 
    (formData.isStories ? STORIES_PRICE : 0);

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
      newErrors.ownerName = t('validation.ownerNameRequired') || 'Owner name is required';
    }
    if (!formData.location.trim()) {
      newErrors.location = t('validation.locationRequired') || 'Location is required';
    }
    if (!formData.companyName.trim()) {
      newErrors.companyName = t('validation.companyNameRequired') || 'Company name is required';
    }
        if (formData.countries.length === 0) {
          newErrors.countries = t('validation.selectAtLeastOneCountry');
        }
        // Validate type is selected
        if (!formData.type) {
          newErrors.type = t('validation.typeRequired') || 'Type is required';
        }
        // Validate either product or service option is selected
        if (!formData.productCategoryId && !formData.serviceCategoryId) {
          newErrors.category = t('validation.categoryRequired') || 'Please select either a product option or a service option';
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
      data.append('isTopLens', String(formData.isTopLens));
      data.append('isStories', String(formData.isStories));
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
                {t('ad.charactersRequired', { count: 50 - formData.description.length }) || `${50 - formData.description.length} more characters required`}
              </span>
            ) : (
              <span className="text-green-600">{t('ad.minLengthMet') || 'Minimum length met'}</span>
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
        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">{t('ad.ownerInformation')}</h3>
        
        <Input
          label={t('ad.ownerNameLabel')}
          value={formData.ownerName}
          onChange={(e) =>
            setFormData({ ...formData, ownerName: e.target.value })
          }
          error={errors.ownerName}
          placeholder={t('ad.ownerNameLabel')}
          required
        />

        <Input
          label={t('ad.locationLabel')}
          value={formData.location}
          onChange={(e) =>
            setFormData({ ...formData, location: e.target.value })
          }
          error={errors.location}
          placeholder={t('ad.locationLabel')}
          required
        />

        <Input
          label={t('ad.companyNameLabel')}
          value={formData.companyName}
          onChange={(e) =>
            setFormData({ ...formData, companyName: e.target.value })
          }
          error={errors.companyName}
          placeholder={t('ad.companyNameLabel')}
          required
        />
      </div>

      {/* Premium Trending Options */}
      <div className="space-y-4 bg-gradient-to-br from-[#790e61]/5 to-transparent p-6 rounded-2xl border border-[#790e61]/10">
        <div className="flex items-center gap-2 mb-2">
          <Flame className="w-5 h-5 text-[#790e61]" />
          <h3 className="text-lg font-bold text-gray-900">{t('ad.premiumTrendingOptions')}</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Top Lens Option */}
          <div 
            className={`cursor-pointer transition-all border-2 rounded-xl p-4 flex flex-col gap-2 ${
              formData.isTopLens 
                ? 'border-[#790e61] bg-[#790e61]/5 ring-1 ring-[#790e61]/20' 
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
            onClick={() => setFormData({ ...formData, isTopLens: !formData.isTopLens })}
          >
            <div className="flex justify-between items-start">
              <div className="bg-amber-100 p-2 rounded-lg">
                <Star className="w-4 h-4 text-amber-600 fill-amber-600" />
              </div>
              <span className="text-[#790e61] font-bold text-sm">+${TOP_LENS_PRICE.toFixed(2)}</span>
            </div>
            <div>
              <h4 className="font-bold text-gray-900">{t('ad.topLensPlacement')}</h4>
              <p className="text-xs text-gray-500 mt-1">
                {t('ad.topLensDescription')}
              </p>
            </div>
            <div className="mt-auto pt-2 flex items-center gap-2">
              <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                formData.isTopLens ? 'bg-[#790e61] border-[#790e61]' : 'border-gray-300'
              }`}>
                {formData.isTopLens && <CheckIcon className="w-3 h-3 text-white" />}
              </div>
              <span className="text-xs font-medium text-gray-700">{t('ad.selectTopLens')}</span>
            </div>
          </div>

          {/* Stories Option */}
          <div 
            className={`cursor-pointer transition-all border-2 rounded-xl p-4 flex flex-col gap-2 ${
              formData.isStories 
                ? 'border-[#790e61] bg-[#790e61]/5 ring-1 ring-[#790e61]/20' 
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
            onClick={() => setFormData({ ...formData, isStories: !formData.isStories })}
          >
            <div className="flex justify-between items-start">
              <div className="bg-pink-100 p-2 rounded-lg">
                <Flame className="w-4 h-4 text-pink-600" />
              </div>
              <span className="text-[#790e61] font-bold text-sm">+${STORIES_PRICE.toFixed(2)}</span>
            </div>
            <div>
              <h4 className="font-bold text-gray-900">{t('ad.yubboxStories')}</h4>
              <p className="text-xs text-gray-500 mt-1">
                {t('ad.storiesDescription')}
              </p>
            </div>
            <div className="mt-auto pt-2 flex items-center gap-2">
              <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                formData.isStories ? 'bg-[#790e61] border-[#790e61]' : 'border-gray-300'
              }`}>
                {formData.isStories && <CheckIcon className="w-3 h-3 text-white" />}
              </div>
              <span className="text-xs font-medium text-gray-700">{t('ad.selectStories')}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-start gap-2 text-[10px] text-gray-400 leading-relaxed bg-white/50 p-3 rounded-lg border border-[#790e61]/5">
          <Info className="w-3 h-3 flex-shrink-0 mt-0.5" />
          <p>{t('ad.premiumFeaturesNote')}</p>
        </div>
      </div>

      {/* Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('ad.typeLabel')} <span className="text-red-500">*</span>
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
          <option value="">{t('ad.selectType')}</option>
          <option value="product">{t('ad.product')}</option>
          <option value="service">{t('ad.service')}</option>
        </select>
        {errors.type && (
          <p className="mt-1 text-sm text-red-600">{errors.type}</p>
        )}
      </div>

      {/* Product Category Selection */}
      {(formData.type === 'product' || !formData.type) && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('home.productOptionSelector')} <span className="text-red-500">*</span>
          </label>
          {loadingOptions ? (
            <div className="text-sm text-gray-500">{t('common.loading')}...</div>
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
              <option value="">{t('ad.selectProductOption')}</option>
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
            {t('home.serviceOptionSelector')} <span className="text-red-500">*</span>
          </label>
          {loadingOptions ? (
            <div className="text-sm text-gray-500">{t('common.loading')}...</div>
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
              <option value="">{t('ad.selectServiceOption')}</option>
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
          <div className="text-sm text-gray-500">{t('ad.loadingIndustries') || 'Loading industries...'}</div>
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

      {/* Summary and Price Section */}
      <div className="bg-neutral-900 text-white rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-6 bg-[#790e61]/20 rounded-bl-[2rem] border-l border-b border-white/10">
          <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-black mb-1">{t('ad.totalDue')}</p>
          <p className="text-3xl font-black text-white">${totalPrice.toFixed(2)}</p>
        </div>

        <div className="relative z-10 max-w-xs">
          <h4 className="text-xl font-black mb-4">{t('ad.summaryHeadline')}</h4>
          <ul className="space-y-2">
            <li className="flex justify-between items-center text-sm">
              <span className="text-neutral-400 font-medium">{t('ad.standardListingDuration')}</span>
              <span className="font-bold">${AD_PRICE.toFixed(2)}</span>
            </li>
            {formData.isTopLens && (
              <li className="flex justify-between items-center text-sm text-[#790e61] font-bold">
                <div className="flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 fill-[#790e61]" />
                  <span>{t('ad.topLensPlacement')}</span>
                </div>
                <span>+${TOP_LENS_PRICE.toFixed(2)}</span>
              </li>
            )}
            {formData.isStories && (
              <li className="flex justify-between items-center text-sm text-pink-400 font-bold">
                <div className="flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5" />
                  <span>{t('ad.yubboxStories')}</span>
                </div>
                <span>+${STORIES_PRICE.toFixed(2)}</span>
              </li>
            )}
          </ul>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <button 
            type="submit" 
            disabled={isLoading || isUploading}
            className={`flex-1 flex items-center justify-center gap-2 bg-[#790e61] hover:bg-[#9d1b7f] text-white py-4 px-8 rounded-2xl font-black text-lg transition-all shadow-xl hover:shadow-[#790e61]/30 active:scale-[0.98] ${
              (isLoading || isUploading) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isUploading 
              ? t('ad.uploadingImage') 
              : initialData 
                ? t('ad.updateAndSave') 
                : t('ad.payAndLaunch', { total: totalPrice.toFixed(2) })}
          </button>
          
          <button
            type="button"
            className="px-8 py-4 rounded-2xl font-bold bg-white/5 hover:bg-white/10 text-white transition-colors"
            onClick={() => router.back()}
          >
            {t('common.cancel')}
          </button>
        </div>
      </div>
    </form>
  );
};

// Simple Check Icon
const CheckIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="4" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default AdForm;

