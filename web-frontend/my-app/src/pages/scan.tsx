import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HeaderNav } from "../components/header-nav";
import { CameraContainer } from "../components/camera-container";
import { CameraControls } from "../components/camera-controls";
import { ResultsPanel } from "../components/results-panel";
import { RecyclingMap } from "../components/recycling-map";

export function ScanPage() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null!);
  const canvasRef = useRef<HTMLCanvasElement>(null!);

  const [resultsText, setResultsText] = useState("No results yet.");
  const [centersText, setCentersText] = useState("No centers found yet.");
  const [locationText, setLocationText] = useState("Location not retrieved yet.");
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [mapKey, setMapKey] = useState(0);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);

  const [isCameraOn, setIsCameraOn] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const scanTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const savedLocation = localStorage.getItem('userLocation');
    if (savedLocation) {
      setLocationText(savedLocation);
      // Parse the coordinates from the saved location string
      const latMatch = savedLocation.match(/Latitude: ([-\d.]+)/);
      const lonMatch = savedLocation.match(/Longitude: ([-\d.]+)/);
      if (latMatch && lonMatch) {
        setUserLocation({
          lat: parseFloat(latMatch[1]),
          lon: parseFloat(lonMatch[1]),
        });
      }
    }
  }, []);

  useEffect(() => {
    const start = async () => {
      if (!isCameraOn || !videoRef.current) return;

      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
    };

    start();

    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      if (videoRef.current) videoRef.current.srcObject = null;
    };
  }, [isCameraOn]);

  const captureAndDetect = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) return;

    const width = video.videoWidth;
    const height = video.videoHeight;
    if (!width || !height) return;

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, width, height);

    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.8)
    );
    if (!blob) return;

    const form = new FormData();
    form.append("image", blob, "frame.jpg");

    const res = await fetch("/detect", { method: "POST", body: form });
    if (!res.ok) return;

    const data = await res.json();
    const top = data?.top;
    if (top?.label) {
      const confValue =
        typeof top.conf === "number" ? Number(top.conf) : null;
      if (confValue !== null && confValue < 0.5) {
        setResultsText("I'm not sure.");
        return;
      }
      const conf =
        confValue !== null ? ` (${(confValue * 100).toFixed(1)}%)` : "";
      setResultsText(`${top.label}${conf}`);
    } else {
      setResultsText("No results yet.");
    }
  }, []);

  useEffect(() => {
    if (!isCameraOn) {
      if (scanTimerRef.current) {
        window.clearInterval(scanTimerRef.current);
        scanTimerRef.current = null;
      }
      return;
    }

    if (scanTimerRef.current) return;

    scanTimerRef.current = window.setInterval(() => {
      captureAndDetect().catch(() => {
        // ignore frame errors
      });
    }, 700);

    return () => {
      if (scanTimerRef.current) {
        window.clearInterval(scanTimerRef.current);
        scanTimerRef.current = null;
      }
    };
  }, [captureAndDetect, isCameraOn]);

  const handlers = useMemo(() => {
    return {
      home: () => {
        navigate('/');
      },
      camera: () => {
        navigate('/scan');
      },
      Help: () => {
        console.log('Help clicked');
      },
      startCamera: async () => {
        setIsCameraOn(true);
      },
      stopCamera: () => {
        setIsCameraOn(false);
      },
      getLocation: () => {
        if (!navigator.geolocation) {
          setLocationText("Geolocation not supported by this browser.");
          return;
        }

        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            const locationString = `Latitude: ${latitude.toFixed(4)}, Longitude: ${longitude.toFixed(4)}`;
            setLocationText(locationString);
            localStorage.setItem('userLocation', locationString);
            setUserLocation({ lat: latitude, lon: longitude });
            setIsMapVisible(true);
          },
          (error) => {
            setLocationText(`Error: ${error.message}`);
          }
        );
      },
      onRecyclingCentersFound: (count: number) => {
        setCentersText(count > 0 ? `Found ${count} recycling center${count !== 1 ? 's' : ''} nearby` : 'No recycling centers found nearby');
      },
    };
  }, [navigate]);

  const handleLocationClick = () => {
    if (isMapVisible) {
      setIsMapVisible(false);
      return;
    }
    setMapKey((prev) => prev + 1);
    handlers.getLocation();
  };

  return (
    <div className="container py-3">
      <HeaderNav 
        onHomeClick={handlers.home} 
        onCameraClick={handlers.camera}
        onHelpClick={handlers.Help}
      />

      <img id="logo" src="/images/LogoWriting.png"></img>
      <div className="my-3">
        <CameraContainer videoRef={videoRef} canvasRef={canvasRef} isVisible={isCameraOn} />
      </div>

      <CameraControls
        onStartCamera={handlers.startCamera}
        onStopCamera={handlers.stopCamera}
        startDisabled={isCameraOn}
        stopDisabled={!isCameraOn}
        captureDisabled={!isCameraOn}
      />
      <ResultsPanel resultsText={resultsText} recyclingCentersText={centersText} />

      <div className="map-wrapper">
        <button id="location-button" onClick={handleLocationClick}>
          <img src="/images/Turtle.png" className="location-icon" ></img>
          Get My Location
        </button>

        {isMapVisible && userLocation && (
          <RecyclingMap 
            key={mapKey}
            latitude={userLocation.lat}
            longitude={userLocation.lon}
            onRecyclingCentersFound={handlers.onRecyclingCentersFound}
          />
        )}
      </div>
    </div>
  );
}
