'use client';

import React, { useState, useRef, useCallback, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Flame, Star, Info, ChevronDown, AlertCircle,
  ShoppingBag, Wrench, ImagePlus, Globe, User, Building2, MapPin, Link2,
} from 'lucide-react';
import Input from './ui/Input';
import CountrySelector from './CountrySelector';
import { useI18n } from '@/lib/i18n-context';
import { IAd } from '@/types/models';
import { publicService, PublicCategory, PublicIndustry } from '@/services/publicService';
import { AD_PRICE, TOP_LENS_PRICE, STORIES_PRICE } from '@/lib/stripe-shared';

// ─── Shared styled select ────────────────────────────────────────────────────
const StyledSelect = ({
  value, onChange, children, error, disabled,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
  error?: string;
  disabled?: boolean;
}) => (
  <div>
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={[
          'w-full appearance-none px-4 py-3 pr-10 rounded-xl border bg-white text-sm text-neutral-800 outline-none transition-all cursor-pointer',
          'focus:ring-4 focus:ring-[#790e61]/10 focus:border-[#790e61]',
          error ? 'border-red-400' : 'border-neutral-200',
          disabled ? 'opacity-50 cursor-not-allowed' : '',
        ].join(' ')}
      >
        {children}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
    </div>
    {error && (
      <div className="flex items-center gap-1.5 mt-1.5">
        <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
        <p className="text-xs text-red-500 font-medium">{error}</p>
      </div>
    )}
  </div>
);

// ─── Section wrapper ─────────────────────────────────────────────────────────
const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="glass-card rounded-2xl p-6 space-y-4">
    <h3 className="text-xs font-black uppercase tracking-widest text-neutral-400">{title}</h3>
    {children}
  </div>
);

// ─── Check icon ──────────────────────────────────────────────────────────────
const CheckIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// ─── Types ───────────────────────────────────────────────────────────────────
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

