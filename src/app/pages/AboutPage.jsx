"use client";

import React from "react";
import Image from "next/image";
import { useSiteSettings } from '../context/SiteSettingsContext';

const AboutPage = () => {
  const { siteSettings, isLoading, error } = useSiteSettings();

  if (isLoading) {
    return (
      <section id="about" className="w-full bg-gray-100 py-16">
        <div className="max-w-6xl mx-auto px-4 flex justify-center items-center min-h-[300px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="about" className="w-full bg-gray-100 py-16">
        <div className="max-w-6xl mx-auto px-4 text-center min-h-[300px]">
          <p className="text-red-600">Error loading practice information</p>
        </div>
      </section>
    );
  }

  if (!siteSettings?.aboutText) {
    return (
      <section id="about" className="w-full bg-gray-100 py-16">
        <div className="max-w-6xl mx-auto px-4 text-center min-h-[300px]">
          <p className="text-gray-600">Practice information not available</p>
        </div>
      </section>
    );
  }

  return (
    <section id="about" className="w-full bg-gray-50 pt-10">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="w-full md:w-1/2 space-y-6">
            <h2 className="text-4xl font-bold text-black">About Our Practice</h2>
            <div
              className="greyText text-start mb-12 max-w-5xl mx-auto"
              dangerouslySetInnerHTML={{ __html: siteSettings.aboutText }}
            />
          </div>
          <div className="w-full md:w-1/2 h-[500px] relative rounded-lg overflow-hidden">
            <Image
              src={(siteSettings.about && siteSettings.about.img) || "https://s3.eu-west-2.amazonaws.com/ocumailuserdata/1606406649_67_about_banner.png"}
              alt="About Our Practice"
              fill
              style={{ objectFit: "contain" }}
              className="rounded-lg"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutPage;