import { useEffect, useRef } from 'react';
import { FaceMesh } from '@mediapipe/face_mesh';
import { VRM } from '@pixiv/three-vrm';

export const useFaceTracking = (vrm: VRM | null) => {
  const faceMeshRef = useRef<FaceMesh | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!vrm) return;

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
      if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) return;

      const faceLandmarks = results.multiFaceLandmarks[0];
      if (!faceLandmarks) return;

      // Update VRM face rotation
      const nose = faceLandmarks[5];
      const leftEye = faceLandmarks[33];
      const rightEye = faceLandmarks[263];

      // Calculate face direction
      const faceDirection = {
        x: (nose.x - 0.5) * 2,
        y: (nose.y - 0.5) * 2,
        z: (nose.z - 0.5) * 2,
      };

      // Update VRM rotation
      vrm.scene.rotation.y = faceDirection.x * Math.PI;
      vrm.scene.rotation.x = faceDirection.y * Math.PI;
      vrm.scene.rotation.z = faceDirection.z * Math.PI;

      // Update VRM eye rotation
      const eyeRotation = {
        x: (leftEye.y - rightEye.y) * 2,
        y: (leftEye.x - rightEye.x) * 2,
      };

      // Update VRM eye bones
      if (vrm.humanoid) {
        const leftEyeBone = vrm.humanoid.getNormalizedBoneNode('leftEye');
        const rightEyeBone = vrm.humanoid.getNormalizedBoneNode('rightEye');

        if (leftEyeBone) {
          leftEyeBone.rotation.x = eyeRotation.x;
          leftEyeBone.rotation.y = eyeRotation.y;
        }

        if (rightEyeBone) {
          rightEyeBone.rotation.x = eyeRotation.x;
          rightEyeBone.rotation.y = eyeRotation.y;
        }
      }
    });

    faceMeshRef.current = faceMesh;

    return () => {
      faceMesh.close();
    };
  }, [vrm]);

  useEffect(() => {
    if (!faceMeshRef.current) return;

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

    startCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (!faceMeshRef.current || !videoRef.current) return;

    const animate = () => {
      if (videoRef.current && faceMeshRef.current) {
        faceMeshRef.current.send({ image: videoRef.current });
      }
      requestAnimationFrame(animate);
    };

    animate();
  }, []);
}; 