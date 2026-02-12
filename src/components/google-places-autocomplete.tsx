"use client"

import { useEffect, useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { MapPin, Loader2 } from "lucide-react"

interface GooglePlacesAutocompleteProps {
  value: string
  onChange: (value: string) => void
  onSelect: (address: string, placeId?: string) => void
  placeholder?: string
  className?: string
  id?: string
}

declare global {
  interface Window {
    google: any
  }
}

export function GooglePlacesAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = "Enter your address",
  className = "",
  id = "address"
}: GooglePlacesAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<any>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Load Google Maps API script
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      console.warn("Google Maps API key not found. Autocomplete will not work.")
      return
    }

    // Check if script is already loaded
    if (window.google && window.google.maps && window.google.maps.places) {
      setIsLoaded(true)
      initializeAutocomplete()
      return
    }

    // Check if script tag already exists in the document
    const scriptUrl = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGooglePlaces`
    const existingScript = document.querySelector(`script[src="${scriptUrl}"]`)
    
    if (existingScript) {
      // Script is already loading, wait for it to complete
      setIsLoading(true)
      const checkLoaded = setInterval(() => {
        if (window.google && window.google.maps && window.google.maps.places) {
          clearInterval(checkLoaded)
          setIsLoaded(true)
          setIsLoading(false)
          initializeAutocomplete()
        }
      }, 100)
      
      return () => {
        clearInterval(checkLoaded)
      }
    }

    setIsLoading(true)

    const script = document.createElement("script")
    script.src = scriptUrl
    script.async = true
    script.defer = true

    // Define callback function
    ;(window as any).initGooglePlaces = () => {
      setIsLoaded(true)
      setIsLoading(false)
      initializeAutocomplete()
    }

    script.onerror = () => {
      console.error("Failed to load Google Maps API")
      setIsLoading(false)
    }

    document.head.appendChild(script)

    return () => {
      // Clean up
      if ((window as any).initGooglePlaces) {
        delete (window as any).initGooglePlaces
      }
    }
  }, [])

  const initializeAutocomplete = () => {
    if (!inputRef.current || !window.google) return

    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ["address"],
      componentRestrictions: { country: "rw" }, // Rwanda
      fields: ["formatted_address", "place_id", "geometry", "name"]
    })

    autocompleteRef.current = autocomplete

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace()
      if (place.formatted_address) {
        onChange(place.formatted_address)
        onSelect(place.formatted_address, place.place_id)
      }
    })
  }

  return (
    <div className="relative">
      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
      <Input
        ref={inputRef}
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`pl-10 ${className}`}
        disabled={isLoading}
      />
      {isLoading && (
        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
      )}
    </div>
  )
}

