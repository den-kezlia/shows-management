"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PublicNav } from "@/components/ui/navigation";
import { TicketValidation } from "@/types";
import { toast } from "sonner";

export default function QRScannerPage() {
  const router = useRouter();
  const [ticketId, setTicketId] = useState("");
  const [validationResult, setValidationResult] = useState<TicketValidation | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scannerInstance, setScannerInstance] = useState<{clear: () => Promise<void>} | null>(null);


  // Camera scanner using qr-scanner library
  const startCameraScanner = async () => {
    if (scannerInstance) {
      stopCameraScanner();
    }

    try {
      console.log("Starting QR scanner...");
      setIsScanning(true);
      
      const QrScanner = (await import('qr-scanner')).default;
      
      // Create video element
      const video = document.createElement('video');
      video.style.width = '100%';
      video.style.maxWidth = '400px';
      video.style.height = 'auto';
      
      const readerElement = document.getElementById("qr-reader");
      if (readerElement) {
        readerElement.innerHTML = "";
        readerElement.appendChild(video);
      }
      
      const qrScanner = new QrScanner(
        video,
        (result) => {
          console.log('QR Code detected:', result.data);
          toast.success("QR Code detected!");
          handleQRCodeScanned(result.data);
          qrScanner.stop();
          setIsScanning(false);
        },
        {
          onDecodeError: (error) => {
            // Ignore decode errors (normal when no QR code is visible)
            console.debug('QR decode error (normal):', error);
          },
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      );
      
      await qrScanner.start();
      setScannerInstance({
        clear: async () => {
          qrScanner.stop();
          qrScanner.destroy();
        }
      });
      
      toast.success("Camera scanner started!");
      console.log("QR scanner started successfully");
      
    } catch (error) {
      console.error("Failed to start scanner:", error);
      setError(`Scanner failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsScanning(false);
      toast.error("Scanner failed");
    }
  };

  const stopCameraScanner = () => {
    if (scannerInstance) {
      try {
        scannerInstance.clear().catch((error: unknown) => {
          console.warn("Error clearing scanner:", error);
        });
      } catch (error) {
        console.warn("Error stopping scanner:", error);
      }
      setScannerInstance(null);
    }
    setIsScanning(false);
    
    // Also clear the reader element
    const readerElement = document.getElementById("qr-reader");
    if (readerElement) {
      readerElement.innerHTML = "";
    }
    console.log("Camera scanner stopped");
  };

  const handleQRCodeScanned = async (qrCodeText: string) => {
    try {
      // Try to parse as JSON first (our QR codes)
      let parsedData;
      try {
        parsedData = JSON.parse(qrCodeText);
        if (parsedData.ticketId) {
          setTicketId(parsedData.ticketId);
          await validateTicketById(parsedData.ticketId);
          return;
        }
      } catch {
        // Not JSON, might be a simple ticket ID
      }

      // If it's not JSON, treat as direct ticket ID
      if (qrCodeText.trim()) {
        setTicketId(qrCodeText.trim());
        await validateTicketById(qrCodeText.trim());
      } else {
        setError("Invalid QR code format");
      }
    } catch (err) {
      console.error("Error processing QR code:", err);
      setError("Failed to process QR code");
    }
  };

  // Protect route: only logged-in users
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.replace("/");
      return;
    }
    // verify token (non-blocking)
    fetch("/api/auth/verify", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((res) => {
        if (!res?.success) router.replace("/");
      })
      .catch(() => router.replace("/"));
  }, [router]);

  // Clean up scanner on component unmount
  useEffect(() => {
    return () => {
      if (scannerInstance) {
        scannerInstance.clear().catch(console.error);
      }
    };
  }, [scannerInstance]);

  const handleTicketIdSubmit = async () => {
    if (!ticketId.trim()) {
      setError("Please enter a ticket ID");
      return;
    }

    await validateTicketById(ticketId.trim());
  };

  const validateTicketById = async (id: string) => {
    setIsLoading(true);
    setError("");
    setValidationResult(null);

    try {
      // Fetch ticket directly by ID
      const response = await fetch(`/api/tickets/${id}`);
      const result = await response.json();

      if (result.success && result.data) {
        const ticket = result.data;
        
        // Fetch performance details
        const perfResponse = await fetch(`/api/performances/${ticket.performanceId}`);
        const perfResult = await perfResponse.json();
        
        if (perfResult.success && perfResult.data) {
          const validationData: TicketValidation = {
            ticket,
            performance: perfResult.data,
            isValid: true,
            alreadyVisited: ticket.isVisited || ticket.status === 'approved'
          };
          setValidationResult(validationData);
        } else {
          setError("Performance not found");
        }
      } else {
        setError(result.error || "Ticket not found");
      }
    } catch (err) {
      setError("Network error. Please try again.");
      console.error("Validation error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const approveTicket = async () => {
    if (!validationResult?.ticket._id) return;

    setIsApproving(true);
    try {
      const response = await fetch("/api/tickets/approve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ticketId: validationResult.ticket._id }),
      });

      const result = await response.json();

      if (result.success) {
        // Update the validation result to reflect the new status
        setValidationResult(prev => prev ? {
          ...prev,
          ticket: { ...prev.ticket, status: 'approved', isVisited: true, visitedAt: new Date(), approvedAt: new Date() },
          alreadyVisited: true
        } : null);
        toast.success("Ticket approved successfully!");
      } else {
        toast.error(result.error || "Failed to approve ticket");
      }
    } catch (err) {
      toast.error("Network error. Please try again.");
      console.error("Approval error:", err);
    } finally {
      setIsApproving(false);
    }
  };

  const resetScanner = () => {
    setValidationResult(null);
    setError("");
    setTicketId("");
    stopCameraScanner();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">✅ Approved</Badge>;
      case 'paid':
        return <Badge className="bg-blue-100 text-blue-800">💳 Paid</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">⏳ Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100">
      <PublicNav />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {!validationResult && !error && (
            <Card>
              <CardHeader>
                <CardTitle>Scan or Enter Ticket</CardTitle>
                <CardDescription>
                  Use camera to scan QR codes or manually enter ticket ID
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Camera Scanner */}
                <div className="text-center">
                  {!isScanning ? (
                    <div>
                      <div className="bg-muted border-2 border-dashed border-border rounded-lg p-8 mb-4">
                        <p className="text-muted-foreground">
                          📷 Use your device camera to scan QR codes
                          <br />
                          Works best in good lighting conditions
                          <br />
                          <small className="text-xs">Make sure to allow camera permissions</small>
                        </p>
                      </div>
                      <Button
                        onClick={() => {
                          console.log("Starting camera scanner...");
                          toast.info("Starting camera scanner...");
                          startCameraScanner();
                        }}
                        variant="default"
                        size="lg"
                        className="w-full h-16 text-lg font-semibold bg-blue-600 hover:bg-blue-700"
                        disabled={isLoading}
                      >
                        📷 Start Camera Scanner
                      </Button>
                      <Button
                        onClick={() => {
                          console.log("Testing camera access...");
                          navigator.mediaDevices?.getUserMedia({ video: true })
                            .then(() => {
                              toast.success("Camera access granted!");
                              console.log("Camera access successful");
                            })
                            .catch((err) => {
                              toast.error(`Camera access denied: ${err.message}`);
                              console.error("Camera access failed:", err);
                            });
                        }}
                        variant="ghost"
                        size="sm"
                        className="w-full mt-2 text-xs"
                      >
                        🔧 Test Camera Access
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded">
                        <p className="text-sm text-blue-700 mb-2">📱 Camera Active - Point at QR Code</p>
                        <div id="qr-reader" className="w-full"></div>
                      </div>
                      <Button
                        onClick={stopCameraScanner}
                        variant="destructive"
                        className="w-full"
                      >
                        ⏹️ Stop Scanner
                      </Button>
                    </div>
                  )}
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or enter manually
                    </span>
                  </div>
                </div>

                {/* Manual Ticket ID Input */}
                <div className="space-y-2">
                  <Label htmlFor="ticketId">Ticket ID</Label>
                  <div className="flex gap-2">
                    <Input
                      id="ticketId"
                      type="text"
                      placeholder="Enter ticket ID"
                      value={ticketId}
                      onChange={(e) => setTicketId(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleTicketIdSubmit()}
                    />
                    <Button 
                      onClick={handleTicketIdSubmit}
                      disabled={isLoading || !ticketId.trim()}
                    >
                      {isLoading ? (
                        <Spinner size="sm" />
                      ) : (
                        "Scan"
                      )}
                    </Button>
                  </div>
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
                ? "border-green-200 bg-green-50" 
                : validationResult.ticket.status === 'paid'
                ? "border-blue-200 bg-blue-50"
                : "border-yellow-200 bg-yellow-50"
            }`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {validationResult.alreadyVisited ? "✅ Already Approved" : "🎫 Ticket Found"}
                  </CardTitle>
                  {getStatusBadge(validationResult.ticket.status)}
                </div>
                <CardDescription>
                  {validationResult.alreadyVisited 
                    ? "This ticket has already been approved for entry"
                    : validationResult.ticket.status === 'paid'
                    ? "Ticket is paid and ready for approval"
                    : `Ticket status: ${validationResult.ticket.status}`
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Performance Info */}
                  <div className="bg-card text-card-foreground p-4 rounded-lg">
                    <h3 className="font-semibold text-lg mb-2">
                      {validationResult.performance.name}
                    </h3>
                    <p className="text-muted-foreground mb-2">
                      {validationResult.performance.description}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      📅 {new Date(validationResult.performance.date).toLocaleDateString()} at{" "}
                      {new Date(validationResult.performance.date).toLocaleTimeString()}
                    </p>
                  </div>

                  {/* Ticket Info */}
                  <div className="bg-card text-card-foreground p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Ticket Details</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Customer:</span>
                        <p className="font-medium">{validationResult.ticket.customerName}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Seat:</span>
                        <p className="font-medium">
                          Row {validationResult.ticket.placeRow}, 
                          Seat {validationResult.ticket.placeNumber}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Reference:</span>
                        <p className="font-medium">{validationResult.ticket.referenceName}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Phone:</span>
                        <p className="font-medium">{validationResult.ticket.customerPhoneNumber}</p>
                      </div>
                      {validationResult.ticket.visitedAt && (
                        <div className="col-span-2">
                          <span className="text-muted-foreground">Visited At:</span>
                          <p className="font-medium">
                            {new Date(validationResult.ticket.visitedAt).toLocaleString()}
                          </p>
                        </div>
                      )}
                      {validationResult.ticket.approvedAt && (
                        <div className="col-span-2">
                          <span className="text-muted-foreground">Approved At:</span>
                          <p className="font-medium">
                            {new Date(validationResult.ticket.approvedAt).toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {validationResult.ticket.status === 'paid' && !validationResult.alreadyVisited && (
                      <Button 
                        onClick={approveTicket}
                        disabled={isApproving}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        {isApproving ? (
                          <>
                            <Spinner size="sm" className="mr-2" />
                            Approving...
                          </>
                        ) : (
                          "✅ Approve Entry"
                        )}
                      </Button>
                    )}
                    <Button 
                      onClick={resetScanner} 
                      variant="outline"
                      className={validationResult.ticket.status === 'paid' && !validationResult.alreadyVisited ? "flex-1" : "w-full"}
                    >
                      {validationResult.ticket.status === 'paid' && !validationResult.alreadyVisited ? "❌ Cancel" : "Scan Next Ticket"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
