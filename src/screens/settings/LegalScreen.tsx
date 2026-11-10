import React from 'react';
import {Linking, Pressable, StyleSheet, Text, View} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';

import Screen from '@/components/Screen';
import Icon from '@/components/Icon';
import {colors, radius} from '@/theme';
import {useMetrics, Metrics} from '@/theme/metrics';
import {Block, Inline, legalDoc, LEGAL_IS_PLACEHOLDER} from '@/legal';
import type {RootParamList} from '@/navigation/types';

/** One legal document, rendered from the bundled Ember_Legal_Pack.md. */
export default function LegalScreen() {
  const nav = useNavigation();
  const {params} = useRoute<RouteProp<RootParamList, 'Legal'>>();
  const m = useMetrics();
  const T = m.type;
  const doc = legalDoc(params.doc);

  return (
    <Screen scroll contentStyle={{paddingHorizontal: m.gutter, paddingBottom: m.h(0.05)}}>
      <View style={[styles.header, {height: m.band.header}]}>
        <Pressable onPress={() => nav.goBack()} hitSlop={14} accessibilityRole="button" accessibilityLabel="Back">
          <Icon name="chevronLeft" size={22} color={colors.ink} />
        </Pressable>
      </View>

      <Text accessibilityRole="header" style={[T.h1, styles.title]}>
        {doc.title}
      </Text>

      {LEGAL_IS_PLACEHOLDER && (
        <View style={styles.draft}>
          <Text style={[T.label, {color: colors.ink}]}>Draft</Text>
          <Text style={[T.caption, {color: colors.muted, marginTop: 4}]}>
            Placeholder text — add Ember_Legal_Pack.md before release.
          </Text>
        </View>
      )}

      {doc.blocks.length === 0 ? (
        <Text style={[T.body, {color: colors.muted, marginTop: 16}]}>
          This document isn’t in the legal pack.
        </Text>
      ) : (
        doc.blocks.map((b, i) => <BlockView key={i} block={b} m={m} first={i === 0} />)
      )}
    </Screen>
  );
}

function BlockView({block, m, first}: {block: Block; m: Metrics; first: boolean}) {
  const T = m.type;
  const body = [T.body, styles.body, {lineHeight: Math.round(T.body.fontSize * 1.55)}];
  switch (block.kind) {
    case 'heading': {
      const style = block.level <= 2 ? T.h2 : {...T.body, fontWeight: '600' as const};
      return (
        <Text accessibilityRole="header" style={[style, styles.heading, first && {marginTop: 8}]}>
          {block.text}
        </Text>
      );
    }
    case 'paragraph':
      return <Text style={[body, styles.para]}>{renderInline(block.inline)}</Text>;
    case 'quote':
      return (
        <View style={styles.quote}>
          <Text style={[body, {color: colors.muted}]}>{renderInline(block.inline)}</Text>
        </View>
      );
    case 'list':
      return (
        <View style={styles.list}>
          {block.items.map((item, i) => (
            <View key={i} style={styles.item}>
              <Text style={[body, styles.marker]}>{block.ordered ? `${i + 1}.` : '•'}</Text>
              <Text style={[body, styles.itemText]}>{renderInline(item)}</Text>
            </View>
          ))}
        </View>
      );
    case 'rule':
      return <View style={styles.rule} />;
  }
}

function renderInline(parts: Inline[]) {
  return parts.map((p, i) =>
    p.kind === 'link' ? (
      <Text
        key={i}
        style={styles.link}
        accessibilityRole="link"
        onPress={() => Linking.openURL(p.url).catch(() => {})}>
        {p.text}
      </Text>
    ) : (
      <Text
        key={i}
        style={[p.bold && styles.bold, p.italic && styles.italic, p.code && styles.code]}>
        {p.text}
      </Text>
    ),
  );
}

const styles = StyleSheet.create({
  header: {justifyContent: 'center', alignItems: 'flex-start'},
  title: {color: colors.ink, marginTop: 8, marginBottom: 8},
  draft: {
    marginTop: 12,
    padding: 12,
    borderRadius: radius.stat,
    borderWidth: 1.5,
    borderColor: colors.ink,
    borderStyle: 'dashed',
  },
  body: {color: colors.ink},
  heading: {color: colors.ink, marginTop: 28, marginBottom: 4},
  para: {marginTop: 12},
  quote: {marginTop: 12, paddingLeft: 12, borderLeftWidth: 1.5, borderLeftColor: colors.border},
  list: {marginTop: 12, gap: 6},
  item: {flexDirection: 'row'},
  marker: {width: 22},
  itemText: {flex: 1},
  rule: {height: 1, backgroundColor: colors.hair, marginVertical: 24},
  link: {textDecorationLine: 'underline', color: colors.ink},
  bold: {fontWeight: '600'},
  italic: {fontStyle: 'italic'},
  code: {fontFamily: 'Menlo, monospace', fontSize: 14},
});
