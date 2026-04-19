import React from 'react';
import { Text, type StyleProp, type TextStyle } from 'react-native';

/** Highlights first case-insensitive occurrence of query in text (search results). */
export function HighlightedText({
  text,
  query,
  style,
  highlightStyle,
  numberOfLines,
}: {
  text: string;
  query: string;
  style?: StyleProp<TextStyle>;
  highlightStyle?: StyleProp<TextStyle>;
  numberOfLines?: number;
}) {
  const q = query.trim();
  if (q.length < 2) {
    return (
      <Text style={style} numberOfLines={numberOfLines}>
        {text}
      </Text>
    );
  }
  const lower = text.toLowerCase();
  const qi = lower.indexOf(q.toLowerCase());
  if (qi < 0) {
    return (
      <Text style={style} numberOfLines={numberOfLines}>
        {text}
      </Text>
    );
  }
  const hl = [{ backgroundColor: 'rgba(212, 175, 55, 0.28)' }, highlightStyle];
  return (
    <Text style={style} numberOfLines={numberOfLines}>
      {text.slice(0, qi)}
      <Text style={hl}>{text.slice(qi, qi + q.length)}</Text>
      {text.slice(qi + q.length)}
    </Text>
  );
}
