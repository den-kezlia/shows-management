"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface QRCodeDisplayProps {
  qrCode?: string;
  ticketId?: string;
  customerName?: string;
  performanceName?: string;
}

export function QRCodeDisplay({ qrCode, ticketId, customerName, performanceName }: QRCodeDisplayProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (!qrCode) {
    return (
      <span className="text-muted-foreground text-xs">
        No QR Code
      </span>
    );
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          View QR Code
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Ticket QR Code</DialogTitle>
          <DialogDescription>
            {performanceName && <div className="mb-1"><strong>Performance:</strong> {performanceName}</div>}
            {customerName && <div className="mb-1"><strong>Customer:</strong> {customerName}</div>}
            {ticketId && <div className="text-xs text-muted-foreground">Ticket ID: {ticketId}</div>}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4">
          <div className="bg-card text-card-foreground p-4 rounded-lg border-2 border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={qrCode} 
              alt="Ticket QR Code" 
              className="w-64 h-64 object-contain"
            />
          </div>
          <div className="text-center text-sm text-muted-foreground">
            <p>Scan this QR code at the venue entrance</p>
            <p>to validate the ticket</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => {
                const link = document.createElement('a');
                link.href = qrCode;
                link.download = `ticket-qr-${ticketId || 'code'}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              variant="outline"
              size="sm"
            >
              Download QR Code
            </Button>
            <Button
              onClick={() => {
                navigator.clipboard.writeText(qrCode);
                toast.success('QR code data copied to clipboard!');
              }}
              variant="outline"
              size="sm"
            >
              Copy Data URL
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function QRCodePreview({ qrCode }: { qrCode?: string }) {
  if (!qrCode) {
    return (
      <div className="w-16 h-16 bg-muted rounded border-2 border-dashed border-border flex items-center justify-center">
        <span className="text-xs text-muted-foreground">No QR</span>
      </div>
    );
  }

  return (
    <div className="w-16 h-16 bg-card text-card-foreground rounded border border-border overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img 
        src={qrCode} 
        alt="QR Code Preview" 
        className="w-full h-full object-contain"
      />
    </div>
  );
}
