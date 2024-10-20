
import { cn } from "@/lib/utils";
import { type GoogleAddress } from "@/types/location";
import { useGeolocation } from "@uidotdev/usehooks";
import { useMapsLibrary } from "@vis.gl/react-google-maps";
import { MapPinIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const LocationButton = ({ onClick, className }: { onClick: () => void; className?: string }) => {
  return (
    <button
      onClick={onClick}
      type="button"
      aria-label="Use your current location"
      className={cn("p-xs", className)}
    >
      <MapPinIcon className="size-icon" />
    </button>
  );
};

const UserLocation = ({
  onLocationChange,
}: {
  onLocationChange: (location: GoogleAddress) => void;
}) => {
  // TODO: What happens if the user denies geolocation? User changes location? VPN?
  const geolocation = useGeolocation({ maximumAge: 500 });
  const geocoding = useMapsLibrary("geocoding");

  const loaded = useMemo(() => geolocation && !geolocation.loading, [geolocation]);

  const updateLocation = useCallback(() => {
    if (!loaded || !geocoding) {
      return;
    }

    if (geolocation.error || !geolocation.latitude || !geolocation.longitude) {
      toast.error(geolocation.error?.message ?? "Error getting location");
      return;
    }

    const { latitude, longitude } = geolocation;
    const geocoder = new geocoding.Geocoder();
    geocoder
      .geocode({
        location: {
          lat: latitude,
          lng: longitude,
        },
      })
      .then((result: any) => {
        if (result.results.length < 1) {
          throw new Error("No results found");
        }
        onLocationChange(result.results[0] as GoogleAddress);
      })
      .catch((error: Error) => {
        toast.error(<>{error.message ?? "An error occurred while fetching location"}</>);
      });
  }, [loaded, geocoding, onLocationChange, geolocation]);

  useEffect(() => {
    console.log(
      "GeolocationButton",
      geolocation,
      window.navigator.geolocation.getCurrentPosition(console.log), // TODO: fix
    );
    if (loaded) {
      updateLocation();
    }
  }, [geolocation, loaded, updateLocation]);

  return (
    <>
      {!loaded ? (
        <LoadingIcon className="animate-spin p-xs text-muted-foreground" />
      ) : (
        <LocationButton onClick={updateLocation} className="p-xs" />
      )}
    </>
  );
};

const GeolocationButton = ({
  className,
  onLocationChange,
}: {
  className?: string;
  onLocationChange: (location: any) => void;
}) => {
  const [showLocation, setShowLocation] = useState(false);

  return (
    <>
      <div className={cn(className)}>
        {showLocation ? (
          <UserLocation onLocationChange={onLocationChange} />
        ) : (
          <LocationButton onClick={() => setShowLocation(true)} />
        )}
      </div>
    </>
  );
};

export default GeolocationButton;
