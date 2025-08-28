"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Clock, Globe, Bell, Zap, Save } from "lucide-react"

export function AccountSettings() {
  return (
    <div className="space-y-6">
      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            General Settings
          </CardTitle>
          <CardDescription>Configure global settings for all connected accounts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="default-timezone">Default Timezone</Label>
              <Select defaultValue="america/new_york">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="america/new_york">Eastern Time (ET)</SelectItem>
                  <SelectItem value="america/chicago">Central Time (CT)</SelectItem>
                  <SelectItem value="america/denver">Mountain Time (MT)</SelectItem>
                  <SelectItem value="america/los_angeles">Pacific Time (PT)</SelectItem>
                  <SelectItem value="utc">UTC</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="default-language">Default Language</Label>
              <Select defaultValue="en">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                  <SelectItem value="it">Italian</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="text-sm font-medium">Auto-posting Settings</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable auto-posting</Label>
                  <p className="text-sm text-muted-foreground">Automatically publish scheduled posts</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Retry failed posts</Label>
                  <p className="text-sm text-muted-foreground">Automatically retry posts that fail to publish</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Cross-platform optimization</Label>
                  <p className="text-sm text-muted-foreground">Optimize content for each platform automatically</p>
                </div>
                <Switch />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posting Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Posting Schedule
          </CardTitle>
          <CardDescription>Set optimal posting times for each platform</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            {[
              { platform: "Instagram", optimal: "2:00 PM - 4:00 PM", current: "2:30 PM" },
              { platform: "Facebook", optimal: "1:00 PM - 3:00 PM", current: "1:45 PM" },
              { platform: "Twitter", optimal: "9:00 AM - 10:00 AM", current: "9:30 AM" },
              { platform: "LinkedIn", optimal: "8:00 AM - 9:00 AM", current: "8:15 AM" },
            ].map((schedule) => (
              <div key={schedule.platform} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{schedule.platform}</p>
                  <p className="text-sm text-muted-foreground">Optimal: {schedule.optimal}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Input defaultValue={schedule.current} className="w-24 text-center" />
                  <Badge variant="outline">Auto</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>Configure when and how you receive notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Post published successfully</Label>
                <p className="text-sm text-muted-foreground">Get notified when posts are published</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Post failed to publish</Label>
                <p className="text-sm text-muted-foreground">Get notified when posts fail</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Account disconnected</Label>
                <p className="text-sm text-muted-foreground">Get notified when accounts lose connection</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Weekly analytics report</Label>
                <p className="text-sm text-muted-foreground">Receive weekly performance summaries</p>
              </div>
              <Switch />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>API limit warnings</Label>
                <p className="text-sm text-muted-foreground">Get notified when approaching API limits</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Notification Email</Label>
            <Input defaultValue="user@quoteart.com" type="email" />
          </div>
        </CardContent>
      </Card>

      {/* API Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            API Management
          </CardTitle>
          <CardDescription>Manage API keys and rate limits</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            {[
              { platform: "Instagram", limit: "200/hour", used: "156", status: "healthy" },
              { platform: "Facebook", limit: "200/hour", used: "89", status: "healthy" },
              { platform: "Twitter", limit: "300/hour", used: "267", status: "warning" },
              { platform: "LinkedIn", limit: "100/hour", used: "45", status: "healthy" },
            ].map((api) => (
              <div key={api.platform} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{api.platform} API</p>
                  <p className="text-sm text-muted-foreground">
                    {api.used}/{api.limit} requests used
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={api.status === "healthy" ? "default" : "secondary"}
                    className={
                      api.status === "healthy"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                    }
                  >
                    {api.status}
                  </Badge>
                  <Button variant="outline" size="sm">
                    Manage
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Save Settings */}
      <div className="flex justify-end">
        <Button>
          <Save className="mr-2 h-4 w-4" />
          Save Settings
        </Button>
      </div>
    </div>
  )
}
