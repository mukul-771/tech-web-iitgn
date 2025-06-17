"use client";

import React from "react";
import { MapPin, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export function GoogleMaps() {
  const iitGandhinagarCoords = {
    lat: 23.2132656,
    lng: 72.6856664
  };

  const googleMapsUrl = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3671.7!2d72.6830915!3d23.2132656!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395c2adec1f16d8d%3A0xdc447b8706689bc3!2sIndian%20Institute%20Of%20Technology%20Gandhinagar%20(IIT%20Gandhinagar)!5e0!3m2!1sen!2sin!4v1234567890123!5m2!1sen!2sin`;

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${iitGandhinagarCoords.lat},${iitGandhinagarCoords.lng}&destination_place_id=ChIJjRbxwexcXDkRw5toB4dHRNw`;

  return (
    <div className="glass rounded-2xl p-8 space-y-8 shadow-2xl">
      <div className="text-center space-y-3">
        <h2 className="text-4xl font-bold tracking-tighter bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Find Us
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Located at the heart of IIT Gandhinagar campus
        </p>
      </div>

      {/* Interactive Map */}
      <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <iframe
          src={googleMapsUrl}
          width="100%"
          height="450"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="w-full rounded-2xl"
          title="IIT Gandhinagar Location"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <Button asChild size="lg">
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2"
          >
            <MapPin className="h-4 w-4" />
            Get Directions
            <ExternalLink className="h-3 w-3" />
          </a>
        </Button>

        <Button asChild variant="outline" size="lg">
          <a
            href={`https://www.google.com/maps/place/Indian+Institute+of+Technology+Gandhinagar/@${iitGandhinagarCoords.lat},${iitGandhinagarCoords.lng},17z`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2"
          >
            View on Google Maps
            <ExternalLink className="h-3 w-3" />
          </a>
        </Button>
      </div>
    </div>
  );
}
