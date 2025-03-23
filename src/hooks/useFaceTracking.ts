import { useEffect, useRef, useState } from 'react';
import { FaceMesh } from '@mediapipe/face_mesh';
import { FaceTrackingState } from '../types/vrm';

export const useFaceTracking = () => {
  const [trackingState, setTrackingState] = useState<FaceTrackingState>({
    isTracking: false,
    blendShapes: {},
    headRotation: [0, 0, 0],
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const faceMeshRef = useRef<FaceMesh | null>(null);

  useEffect(() => {
    const initializeFaceMesh = async () => {
      const faceMesh = new FaceMesh({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
        },
      });

      faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      faceMesh.onResults((results) => {
        if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
          const landmarks = results.multiFaceLandmarks[0];
          // TODO: Convert landmarks to blend shapes and head rotation
          setTrackingState({
            isTracking: true,
            blendShapes: {},
            headRotation: [0, 0, 0],
          });
        } else {
          setTrackingState(prev => ({ ...prev, isTracking: false }));
        }
      });

      faceMeshRef.current = faceMesh;
    };

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
      }
    };

    initializeFaceMesh();
    startCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
      faceMeshRef.current?.close();
    };
  }, []);

  useEffect(() => {
    if (videoRef.current && faceMeshRef.current) {
      const processFrame = async () => {
        if (videoRef.current && faceMeshRef.current) {
          await faceMeshRef.current.send({ image: videoRef.current });
        }
        requestAnimationFrame(processFrame);
      };

      processFrame();
    }
  }, []);

  return trackingState;
}; 