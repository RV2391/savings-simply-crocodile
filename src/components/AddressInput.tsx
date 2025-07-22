
import { BackendAddressInput } from "./BackendAddressInput";
import type { AddressComponents } from "@/types";

interface AddressInputProps {
  onLocationChange: (location: { lat: number; lng: number }) => void;
  onNearestInstituteFound: (lat: number, lng: number) => void;
  onAddressComponentsChange: (components: AddressComponents) => void;
}

export const AddressInput = (props: AddressInputProps) => {
  // Verwende immer die Backend-Version
  return <BackendAddressInput {...props} />;
};
