import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BackdropBlur } from '../ui/BackdropBlur';
import { 
  MapPinIcon, 
  TruckIcon, 
  BuildingStorefrontIcon,
  InformationCircleIcon 
} from '@heroicons/react/24/outline';

interface LocationFormProps {
  data: {
    location: {
      city: string;
      state: string;
      country: string;
      zipCode: string;
      coordinates: {
        latitude: number;
        longitude: number;
      } | null;
      shippingAvailable: boolean;
      localPickupOnly: boolean;
    };
  };
  onChange: (updates: any) => void;
  errors: any;
}

const popularCountries = [
  'United States', 'Canada', 'United Kingdom', 'Australia', 
  'Germany', 'France', 'Japan', 'Other'
];

export const LocationForm: React.FC<LocationFormProps> = ({
  data,
  onChange,
  errors
}) => {
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  const handleLocationChange = (field: string, value: any) => {
    onChange({
      location: {
        ...data.location,
        [field]: value
      }
    });
  };

  const detectCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }

    setIsDetectingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Use a reverse geocoding service to get address details
          // For demo purposes, we'll set coordinates and let user fill details
          onChange({
            location: {
              ...data.location,
              coordinates: { latitude, longitude }
            }
          });
          
          // You could integrate with a geocoding API here to auto-fill address
          alert('Location detected! Please fill in the address details.');
        } catch (error) {
          console.error('Error getting location details:', error);
          alert('Location detected but could not get address details.');
        } finally {
          setIsDetectingLocation(false);
        }
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Could not detect your location. Please enter manually.');
        setIsDetectingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Location & Delivery
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Help buyers find your product and understand delivery options
        </p>
      </div>

      <div className="space-y-6">
        {/* Auto-detect Location */}
        <BackdropBlur className="p-6 rounded-xl border border-white/20 dark:border-gray-700/50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Auto-detect Location
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Use your device's location to fill in details automatically
              </p>
            </div>
            <button
              onClick={detectCurrentLocation}
              disabled={isDetectingLocation}
              className="flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg transition-colors duration-200"
            >
              {isDetectingLocation ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Detecting...
                </>
              ) : (
                <>
                  <MapPinIcon className="w-4 h-4 mr-2" />
                  Detect Location
                </>
              )}
            </button>
          </div>
          
          {data.location.coordinates && (
            <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-700">
              <div className="flex items-center text-sm text-green-800 dark:text-green-200">
                <MapPinIcon className="w-4 h-4 mr-2" />
                Location detected: {data.location.coordinates.latitude.toFixed(6)}, {data.location.coordinates.longitude.toFixed(6)}
              </div>
            </div>
          )}
        </BackdropBlur>

        {/* Address Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <BackdropBlur className="p-6 rounded-xl border border-white/20 dark:border-gray-700/50">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              City
            </label>
            <input
              type="text"
              value={data.location.city}
              onChange={(e) => handleLocationChange('city', e.target.value)}
              placeholder="Enter your city"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none transition-all duration-200"
            />
          </BackdropBlur>

          <BackdropBlur className="p-6 rounded-xl border border-white/20 dark:border-gray-700/50">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              State/Province
            </label>
            <input
              type="text"
              value={data.location.state}
              onChange={(e) => handleLocationChange('state', e.target.value)}
              placeholder="Enter your state or province"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none transition-all duration-200"
            />
          </BackdropBlur>

          <BackdropBlur className="p-6 rounded-xl border border-white/20 dark:border-gray-700/50">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Country
            </label>
            <select
              value={data.location.country}
              onChange={(e) => handleLocationChange('country', e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none transition-all duration-200"
            >
              <option value="">Select country</option>
              {popularCountries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </BackdropBlur>

          <BackdropBlur className="p-6 rounded-xl border border-white/20 dark:border-gray-700/50">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              ZIP/Postal Code
            </label>
            <input
              type="text"
              value={data.location.zipCode}
              onChange={(e) => handleLocationChange('zipCode', e.target.value)}
              placeholder="Enter ZIP or postal code"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none transition-all duration-200"
            />
          </BackdropBlur>
        </div>

        {/* Delivery Options */}
        <BackdropBlur className="p-6 rounded-xl border border-white/20 dark:border-gray-700/50">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Delivery Options
          </h3>
          
          <div className="space-y-4">
            {/* Local Pickup */}
            <label className={`flex items-start p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
              data.location.localPickupOnly
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            }`}>
              <input
                type="checkbox"
                checked={data.location.localPickupOnly}
                onChange={(e) => handleLocationChange('localPickupOnly', e.target.checked)}
                className="mt-1 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
              />
              <div className="ml-3 flex-1">
                <div className="flex items-center">
                  <BuildingStorefrontIcon className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-2" />
                  <span className="font-medium text-gray-900 dark:text-white">
                    Local Pickup Available
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Buyers can pick up the item from your location
                </p>
              </div>
            </label>

            {/* Shipping */}
            <label className={`flex items-start p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
              data.location.shippingAvailable
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            }`}>
              <input
                type="checkbox"
                checked={data.location.shippingAvailable}
                onChange={(e) => handleLocationChange('shippingAvailable', e.target.checked)}
                className="mt-1 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
              />
              <div className="ml-3 flex-1">
                <div className="flex items-center">
                  <TruckIcon className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-2" />
                  <span className="font-medium text-gray-900 dark:text-white">
                    Shipping Available
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  You can ship the item to buyers
                </p>
              </div>
            </label>
          </div>

          {data.location.shippingAvailable && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700"
            >
              <div className="flex items-start">
                <InformationCircleIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Shipping Note:</strong> You'll discuss shipping costs and methods 
                  directly with buyers during negotiations. Consider packaging requirements 
                  and handling time when setting your prices.
                </div>
              </div>
            </motion.div>
          )}

          {!data.location.localPickupOnly && !data.location.shippingAvailable && (
            <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/30 rounded-lg border border-amber-200 dark:border-amber-700">
              <div className="flex items-start">
                <InformationCircleIcon className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 mr-2 flex-shrink-0" />
                <div className="text-sm text-amber-800 dark:text-amber-200">
                  <strong>Recommendation:</strong> Select at least one delivery option 
                  to make your listing more attractive to buyers.
                </div>
              </div>
            </div>
          )}
        </BackdropBlur>

        {/* Location Privacy */}
        <BackdropBlur className="p-6 rounded-xl border border-white/20 dark:border-gray-700/50">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            🔒 Privacy & Safety
          </h3>
          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-start">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <div>
                Only your general area (city/region) will be shown to buyers
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <div>
                Your exact address is never displayed publicly
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <div>
                Meet in safe, public places for local pickups
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <div>
                Use secure payment methods for all transactions
              </div>
            </div>
          </div>
        </BackdropBlur>
      </div>
    </div>
  );
};
