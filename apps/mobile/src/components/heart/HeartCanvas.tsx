import React, { useMemo, useCallback } from 'react';
import { useWindowDimensions } from 'react-native';
import {
  Canvas,
  Path,
  Skia,
  Circle,
  Text as SkiaText,
  useFont,
  Group,
  RoundedRect,
  Paint,
} from '@shopify/react-native-skia';
import { SURAHS } from '../../data/surahsMeta';
import { useProgressStore } from '../../store/progressStore';
import { Colors } from '../../theme';
import type { SurahStatus } from '../../data/types';

// Heart shape: 114 points arranged in a heart curve
// Each surah maps to one cell on the heart
function heartPoint(t: number, scale: number, cx: number, cy: number) {
  // Parametric heart: x = 16sin³(t), y = -(13cos(t) - 5cos(2t) - 2cos(3t) - cos(4t))
  const x = 16 * Math.pow(Math.sin(t), 3);
  const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
  return { x: cx + x * scale, y: cy + y * scale };
}

// Generate 114 positions distributed along the heart outline + fill
function generateHeartPositions(width: number, height: number): Array<{ x: number; y: number }> {
  const cx = width / 2;
  const cy = height / 2 + height * 0.05;
  const scale = Math.min(width, height) * 0.034;

  const positions: Array<{ x: number; y: number }> = [];

  // Outer ring: ~44 surahs along the perimeter
  const outerCount = 44;
  for (let i = 0; i < outerCount; i++) {
    const t = (i / outerCount) * 2 * Math.PI;
    positions.push(heartPoint(t, scale, cx, cy));
  }

  // Middle ring: ~38 surahs
  const midCount = 38;
  for (let i = 0; i < midCount; i++) {
    const t = (i / midCount) * 2 * Math.PI;
    positions.push(heartPoint(t, scale * 0.65, cx, cy));
  }

  // Inner ring: ~20 surahs
  const innerCount = 20;
  for (let i = 0; i < innerCount; i++) {
    const t = (i / innerCount) * 2 * Math.PI;
    positions.push(heartPoint(t, scale * 0.32, cx, cy));
  }

  // Center: ~12 surahs (tight cluster)
  const centerCount = 12;
  for (let i = 0; i < centerCount; i++) {
    const t = (i / centerCount) * 2 * Math.PI;
    positions.push(heartPoint(t, scale * 0.12, cx, cy));
  }

  return positions.slice(0, 114);
}

const STATUS_COLORS: Record<SurahStatus, string> = {
  unread: Colors.light.statusUnread,
  read: Colors.light.statusRead,
  studying: Colors.light.statusStudying,
  memorizing: Colors.light.statusMemorizing,
  memorized: Colors.light.statusMemorized,
  reviewing: Colors.light.statusReviewing,
};

interface HeartCanvasProps {
  onSurahPress: (surahId: number) => void;
  colorMode?: 'status' | 'juz' | 'place' | 'length';
}

export const HeartCanvas: React.FC<HeartCanvasProps> = ({
  onSurahPress,
  colorMode = 'status',
}) => {
  const { width, height } = useWindowDimensions();
  const canvasHeight = height * 0.72;
  const { getSurahProgress } = useProgressStore();

  const positions = useMemo(
    () => generateHeartPositions(width, canvasHeight),
    [width, canvasHeight]
  );

  const cellRadius = Math.min(width, canvasHeight) * 0.028;

  const getCellColor = useCallback(
    (surahId: number): string => {
      if (colorMode === 'status') {
        const progress = getSurahProgress(surahId);
        return STATUS_COLORS[progress.status];
      }
      if (colorMode === 'place') {
        const surah = SURAHS[surahId - 1];
        return surah.revelationPlace === 'meccan' ? '#E8D6A6' : '#CFE4D8';
      }
      if (colorMode === 'juz') {
        const surah = SURAHS[surahId - 1];
        const hue = ((surah.juzStart - 1) / 30) * 120 + 160; // green-teal range
        return `hsl(${hue}, 40%, 75%)`;
      }
      // length mode
      const surah = SURAHS[surahId - 1];
      const maxAyahs = 286;
      const ratio = surah.ayahCount / maxAyahs;
      const lightness = 90 - ratio * 40;
      return `hsl(160, 35%, ${lightness}%)`;
    },
    [colorMode, getSurahProgress]
  );

  return (
    <Canvas
      style={{ width, height: canvasHeight }}
      onTouchEnd={(e) => {
        const { locationX, locationY } = e.nativeEvent;
        // Hit test: find which surah cell was tapped
        for (let i = 0; i < 114; i++) {
          const pos = positions[i];
          if (!pos) continue;
          const dx = locationX - pos.x;
          const dy = locationY - pos.y;
          if (Math.sqrt(dx * dx + dy * dy) < cellRadius + 4) {
            onSurahPress(i + 1);
            return;
          }
        }
      }}
    >
      {positions.map((pos, index) => {
        const surahId = index + 1;
        const color = getCellColor(surahId);
        const surah = SURAHS[index];

        return (
          <Group key={surahId}>
            <Circle
              cx={pos.x}
              cy={pos.y}
              r={cellRadius}
              color={color}
            />
            <Circle
              cx={pos.x}
              cy={pos.y}
              r={cellRadius}
              color="transparent"
              style="stroke"
              strokeWidth={0.8}
            />
          </Group>
        );
      })}
    </Canvas>
  );
};
