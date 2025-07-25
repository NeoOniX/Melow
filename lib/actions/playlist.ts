"use server";

import { Prisma } from "@prisma/client";
import prisma from "../prisma";

export type PlaylistWithTracksAndUsers = Prisma.PlaylistGetPayload<{
  include: {
    owner: true;
    users: true;
    tracks: {
      include: {
        track: {
          include: {
            artist: true;
            album: {
              include: {
                artist: true;
              };
            };
          };
        };
      };
    };
  };
}>;

// CRUD Operations

export async function getPlaylists(userId: string) {
  try {
    const playlists = await prisma.playlist.findMany({
      where: {
        OR: [
          {
            users: {
              some: {
                id: userId,
              },
            },
          },
          {
            ownerId: userId,
          },
        ],
      },
      include: {
        tracks: {
          include: {
            track: {
              include: {
                artist: true,
                album: {
                  include: {
                    artist: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return playlists as PlaylistWithTracksAndUsers[];
  } catch (error) {
    console.error("Error fetching playlists:", error);
    return [];
  }
}

export async function getPlaylistById(id: string) {
  try {
    const playlist = await prisma.playlist.findUnique({
      where: {
        id,
      },
      include: {
        owner: true,
        users: true,
        tracks: {
          include: {
            track: {
              include: {
                artist: true,
                album: {
                  include: {
                    artist: true,
                  },
                },
              },
            },
          },
          orderBy: {
            position: "asc",
          },
        },
      },
    });

    return playlist as PlaylistWithTracksAndUsers | null;
  } catch (error) {
    console.error("Error fetching playlist by ID:", error);
    return null;
  }
}

export async function createPlaylist(userId: string, formData: FormData) {
  const name = formData.get("name") as string;

  if (!name) {
    throw new Error("Name is required");
  }

  const playlist = await prisma.playlist.create({
    data: {
      name,
      owner: {
        connect: { id: userId },
      },
    },
    include: {
      owner: true,
      users: true,
      tracks: {
        include: {
          track: {
            include: {
              album: {
                include: {
                  artist: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return { success: true, playlist } as const;
}

export async function updatePlaylist(playlistId: string, formData: FormData) {
  const name = formData.get("name") as string;

  if (!name) {
    throw new Error("Name is required");
  }

  const playlist = await prisma.playlist.update({
    where: { id: playlistId },
    data: { name },
    include: {
      owner: true,
      users: true,
      tracks: {
        include: {
          track: {
            include: {
              album: {
                include: {
                  artist: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return { success: true, playlist } as const;
}

export async function deletePlaylist(playlistId: string) {
  // Delete all tracks associated with the playlist
  await prisma.playlistTrack.deleteMany({
    where: { playlistId },
  });

  // Delete the playlist itself
  await prisma.playlist.delete({
    where: { id: playlistId },
  });

  return { success: true } as const;
}

// Track Operations

export async function addTrackToPlaylist(playlistId: string, trackId: string) {
  const existingTrack = await prisma.playlistTrack.findFirst({
    where: {
      playlistId,
      trackId,
    },
  });

  if (existingTrack) {
    const updatedPlaylist = await getPlaylistById(playlistId);
    return {
      success: false,
      playlist: updatedPlaylist,
      error: "Track already in playlist",
    } as const;
  }

  const count = await prisma.playlistTrack.count({
    where: { playlistId },
  });

  await prisma.playlistTrack.create({
    data: {
      playlist: { connect: { id: playlistId } },
      track: { connect: { id: trackId } },
      position: count + 1,
    },
  });

  const updatedPlaylist = await getPlaylistById(playlistId);

  return { success: true, playlist: updatedPlaylist } as const;
}

export async function removeTrackFromPlaylist(
  playlistId: string,
  trackId: string
) {
  await prisma.playlistTrack.deleteMany({
    where: {
      playlistId,
      trackId,
    },
  });

  const updatedPlaylist = await getPlaylistById(playlistId);

  return { success: true, playlist: updatedPlaylist } as const;
}

export async function reorderTracksInPlaylist(
  playlistId: string,
  trackIds: string[]
) {
  const updates = trackIds.map(async (trackId, index) => {
    const existingTrack = await prisma.playlistTrack.findFirst({
      where: {
        playlistId,
        trackId,
      },
    });

    if (!existingTrack) return;

    await prisma.playlistTrack.update({
      where: {
        id: existingTrack.id,
      },
      data: {
        position: index + 1,
      },
    });

    return;
  });

  await Promise.all(updates);

  const updatedPlaylist = await getPlaylistById(playlistId);

  return { success: true, playlist: updatedPlaylist } as const;
}

// User Operations

export async function addUserToPlaylist(playlistId: string, username: string) {
  const user = await prisma.user.findUnique({
    where: { name: username },
  });

  if (!user) {
    return { success: false, error: "User not found" } as const;
  }

  const playlist = await prisma.playlist.update({
    where: { id: playlistId },
    data: {
      users: {
        connect: { id: user.id },
      },
    },
    include: {
      owner: true,
      users: true,
      tracks: {
        include: {
          track: {
            include: {
              album: {
                include: {
                  artist: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return { success: true, playlist } as const;
}

export async function removeUserFromPlaylist(
  playlistId: string,
  userId: string
) {
  const playlist = await prisma.playlist.update({
    where: { id: playlistId },
    data: {
      users: {
        disconnect: { id: userId },
      },
    },
    include: {
      owner: true,
      users: true,
      tracks: {
        include: {
          track: {
            include: {
              album: {
                include: {
                  artist: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return { success: true, playlist } as const;
}
