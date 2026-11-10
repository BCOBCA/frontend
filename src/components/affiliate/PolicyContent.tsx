import type { PropsWithChildren } from 'react';
import { Text, View } from 'react-native';
import { colors } from '../../theme';

export function PolicyParagraphs({ items }: { items: readonly string[] }) {
  return <View style={{ gap: 10 }}>{items.map(text => <Text key={text} selectable style={{ fontSize: 14, lineHeight: 23, color: colors.text }}>{text}</Text>)}</View>;
}

export function PolicyNote({ children }: PropsWithChildren) {
  return <View style={{ borderLeftWidth: 3, borderColor: colors.primary, backgroundColor: '#FFF1F3', borderRadius: 6, padding: 12, marginTop: 10 }}><Text selectable style={{ fontSize: 13, lineHeight: 21, color: colors.text }}>{children}</Text></View>;
}

export function PolicyTable({ headings, rows }: { headings: readonly string[]; rows: readonly (readonly string[])[] }) {
  return <View style={{ borderWidth: 1, borderColor: '#F0E5E9', borderRadius: 8, overflow: 'hidden', marginVertical: 10 }}>
    <View style={{ flexDirection: 'row', backgroundColor: '#FDEEF1' }}>{headings.map(heading => <Text key={heading} style={{ flex: 1, minWidth: 0, padding: 9, color: colors.text, fontSize: 12, lineHeight: 18, fontWeight: '700' }}>{heading}</Text>)}</View>
    {rows.map((row, index) => <View key={row[0] + index} style={{ flexDirection: 'row', borderTopWidth: 1, borderColor: '#F0E5E9', backgroundColor: index % 2 ? '#FFFBFC' : colors.surface }}>{row.map((cell, column) => <Text key={column} selectable style={{ flex: 1, minWidth: 0, padding: 9, color: colors.text, fontSize: 12, lineHeight: 20, fontWeight: column === 0 ? '600' : '400' }}>{cell}</Text>)}</View>)}
  </View>;
}
