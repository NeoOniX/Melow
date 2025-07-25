import ArtistForm from "@/components/form/ArtistForm";

import React from "react";

export async function generateMetadata() {
  return {
    title: "Create Artist",
    description: "Create a new artist",
  };
}

export default function ArtistCreatePage({}) {
  return (
    <div className="h-full flex flex-col items-center justify-center p-4">
      <ArtistForm mode="create" withCard />
    </div>
  );
}
