import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';

interface NomineeDetailsProps {
  contestSlug: string;
  categorySlug: string;
  nominee: {
    id: string;
    name: string;
    image_url: string;
    description: string;
    nominee_code: string;
    votes: number;
  };
}

export default function NomineeDetails({ contestSlug, categorySlug, nominee }: NomineeDetailsProps) {
  return (
    <>
      <Link
        href={`/categories/${categorySlug}?contestSlug=${contestSlug}`}
        className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-8"
      >
        <ArrowLeft className="mr-2" />
        Back to Nominees
      </Link>

      <div className="flex flex-col md:flex-row gap-8 mb-8">
        <div className="md:w-1/2">
          <div className="relative aspect-square rounded-xl overflow-hidden">
            <Image
              src={nominee.image_url}
              alt={nominee.name}
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>

        <div className="md:w-1/2">
          <h2 className="text-2xl font-bold mb-2">{nominee.name}</h2>
          <p className="text-gray-600 mb-4">{nominee.description}</p>
          <div className="text-lg font-medium">
            Total Votes: <span className="text-green-600">{nominee.votes}</span>
          </div>
        </div>
      </div>
    </>
  );
}