"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { format } from "date-fns"
import {
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  MoreHorizontal,
  Settings,
  Unlink,
  RefreshCw,
  BarChart3,
  CheckCircle,
  AlertCircle,
  Clock,
} from "lucide-react"

// Mock connected accounts data
const connectedAccounts = [
  {
    id: 1,
    platform: "Instagram",
    icon: Instagram,
    color: "#E1306C",
    username: "@quoteart_official",
    displayName: "QuoteArt Official",
    followers: 12500,
    status: "active",
    lastSync: new Date(2024, 0, 15, 14, 30),
    permissions: ["read", "write", "analytics"],
    postsThisMonth: 18,
    engagementRate: 4.8,
    apiLimit: 200,
    apiUsed: 156,
    connectedDate: new Date(2023, 11, 1),
  },
  {
    id: 2,
    platform: "Facebook",
    icon: Facebook,
    color: "#1877F2",
    username: "QuoteArt Page",
    displayName: "QuoteArt - Daily Inspiration",
    followers: 8900,
    status: "active",
    lastSync: new Date(2024, 0, 15, 14, 25),
    permissions: ["read", "write", "analytics", "pages"],
    postsThisMonth: 15,
    engagementRate: 3.2,
    apiLimit: 200,
    apiUsed: 89,
    connectedDate: new Date(2023, 11, 5),
  },
  {
    id: 3,
    platform: "Twitter",
    icon: Twitter,
    color: "#1DA1F2",
    username: "@quoteart_daily",
    displayName: "QuoteArt Daily",
    followers: 5600,
    status: "warning",
    lastSync: new Date(2024, 0, 14, 9, 15),
    permissions: ["read", "write"],
    postsThisMonth: 24,
    engagementRate: 2.9,
    apiLimit: 300,
    apiUsed: 267,
    connectedDate: new Date(2023, 10, 15),
  },
  {
    id: 4,
    platform: "LinkedIn",
    icon: Linkedin,
    color: "#0A66C2",
    username: "QuoteArt Company",
    displayName: "QuoteArt - Professional Growth",
    followers: 3200,
    status: "error",
    lastSync: new Date(2024, 0, 13, 16, 45),
    permissions: ["read"],
    postsThisMonth: 8,
    engagementRate: 5.1,
    apiLimit: 100,
    apiUsed: 45,
    connectedDate: new Date(2024, 0, 1),
  },
]

const getStatusIcon = (status: string) => {
  switch (status) {
    case "active":
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case "warning":
      return <AlertCircle className="h-4 w-4 text-yellow-500" />
    case "error":
      return <AlertCircle className="h-4 w-4 text-red-500" />
    default:
      return <Clock className="h-4 w-4 text-gray-500" />
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
    case "warning":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
    case "error":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
  }
}

export function ConnectedAccounts() {
  return (
    <div className="space-y-4">
      {connectedAccounts.map((account) => (
        <Card key={account.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg" style={{ backgroundColor: `${account.color}20` }}>
                  <account.icon className="h-6 w-6" style={{ color: account.color }} />
                </div>
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {account.displayName}
                    {getStatusIcon(account.status)}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    {account.username} • {account.followers.toLocaleString()} followers
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(account.status)}>{account.status}</Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      Account Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Refresh Connection
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <BarChart3 className="mr-2 h-4 w-4" />
                      View Analytics
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">
                      <Unlink className="mr-2 h-4 w-4" />
                      Disconnect
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Account Stats */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Posts this month:</span>
                  <span className="font-medium">{account.postsThisMonth}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Engagement rate:</span>
                  <span className="font-medium">{account.engagementRate}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Connected since:</span>
                  <span className="font-medium">{format(account.connectedDate, "MMM yyyy")}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>API Usage:</span>
                  <span className="font-medium">
                    {account.apiUsed}/{account.apiLimit}
                  </span>
                </div>
                <Progress value={(account.apiUsed / account.apiLimit) * 100} className="h-2" />
                <div className="flex justify-between text-sm">
                  <span>Last sync:</span>
                  <span className="font-medium">{format(account.lastSync, "MMM d, h:mm a")}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">Permissions:</div>
                <div className="flex flex-wrap gap-1">
                  {account.permissions.map((permission) => (
                    <Badge key={permission} variant="secondary" className="text-xs capitalize">
                      {permission}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Auto-posting:</span>
                  <Switch defaultChecked={account.status === "active"} />
                </div>
              </div>
            </div>

            {/* Status Messages */}
            {account.status === "warning" && (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">API limit approaching</span>
                </div>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  You've used {Math.round((account.apiUsed / account.apiLimit) * 100)}% of your API quota. Consider
                  upgrading your plan.
                </p>
              </div>
            )}

            {account.status === "error" && (
              <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Connection issue</span>
                </div>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                  Unable to sync with {account.platform}. Please reconnect your account to resume posting.
                </p>
                <Button size="sm" className="mt-2">
                  Reconnect Account
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
