import SettingsNavigation from "@/components/ui/settings-navigation";
import React from "react";

export async function generateMetadata() {
  return {
    title: "Theme Settings",
    description: "Customize your theme settings",
  };
}

export default function ThemeSettingsPage() {
  return (
    <div className="flex flex-col items-center">
      <SettingsNavigation current="theme" />
      <p>Theme settings</p>
    </div>
  );
}
