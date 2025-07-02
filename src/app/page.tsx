import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PublicNav } from "@/components/ui/navigation";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <PublicNav />
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎭 Tickets Agent v2
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Theater Ticket Management System
          </p>
          <p className="text-gray-500 max-w-2xl mx-auto">
            A comprehensive solution for managing theater performances, creating tickets,
            and validating entries with QR codes. Send tickets via email, Telegram, or Viber.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🎪 Admin Panel
              </CardTitle>
              <CardDescription>
                Manage performances, create tickets, and oversee the entire ticketing system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-600">• Create and manage performances</p>
                <p className="text-sm text-gray-600">• Generate tickets with QR codes</p>
                <p className="text-sm text-gray-600">• Send tickets via multiple channels</p>
                <p className="text-sm text-gray-600">• Track ticket validation</p>
              </div>
              <Link href="/admin">
                <Button className="w-full">
                  Access Admin Panel
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📱 QR Scanner
              </CardTitle>
              <CardDescription>
                Validate tickets by scanning QR codes at the venue entrance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-600">• Scan ticket QR codes</p>
                <p className="text-sm text-gray-600">• Validate ticket authenticity</p>
                <p className="text-sm text-gray-600">• Prevent duplicate entries</p>
                <p className="text-sm text-gray-600">• Real-time validation</p>
              </div>
              <Link href="/scanner">
                <Button variant="outline" className="w-full">
                  Open QR Scanner
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16 text-center">
          <div className="bg-white rounded-lg shadow-sm p-6 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold mb-4">Features</h2>
            <div className="grid sm:grid-cols-2 gap-4 text-left">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">🎯 Performance Management</h3>
                <p className="text-sm text-gray-600">
                  Create performances with name, description, photo, and date/time
                </p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">🎫 Ticket Generation</h3>
                <p className="text-sm text-gray-600">
                  Generate tickets with seat details, customer info, and QR codes
                </p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">📧 Multi-Channel Delivery</h3>
                <p className="text-sm text-gray-600">
                  Send tickets via Email, Telegram, or Viber messaging
                </p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">✅ Validation System</h3>
                <p className="text-sm text-gray-600">
                  QR code scanning with duplicate prevention and entry tracking
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
