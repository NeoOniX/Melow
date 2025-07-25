import PlaylistForm from "@/components/form/PlaylistForm";

import React from "react";

export async function generateMetadata() {
  return {
    title: "Create Playlist",
    description: "Create a new playlist",
  };
}

export default function PlaylistCreatePage() {
  return (
    <div className="h-full flex flex-col items-center justify-center p-4">
      <PlaylistForm mode="create" withCard />
    </div>
  );
}