// ─── Component ───────────────────────────────────────────────────────────────
const AdForm: React.FC<AdFormProps> = ({ initialData, onSubmit }) => {
  const router = useRouter();
  const { t } = useI18n();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading,    setIsLoading]    = useState(false);
  const [isUploading,  setIsUploading]  = useState(false);
  const [isDragging,   setIsDragging]   = useState(false);
  const [errors,       setErrors]       = useState<Record<string, string>>({});
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.imageUrl || null);
  const [categories,   setCategories]   = useState<PublicCategory[]>([]);
  const [industries,   setIndustries]   = useState<PublicIndustry[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const [formData, setFormData] = useState<FormDataType>({
    title:             initialData?.title       || '',
    description:       initialData?.description || '',
    imageUrl:          initialData?.imageUrl    || '',
    imageFile:         null,
    webLink:           initialData?.webLink     || '',
    countries:         (initialData?.countries || initialData?.countries || []) as string[],
    type:              (initialData?.categoryId as unknown as PublicCategory)?.type || '',
    productCategoryId: initialData?.categoryId ? String(initialData.categoryId) : '',
    serviceCategoryId: '',
    industryId:        initialData?.industryId ? String(initialData.industryId) : '',
    ownerName:         initialData?.ownerName   || '',
    location:          initialData?.location    || '',
    companyName:       initialData?.companyName || '',
    isTopLens:         initialData?.topLensExpiry ? new Date(initialData.topLensExpiry) > new Date() : false,
    isStories:         initialData?.storiesExpiry ? new Date(initialData.storiesExpiry) > new Date() : false,
  });

  const totalPrice = AD_PRICE
    + (formData.isTopLens ? TOP_LENS_PRICE : 0)
    + (formData.isStories ? STORIES_PRICE  : 0);

  useEffect(() => {
    publicService.getCategories().then(setCategories).catch(console.error);
    publicService.getIndustries().then(setIndustries).catch(console.error).finally(() => setLoadingOptions(false));
  }, []);

  // ── Image handling ─────────────────────────────────────────────────────────
  const applyFile = (file: File) => {
    setFormData(prev => ({ ...prev, imageFile: file, imageUrl: '' }));
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(true);
  }, []);
  const handleDragLeave = useCallback(() => setIsDragging(false), []);
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) applyFile(file);
  }, []);

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.title.trim())                          e.title       = t('validation.titleRequired');
    if (!formData.description.trim())                    e.description = t('validation.descriptionRequired');
    else if (formData.description.trim().length < 50)    e.description = t('validation.descriptionMinLength');
    else if (formData.description.trim().length > 500)   e.description = t('validation.descriptionMaxLength');
    if (!formData.imageFile && !formData.imageUrl)       e.image       = t('ad.pleaseUploadImage');
    if (!formData.webLink.trim())                        e.webLink     = t('validation.webLinkRequired');
    if (!formData.ownerName.trim())                      e.ownerName   = t('validation.ownerNameRequired');
    if (!formData.location.trim())                       e.location    = t('validation.locationRequired');
    if (!formData.companyName.trim())                    e.companyName = t('validation.companyNameRequired');
    if (formData.countries.length === 0)                 e.countries   = t('validation.selectAtLeastOneCountry');
    if (!formData.type)                                  e.type        = t('validation.typeRequired');
    if (!formData.productCategoryId && !formData.serviceCategoryId) e.category = t('validation.categoryRequired');
    if (!formData.industryId)                            e.industryId  = t('validation.industryRequired');
    return e;
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); setIsLoading(false); return; }

    setIsLoading(true);
    setErrors({});

    try {
      let finalImageUrl = formData.imageUrl;
      if (formData.imageFile) {
        setIsUploading(true);
        const upload = new FormData();
        upload.append('image', formData.imageFile);
        const res = await fetch('/api/upload', { method: 'POST', body: upload });
        if (!res.ok) throw new Error((await res.json()).error || t('errors.uploadError'));
        finalImageUrl = (await res.json()).data.imageUrl;
        setIsUploading(false);
      }

      const data = new FormData();
      data.append('title',       formData.title);
      data.append('description', formData.description);
      data.append('imageUrl',    finalImageUrl);
      data.append('webLink',     formData.webLink);
      data.append('ownerName',   formData.ownerName);
      data.append('location',    formData.location);
      data.append('companyName', formData.companyName);
      data.append('isTopLens',   String(formData.isTopLens));
      data.append('isStories',   String(formData.isStories));
      formData.countries.forEach(c => data.append('countries', c));
      const catId = formData.productCategoryId || formData.serviceCategoryId;
      if (catId)            data.append('categoryId', catId);
      if (formData.industryId) data.append('industryId', formData.industryId);

      await onSubmit(data);
      router.push('/dashboard');
    } catch (err) {
      setIsUploading(false);
      setErrors({ submit: err instanceof Error ? err.message : t('errors.failedToSave') });
    } finally {
      setIsLoading(false);
    }
  };

  const productCategories = categories.filter(c => c.type === 'product');
  const serviceCategories = categories.filter(c => c.type === 'service');
  const descLen           = formData.description.length;

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">

        {/* ── LEFT: form fields ────────────────────────────────────────── */}
        <div className="space-y-5">

          {/* 1 — Listing type */}
          <Section title="Listing Type">
            <div className="grid grid-cols-2 gap-3">
              {([
                { value: 'product', icon: ShoppingBag, label: t('ad.product') },
                { value: 'service', icon: Wrench,      label: t('ad.service') },
              ] as const).map(({ value, icon: Icon, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, type: value, productCategoryId: '', serviceCategoryId: '' }))}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all border"
                  style={formData.type === value
                    ? { background: 'linear-gradient(135deg,#790e61,#c41e8a)', color: '#fff', borderColor: 'transparent', boxShadow: '0 4px 16px rgba(121,14,97,0.3)' }
                    : { background: '#fff', color: '#737373', borderColor: '#e5e5e5' }}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
            {errors.type && (
              <div className="flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <p className="text-xs text-red-500 font-medium">{errors.type}</p>
              </div>
            )}
          </Section>

          {/* 2 — Category & Industry */}
          <Section title="Category & Industry">
            {formData.type === 'product' && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-neutral-400 mb-1.5">
                  {t('home.productOptionSelector')} <span className="text-red-400">*</span>
                </label>
                <StyledSelect
                  value={formData.productCategoryId}
                  onChange={e => setFormData(p => ({ ...p, productCategoryId: e.target.value, serviceCategoryId: '' }))}
                  error={errors.category}
                  disabled={loadingOptions}
                >
                  <option value="">{t('ad.selectProductOption')}</option>
                  {productCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </StyledSelect>
              </div>
            )}

            {formData.type === 'service' && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-neutral-400 mb-1.5">
                  {t('home.serviceOptionSelector')} <span className="text-red-400">*</span>
                </label>
                <StyledSelect
                  value={formData.serviceCategoryId}
                  onChange={e => setFormData(p => ({ ...p, serviceCategoryId: e.target.value, productCategoryId: '' }))}
                  error={errors.category}
                  disabled={loadingOptions}
                >
                  <option value="">{t('ad.selectServiceOption')}</option>
                  {serviceCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </StyledSelect>
              </div>
            )}

            {!formData.type && (
              <p className="text-xs text-neutral-400 italic">Select a listing type above to see categories.</p>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-neutral-400 mb-1.5">
                {t('ad.industry')} <span className="text-red-400">*</span>
              </label>
              <StyledSelect
                value={formData.industryId}
                onChange={e => setFormData(p => ({ ...p, industryId: e.target.value }))}
                error={errors.industryId}
                disabled={loadingOptions}
              >
                <option value="">{t('ad.selectIndustry')}</option>
                {industries.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
              </StyledSelect>
            </div>
          </Section>

          {/* 3 — Listing details */}
          <Section title="Listing Details">
            <Input
              label={t('ad.title')}
              value={formData.title}
              onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
              error={errors.title}
              placeholder="e.g. Premium Web Design Service"
              maxLength={100}
              required
            />

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-neutral-400 mb-1.5">
                {t('ad.description')} <span className="text-red-400">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                rows={5}
                maxLength={500}
                placeholder={t('ad.descriptionPlaceholder')}
                className={[
                  'w-full px-4 py-3 rounded-xl border bg-white text-sm text-neutral-800 placeholder-neutral-400 outline-none transition-all resize-none',
                  'focus:ring-4 focus:ring-[#790e61]/10 focus:border-[#790e61]',
                  errors.description ? 'border-red-400' : 'border-neutral-200',
                ].join(' ')}
              />
              <div className="flex items-center justify-between mt-1.5">
                {descLen < 50 ? (
                  <span className="text-xs text-orange-500 font-medium">{50 - descLen} more characters required</span>
                ) : (
                  <span className="text-xs text-emerald-500 font-medium">✓ Minimum length met</span>
                )}
                <span className="text-xs text-neutral-400">{descLen} / 500</span>
              </div>
              {errors.description && (
                <div className="flex items-center gap-1.5 mt-1">
                  <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  <p className="text-xs text-red-500 font-medium">{errors.description}</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-neutral-400 mb-1.5">
                {t('ad.webLink')} <span className="text-red-400">*</span>
              </label>
              <div className="relative group">
                <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-[#790e61] transition-colors" />
                <input
                  type="url"
                  value={formData.webLink}
                  onChange={e => setFormData(p => ({ ...p, webLink: e.target.value }))}
                  placeholder="https://yourwebsite.com"
                  className={[
                    'w-full pl-11 pr-4 py-3 rounded-xl border bg-white text-sm text-neutral-800 placeholder-neutral-400 outline-none transition-all',
                    'focus:ring-4 focus:ring-[#790e61]/10 focus:border-[#790e61]',
                    errors.webLink ? 'border-red-400' : 'border-neutral-200',
                  ].join(' ')}
                />
              </div>
              {errors.webLink && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  <p className="text-xs text-red-500 font-medium">{errors.webLink}</p>
                </div>
              )}
            </div>
          </Section>

          {/* 4 — Image upload */}
          <Section title="Listing Image">
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={[
                'border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all',
                isDragging
                  ? 'border-[#790e61] bg-[#790e61]/5 scale-[1.01]'
                  : 'border-neutral-200 hover:border-[#790e61]/40 hover:bg-neutral-50/50',
              ].join(' ')}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) applyFile(f); }}
              />
              {imagePreview ? (
                <div className="relative">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    width={600}
                    height={360}
                    unoptimized
                    className="w-full h-52 object-cover rounded-xl border border-neutral-200"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-xl bg-black/40">
                    <span className="text-white text-sm font-bold">Click to change image</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center mb-1">
                    <ImagePlus className="w-7 h-7 text-neutral-400" />
                  </div>
                  <p className="text-sm font-semibold text-neutral-700">Drop image here or click to browse</p>
                  <p className="text-xs text-neutral-400">PNG, JPG, WEBP — recommended 1200×900px</p>
                </div>
              )}
            </div>
            {errors.image && (
              <div className="flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <p className="text-xs text-red-500 font-medium">{errors.image}</p>
              </div>
            )}
          </Section>

          {/* 5 — Owner info */}
          <Section title={t('ad.ownerInformation')}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-[#790e61] transition-colors pointer-events-none" />
                <Input
                  label={t('ad.ownerNameLabel')}
                  value={formData.ownerName}
                  onChange={e => setFormData(p => ({ ...p, ownerName: e.target.value }))}
                  error={errors.ownerName}
                  placeholder="Full name"
                  className="pl-11"
                  required
                />
              </div>
              <div className="relative group">
                <Building2 className="absolute left-4 top-[2.1rem] w-4 h-4 text-neutral-400 group-focus-within:text-[#790e61] transition-colors pointer-events-none" />
                <Input
                  label={t('ad.companyNameLabel')}
                  value={formData.companyName}
                  onChange={e => setFormData(p => ({ ...p, companyName: e.target.value }))}
                  error={errors.companyName}
                  placeholder="Company or brand name"
                  className="pl-11"
                  required
                />
              </div>
            </div>
            <div className="relative group">
              <MapPin className="absolute left-4 top-[2.1rem] w-4 h-4 text-neutral-400 group-focus-within:text-[#790e61] transition-colors pointer-events-none" />
              <Input
                label={t('ad.locationLabel')}
                value={formData.location}
                onChange={e => setFormData(p => ({ ...p, location: e.target.value }))}
                error={errors.location}
                placeholder="City, Country"
                className="pl-11"
                required
              />
            </div>
          </Section>

          {/* 6 — Target countries */}
          <Section title={t('ad.targetCountries')}>
            <CountrySelector
              selectedCountries={formData.countries}
              onChange={countries => setFormData(p => ({ ...p, countries }))}
            />
            {errors.countries && (
              <div className="flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <p className="text-xs text-red-500 font-medium">{errors.countries}</p>
              </div>
            )}
          </Section>

          {/* 7 — Premium options */}
          <Section title={t('ad.premiumTrendingOptions')}>
            <div className="flex items-center gap-2 -mt-1 mb-1">
              <Flame className="w-4 h-4" style={{ color: '#790e61' }} />
              <p className="text-xs text-neutral-500 font-medium">Boost your listing visibility</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Top Lens */}
              <div
                onClick={() => setFormData(p => ({ ...p, isTopLens: !p.isTopLens }))}
                className={[
                  'cursor-pointer transition-all border-2 rounded-xl p-4 flex flex-col gap-2',
                  formData.isTopLens
                    ? 'border-[#790e61] bg-[#790e61]/5 ring-1 ring-[#790e61]/20'
                    : 'border-neutral-200 bg-white hover:border-neutral-300',
                ].join(' ')}
              >
                <div className="flex justify-between items-start">
                  <div className="bg-amber-100 p-2 rounded-lg">
                    <Star className="w-4 h-4 text-amber-600 fill-amber-600" />
                  </div>
                  <span className="font-bold text-sm" style={{ color: '#790e61' }}>+${TOP_LENS_PRICE.toFixed(2)}</span>
                </div>
                <h4 className="font-bold text-neutral-900 text-sm">{t('ad.topLensPlacement')}</h4>
                <p className="text-xs text-neutral-500 leading-relaxed">{t('ad.topLensDescription')}</p>
                <div className="mt-auto pt-2 flex items-center gap-2">
                  <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${formData.isTopLens ? 'border-[#790e61]' : 'border-neutral-300'}`}
                    style={formData.isTopLens ? { background: '#790e61' } : {}}>
                    {formData.isTopLens && <CheckIcon className="w-3 h-3 text-white" />}
                  </div>
                  <span className="text-xs font-medium text-neutral-600">{t('ad.selectTopLens')}</span>
                </div>
              </div>

              {/* Stories */}
              <div
                onClick={() => setFormData(p => ({ ...p, isStories: !p.isStories }))}
                className={[
                  'cursor-pointer transition-all border-2 rounded-xl p-4 flex flex-col gap-2',
                  formData.isStories
                    ? 'border-[#790e61] bg-[#790e61]/5 ring-1 ring-[#790e61]/20'
                    : 'border-neutral-200 bg-white hover:border-neutral-300',
                ].join(' ')}
              >
                <div className="flex justify-between items-start">
                  <div className="bg-pink-100 p-2 rounded-lg">
                    <Flame className="w-4 h-4 text-pink-600" />
                  </div>
                  <span className="font-bold text-sm" style={{ color: '#790e61' }}>+${STORIES_PRICE.toFixed(2)}</span>
                </div>
                <h4 className="font-bold text-neutral-900 text-sm">{t('ad.yubboxStories')}</h4>
                <p className="text-xs text-neutral-500 leading-relaxed">{t('ad.storiesDescription')}</p>
                <div className="mt-auto pt-2 flex items-center gap-2">
                  <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${formData.isStories ? 'border-[#790e61]' : 'border-neutral-300'}`}
                    style={formData.isStories ? { background: '#790e61' } : {}}>
                    {formData.isStories && <CheckIcon className="w-3 h-3 text-white" />}
                  </div>
                  <span className="text-xs font-medium text-neutral-600">{t('ad.selectStories')}</span>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2 text-[10px] text-neutral-400 leading-relaxed bg-neutral-50 p-3 rounded-xl border border-neutral-100">
              <Info className="w-3 h-3 shrink-0 mt-0.5" />
              <p>{t('ad.premiumFeaturesNote')}</p>
            </div>
          </Section>

          {/* Submit error */}
          {errors.submit && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 font-medium">{errors.submit}</p>
            </div>
          )}
        </div>

        {/* ── RIGHT: sticky sidebar ────────────────────────────────────── */}
        <div className="lg:sticky lg:top-36 space-y-4">
          {/* Price summary */}
          <div className="bg-neutral-900 text-white rounded-3xl p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 bg-white -mr-8 -mt-8" />
            <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full opacity-5 bg-white -ml-8 -mb-8" />

            <div className="relative z-10">
              <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-black mb-1">
                {t('ad.totalDue')}
              </p>
              <p className="text-4xl font-black text-white mb-6">${totalPrice.toFixed(2)}</p>

              <div className="space-y-2 mb-6">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-neutral-400">{t('ad.standardListingDuration')}</span>
                  <span className="font-bold">${AD_PRICE.toFixed(2)}</span>
                </div>
                {formData.isTopLens && (
                  <div className="flex justify-between items-center text-sm font-bold" style={{ color: '#c41e8a' }}>
                    <div className="flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{t('ad.topLensPlacement')}</span>
                    </div>
                    <span>+${TOP_LENS_PRICE.toFixed(2)}</span>
                  </div>
                )}
                {formData.isStories && (
                  <div className="flex justify-between items-center text-sm text-pink-400 font-bold">
                    <div className="flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5" />
                      <span>{t('ad.yubboxStories')}</span>
                    </div>
                    <span>+${STORIES_PRICE.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-white/10 pt-2 mt-2 flex justify-between items-center text-sm font-black">
                  <span className="text-neutral-300">{t('ad.total')}</span>
                  <span className="text-white">${totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || isUploading}
                className="w-full py-3.5 rounded-2xl font-black text-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg,#790e61,#c41e8a)', boxShadow: '0 4px 20px rgba(121,14,97,0.4)' }}
              >
                {isUploading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Uploading...</>
                ) : isLoading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</>
                ) : initialData ? (
                  t('ad.updateAndSave')
                ) : (
                  t('ad.payAndLaunch', { total: totalPrice.toFixed(2) })
                )}
              </button>

              <button
                type="button"
                onClick={() => router.back()}
                className="w-full mt-3 py-2.5 rounded-2xl font-bold text-sm bg-white/5 hover:bg-white/10 text-neutral-300 transition-colors"
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>

          {/* Checklist hint */}
          <div className="glass-card rounded-2xl p-5 space-y-2.5">
            <p className="text-xs font-black uppercase tracking-widest text-neutral-400">Before you launch</p>
            {[
              'Add a high-quality image',
              'Write 50+ character description',
              'Select target countries',
              'Add your web link',
            ].map(tip => (
              <div key={tip} className="flex items-center gap-2 text-xs text-neutral-500">
                <Globe className="w-3 h-3 shrink-0" style={{ color: '#790e61' }} />
                {tip}
              </div>
            ))}
          </div>
        </div>
      </div>
    </form>
  );
};

export default AdForm;
