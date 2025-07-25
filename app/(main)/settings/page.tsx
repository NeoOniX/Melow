import SettingsNavigation from "@/components/ui/settings-navigation";
import React from "react";

export async function generateMetadata() {
  return {
    title: "Settings",
    description: "Configure your general application settings",
  };
}

export default function SettingsPage() {
  return (
    <div className="flex flex-col items-center">
      <SettingsNavigation current="general" />
      <p>General settings</p>
    </div>
  );
}
