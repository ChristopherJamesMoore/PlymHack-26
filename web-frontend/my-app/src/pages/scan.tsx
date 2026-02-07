import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HeaderNav } from "../components/header-nav";
import { CameraContainer } from "../components/camera-container";
import { CameraControls } from "../components/camera-controls";
import { ResultsPanel } from "../components/results-panel";

export function ScanPage() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null!);
  const canvasRef = useRef<HTMLCanvasElement>(null!);

  const [resultsText, setResultsText] = useState("No results yet.");
  const [centersText, setCentersText] = useState("No centers found yet.");
  const [locationText, setLocationText] = useState("Location not retrieved yet.");

  const [isCameraOn, setIsCameraOn] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const scanTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const savedLocation = localStorage.getItem('userLocation');
    if (savedLocation) {
      setLocationText(savedLocation);
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
          },
          (error) => {
            setLocationText(`Error: ${error.message}`);
          }
        );
      },
    };
  }, [navigate]);

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

        <button id="location-button"
          onClick={handlers.getLocation}
        >
          Get My Location
        </button>
    </div>
  );
}
