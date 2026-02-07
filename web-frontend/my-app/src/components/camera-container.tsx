import React, { RefObject } from "react";

export type CameraContainerProps = {
  videoRef?: RefObject<HTMLVideoElement>;
  canvasRef?: RefObject<HTMLCanvasElement>;
  isVisible?: boolean;
};

export function CameraContainer({ videoRef, canvasRef, isVisible = false }: CameraContainerProps) {
  return (
    <div className="camera-container position-relative">
      {isVisible && (
        <video id="videoFeed" ref={videoRef} autoPlay playsInline className="w-100 rounded" />
      )}
    </div>
  );
}
