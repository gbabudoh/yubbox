'use client';

import React, { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n-context';

interface CountdownTimerProps {
  expiryDate: Date | string;
  className?: string;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({
  expiryDate,
  className = '',
}) => {
  const { t } = useI18n();
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    expired: false,
  });

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const expiry = new Date(expiryDate);
      const now = new Date();
      const difference = expiry.getTime() - now.getTime();

      if (difference <= 0) {
        setTimeRemaining({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          expired: true,
        });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeRemaining({
        days,
        hours,
        minutes,
        seconds,
        expired: false,
      });
    };

    // Calculate immediately
    calculateTimeRemaining();

    // Update every second
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [expiryDate]);

  if (timeRemaining.expired) {
    return (
      <div className={`text-red-600 font-semibold ${className}`}>
        {t('ad.expired') || 'Expired'}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`} style={{ minWidth: '120px' }}>
      <div className="flex items-baseline gap-1.5">
        <span className="text-3xl font-extrabold text-blue-700" style={{ lineHeight: '1' }}>
          {timeRemaining.days}
        </span>
        <span className="text-base text-gray-800 font-bold">
          {t('ad.days') || 'days'}
        </span>
      </div>
      {timeRemaining.days < 7 && (
        <div className="flex items-center gap-0.5 text-sm font-mono text-gray-700 bg-white px-2 py-1 rounded border border-gray-300">
          <span className="font-bold">{String(timeRemaining.hours).padStart(2, '0')}</span>
          <span>:</span>
          <span className="font-bold">{String(timeRemaining.minutes).padStart(2, '0')}</span>
          <span>:</span>
          <span className="font-bold">{String(timeRemaining.seconds).padStart(2, '0')}</span>
        </div>
      )}
    </div>
  );
};

export default CountdownTimer;

