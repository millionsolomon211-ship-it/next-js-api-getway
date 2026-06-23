'use client';

import React, { useMemo, useState } from 'react';
import * as d3 from 'd3-geo';

interface RegionProperties {
  id: string;
  name: string;
}

interface GeoJSONFeature {
  type: "Feature";
  geometry: {
    type: "Polygon" | "MultiPolygon";
    coordinates: any[];
  };
  properties: RegionProperties;
}

interface EthiopiaMapProps {
  geoData: { type: "FeatureCollection"; features: GeoJSONFeature[] };
  onRegionClick?: (region: RegionProperties) => void;
}

const EthiopiaMap: React.FC<EthiopiaMapProps> = ({ geoData, onRegionClick }) => {
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

  const projection = useMemo(() => {
    // Automatically center and scale the projection to fit an 800x600 viewable area
    return d3.geoMercator().fitSize([800, 600], geoData as any);
  }, [geoData]);

  const pathGenerator = d3.geoPath(projection);

  // A modern, vibrant color palette for the map regions (14 colors)
  const mapColors = [
    '#6366f1', // Indigo
    '#ec4899', // Pink
    '#f59e0b', // Amber
    '#10b981', // Emerald
    '#8b5cf6', // Violet
    '#ef4444', // Red
    '#06b6d4', // Cyan
    '#f97316', // Orange
    '#84cc16', // Lime
    '#14b8a6', // Teal
    '#3b82f6', // Blue
    '#d946ef', // Fuchsia
    '#eab308', // Yellow
    '#f43f5e'  // Rose
  ];

  return (
    <div className="relative w-full max-w-4xl mx-auto p-4 bg-white/5 rounded-3xl backdrop-blur-xl border border-white/10 shadow-[0_0_40px_rgba(99,102,241,0.15)] overflow-hidden">
      
      {/* Dynamic Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/20 blur-[100px] pointer-events-none rounded-full" />
      
      <svg viewBox="0 0 800 600" className="relative w-full h-auto drop-shadow-xl z-10">
        <g>
          {geoData.features.map((feature, index) => {
            const pathData = pathGenerator(feature as any);
            const regionId = feature.properties.id;
            const isHovered = hoveredRegion === regionId;
            const regionColor = mapColors[index % mapColors.length];
            
            // For a subtle hover brightness effect without d3-color complexity
            const fillOpacity = isHovered ? 0.9 : 0.7;

            return (
              <path
                key={regionId}
                d={pathData || ''}
                fill={regionColor}
                fillOpacity={fillOpacity}
                stroke="#ffffff"
                strokeWidth={isHovered ? "2.5" : "1"}
                strokeLinejoin="round"
                className="cursor-pointer transition-all duration-300 outline-none"
                onMouseEnter={() => setHoveredRegion(regionId)}
                onMouseLeave={() => setHoveredRegion(null)}
                onClick={() => {
                  if (onRegionClick) onRegionClick(feature.properties);
                }}
              />
            );
          })}
        </g>
      </svg>
      {/* Overlay info box */}
      <div className="absolute bottom-8 right-8 z-20 pointer-events-none bg-black/60 text-white px-6 py-3 rounded-2xl border border-white/20 backdrop-blur-lg shadow-2xl">
        <h3 className="text-sm text-indigo-300 font-semibold mb-1 uppercase tracking-wider">Status</h3>
        <p className="text-lg font-medium">
          {hoveredRegion ? `Hovering: ${hoveredRegion}` : 'Interactive Map Running'}
        </p>
      </div>
    </div>
  );
};

export default EthiopiaMap;
