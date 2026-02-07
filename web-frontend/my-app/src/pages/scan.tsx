import React, { useMemo, useRef, useState } from "react";
import { HeaderNav } from "../components/header-nav";
import { CameraContainer } from "../components/camera-container";
import { CameraControls } from "../components/camera-controls";
import { ResultsPanel } from "../components/results-panel";

export function BinWisePage() {
  const videoRef = useRef<HTMLVideoElement>(null!);
  const canvasRef = useRef<HTMLCanvasElement>(null!);

  const [resultsText, setResultsText] = useState("No results yet.");
  const [centersText, setCentersText] = useState("No centers found yet.");

  const [isCameraOn, setIsCameraOn] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  const handlers = useMemo(() => {
    return {
      home: () => {
        // navigate / reset view if you want
      },
      camera: () => {
        // scroll into view / focus camera section if you want
      },
      startCamera: async () => {
        if (!videoRef.current) return;
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        streamRef.current = stream;
        videoRef.current.srcObject = stream;
        setIsCameraOn(true);
      },
      stopCamera: () => {
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        if (videoRef.current) videoRef.current.srcObject = null;
        setIsCameraOn(false);
      },
      capturePhoto: () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;

        const w = video.videoWidth || 640;
        const h = video.videoHeight || 480;
        canvas.width = w;
        canvas.height = h;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.drawImage(video, 0, 0, w, h);

        // example placeholder updates:
        setResultsText("Captured photo (placeholder result).");
        setCentersText("Nearest centers (placeholder).");
      },
    };
  }, []);

  return (
    <div className="container py-3">
      <h1>BinWise</h1>

      <HeaderNav onHomeClick={handlers.home} onCameraClick={handlers.camera} />

      <div className="my-3">
        <CameraContainer videoRef={videoRef} canvasRef={canvasRef} />
      </div>

      <CameraControls
        onStartCamera={handlers.startCamera}
        onStopCamera={handlers.stopCamera}
        onCapturePhoto={handlers.capturePhoto}
        startDisabled={isCameraOn}
        stopDisabled={!isCameraOn}
        captureDisabled={!isCameraOn}
      />

      <ResultsPanel resultsText={resultsText} recyclingCentersText={centersText} />
    </div>
  );
}
