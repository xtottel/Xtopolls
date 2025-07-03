'use client';

import { Clock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

type ContestCardProps = {
  image: string;
  alt: string;
  title: string;
  description: string;
  end_date: string;
  slug: string;
};

export default function ContestCard({
  image,
  alt,
  title,
  description,
  end_date,
  slug,
}: ContestCardProps) {
  const end = new Date(end_date);
  const today = new Date();
  const daysRemaining = Math.ceil(
    (end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
  const isExpired = daysRemaining <= 0;

  // Render disabled state without Link
  if (isExpired) {
    return (
      <div className="relative group overflow-hidden rounded-xl shadow-lg opacity-70 cursor-not-allowed">
        <div className="relative h-64">
          <Image
            src={image}
            alt={alt}
            fill
            className="object-cover"
            quality={80}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          
          <div className="absolute inset-0 bg-black bg-opacity-50" />

          <div className="absolute top-4 right-4 px-3 py-1 rounded-full flex items-center text-sm font-medium bg-gray-600 text-white">
            <Clock className="w-4 h-4 mr-1" />
            Expired
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <h3 className="text-2xl font-bold mb-2">{title}</h3>
            <p className="mb-4 line-clamp-2">{description}</p>
            <button
              className="w-full py-2 rounded-md bg-gray-500 cursor-not-allowed"
              disabled
            >
              Contest Ended
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active contest with Link
  return (
    <Link href={`/contests/${slug}`} passHref>
      <div className="relative group overflow-hidden rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] cursor-pointer">
        <div className="relative h-64">
          <Image
            src={image}
            alt={alt}
            fill
            className="object-cover"
            quality={80}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          
          <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-30" />

          <div className="absolute top-4 right-4 px-3 py-1 rounded-full flex items-center text-sm font-medium bg-red-500 text-white">
            <Clock className="w-4 h-4 mr-1" />
            {daysRemaining}d left
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <h3 className="text-2xl font-bold mb-2">{title}</h3>
            <p className="mb-4 line-clamp-2">{description}</p>
            <button
              className="w-full py-2 rounded-md bg-white text-blue-600 hover:bg-blue-50 transition-colors duration-200"
            >
              View Details
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}