import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Server, Bell, Shield, Users } from 'lucide-react';

export const metadata = {
  title: 'Settings - NeoGuard',
  description: 'Application settings and configuration',
};

export default function SettingsPage() {
  return (
    <div className="p-6 space-y-6 bg-background">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Configure NeoGuard dashboard</p>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="bg-white border border-border p-1 rounded-lg h-auto">
          <TabsTrigger value="general" className="rounded py-2 px-4 flex items-center gap-2">
            <Server className="w-4 h-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="notifications" className="rounded py-2 px-4 flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="rounded py-2 px-4 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="users" className="rounded py-2 px-4 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Users
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-4 mt-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Device Configuration</CardTitle>
              <CardDescription>Configure connected IoT devices</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">ESP32 Smoke Sensor IP</Label>
                <Input value="192.168.0.103" placeholder="IP Address" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">ESP8266 Fingerprint IP</Label>
                <Input value="http://10.78.188.49/api" placeholder="IP Address" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Camera Server URL</Label>
                <Input value="http://localhost:8000" placeholder="Server URL" />
              </div>
              <Button className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white">
                Save Configuration
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-4 mt-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Manage alert and notification settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div>
                    <p className="font-medium">Safety Violations</p>
                    <p className="text-xs text-muted-foreground">Alert on detected violations</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5" />
                </div>
                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div>
                    <p className="font-medium">Device Offline</p>
                    <p className="text-xs text-muted-foreground">Alert when devices disconnect</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5" />
                </div>
                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div>
                    <p className="font-medium">High Smoke Levels</p>
                    <p className="text-xs text-muted-foreground">Alert on dangerous smoke levels</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5" />
                </div>
              </div>
              <Button className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white">
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="space-y-4 mt-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage authentication and access control</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Current Password</Label>
                <Input type="password" placeholder="Enter current password" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">New Password</Label>
                <Input type="password" placeholder="Enter new password" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Confirm Password</Label>
                <Input type="password" placeholder="Confirm new password" />
              </div>
              <Button className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white">
                Update Password
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users */}
        <TabsContent value="users" className="space-y-4 mt-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage dashboard users and permissions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground p-4 bg-gray-50 rounded-lg border border-border">
                <p>User management feature coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
