"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { format } from "date-fns"
import { Shield, Key, Eye, AlertTriangle, CheckCircle, Clock, RefreshCw, Download } from "lucide-react"

// Mock security data
const securityEvents = [
  {
    id: 1,
    type: "login",
    description: "Successful login from new device",
    timestamp: new Date(2024, 0, 15, 14, 30),
    location: "New York, US",
    status: "success",
  },
  {
    id: 2,
    type: "api_access",
    description: "Instagram API access granted",
    timestamp: new Date(2024, 0, 15, 12, 15),
    location: "Server",
    status: "success",
  },
  {
    id: 3,
    type: "failed_auth",
    description: "Failed authentication attempt",
    timestamp: new Date(2024, 0, 14, 18, 45),
    location: "Unknown",
    status: "warning",
  },
  {
    id: 4,
    type: "permission_change",
    description: "Facebook permissions updated",
    timestamp: new Date(2024, 0, 14, 10, 20),
    location: "Dashboard",
    status: "info",
  },
]

const connectedApps = [
  {
    id: 1,
    name: "QuoteArt Mobile App",
    type: "Mobile Application",
    permissions: ["read", "write", "analytics"],
    lastAccess: new Date(2024, 0, 15, 14, 30),
    status: "active",
  },
  {
    id: 2,
    name: "Zapier Integration",
    type: "Third-party Service",
    permissions: ["read", "write"],
    lastAccess: new Date(2024, 0, 14, 9, 15),
    status: "active",
  },
  {
    id: 3,
    name: "Analytics Dashboard",
    type: "Internal Tool",
    permissions: ["read", "analytics"],
    lastAccess: new Date(2024, 0, 13, 16, 45),
    status: "inactive",
  },
]

const getEventIcon = (type: string) => {
  switch (type) {
    case "login":
      return <Key className="h-4 w-4" />
    case "api_access":
      return <CheckCircle className="h-4 w-4" />
    case "failed_auth":
      return <AlertTriangle className="h-4 w-4" />
    case "permission_change":
      return <Shield className="h-4 w-4" />
    default:
      return <Clock className="h-4 w-4" />
  }
}

const getEventColor = (status: string) => {
  switch (status) {
    case "success":
      return "text-green-500"
    case "warning":
      return "text-yellow-500"
    case "error":
      return "text-red-500"
    case "info":
      return "text-blue-500"
    default:
      return "text-gray-500"
  }
}

export function IntegrationSecurity() {
  return (
    <div className="space-y-6">
      {/* Security Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 text-green-800 rounded-lg">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">Secure</p>
                <p className="text-sm text-muted-foreground">Account Status</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 text-blue-800 rounded-lg">
                <Key className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">3</p>
                <p className="text-sm text-muted-foreground">Connected Apps</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 text-orange-800 rounded-lg">
                <Eye className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">24h</p>
                <p className="text-sm text-muted-foreground">Last Activity</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Settings
          </CardTitle>
          <CardDescription>Configure security preferences for your integrations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Two-factor authentication</Label>
                <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Login notifications</Label>
                <p className="text-sm text-muted-foreground">Get notified of new login attempts</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>API access logging</Label>
                <p className="text-sm text-muted-foreground">Log all API access attempts</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Automatic session timeout</Label>
                <p className="text-sm text-muted-foreground">Automatically log out after 24 hours of inactivity</p>
              </div>
              <Switch />
            </div>
          </div>

          <Separator />

          <div className="flex gap-2">
            <Button variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Rotate API Keys
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Security Log
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Connected Applications */}
      <Card>
        <CardHeader>
          <CardTitle>Connected Applications</CardTitle>
          <CardDescription>Manage third-party applications that have access to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {connectedApps.map((app) => (
              <div key={app.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{app.name}</h4>
                    <Badge variant={app.status === "active" ? "default" : "secondary"}>{app.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{app.type}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Last access: {format(app.lastAccess, "MMM d, yyyy 'at' h:mm a")}</span>
                    <span>•</span>
                    <span>Permissions: {app.permissions.join(", ")}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Manage
                  </Button>
                  <Button variant="outline" size="sm" className="text-destructive bg-transparent">
                    Revoke
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security Activity Log */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Security Activity</CardTitle>
          <CardDescription>Monitor recent security events and access attempts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {securityEvents.map((event) => (
              <div key={event.id} className="flex items-start gap-3 p-3 border rounded-lg">
                <div className={`mt-0.5 ${getEventColor(event.status)}`}>{getEventIcon(event.type)}</div>
                <div className="flex-1">
                  <p className="font-medium">{event.description}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <span>{format(event.timestamp, "MMM d, yyyy 'at' h:mm a")}</span>
                    <span>•</span>
                    <span>{event.location}</span>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={
                    event.status === "success"
                      ? "border-green-200 text-green-800"
                      : event.status === "warning"
                        ? "border-yellow-200 text-yellow-800"
                        : "border-gray-200 text-gray-800"
                  }
                >
                  {event.status}
                </Badge>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <Button variant="outline">View Full Security Log</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
