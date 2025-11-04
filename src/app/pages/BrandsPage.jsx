"use client"

import Image from "next/image";
import { useSiteSettings } from '../context/SiteSettingsContext';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const BrandsPage = () => {
  const { siteSettings } = useSiteSettings();

  if (!siteSettings || !siteSettings.brands || siteSettings.brands.length === 0) {
    return (

      <section id="brands" className="w-full bg-gray-100 py-16 px-4 sm:px-8 lg:px-16 text-center">
        <p>Loading...</p>
      </section>
    )
  }

  const settings = {
    dots: true,
    infinite: true,
    speed: 5000,
    slidesToShow: 7,
    slidesToScroll: 7,
    autoplay: true,
    autoplaySpeed: 6500,
    pauseOnHover: true,
    rows: 1,
    slidesPerRow: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
          rows: 2
        }
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          rows: 2
        }
      }
    ]
  };

  return (
    <section id="brands" className="w-full bg-white py-16">
      <div className="text-center mb-12 px-4 sm:px-8 lg:px-16">
        <h2 className="text-3xl font-bold text-black mb-5">Our Brands</h2>
        <div className="w-20 h-1 bg-primary mx-auto mb-5"></div>
        <p className="font-roboto text-[#333] leading-[1.7] text-center mb-12 max-w-5xl mx-auto">The brands we stock reflect what matters to us—quality, reliability, and the confidence to recommend them to our patients every day.</p>
      </div>
      <div className="w-full overflow-hidden">
        <Slider {...settings} className="[&_.slick-slide]:px-6">
          {siteSettings && siteSettings.brands && siteSettings.brands
            .filter(brand => brand.show)
            .map(brand => (
              <div key={brand.id} className="h-full">
                <BrandCard
                  image={brand.img}
                  title={brand.name}
                />
              </div>
            ))}
        </Slider>
      </div>
    </section>
  );
};

const BrandCard = ({ image, title }) => {
  // Fallback to a placeholder if image is empty or undefined
  const imageSrc = image || 'No image specified';
  
  return (
    <div className="bg-white shadow-lg p-6 rounded-lg h-full flex items-center justify-center my-4">
      <div className="relative w-full h-24">
        <Image
          src={imageSrc}
          alt={title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
          className="object-contain p-2"
          priority={false}
          onError={(e) => {
            // Fallback to placeholder if image fails to load
            if (imageSrc !== 'No image specified') {
              e.target.src = 'No image specified';
            }
          }}
        />
      </div>
    </div>
  );
};

export default BrandsPage;