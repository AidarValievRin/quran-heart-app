import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  zoomResetRevision: number;
  activeSurahId?: number | null;
}

function fitLabel(text: string, maxChars: number): string {
  const t = text.trim();
  return t.length <= maxChars ? t : `${t.slice(0, Math.max(1, maxChars - 1))}…`;
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
  // Taller canvas to accommodate anatomical heart proportions
  const canvasH = width * 1.35;
  const { i18n } = useTranslation();
  const { getSurahProgress } = useProgressStore();
  const [pressedId, setPressedId] = useState<number | null>(null);

  const [fontsLoaded] = useFonts({ Amiri_400Regular, Amiri_700Bold });

  const outlineD = useMemo(() => heartOutlinePath(width, canvasH), [width, canvasH]);
  const sites = useMemo(() => generateSurahSites(width, canvasH), [width, canvasH]);
  const polygons = useMemo(
    () => computeVoronoiPolygons(width, canvasH, sites),
    [sites, width, canvasH]
  );

  // Keep a stable ref to sites for gesture callbacks (avoids re-creating gestures on every render)
  const sitesRef = useRef(sites);
  useEffect(() => { sitesRef.current = sites; }, [sites]);

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

  const getFill = useCallback(
    (surahId: number): string => {
      const surah = SURAHS[surahId - 1];
      if (colorMode === 'status') return statusColors[getSurahProgress(surahId).status];
      if (colorMode === 'place') return surah.revelationPlace === 'meccan' ? '#E8D6A6' : '#CFE4D8';
      if (colorMode === 'juz') return JUZ_COLORS[(surah.juzStart - 1) % 30];
      const ratio = surah.ayahCount / 286;
      return `hsl(160, 35%, ${Math.round(90 - ratio * 45)}%)`;
    },
    [colorMode, statusColors, getSurahProgress]
  );

  // ─── Nearest-surah hit detection (JS, called from gesture callbacks) ───────
  const findNearestSurah = useCallback(
    (tapX: number, tapY: number): number | null => {
      const s = sitesRef.current;
      let minDist = Infinity;
      let nearest = -1;
      for (let i = 0; i < s.length; i++) {
        const dx = tapX - s[i][0];
        const dy = tapY - s[i][1];
        const d = dx * dx + dy * dy;
        if (d < minDist) { minDist = d; nearest = i; }
      }
      // Reject taps too far from any site (~half an average cell diagonal)
      const maxDist = (width * canvasH) / (s.length * 1.5);
      return minDist < maxDist && nearest >= 0 ? nearest + 1 : null;
    },
    [width, canvasH]
  );

  const handleTap = useCallback(
    (x: number, y: number) => {
      const id = findNearestSurah(x, y);
      if (id) {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setPressedId(id);
        setTimeout(() => setPressedId(null), 200);
        onSurahPress(id);
      }
    },
    [findNearestSurah, onSurahPress]
  );

  const handleLongPress = useCallback(
    (x: number, y: number) => {
      const id = findNearestSurah(x, y);
      if (id) {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onSurahLongPress(id);
      }
    },
    [findNearestSurah, onSurahLongPress]
  );

  // ─── Animations ──────────────────────────────────────────────────────────
  const beat = useSharedValue(1);
  const entered = useSharedValue(0);
  const pinchScale = useSharedValue(1);
  const savedPinch = useSharedValue(1);
  /** Block tap/long-press while pinch is active to avoid gesture conflicts / crashes. */
  const isPinching = useSharedValue(0);

  useEffect(() => {
    entered.value = withDelay(80, withTiming(1, { duration: 1100, easing: Easing.out(Easing.cubic) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoomResetRevision]);

  // ─── Gestures ─────────────────────────────────────────────────────────────
  const pinchGesture = Gesture.Pinch()
    .onBegin(() => {
      'worklet';
      isPinching.value = 1;
    })
    .onUpdate((e) => {
      'worklet';
      const s = e.scale;
      if (typeof s !== 'number' || !Number.isFinite(s) || s <= 0) return;
      const base = Number.isFinite(savedPinch.value) ? savedPinch.value : 1;
      const next = base * s;
      pinchScale.value = Math.min(3.25, Math.max(1, next));
    })
    .onEnd(() => {
      'worklet';
      const v = pinchScale.value;
      if (!Number.isFinite(v)) {
        pinchScale.value = 1;
        savedPinch.value = 1;
        return;
      }
      savedPinch.value = v;
      if (v < 1.04) {
        pinchScale.value = withSpring(1, { damping: 18, stiffness: 220 });
        savedPinch.value = 1;
      } else if (v > 3.1) {
        pinchScale.value = withSpring(3.1, { damping: 16, stiffness: 200 });
        savedPinch.value = 3.1;
      }
    })
    .onFinalize(() => {
      'worklet';
      isPinching.value = 0;
      const v = pinchScale.value;
      if (!Number.isFinite(v)) {
        pinchScale.value = 1;
        savedPinch.value = 1;
      }
    });

  const tapGesture = Gesture.Tap()
    .maxDuration(400)
    .onEnd((e) => {
      'worklet';
      if (isPinching.value) return;
      runOnJS(handleTap)(e.x, e.y);
    });

  const longPressGesture = Gesture.LongPress()
    .minDuration(500)
    .onStart((e) => {
      'worklet';
      if (isPinching.value) return;
      runOnJS(handleLongPress)(e.x, e.y);
    });

  const flingLeft = Gesture.Fling()
    .direction(Directions.LEFT)
    .onEnd(() => {
      'worklet';
      runOnJS(onCycleColorMode)(1);
    });

  const flingRight = Gesture.Fling()
    .direction(Directions.RIGHT)
    .onEnd(() => {
      'worklet';
      runOnJS(onCycleColorMode)(-1);
    });

  const composed = Gesture.Simultaneous(
    pinchGesture,
    Gesture.Exclusive(longPressGesture, tapGesture, flingLeft, flingRight)
  );

  const shellStyle = useAnimatedStyle(() => {
    const p = Number.isFinite(pinchScale.value) ? pinchScale.value : 1;
    const b = Number.isFinite(beat.value) ? beat.value : 1;
    const e = Number.isFinite(entered.value) ? entered.value : 1;
    const raw = p * b * interpolate(e, [0, 1], [0.88, 1]);
    const safe = Number.isFinite(raw) ? Math.max(0.1, Math.min(4, raw)) : 1;
    return {
      opacity: interpolate(e, [0, 1], [0, 1]),
      transform: [{ scale: safe }],
    };
  });

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
                if (!poly || poly.length < 3) return null;
                const d = polygonToPathD(poly);
                if (!d) return null;
                const [cx, cy] = polygonCentroid(poly);
                const area = polygonArea(poly);
                const side = Math.sqrt(Math.max(area, 1));
                const isActive = activeSurahId === surahId;
                const isPressed = pressedId === surahId;
                const fill = getFill(surahId);
                const surah = SURAHS[surahId - 1];
                if (!surah) return null;
                const secondary = i18n.language.startsWith('en') ? surah.nameTranslit : surah.nameRu;
                const maxSec = side < 22 ? 4 : side < 32 ? 7 : 11;
                const arabicSize = Math.min(11, Math.max(5, side * 0.33));
                const secSize = Math.min(7.5, Math.max(4, side * 0.21));

                return (
                  <G key={surahId}>
                    <Path
                      d={d}
                      fill={fill}
                      fillOpacity={isPressed ? 0.75 : 1}
                      stroke={isActive || isPressed ? themeColors.accentGold : themeColors.border}
                      strokeWidth={isActive ? 1.5 : isPressed ? 1.2 : 0.5}
                    />
                    {fontsLoaded && side >= 14 ? (
                      <>
                        <SvgText
                          x={cx}
                          y={cy - secSize * 0.6}
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
                          y={cy + arabicSize * 0.6}
                          fill={themeColors.textSecondary}
                          fontSize={secSize}
                          fontFamily="Amiri_400Regular"
                          textAnchor="middle"
                          pointerEvents="none"
                        >
                          {fitLabel(secondary, maxSec)}
                        </SvgText>
                      </>
                    ) : null}
                  </G>
                );
              })}
            </G>

            {/* Outline rendered on top of cells */}
            <Path
              d={outlineD}
              fill="none"
              stroke={themeColors.textPrimary}
              strokeWidth={1.5}
              pointerEvents="none"
            />
          </Svg>
        </View>
      </AnimatedView>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
});
