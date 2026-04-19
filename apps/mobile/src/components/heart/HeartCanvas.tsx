import React, { useMemo, useCallback } from 'react';
import { useWindowDimensions, View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { SURAHS } from '../../data/surahsMeta';
import { useProgressStore } from '../../store/progressStore';
import { Colors } from '../../theme';
import type { SurahStatus } from '../../data/types';

// Parametric heart: 114 cells distributed across 3 rings + center
function heartPoint(t: number, scale: number, cx: number, cy: number) {
  const x = 16 * Math.pow(Math.sin(t), 3);
  const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
  return { x: cx + x * scale, y: cy + y * scale };
}

function generateHeartPositions(width: number, height: number) {
  const cx = width / 2;
  const cy = height / 2 + height * 0.04;
  const scale = Math.min(width, height) * 0.034;
  const positions: Array<{ x: number; y: number }> = [];

  const rings = [
    { count: 44, radiusScale: 1.0 },
    { count: 36, radiusScale: 0.65 },
    { count: 22, radiusScale: 0.34 },
    { count: 12, radiusScale: 0.13 },
  ];

  for (const ring of rings) {
    for (let i = 0; i < ring.count; i++) {
      const t = (i / ring.count) * 2 * Math.PI;
      positions.push(heartPoint(t, scale * ring.radiusScale, cx, cy));
    }
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

const JUZ_COLORS = [
  '#E8D6A6','#CFE4D8','#BCD6E0','#D4C5E0','#E0C5C5',
  '#C5E0D4','#E0D4C5','#C5D4E0','#D4E0C5','#E0C5D4',
  '#C5E0C5','#D4C5D4','#E0D4D4','#C5C5E0','#D4E0D4',
  '#E0E0C5','#C5D4C5','#D4D4E0','#C5E0E0','#E0C5E0',
  '#D4C5C5','#C5C5D4','#E0D4C5','#C5D4D4','#D4E0C5',
  '#E0C5C5','#C5E0D4','#D4C5E0','#E0D4D4','#C5D4E0',
];

interface HeartCanvasProps {
  onSurahPress: (surahId: number) => void;
  colorMode?: 'status' | 'juz' | 'place' | 'length';
}

export const HeartCanvas: React.FC<HeartCanvasProps> = ({
  onSurahPress,
  colorMode = 'status',
}) => {
  const { width } = useWindowDimensions();
  const canvasHeight = width * 1.05;
  const { getSurahProgress } = useProgressStore();

  const positions = useMemo(
    () => generateHeartPositions(width, canvasHeight),
    [width, canvasHeight]
  );

  const cellRadius = Math.min(width, canvasHeight) * 0.028;

  const getCellColor = useCallback(
    (surahId: number): string => {
      const surah = SURAHS[surahId - 1];
      if (colorMode === 'status') {
        return STATUS_COLORS[getSurahProgress(surahId).status];
      }
      if (colorMode === 'place') {
        return surah.revelationPlace === 'meccan' ? '#E8D6A6' : '#CFE4D8';
      }
      if (colorMode === 'juz') {
        return JUZ_COLORS[(surah.juzStart - 1) % 30];
      }
      // length
      const ratio = surah.ayahCount / 286;
      const lightness = Math.round(90 - ratio * 45);
      return `hsl(160, 35%, ${lightness}%)`;
    },
    [colorMode, getSurahProgress]
  );

  return (
    <View style={{ width, height: canvasHeight }}>
      <Svg width={width} height={canvasHeight}>
        {positions.map((pos, index) => {
          const surahId = index + 1;
          return (
            <G
              key={surahId}
              onPress={() => onSurahPress(surahId)}
            >
              <Circle
                cx={pos.x}
                cy={pos.y}
                r={cellRadius}
                fill={getCellColor(surahId)}
                stroke={Colors.light.border}
                strokeWidth={0.6}
              />
            </G>
          );
        })}
      </Svg>
    </View>
  );
};
