import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Polygon, Rect } from 'react-native-svg';

/** Geometric ornaments only (no living beings). Preset id 0–7. */
export function OrnamentAvatar({
  presetId,
  size = 96,
  stroke,
  fill,
}: {
  presetId: number;
  size?: number;
  stroke: string;
  fill: string;
}) {
  const id = ((presetId % 8) + 8) % 8;
  const s = size;
  const c = s / 2;

  return (
    <View style={[styles.wrap, { width: s, height: s }]}>
      <Svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
        <Rect x={0} y={0} width={s} height={s} fill={fill} rx={s * 0.12} />
        {id === 0 ? (
          <Polygon
            points={`${c},${s * 0.12} ${s * 0.88},${s * 0.38} ${s * 0.72},${s * 0.88} ${s * 0.28},${s * 0.88} ${s * 0.12},${s * 0.38}`}
            fill="none"
            stroke={stroke}
            strokeWidth={2}
          />
        ) : null}
        {id === 1 ? (
          <Polygon
            points={`${c},${s * 0.1} ${s * 0.9},${c} ${c},${s * 0.9} ${s * 0.1},${c}`}
            fill="none"
            stroke={stroke}
            strokeWidth={2}
          />
        ) : null}
        {id === 2 ? (
          <>
            <Polygon
              points={`${c},${s * 0.15} ${s * 0.85},${s * 0.4} ${s * 0.7},${s * 0.85} ${s * 0.3},${s * 0.85} ${s * 0.15},${s * 0.4}`}
              fill="none"
              stroke={stroke}
              strokeWidth={1.5}
            />
            <Polygon
              points={`${c},${s * 0.28} ${s * 0.72},${s * 0.52} ${s * 0.62},${s * 0.78} ${s * 0.38},${s * 0.78} ${s * 0.28},${s * 0.52}`}
              fill="none"
              stroke={stroke}
              strokeWidth={1.5}
            />
          </>
        ) : null}
        {id === 3 ? (
          <Polygon
            points={`${s * 0.5},${s * 0.08} ${s * 0.82},${s * 0.35} ${s * 0.72},${s * 0.72} ${s * 0.28},${s * 0.72} ${s * 0.18},${s * 0.35}`}
            fill="none"
            stroke={stroke}
            strokeWidth={2}
          />
        ) : null}
        {id === 4 ? (
          <>
            <Rect x={s * 0.22} y={s * 0.22} width={s * 0.56} height={s * 0.56} fill="none" stroke={stroke} strokeWidth={2} />
            <Polygon points={`${c},${s * 0.18} ${c},${s * 0.82}`} fill="none" stroke={stroke} strokeWidth={1.5} />
            <Polygon points={`${s * 0.18},${c} ${s * 0.82},${c}`} fill="none" stroke={stroke} strokeWidth={1.5} />
          </>
        ) : null}
        {id === 5 ? (
          <Polygon
            points={`${c},${s * 0.12} ${s * 0.78},${s * 0.32} ${s * 0.78},${s * 0.68} ${c},${s * 0.88} ${s * 0.22},${s * 0.68} ${s * 0.22},${s * 0.32}`}
            fill="none"
            stroke={stroke}
            strokeWidth={2}
          />
        ) : null}
        {id === 6 ? (
          <>
            <Polygon
              points={`${c},${s * 0.1} ${s * 0.75},${s * 0.32} ${s * 0.68},${s * 0.58} ${c},${s * 0.78} ${s * 0.32},${s * 0.58} ${s * 0.25},${s * 0.32}`}
              fill="none"
              stroke={stroke}
              strokeWidth={1.8}
            />
            <Polygon
              points={`${c},${s * 0.32} ${s * 0.62},${s * 0.5} ${s * 0.55},${s * 0.72} ${c},${s * 0.62} ${s * 0.45},${s * 0.72} ${s * 0.38},${s * 0.5}`}
              fill="none"
              stroke={stroke}
              strokeWidth={1.5}
            />
          </>
        ) : null}
        {id === 7 ? (
          <Polygon
            points={`${s * 0.5},${s * 0.1} ${s * 0.88},${s * 0.42} ${s * 0.72},${s * 0.88} ${s * 0.28},${s * 0.88} ${s * 0.12},${s * 0.42}`}
            fill="none"
            stroke={stroke}
            strokeWidth={2}
          />
        ) : null}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
});
