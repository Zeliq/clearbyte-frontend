"use client";
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
// Remove unused Camera import
import { Card } from "@/components/ui/card";
import Image from "next/image"; // Import Next.js Image component

interface ClassificationResult {
  halal: boolean;
  haram: boolean;
  vegan: boolean;
  vegetarian: boolean;
}

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [classification, setClassification] = useState<ClassificationResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [cameraAccess, setCameraAccess] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Function to check camera permissions
  const checkCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraAccess(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Camera access denied:", error);
      setCameraAccess(false);
    }
  };

  useEffect(() => {
    // Check camera permission when component mounts
    checkCameraPermission();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // Disabling because we only want to run this once on mount
  }, []);

  // Function to start camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error starting camera:", error);
    }
  };

  useEffect(() => {
    if (cameraAccess) {
      startCamera();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // Disabling because we only want to run this when cameraAccess changes
  }, [cameraAccess]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const captureFromCamera = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      
      if (context) {
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to blob
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
            setSelectedFile(file);
            setPreview(canvas.toDataURL("image/jpeg"));
          }
        }, "image/jpeg");
      }
    }
  };

  const uploadImage = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setResult(null);
    setClassification(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("https://food-classifier-backend.onrender.com/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setResult(data.text);
      setClassification(data.classification);
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-24">
      <h1 className="text-3xl font-bold mb-6">Food Classification</h1>
      
      <div className="flex flex-col w-full max-w-xl gap-4">
        {/* Input image section */}
        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-4">Upload Food Label Image</h2>
          
          <div className="flex flex-col gap-4">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            
            <Button 
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="w-full"
            >
              Select Image
            </Button>
            
            {cameraAccess && (
              <div className="relative w-full mt-2">
                <video 
                  ref={videoRef}
                  autoPlay 
                  playsInline
                  className="w-full rounded-md"
                />
                <Button 
                  onClick={captureFromCamera}
                  className="absolute bottom-2 left-1/2 transform -translate-x-1/2"
                >
                  Capture
                </Button>
                <canvas ref={canvasRef} className="hidden" />
              </div>
            )}
            
            {preview && (
              <div className="mt-4">
                {/* Replace img with Next.js Image component */}
                <div className="relative w-full h-64">
                  <Image 
                    src={preview} 
                    alt="Preview of selected food label" 
                    fill
                    className="object-contain rounded-md"
                  />
                </div>
                <Button 
                  onClick={uploadImage}
                  className="w-full mt-2"
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Analyze"}
                </Button>
              </div>
            )}
          </div>
        </Card>
        
        {/* Results section */}
        {result && classification && (
          <Card className="p-4">
            <h2 className="text-xl font-semibold mb-4">Results</h2>
            
            <div className="grid grid-cols-2 gap-2">
              <div className={`p-2 rounded ${classification.halal ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                Halal: {classification.halal ? "Yes" : "No"}
              </div>
              <div className={`p-2 rounded ${classification.haram ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                Haram: {classification.haram ? "Yes" : "No"}
              </div>
              <div className={`p-2 rounded ${classification.vegan ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                Vegan: {classification.vegan ? "Yes" : "No"}
              </div>
              <div className={`p-2 rounded ${classification.vegetarian ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                Vegetarian: {classification.vegetarian ? "Yes" : "No"}
              </div>
            </div>
            
            <div className="mt-4">
              <h3 className="font-medium">Extracted Text:</h3>
              <p className="text-sm mt-1 p-2 bg-gray-100 rounded">{result}</p>
            </div>
          </Card>
        )}
      </div>
    </main>
  );
}