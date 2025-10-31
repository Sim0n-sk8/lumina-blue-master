"use client";
//============================ 
/* THIS IS THE WORKING PAGE */
//============================ 
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { FaFacebook, FaInstagram, FaLinkedin } from 'react-icons/fa';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import Link from "next/link";
import CounterPage from "./CounterPage";
import CustomPanelPage from "./CustomPanelPage";
import YouTubePanelPage from "./YouTubePanelPage";
import AboutPage from "./AboutPage";
import ServicesPage from "./ServicesPage";
import TeamPage from "./TeamPage";
import RecentBlogs from "./RecentBlogs";
import BrandsPage from "./BrandsPage";
import BookingPage from "./BookingPage";
import TestimonialsPage from "./TestimonialsPage";
import ConnectWithUsPage from "./ConnectWithUsPage";
import { useSiteSettings } from '../context/SiteSettingsContext';
import { FaWhatsapp } from 'react-icons/fa';

export default function HomePage({ customerCode }) {
  const { siteSettings, isLoading, error } = useSiteSettings();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">          
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-700 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!siteSettings?.banners || siteSettings.banners.length === 0) {
    return (
      <div className="w-full h-[600px] bg-cover bg-center text-center text-white">
        <p>No banner information available</p>
      </div>
    );
  }

  return (
    <div>
      {/* Home Page Section */}
      {siteSettings.banners.length > 0 && (
        <div
          className="w-full h-[600px] bg-cover bg-center text-center text-white"
          style={{
            backgroundImage: `url(${siteSettings.banners[0].bannerImg})`,
          }}
        >
          <div
            className="bg-black bg-opacity-50 h-full flex flex-col items-center justify-center p-4"
            style={{
              fontFamily: siteSettings.banners[0].titleGoogleFont || 'inherit'
            }}
          >
            <p style={{ fontSize: `${siteSettings.banners[0].titleFontSize}px`, color: 'white' }}>
              {siteSettings.banners[0].title}
            </p>
            <p style={{ fontSize: `${siteSettings.banners[0].textFontSize}px`, color: 'white' }}>
              {siteSettings.banners[0].text || "Serving the community for over 80 years delivering the highest quality care and products for our customers"}
            </p>
            <br></br>
            <button
              className="px-8 py-3 bg-primary text-white font-semibold rounded-md hover:bg-white hover:text-primary hover:border-primary border-2 border-transparent transition-all"
            >
              <Link href={siteSettings.banners[0].buttonLink || "/#booking"}>{siteSettings.banners[0].buttonText || "Make A Booking"}</Link>
            </button>
          </div>
        </div>
      )}
      {siteSettings.show_counters_panel && <CounterPage />}
      {siteSettings.show_custom_panel && <CustomPanelPage />}
      <AboutPage />
      {siteSettings.show_youtube_panel && <YouTubePanelPage />}
      <ServicesPage />
      {siteSettings.show_socials_panel && <ConnectWithUsPage />}
      {siteSettings.show_teams_panel && <TeamPage />}
      <RecentBlogs />
      <BrandsPage />
      <TestimonialsPage />
      <BookingPage />
      
      {/* WhatsApp Button with Speech Bubble */}
      {siteSettings.whatsapp_tel && (
        <div className="fixed bottom-8 right-8 flex items-center gap-2 z-50 group">
          <div className="bg-white text-green-600 text-sm font-medium px-3 py-1.5 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            WhatsApp Us
            <div className="absolute right-0 top-1/2 w-3 h-3 bg-white transform -translate-y-1/2 translate-x-1/2 rotate-45"></div>
          </div>
          <a 
            href={`https://wa.me/${siteSettings.whatsapp_tel}?text=Hi%20there%2C%0A%0AI%20am%20sending%20you%20a%20request%20from%20the%20LuminaBlue%20website.%20My%20request%20as%20follows%3A%0A`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110 flex items-center justify-center"
            aria-label="Chat on WhatsApp"
          >
            <FaWhatsapp className="text-3xl" />
          </a>
        </div>
      )}
    </div>
  );
}