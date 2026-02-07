import React, { useEffect, useMemo, useRef, useState } from "react";
import { HeaderNav } from "../components/header-nav";
import { CameraContainer } from "../components/camera-container";
import { CameraControls } from "../components/camera-controls";
import { ResultsPanel } from "../components/results-panel";

export function ScanPage() {
  const videoRef = useRef<HTMLVideoElement>(null!);
  const canvasRef = useRef<HTMLCanvasElement>(null!);

  const [resultsText, setResultsText] = useState("No results yet.");
  const [centersText, setCentersText] = useState("No centers found yet.");

  const [isCameraOn, setIsCameraOn] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const start = async () => {
      if (!isCameraOn || !videoRef.current) return;

      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
    };

    start();

    return () => {
      if (isCameraOn) return;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      if (videoRef.current) videoRef.current.srcObject = null;
    };
  }, [isCameraOn]);

  const handlers = useMemo(() => {
    return {
      home: () => {
        // navigate / reset view if you want
      },
      camera: () => {
        // scroll into view / focus camera section if you want
      },
      Help: () => {
        //placeholder
      },
      startCamera: async () => {
        setIsCameraOn(true);
      },
      stopCamera: () => {
        setIsCameraOn(false);
      },
    };
  }, []);

  return (
    <div className="container py-3">
      <HeaderNav onHomeClick={handlers.home} onCameraClick={handlers.camera} />

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
    </div>
  );
}
