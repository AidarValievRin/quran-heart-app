import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import Svg, { ClipPath, Defs, G, Path, Text as SvgText } from 'react-native-svg';
import { Gesture, GestureDetector, Directions } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { useFonts, Amiri_400Regular, Amiri_700Bold } from '@expo-google-fonts/amiri';
import { useTranslation } from 'react-i18next';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { SURAHS } from '../../data/surahsMeta';
import { useProgressStore } from '../../store/progressStore';
import type { ThemeColors } from '../../theme/colors';
import type { SurahStatus } from '../../data/types';
import {
  computeVoronoiPolygons,
  generateSurahSites,
  heartOutlinePath,
  polygonArea,
  polygonCentroid,
  polygonToPathD,
} from './heartGeometry';

const AnimatedView = Animated.createAnimatedComponent(View);

const JUZ_COLORS = [
  '#E8D6A6', '#CFE4D8', '#BCD6E0', '#D4C5E0', '#E0C5C5',
  '#C5E0D4', '#E0D4C5', '#C5D4E0', '#D4E0C5', '#E0C5D4',
  '#C5E0C5', '#D4C5D4', '#E0D4D4', '#C5C5E0', '#D4E0D4',
  '#E0E0C5', '#C5D4C5', '#D4D4E0', '#C5E0E0', '#E0C5E0',
  '#D4C5C5', '#C5C5D4', '#E0D4C5', '#C5D4D4', '#D4E0C5',
  '#E0C5C5', '#C5E0D4', '#D4C5E0', '#E0D4D4', '#C5D4E0',
];

export type HeartColorMode = 'status' | 'juz' | 'place' | 'length';

export interface HeartMosaicProps {
  themeColors: ThemeColors;
  colorMode: HeartColorMode;
  onSurahPress: (surahId: number) => void;
  onSurahLongPress: (surahId: number) => void;
  onCycleColorMode: (delta: number) => void;
  /** Bump to reset pinch zoom to 1 */
  zoomResetRevision: number;
  /** Stronger outline while sheet / modal references this surah */
  activeSurahId?: number | null;
}

function fitSecondaryLabel(text: string, maxChars: number): string {
  const t = text.trim();
  if (t.length <= maxChars) return t;
  return `${t.slice(0, Math.max(1, maxChars - 1))}…`;
}

