import { useState, useRef, useEffect } from "react";
import { Volume2, VolumeX, Music, Play, Pause } from "lucide-react";

function GlobalAudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState("Rainfall");
  const audioRef = useRef(null);

  const tracks = {
    Rainfall: "/audio/rain.mp3",
    Forest: "/audio/forest.mp3",
  };

  const togglePlay = (trackName) => {
    if (currentTrack === trackName && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const newAudio = new Audio(tracks[trackName]);
      newAudio.loop = true;
      audioRef.current = newAudio;
      audioRef.current.play().catch(() => {});
      setCurrentTrack(trackName);
      setIsPlaying(true);
    }
  };

  const stopMusic = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-full border border-[#E7E2D9] bg-white/90 px-4 py-2.5 shadow-lg backdrop-blur-md">
      <div className="flex items-center gap-2 text-xs font-semibold text-[#77716B]">
        <Music size={15} className="text-[#7C6CF2] animate-pulse" />
        <span className="hidden sm:inline">Soundscape:</span>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => togglePlay("Rainfall")}
          className={`cursor-pointer rounded-full px-3 py-1 text-xs font-semibold transition ${
            isPlaying && currentTrack === "Rainfall"
              ? "bg-[#7C6CF2] text-white"
              : "bg-[#F7F5F0] text-[#77716B] hover:bg-[#EEEAE3]"
          }`}
        >
          Rain
        </button>
        <button
          onClick={() => togglePlay("Forest")}
          className={`cursor-pointer rounded-full px-3 py-1 text-xs font-semibold transition ${
            isPlaying && currentTrack === "Forest"
              ? "bg-[#7C6CF2] text-white"
              : "bg-[#F7F5F0] text-[#77716B] hover:bg-[#EEEAE3]"
          }`}
        >
          Forest
        </button>

        {isPlaying && (
          <button
            onClick={stopMusic}
            className="ml-1 cursor-pointer rounded-full bg-red-100 p-1 text-[#A35A62] hover:bg-red-200 transition"
            title="Mute Music"
          >
            <VolumeX size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

export default GlobalAudioPlayer;