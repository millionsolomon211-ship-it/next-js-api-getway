import React from 'react';
import EthiopiaMap from '../EthiopiaMap';
import ethData from '../ethiopia.json';

export default function MapPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-8 font-sans">
      <div className="text-center mb-10 space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 bg-clip-text text-transparent drop-shadow-sm">
          Interactive Regions Map
        </h1>
        <p className="text-gray-400 max-w-xl mx-auto">
          Explore the beautifully colored regions of Ethiopia. Hover over a region to highlight it, or click to interact. Built dynamically from real GeoJSON data.
        </p>
      </div>
      
      <EthiopiaMap 
        geoData={ethData as any} 
      />
    </div>
  );
}
