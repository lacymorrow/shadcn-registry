"use client";

import LoadingIcon from "@/app/loading";
import GeolocationButton from "@/components/buttons/geolocation-button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { env } from "@/env";
import { LOCAL_STORAGE_KEYS } from "@/lib/constants/local-storage-keys";
import logger from "@/lib/services/logger";
import { cn } from "@/lib/utils";
import { debounce } from "@/lib/utils/debounce";
import { makeSerializable } from "@/lib/utils/make-serializable";
import { type GoogleAddress } from "@/types/location";
import { useIsClient, useLocalStorage } from "@uidotdev/usehooks";
import { APIProvider, useMapsLibrary } from "@vis.gl/react-google-maps";
import { forwardRef, useCallback, useEffect, useRef, useState } from "react";

/**
 * Finds the nearest ZIP code for a given latitude and longitude
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<string|null>} The nearest ZIP code if found, null otherwise
 */
function findNearestZipCode(location: GoogleAddress) {
  return new Promise((resolve, reject) => {
    if (!location.geometry?.location?.lat || !location.geometry?.location?.lng) {
      return resolve(null);
    }

    const geocoder = new google.maps.Geocoder();
    const latlng = new google.maps.LatLng(
      location.geometry.location.lat,
      location.geometry.location.lng,
    );

    void geocoder.geocode({ location: latlng }, (results, status) => {
      if (status === google.maps.GeocoderStatus.OK && results) {
        if (results[0]) {
          const zipComponent = results[0].address_components.find((component) =>
            component.types.includes("postal_code"),
          );

          if (zipComponent) {
            resolve(zipComponent.long_name);
          } else {
            console.log("No ZIP code found in the result");
            resolve(null);
          }
        } else {
          console.log("No results found");
          resolve(null);
        }
      } else {
        console.error("Geocoder failed due to: " + status);
        reject(new Error("Geocoder failed due to: " + status));
      }
    });
  });
}

const serializeLocation = (value: any) => {
  if (!value?.geometry?.location?.lat || !value?.geometry?.location?.lng) {
    return value;
  }

  const plainLocation = {
    ...value,
    formattedAddress: value.formatted_address,
    geometry: {
      // ...value.geometry,
      // Google location has lat/lng as functions
      location: {
        lat:
          typeof value.geometry.location.lat === "function"
            ? value.geometry.location.lat()
            : value.geometry.location.lat,
        lng:
          typeof value.geometry.location.lng === "function"
            ? value.geometry.location.lng()
            : value.geometry.location.lng,
      },
    },
    // Add other necessary properties in a similar manner
  };
  return makeSerializable(plainLocation);
};

interface LocationInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onLocationChange?: (location: GoogleAddress) => void;
  isDisplayed?: boolean;
}

const LocationInputWithAPIProvider = forwardRef<HTMLInputElement, LocationInputProps>(
  ({ onLocationChange, isDisplayed = true, ...props }, ref) => {
    const [isLoading, setIsLoading] = useState(false);
    const [storedLocation, setStoredLocation] = useLocalStorage<GoogleAddress | null>(
      LOCAL_STORAGE_KEYS.location,
      null,
    );
    const [location, setLocation] = useState<GoogleAddress | null>(storedLocation);
    const [addressInput, setAddressInput] = useState(props.value);
    const autocompleteRef = useRef<HTMLInputElement | null>(null);
    const places = useMapsLibrary("places");
    const geocoding = useMapsLibrary("geocoding");

    const handleSetLocation = useCallback(
      (value: any) => {
        if (!value) {
          return;
        }

        const plainLocation = serializeLocation(value);
        void findNearestZipCode(plainLocation)
          .then((zipCode) => {
            if (zipCode) {
              plainLocation.zipCode = zipCode;

              logger.info("Geocoded", plainLocation);
              if (onLocationChange) {
                onLocationChange(plainLocation);
              }
              setLocation(plainLocation);
              setStoredLocation(plainLocation);
            }
          })
          .catch((error) => {
            logger.error(error);
          });
      },
      [onLocationChange, setStoredLocation, setLocation],
    );
    // Google Places Autocomplete
    useEffect(() => {
      if (!places || !autocompleteRef.current) {
        return;
      }

      const autocomplete = new places.Autocomplete(autocompleteRef.current, {
        types: ["geocode"],
      });

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace() as GoogleAddress;
        if (place?.formatted_address) {
          handleSetLocation(place);
          setAddressInput(place.formatted_address);
        }
      });
    }, [places, onLocationChange, handleSetLocation]);

    const geocodeAddress = useCallback(
      (value: string) => {
        if (!geocoding) {
          return;
        }
        setIsLoading(true);
        new geocoding.Geocoder()
          .geocode({
            address: value,
          })
          .then((response: google.maps.GeocoderResponse) => {
            if (response.results.length < 1) {
              throw new Error("No results found");
            }
            const location: any = response.results[0]!;

            handleSetLocation(location);
          })
          .catch((error: Error) => {
            logger.error(error);
          })
          .finally(() => {
            setIsLoading(false);
          });
      },
      [geocoding, handleSetLocation],
    );

    const debouncedGeocodeAddress = debounce((value: string) => {
      geocodeAddress(value);
    }, 300);

    const handleInputChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setAddressInput(newValue);
        handleSetLocation(null);

        if (newValue.length > 3) {
          debouncedGeocodeAddress(newValue);
        } else {
          setIsLoading(false);
        }

        // React Hook Form
        if (props.onChange) {
          props.onChange(e);
        }
      },
      [debouncedGeocodeAddress, handleSetLocation, props],
    );

    // Geolocation with map
    const handleLocationChange = useCallback(
      (selectedLocation: GoogleAddress) => {
        if (!selectedLocation.formatted_address) {
          return;
        }

        handleSetLocation(selectedLocation);

        setAddressInput(selectedLocation.formatted_address);
        if (autocompleteRef.current) {
          autocompleteRef.current.focus();
        }
      },
      [handleSetLocation, setAddressInput, autocompleteRef],
    );

    return (
      <>
        <div className="flex flex-col gap-xs">
          <div className="relative">
            <input
              {...props}
              name={`${props.name}_object` || "location"}
              type="hidden"
              value={JSON.stringify(location)}
            />
            <Input
              {...props}
              className={cn("pr-xl", props.className)}
              ref={(node) => {
                if (typeof ref === "function") {
                  ref(node);
                } else if (ref) {
                  ref.current = node;
                }
                autocompleteRef.current = node;
              }}
              autoComplete="street-address"
              value={addressInput}
              onChange={handleInputChange}
              type="text"
              aria-label="Location"
              placeholder="Enter a location"
            />
            <div className="absolute bottom-0 right-0 top-0 flex items-center justify-center">
              <LoadingIcon
                className={cn("opacity-0 transition-opacity", isLoading && "opacity-80")}
              />
              <GeolocationButton className="" onLocationChange={handleLocationChange} />
            </div>
          </div>
          {isDisplayed && (
            <p className="text-xs text-muted-foreground">{location?.formatted_address}</p>
          )}
        </div>
      </>
    );
  },
);

LocationInputWithAPIProvider.displayName = "LocationInputWithAPIProvider";

export const LocationInput = forwardRef<HTMLInputElement, LocationInputProps>((props, ref) => {
  const isClient = useIsClient();
  return (
    <APIProvider apiKey={env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
      {isClient ? (
        <LocationInputWithAPIProvider {...props} ref={ref} />
      ) : (
        <Skeleton className="h-10 w-full" />
      )}
    </APIProvider>
  );
});

LocationInput.displayName = "LocationInput";
