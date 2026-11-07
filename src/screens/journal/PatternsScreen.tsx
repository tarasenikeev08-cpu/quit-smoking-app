import React, {useState} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Svg, {Line, Polyline, Circle} from 'react-native-svg';
import dayjs from 'dayjs';

import Screen from '@/components/Screen';
import {Button, Card, Hair} from '@/components/ui';
import {colors} from '@/theme';
import {useMetrics} from '@/theme/metrics';
import {useStore} from '@/store';
import {useInsights} from '@/store/selectors';

const CHART_W = 250;
const CHART_H = 80;
const X_LABELS = ['6am', 'noon', '6pm', 'mid'];

export default function PatternsScreen() {
  const insights = useInsights();
  const m = useMetrics();
  const T = m.type;
  const journal = useStore(s => s.journal);
  const [showLog, setShowLog] = useState(false);

  const hasData = insights.entryCount > 0;

  // map 6 buckets (0..5 craving) to chart points
  const pts = insights.cravingByBucket
    .map((v, i) => {
      const x = 6 + (i / 5) * (CHART_W - 12);
      const y = CHART_H - 16 - (v / 5) * (CHART_H - 28);
      return `${x.toFixed(0)},${y.toFixed(0)}`;
    })
    .join(' ');

  const peakPoint =
    insights.peakBucket >= 0
      ? {
          x: 6 + (insights.peakBucket / 5) * (CHART_W - 12),
          y: CHART_H - 16 - (insights.cravingByBucket[insights.peakBucket] / 5) * (CHART_H - 28),
        }
      : null;

  return (
    <Screen scroll contentStyle={[styles.content, {paddingHorizontal: m.gutter}]}>
      <Text style={[T.label, styles.kicker, {color: colors.muted}]}>Your patterns</Text>

      <Card strong style={styles.highlight}>
        <Text style={[T.body, {color: colors.ink}]}>
          {insights.alcoholMultiplier
            ? `Your cravings hit ${insights.alcoholMultiplier}× harder on days you drink.`
            : hasData
            ? 'Keep checking in — patterns sharpen after a few days.'
            : 'Log your first check-in to start seeing patterns.'}
        </Text>
      </Card>

      <Text style={[T.label, styles.sectionLabel, {color: colors.muted}]}>Craving by time of day</Text>
      <Svg width="100%" height={CHART_H} viewBox={`0 0 ${CHART_W} ${CHART_H}`}>
        <Line x1="0" y1={CHART_H - 16} x2={CHART_W} y2={CHART_H - 16} stroke={colors.border} />
        {hasData && <Polyline points={pts} fill="none" stroke={colors.ink} strokeWidth={2.4} />}
        {peakPoint && <Circle cx={peakPoint.x} cy={peakPoint.y} r={4} fill={colors.accent} />}
      </Svg>
      <View style={styles.xLabels}>
        {X_LABELS.map(l => (
          <Text key={l} style={[T.caption, {color: colors.frame}]}>
            {l}
          </Text>
        ))}
      </View>

      <Card style={styles.secondary}>
        <Text style={[T.body, {color: colors.ink}]}>
          {insights.peakLabel
            ? `${cap(insights.peakLabel)} is your weak spot. Plan something around then.`
            : 'Your weak spots will show up here as you check in.'}
        </Text>
      </Card>

      <View style={styles.grow} />
      <Button
        label={showLog ? 'Hide log' : 'See full log'}
        variant="outline"
        style={styles.logBtn}
        onPress={() => setShowLog(v => !v)}
      />

      {showLog && (
        <View style={styles.log}>
          {journal.length === 0 && <Text style={[T.caption, styles.empty, {color: colors.muted}]}>No check-ins yet.</Text>}
          {journal.map((e, i) => (
            <View key={e.id}>
              {i > 0 && <Hair />}
              <View style={styles.logRow}>
                <Text style={[T.body, {fontWeight: "500", color: colors.ink}]}>{dayjs(e.createdAt).format('MMM D · h:mma')}</Text>
                <Text style={[T.caption, {color: colors.muted, marginTop: 4}]}>
                  craving {e.craving}
                  {e.triggers.length ? ` · ${e.triggers.join(', ')}` : ''}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </Screen>
  );
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const styles = StyleSheet.create({
  content: {flexGrow: 1},
  kicker: {textAlign: 'center', marginBottom: 16},
  highlight: {marginBottom: 12},
  sectionLabel: {marginBottom: 12},
  xLabels: {flexDirection: 'row', justifyContent: 'space-between', marginTop: 4},
  secondary: {marginTop: 16, borderColor: colors.border},
  // THE ONE FLEX GAP — "See full log" anchored to the bottom
  grow: {flex: 1, minHeight: 16},
  logBtn: {marginTop: 20},
  log: {marginTop: 16},
  logRow: {paddingVertical: 12},
  empty: {textAlign: 'center', paddingVertical: 12},
});
