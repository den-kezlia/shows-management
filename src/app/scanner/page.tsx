"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { PublicNav } from "@/components/ui/navigation";
import { TicketValidation } from "@/types";

export default function QRScannerPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [validationResult, setValidationResult] = useState<TicketValidation | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // For now, we'll simulate QR code reading
    // In a real implementation, you would use a QR code reading library
    setError("QR code file upload not yet implemented. Use manual input for testing.");
  };

  const handleManualInput = async () => {
    // For demo purposes, create a sample QR data
    const sampleQRData = JSON.stringify({
      ticketId: "sample-ticket-id",
      performanceId: "sample-performance-id",
      customerName: "John Doe",
      placeRow: "A",
      placeNumber: "1",
      timestamp: Date.now(),
    });

    await validateTicket(sampleQRData);
  };

  const validateTicket = async (qrData: string) => {
    setIsLoading(true);
    setError("");
    setValidationResult(null);

    try {
      const response = await fetch("/api/tickets/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ qrData }),
      });

      const result = await response.json();

      if (result.success) {
        setValidationResult(result.data);
      } else {
        setError(result.error || "Validation failed");
      }
    } catch (err) {
      setError("Network error. Please try again.");
      console.error("Validation error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const resetScanner = () => {
    setValidationResult(null);
    setError("");
    setIsScanning(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100">
      <PublicNav />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📱 QR Code Scanner
          </h1>
          <p className="text-gray-600">
            Scan ticket QR codes to validate entry
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          {!validationResult && !error && (
            <Card>
              <CardHeader>
                <CardTitle>Scan QR Code</CardTitle>
                <CardDescription>
                  Upload a QR code image or use your camera to scan
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* File Upload Option */}
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className="w-full"
                  >
                    📁 Upload QR Code Image
                  </Button>
                </div>

                {/* Camera Scanner (placeholder) */}
                <div className="text-center">
                  <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 mb-4">
                    <p className="text-gray-500">
                      Camera scanner not yet implemented.
                      <br />
                      Use the demo button below for testing.
                    </p>
                  </div>
                  <Button
                    onClick={() => setIsScanning(!isScanning)}
                    variant="outline"
                  >
                    📷 {isScanning ? "Stop" : "Start"} Camera Scanner
                  </Button>
                </div>

                {/* Demo/Manual Input */}
                <div className="border-t pt-4">
                  <Button
                    onClick={handleManualInput}
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Spinner size="sm" className="mr-2" />
                        Validating...
                      </>
                    ) : (
                      "🧪 Test with Sample QR Code"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error Display */}
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-700">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-red-800 font-medium">❌ Validation Failed</span>
                </div>
                {error}
              </AlertDescription>
              <Button onClick={resetScanner} variant="outline" className="mt-2">
                Try Again
              </Button>
            </Alert>
          )}

          {/* Validation Result */}
          {validationResult && (
            <Card className={`border-2 ${
              validationResult.alreadyVisited 
                ? "border-yellow-200 bg-yellow-50" 
                : "border-green-200 bg-green-50"
            }`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className={`flex items-center gap-2 ${
                    validationResult.alreadyVisited ? "text-yellow-800" : "text-green-800"
                  }`}>
                    {validationResult.alreadyVisited ? "⚠️ Already Used" : "✅ Valid Ticket"}
                  </CardTitle>
                  <Badge 
                    variant={validationResult.alreadyVisited ? "secondary" : "default"}
                    className={validationResult.alreadyVisited ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}
                  >
                    {validationResult.alreadyVisited ? "Used" : "Valid"}
                  </Badge>
                </div>
                <CardDescription>
                  {validationResult.alreadyVisited 
                    ? "This ticket has already been used for entry"
                    : "Ticket validated successfully - entry allowed"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Performance Info */}
                  <div className="bg-white p-4 rounded-lg">
                    <h3 className="font-semibold text-lg mb-2">
                      {validationResult.performance.name}
                    </h3>
                    <p className="text-gray-600 mb-2">
                      {validationResult.performance.description}
                    </p>
                    <p className="text-sm text-gray-500">
                      📅 {new Date(validationResult.performance.date).toLocaleDateString()} at{" "}
                      {new Date(validationResult.performance.date).toLocaleTimeString()}
                    </p>
                  </div>

                  {/* Ticket Info */}
                  <div className="bg-white p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Ticket Details</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Customer:</span>
                        <p className="font-medium">{validationResult.ticket.customerName}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Seat:</span>
                        <p className="font-medium">
                          Row {validationResult.ticket.placeRow}, 
                          Seat {validationResult.ticket.placeNumber}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Reference:</span>
                        <p className="font-medium">{validationResult.ticket.referenceName}</p>
                      </div>
                      {validationResult.ticket.visitedAt && (
                        <div>
                          <span className="text-gray-500">Visited At:</span>
                          <p className="font-medium">
                            {new Date(validationResult.ticket.visitedAt).toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button onClick={resetScanner} className="w-full">
                    Scan Next Ticket
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
