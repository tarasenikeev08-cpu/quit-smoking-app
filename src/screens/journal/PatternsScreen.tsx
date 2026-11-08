import React, {useState} from 'react';
import {View, Text, StyleSheet, Pressable, LayoutChangeEvent} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Svg, {Line, Polyline, Circle} from 'react-native-svg';
import dayjs from 'dayjs';

import Screen from '@/components/Screen';
import {Button, Card, Hair} from '@/components/ui';
import {colors} from '@/theme';
import {useMetrics} from '@/theme/metrics';
import {useStore} from '@/store';
import {useInsights} from '@/store/selectors';

/** Horizontal inset so the first/last points and their labels aren't clipped. */
const CHART_PAD_X = 18;
/** Room above the highest point and below the baseline. */
const CHART_PAD_TOP = 12;
const CHART_PAD_BOTTOM = 10;
const AXIS_LABEL_W = 44;

/**
 * JOURNAL — PATTERNS, per Ember_Proportions.md.
 * header 6.5% · insight card 13% · gap 4% · chart label 3.5% · chart 22% ·
 * x labels 3% · gap 4% · tip card 13% · [THE ONE FLEX GAP] ·
 * See full log 5.9% · bottom 3%
 */
export default function PatternsScreen() {
  const insights = useInsights();
  const m = useMetrics();
  const T = m.type;
  const journal = useStore(s => s.journal);
  const nav = useNavigation<any>();
  const [showLog, setShowLog] = useState(false);

  const hasData = insights.entryCount > 0;

  // Drawn in real pixels (measured), not a stretched viewBox — a non-uniform
  // viewBox squashed the peak dot into an ellipse and warped the stroke.
  const [chartW, setChartW] = useState(0);
  const chartH = m.h(0.22);
  const onChartLayout = (e: LayoutChangeEvent) => setChartW(e.nativeEvent.layout.width);

  const buckets = insights.cravingByBucket.length;
  const xAt = (i: number) =>
    CHART_PAD_X + (buckets > 1 ? (i / (buckets - 1)) * (chartW - CHART_PAD_X * 2) : 0);
  const baseY = chartH - CHART_PAD_BOTTOM;
  // craving runs 1..5; 1 sits just above the baseline, 5 at the top
  const yAt = (v: number) => baseY - ((v - 1) / 4) * (baseY - CHART_PAD_TOP) - 4;

  // Only buckets with check-ins are plotted. An empty bucket averages to 0,
  // which is below the 1..5 scale — drawing it would claim "no cravings"
  // when the truth is "no data".
  const points = insights.cravingByBucket
    .map((v, i) => ({i, v}))
    .filter(pt => pt.v > 0)
    .map(pt => ({x: xAt(pt.i), y: yAt(pt.v), i: pt.i}));
  const polyline = points.map(pt => `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`).join(' ');
  const peak = points.find(pt => pt.i === insights.peakBucket) ?? null;

  return (
    <Screen scroll contentStyle={[styles.content, {paddingHorizontal: m.gutter}]}>
      <View style={[styles.headerBand, {height: m.h(0.065)}]}>
        <Text style={[T.label, styles.kicker, {color: colors.muted}]}>Your patterns</Text>
        {/* the stack has no header, so make the way back explicit */}
        <Pressable
          // popTo, not navigate: in React Navigation 7, navigate() to a screen
          // already in the stack pushes a duplicate instead of going back.
          onPress={() => nav.popTo('CheckIn')}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="New check-in"
          style={styles.checkInLink}>
          <Text style={[T.caption, styles.checkInTxt]}>+ Check in</Text>
        </Pressable>
      </View>

      <Card strong style={[styles.insight, {height: m.h(0.13)}]}>
        <Text style={[T.body, {color: colors.ink}]}>
          {insights.alcoholMultiplier
            ? `Your cravings hit ${insights.alcoholMultiplier}× harder on days you drink.`
            : hasData
            ? 'Keep checking in — patterns sharpen after a few days.'
            : 'Log your first check-in to start seeing patterns.'}
        </Text>
      </Card>

      <View style={{height: m.h(0.04)}} />

      <View style={[styles.chartLabelBand, {height: m.h(0.035)}]}>
        <Text style={[T.label, {color: colors.muted}]}>Craving by time of day</Text>
      </View>
      <View onLayout={onChartLayout} style={{height: chartH}}>
        {chartW > 0 && (
          <Svg width={chartW} height={chartH}>
            <Line x1={0} y1={baseY} x2={chartW} y2={baseY} stroke={colors.border} strokeWidth={1.5} />
            {points.length > 1 && (
              <Polyline
                points={polyline}
                fill="none"
                stroke={colors.ink}
                strokeWidth={2.4}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            )}
            {/* a lone check-in is a dot, not an invisible zero-length line */}
            {points.length === 1 && (
              <Circle cx={points[0].x} cy={points[0].y} r={3.5} fill={colors.ink} />
            )}
            {peak && <Circle cx={peak.x} cy={peak.y} r={5} fill={colors.accent} />}
          </Svg>
        )}
      </View>
      {/* one label per bucket, centred under that bucket's x */}
      <View style={[styles.xLabels, {height: m.h(0.03)}]}>
        {chartW > 0 &&
          insights.bucketLabels.map((l, i) => (
            <Text
              key={l}
              style={[
                T.caption,
                styles.xLabel,
                {left: xAt(i) - AXIS_LABEL_W / 2, width: AXIS_LABEL_W, color: colors.frame},
              ]}>
              {l}
            </Text>
          ))}
      </View>

      <View style={{height: m.h(0.04)}} />

      <Card style={[styles.tip, {height: m.h(0.13)}]}>
        <Text style={[T.body, {color: colors.ink}]}>
          {insights.peakLabel
            ? `${insights.peakLabel} are your weak spot. Plan something around then.`
            : 'Your weak spots will show up here as you check in.'}
        </Text>
      </Card>

      {/* ---- THE ONE FLEX GAP ---- */}
      <View style={styles.flexGap} />

      <Button
        label={showLog ? 'Hide log' : 'See full log'}
        variant="outline"
        onPress={() => setShowLog(v => !v)}
      />
      <View style={{height: m.h(0.03)}} />

      {showLog && (
        <View style={styles.log}>
          {journal.length === 0 && (
            <Text style={[T.caption, styles.empty, {color: colors.muted}]}>No check-ins yet.</Text>
          )}
          {journal.map((e, i) => (
            <View key={e.id}>
              {i > 0 && <Hair />}
              <View style={styles.logRow}>
                <Text style={[T.body, {fontWeight: '500', color: colors.ink}]}>
                  {dayjs(e.createdAt).format('MMM D · h:mma')}
                </Text>
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


const styles = StyleSheet.create({
  content: {flexGrow: 1},
  headerBand: {justifyContent: 'flex-end'},
  kicker: {textAlign: 'center'},
  insight: {justifyContent: 'center'},
  chartLabelBand: {justifyContent: 'flex-end'},
  xLabels: {position: 'relative'},
  xLabel: {position: 'absolute', top: 2, textAlign: 'center'},
  checkInLink: {position: 'absolute', right: 0, bottom: 0},
  checkInTxt: {color: colors.ink, fontWeight: '500'},
  tip: {justifyContent: 'center', borderColor: colors.border},
  flexGap: {flex: 1},
  log: {marginTop: 4},
  logRow: {paddingVertical: 12},
  empty: {textAlign: 'center', paddingVertical: 12},
});