export const HeartMosaic: React.FC<HeartMosaicProps> = ({
  themeColors,
  colorMode,
  onSurahPress,
  onSurahLongPress,
  onCycleColorMode,
  zoomResetRevision,
  activeSurahId,
}) => {
  const { width } = useWindowDimensions();
  const canvasH = width * 1.08;
  const { i18n } = useTranslation();
  const { getSurahProgress } = useProgressStore();
  const [pressedId, setPressedId] = useState<number | null>(null);

  const [fontsLoaded] = useFonts({
    Amiri_400Regular,
    Amiri_700Bold,
  });

  const outlineD = useMemo(() => heartOutlinePath(width, canvasH), [width, canvasH]);
  const sites = useMemo(() => generateSurahSites(width, canvasH), [width, canvasH]);

  const polygons = useMemo(
    () => computeVoronoiPolygons(width, canvasH, sites),
    [sites, width, canvasH]
  );

  const statusColors = useMemo(
    () =>
      ({
        unread: themeColors.statusUnread,
        read: themeColors.statusRead,
        studying: themeColors.statusStudying,
        memorizing: themeColors.statusMemorizing,
        memorized: themeColors.statusMemorized,
        reviewing: themeColors.statusReviewing,
      }) satisfies Record<SurahStatus, string>,
    [themeColors]
  );

  const getFill = (surahId: number): string => {
    const surah = SURAHS[surahId - 1];
    if (colorMode === 'status') {
      return statusColors[getSurahProgress(surahId).status];
    }
    if (colorMode === 'place') {
      return surah.revelationPlace === 'meccan' ? '#E8D6A6' : '#CFE4D8';
    }
    if (colorMode === 'juz') {
      return JUZ_COLORS[(surah.juzStart - 1) % 30];
    }
    const ratio = surah.ayahCount / 286;
    const lightness = Math.round(90 - ratio * 45);
    return `hsl(160, 35%, ${lightness}%)`;
  };

  const beat = useSharedValue(1);
  const entered = useSharedValue(0);
  const pinchScale = useSharedValue(1);
  const savedPinch = useSharedValue(1);

  useEffect(() => {
    entered.value = withDelay(
      80,
      withTiming(1, { duration: 1100, easing: Easing.out(Easing.cubic) })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount
  }, []);

  useEffect(() => {
    beat.value = withRepeat(
      withSequence(
        withTiming(1.018, { duration: 480, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 560, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    pinchScale.value = 1;
    savedPinch.value = 1;
    // zoomResetRevision only — shared values are stable Reanimated refs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoomResetRevision]);

  const clampPinch = (v: number) => Math.min(3.25, Math.max(1, v));

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      pinchScale.value = clampPinch(savedPinch.value * e.scale);
    })
    .onEnd(() => {
      savedPinch.value = pinchScale.value;
      if (pinchScale.value < 1.04) {
        pinchScale.value = withSpring(1, { damping: 18, stiffness: 220 });
        savedPinch.value = 1;
      } else if (pinchScale.value > 3.1) {
        pinchScale.value = withSpring(3.1, { damping: 16, stiffness: 200 });
        savedPinch.value = 3.1;
      }
    });

  const flingLeft = Gesture.Fling()
    .direction(Directions.LEFT)
    .onEnd(() => {
      runOnJS(onCycleColorMode)(1);
    });

  const flingRight = Gesture.Fling()
    .direction(Directions.RIGHT)
    .onEnd(() => {
      runOnJS(onCycleColorMode)(-1);
    });

  const composed = Gesture.Simultaneous(pinchGesture, Gesture.Exclusive(flingLeft, flingRight));

  const shellStyle = useAnimatedStyle(() => ({
    opacity: interpolate(entered.value, [0, 1], [0, 1]),
    transform: [
      {
        scale: pinchScale.value * beat.value * interpolate(entered.value, [0, 1], [0.9, 1]),
      },
    ],
  }));

  return (
    <GestureDetector gesture={composed}>
      <AnimatedView style={[styles.wrap, shellStyle]}>
        <View style={{ width, height: canvasH }}>
          <Svg width={width} height={canvasH}>
            <Defs>
              <ClipPath id="heartClip">
                <Path d={outlineD} />
              </ClipPath>
            </Defs>

            <G clipPath="url(#heartClip)">
              {polygons.map((poly, index) => {
                const surahId = index + 1;
                if (!poly) return null;
                const d = polygonToPathD(poly);
                if (!d) return null;
                const [cx, cy] = polygonCentroid(poly);
                const area = polygonArea(poly);
                const side = Math.sqrt(Math.max(area, 1));
                const isActive = activeSurahId === surahId;
                const isPressed = pressedId === surahId;
                const fill = getFill(surahId);
                const surah = SURAHS[surahId - 1];
                const secondary =
                  i18n.language.startsWith('en') ? surah.nameTranslit : surah.nameRu;
                const maxSec = side < 22 ? 5 : side < 30 ? 8 : 12;
                const arabicSize = Math.min(10.5, Math.max(5.2, side * 0.34));
                const secSize = Math.min(7.2, Math.max(4.2, side * 0.22));

                return (
                  <G
                    key={surahId}
                    onPress={() => {
                      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      onSurahPress(surahId);
                    }}
                    onLongPress={() => {
                      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      onSurahLongPress(surahId);
                    }}
                    onPressIn={() => setPressedId(surahId)}
                    onPressOut={() => setPressedId((p) => (p === surahId ? null : p))}
                  >
                    <Path
                      d={d}
                      fill={fill}
                      fillOpacity={isPressed ? 0.92 : 1}
                      stroke={isActive || isPressed ? themeColors.accentGold : themeColors.border}
                      strokeWidth={isActive ? 1.35 : isPressed ? 1.15 : 0.55}
                    />
                    {fontsLoaded ? (
                      <>
                        <SvgText
                          x={cx}
                          y={cy - secSize * 0.55}
                          fill={themeColors.textPrimary}
                          fontSize={arabicSize}
                          fontFamily="Amiri_700Bold"
                          textAnchor="middle"
                          pointerEvents="none"
                        >
                          {surah.nameAr}
                        </SvgText>
                        <SvgText
                          x={cx}
                          y={cy + arabicSize * 0.55}
                          fill={themeColors.textSecondary}
                          fontSize={secSize}
                          fontFamily="Amiri_400Regular"
                          textAnchor="middle"
                          pointerEvents="none"
                        >
                          {fitSecondaryLabel(secondary, maxSec)}
                        </SvgText>
                      </>
                    ) : null}
                  </G>
                );
              })}
            </G>

            <Path
              d={outlineD}
              fill="none"
              stroke={themeColors.textPrimary}
              strokeWidth={1.35}
              pointerEvents="none"
            />
          </Svg>
        </View>
      </AnimatedView>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
