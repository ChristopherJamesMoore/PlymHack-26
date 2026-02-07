import React, { RefObject } from "react";

export type CameraContainerProps = {
  videoRef?: RefObject<HTMLVideoElement>;
  canvasRef?: RefObject<HTMLCanvasElement>;
};

export function CameraContainer({ videoRef, canvasRef }: CameraContainerProps) {
  return (
    <div className="camera-container position-relative">
      <video id="videoFeed" ref={videoRef} autoPlay playsInline className="w-100 rounded" />
      <canvas id="canvas" ref={canvasRef} className="w-100 rounded mt-2" />
    </div>
  );
}
