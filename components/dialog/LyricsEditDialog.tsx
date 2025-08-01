"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { Lyrics } from "@/lib/actions/lyrics";

export default function LyricsEditDialog({
  lyrics,
  open,
  setOpen,
  onLyricsUpdated,
}: {
  lyrics: Lyrics;
  open: boolean;
  setOpen: (open: boolean) => void;
  onLyricsUpdated: (updatedLyrics: Lyrics) => void;
}) {
  const [syncedLyrics, setSyncedLyrics] = useState(lyrics.syncedLyrics || "");
  const [plainLyrics, setPlainLyrics] = useState(lyrics.plainLyrics || "");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogTitle>Edit Lyrics</DialogTitle>
        <Accordion type="single" collapsible>
          <AccordionItem value="lrc">
            <AccordionTrigger>Synchronized Lyrics (LRC)</AccordionTrigger>
            <AccordionContent>
              <textarea
                className="w-full h-64 p-2 border rounded"
                placeholder="Paste your LRC lyrics here..."
                value={syncedLyrics}
                onChange={(e) => setSyncedLyrics(e.target.value)}
              ></textarea>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="text">
            <AccordionTrigger>Plain Text Lyrics</AccordionTrigger>
            <AccordionContent>
              <textarea
                className="w-full h-64 p-2 border rounded"
                placeholder="Paste your plain text lyrics here..."
                value={plainLyrics}
                onChange={(e) => setPlainLyrics(e.target.value)}
              ></textarea>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <Button
          type="submit"
          onClick={() => onLyricsUpdated({ syncedLyrics, plainLyrics })}
        >
          Submit
        </Button>
      </DialogContent>
    </Dialog>
  );
}
