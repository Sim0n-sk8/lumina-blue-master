'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '../../pages/Navbar';
import FooterPage from '../../pages/FooterPage';
import Image from 'next/image';
import crypto from 'crypto';

// Generate API key using the same logic as Ruby's today_key
function getApiKey() {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  return crypto.createHash('md5').update(today).digest('hex');
}

export default function ViewMailLink({ params }) {
  const resolvedParams = React.use(params);
  const mail_uuid = resolvedParams.mail_uuid;
  const [mailData, setMailData] = useState(null);
  const [appointment, setAppointment] = useState(null);
  const [primaryColor, setPrimaryColor] = useState('#3b82f6'); // Default blue color
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Format appointment time
  const formatAppointmentTime = (dateTimeString) => {
    if (!dateTimeString) return '';
    const date = new Date(dateTimeString);
    const dateStr = date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    const timeStr = date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
    return `${dateStr}\n${timeStr}`;
  };

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch mail data
        const mailResponse = await fetch(`https://www.ocumail.com/api/get_sent_mail/${mail_uuid}`, {
          cache: 'no-store'
        });
        
        if (!mailResponse.ok) {
          throw new Error(`Failed to fetch mail data: ${mailResponse.status}`);
        }
        
        const mailJson = await mailResponse.json();
        const mailItem = Array.isArray(mailJson) && mailJson.length > 0 ? mailJson[0] : mailJson;
        
        const practiceData = {
          id: mailItem.practice_id,
          name: mailItem.sender_name || 'Practice',
          phone: mailItem.mobile_num,
          logo_url: null
        };
        
        const processedMailData = {
          banner_url: mailItem.banner_url,
          practice: practiceData,
          patient_preferred_name: mailItem.patient_preferred_name,
          message_body: mailItem.message_body,
          ...mailItem
        };
        
        setMailData(processedMailData);
        
        // Fetch practice settings to get primary color
        try {
          const practiceResponse = await fetch(`/api/practice-settings?practice_id=${practiceData.id}`);
          if (practiceResponse.ok) {
            const practiceSettings = await practiceResponse.json();
            if (practiceSettings.primary_color) {
              setPrimaryColor(practiceSettings.primary_color);
            }
          }
        } catch (err) {
          console.error('Error fetching practice settings:', err);
          // Continue with default color if there's an error
        }
        
        // Fetch appointment data
        if (practiceData.id) {
          const apiKey = getApiKey();
          const appointmentUrl = `https://passport.nevadacloud.com/api/v1/public/appointments/${mail_uuid}?api_key=${apiKey}&practice_id=${practiceData.id}`;
          
          try {
            const response = await fetch(appointmentUrl);
            if (response.ok) {
              const appointmentData = await response.json();
              setAppointment(appointmentData);
            }
          } catch (err) {
            console.error('Error fetching appointment:', err);
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error in fetchData:', err);
        setError(err.message || 'Failed to load data');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [mail_uuid]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error || !mailData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Error Loading Content</h1>
          <p className="text-gray-700 mb-4">{error || 'Unable to load the requested data.'}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { banner_url: bannerUrl, practice, patient_preferred_name: patientName, message_body: messageBody, section_items: sectionItems = [] } = mailData;

  const iframeContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { 
            margin: 0; 
            padding: 0; 
            font-family: Arial, sans-serif;
            background: white;
            color: #333;
          }
          .banner-container {
            width: 100%;
            max-width: 100%;
            overflow: hidden;
            margin-bottom: 30px;
          }
          .banner-image {
            width: 100%;
            height: auto;
            display: block;
          }
          .content {
            padding: 0 40px 40px;
            max-width: 845px;
            margin: 0 auto;
          }
          .review-section {
            text-align: center;
            margin: 20px 0;
          }
          .review-title {
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 5px;
            color: #1a1a1a;
          }
          .review-subtitle {
            font-size: 14px;
            color: #666;
            margin-bottom: 30px;
          }
          .message-container {
            text-align: left;
            margin: 30px 0;
            line-height: 1.6;
            color: #333;
          }
          .greeting {
            margin-bottom: 15px;
          }
          .message-body {
            white-space: pre-line;
            margin-bottom: 15px;
          }
          .appointment-panel {
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            background-color: #f8fafc;
          }
          .appointment-title {
            font-weight: 600;
            margin-bottom: 10px;
            color: #1e293b;
          }
          .appointment-time {
            font-size: 16px;
            color: #334155;
            margin-bottom: 15px;
          }
          .add-to-calendar {
            display: inline-block;
            background-color: ${primaryColor};
            color: white;
            padding: 8px 16px;
            border-radius: 4px;
            text-decoration: none;
            font-size: 14px;
            transition: background-color 0.2s;
          }
          .add-to-calendar:hover {
            background-color: ${primaryColor};
            opacity: 0.9;
          }
          
          /* Info Modules */
          .info-modules {
            margin: 40px 0;
          }
          
          .info-module {
            display: flex;
            margin-bottom: 30px;
            background: white;
            border: none;
            border-radius: 0;
            overflow: hidden;
          }
          
          .info-image {
            width: 200px;
            height: 200px;
            object-fit: cover;
            flex-shrink: 0;
            margin: 0;
            padding: 0;
            border: none;
          }
          
          .info-content {
            padding: 20px;
            flex-grow: 1;
          }
          
          .info-title {
            font-size: 18px;
            font-weight: 600;
            margin: 0 0 10px 0;
            color: #1a1a1a;
          }
          
          .info-body {
            margin: 0 0 15px 0;
            color: #4a5568;
            line-height: 1.5;
          }
          
          .read-more {
            display: inline-block;
            background-color: ${primaryColor};
            color: white;
            padding: 8px 16px;
            border-radius: 4px;
            text-decoration: none;
            font-size: 14px;
            transition: background-color 0.2s;
          }
          
          .read-more:hover {
            background-color: ${primaryColor};
            opacity: 0.9;
          }
        </style>
      </head>
      <body>
        <div class="banner-container">
          <img src="${bannerUrl}" class="banner-image" alt="Banner" />
        </div>
        <div class="content">
          <div class="review-section">
            <h2 class="review-title">Rate and review</h2>
            <p class="review-subtitle">Share your experience to help others</p>
            <div class="stars-container" style="display: flex; justify-content: center; align-items: center; gap: 5px; margin-top: 15px;">
              ${[1, 2, 3, 4, 5].map(rating => `
                <a 
                  href="/practice_review_link/${practice?.id || ''}/${rating}/${mail_uuid}" 
                  target="_blank" 
                  key="rating-${rating}"
                  style="display: inline-block;"
                >
                  <img 
                    alt="${rating} stars" 
                    src="/images/stars${rating}.jpg" 
                    width="40" 
                    height="45" 
                    border="0"
                  />
                </a>
              `).join('')}
            </div>
          </div>
          
          <div class="message-container">
            <p class="greeting">Dear ${patientName || 'Valued Patient'},</p>
            <div class="message-body">${messageBody || ''}</div>
            ${appointment?.start_time ? `
              <div class="appointment-panel">
                <div class="appointment-title">Your next appointment is:</div>
                <div class="appointment-time">${formatAppointmentTime(appointment.start_time)}</div>
                ${(() => {
                  console.log('mailData:', mailData);
                  const href = "/appointment_cal_file/" + (mailData?.practice_id || '') + "/" + (mailData?.mail_uuid || '');
                  console.log('Generated href:', href);
                  return `
                    <a 
                      href="${href}" 
                      class="add-to-calendar"
                    >
                  `;
                })()}
                  Add to Calendar
                </a>
              </div>
            ` : ''}
            
            ${sectionItems.length > 0 ? `
              <div class="info-modules">
                ${sectionItems.map(item => `
                  <div class="info-module">
                    <img src="${item.imgurl}" alt="${item.title}" class="info-image" />
                    <div class="info-content">
                      <h3 class="info-title">${item.title}</h3>
                      <p class="info-body">${item.body}</p>
                      <a href="/info_centre/view/${item.id}/${practice.id}" class="read-more">Read More</a>
                    </div>
                  </div>
                `).join('')}
              </div>
            ` : ''}
          </div>
        </div>
      </body>
    </html>
  `;

  return (
    <div className="flex flex-col bg-gray-50 min-h-screen">
      <Navbar practiceId={practice.id} />
      {/* Hero Section */}
      <div className="w-full h-[500px] bg-[url('https://www.imageeyecareoptometrists.com/assets/info_centre_banner-4940284541b3ff321b2a3d735fc5ef1caa0f4c66de9804905118656edf31c88d.jpg')] bg-cover bg-center text-white">
        <div className="h-full bg-black bg-opacity-50 flex items-center justify-center">
        </div>
      </div>
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="w-[845px] max-w-full bg-white rounded-lg shadow-lg">
          <div 
            className="w-full"
            dangerouslySetInnerHTML={{ __html: iframeContent }}
          />
        </div>
      </div>
      <FooterPage />
    </div>
  );
}
