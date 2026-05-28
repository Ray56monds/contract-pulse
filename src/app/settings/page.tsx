import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage alert preferences and team</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Alert Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <label htmlFor="emailAlerts" className="flex-1">
              <p className="font-medium">Email Alerts</p>
              <p className="text-sm text-muted-foreground">Get notified via email before renewals</p>
            </label>
            <input type="checkbox" id="emailAlerts" defaultChecked className="h-4 w-4" />
          </div>
          <div className="flex items-center justify-between">
            <label htmlFor="slackNotifications" className="flex-1">
              <p className="font-medium">Slack Notifications</p>
              <p className="text-sm text-muted-foreground">Post alerts to your Slack channel</p>
            </label>
            <input type="checkbox" id="slackNotifications" className="h-4 w-4" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Alert Timing</p>
              <p className="text-sm text-muted-foreground">Days before renewal to send alerts</p>
            </div>
            <span className="text-sm text-muted-foreground">30, 60, 90 days</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
