'use client';

import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

interface BannerAd {
  _id: string;
  title: string;
  description?: string;
  imageUrl: string;
  linkUrl: string;
  displayOrder: number;
}

export default function BannerAdDisplay() {
  const [bannerAds, setBannerAds] = useState<BannerAd[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBannerAds();
  }, []);

  const loadBannerAds = async () => {
    try {
      const response = await fetch('/api/banner-ads/active');
      const data = await response.json();
      if (data.success && data.data.length > 0) {
        setBannerAds(data.data);
      }
    } catch (error) {
      console.error('Failed to load banner ads:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || bannerAds.length === 0) {
    return null;
  }

  return (
    <div className="w-full bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Premium Featured Partners
          </h2>
          <p className="text-gray-600 text-sm mt-1">Discover amazing products and services</p>
        </div>

        <Swiper
          modules={[Autoplay, Pagination, Navigation]}
          spaceBetween={20}
          slidesPerView={1}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          pagination={{
            clickable: true,
          }}
          navigation={bannerAds.length > 1}
          loop={bannerAds.length > 1}
          className="banner-swiper rounded-2xl overflow-hidden shadow-2xl"
        >
          {bannerAds.map((banner, index) => (
            <SwiperSlide key={banner._id}>
              <a
                href={banner.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block group"
              >
                <div className="relative h-64 sm:h-80 md:h-96 lg:h-[28rem] overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 z-10"></div>
                  
                  <img
                    src={banner.imageUrl}
                    alt={banner.title}
                    className="w-full h-full object-cover"
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-20">
                    <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8 md:p-12">
                      <div className="max-w-4xl">
                        <div className="inline-block px-4 py-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full text-white text-xs font-semibold mb-4 shadow-lg">
                          PREMIUM PARTNER
                        </div>
                        
                        <h3 className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-3 drop-shadow-2xl leading-tight">
                          {banner.title}
                        </h3>
                        
                        {banner.description && (
                          <p className="text-white/95 text-base sm:text-lg md:text-xl max-w-3xl drop-shadow-lg line-clamp-2 mb-6">
                            {banner.description}
                          </p>
                        )}
                        
                        <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-md hover:bg-white/30 rounded-full text-white font-semibold transition-all duration-300 group-hover:gap-4 border border-white/30">
                          <span>Explore Now</span>
                          <svg
                            className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2.5}
                              d="M17 8l4 4m0 0l-4 4m4-4H3"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="absolute top-6 right-6 z-30 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
                    <span className="text-sm font-bold text-gray-800">
                      {index + 1} / {bannerAds.length}
                    </span>
                  </div>
                </div>
              </a>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <style jsx global>{`
        .banner-swiper {
          border: 2px solid rgba(255, 255, 255, 0.8);
          position: relative;
        }
        
        /* Pagination - Modern pill style at bottom center */
        .banner-swiper .swiper-pagination {
          bottom: 24px !important;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(8px);
          border-radius: 50px;
          width: fit-content !important;
          left: 50% !important;
          transform: translateX(-50%);
        }
        .banner-swiper .swiper-pagination-bullet {
          background: rgba(255, 255, 255, 0.6);
          opacity: 1;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          border: none;
          margin: 0 !important;
        }
        .banner-swiper .swiper-pagination-bullet:hover {
          background: rgba(255, 255, 255, 0.9);
          transform: scale(1.2);
        }
        .banner-swiper .swiper-pagination-bullet-active {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          width: 28px;
          border-radius: 10px;
          box-shadow: 0 0 12px rgba(139, 92, 246, 0.6);
        }
        
        /* Navigation arrows - Simple design */
        .banner-swiper .swiper-button-next,
        .banner-swiper .swiper-button-prev {
          color: white;
          background: none;
          width: 40px;
          height: 40px;
        }
        .banner-swiper .swiper-button-next {
          right: 16px;
        }
        .banner-swiper .swiper-button-prev {
          left: 16px;
        }
        .banner-swiper .swiper-button-next:hover,
        .banner-swiper .swiper-button-prev:hover {
          color: rgba(255, 255, 255, 0.8);
        }
        .banner-swiper .swiper-button-next::after,
        .banner-swiper .swiper-button-prev::after {
          font-size: 24px !important;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
        }
        .banner-swiper .swiper-button-disabled {
          opacity: 0.3 !important;
          cursor: not-allowed;
        }
        
        /* Tablet */
        @media (max-width: 768px) {
          .banner-swiper .swiper-button-next,
          .banner-swiper .swiper-button-prev {
            width: 32px;
            height: 32px;
          }
          .banner-swiper .swiper-button-next {
            right: 10px;
          }
          .banner-swiper .swiper-button-prev {
            left: 10px;
          }
          .banner-swiper .swiper-button-next::after,
          .banner-swiper .swiper-button-prev::after {
            font-size: 20px !important;
          }
          .banner-swiper .swiper-pagination {
            bottom: 16px !important;
            padding: 6px 12px;
          }
        }
        
        /* Mobile - Hide arrows, show pagination */
        @media (max-width: 640px) {
          .banner-swiper .swiper-button-next,
          .banner-swiper .swiper-button-prev {
            display: none;
          }
          .banner-swiper .swiper-pagination {
            bottom: 12px !important;
            padding: 5px 10px;
            gap: 5px;
          }
          .banner-swiper .swiper-pagination-bullet {
            width: 6px;
            height: 6px;
          }
          .banner-swiper .swiper-pagination-bullet-active {
            width: 22px;
          }
        }
      `}</style>
    </div>
  );
}
