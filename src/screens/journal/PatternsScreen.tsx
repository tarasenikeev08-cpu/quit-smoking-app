import React, {useState} from 'react';
import {View, Text, StyleSheet, Pressable, LayoutChangeEvent} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Svg, {Line, Path, Circle, Defs, LinearGradient, Stop} from 'react-native-svg';
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
const CHART_PAD_TOP = 24;
const CHART_PAD_BOTTOM = 10;
const AXIS_LABEL_W = 44;

/**
 * JOURNAL — PATTERNS, per Ember_Proportions.md.
 * header 6.5% · gap 4% · insight card 12% · gap 5% · chart label 3.5% ·
 * chart 22% · x labels 3% · gap 5% · tip card 12% · [THE ONE FLEX GAP] ·
 * See full log 5.9% · bottom 3%
 * The three blocks sit on an even rhythm (5% between each), so the screen
 * reads balanced rather than top-loaded.
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

  // Every bucket is plotted so the line reads as a day. Buckets without a
  // check-in borrow from their neighbours (interpolated around the clock,
  // since 4am wraps back to 8am); with only one logged bucket the rest sit at
  // the calmest level, so the peak still stands out.
  const filled = fillBuckets(insights.cravingByBucket);
  const points = filled.map((v, i) => ({x: xAt(i), y: yAt(v), i}));
  const curve = smoothPath(points);
  const area = points.length
    ? `${curve} L${points[points.length - 1].x},${baseY} L${points[0].x},${baseY} Z`
    : '';
  const peak = points.find(pt => pt.i === insights.peakBucket) ?? null;
  const gridYs = [yAt(5), yAt(3)];

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
          style={styles.checkInLink}
        >
          <Text style={[T.caption, styles.checkInTxt]}>+ Check in</Text>
        </Pressable>
      </View>

      <View style={{height: m.h(0.04)}} />

      <Card strong style={[styles.insight, {height: m.h(0.12)}]}>
        <Text style={[T.body, {color: colors.ink}]}>
          {insights.alcoholMultiplier
            ? `Your cravings hit ${insights.alcoholMultiplier}× harder on days you drink.`
            : hasData
            ? 'Keep checking in — patterns sharpen after a few days.'
            : 'Log your first check-in to start seeing patterns.'}
        </Text>
      </Card>

      <View style={{height: m.h(0.05)}} />

      <View style={[styles.chartLabelBand, {height: m.h(0.035)}]}>
        <Text style={[T.label, {color: colors.muted}]}>Craving by time of day</Text>
      </View>
      <View onLayout={onChartLayout} style={{height: chartH}}>
        {chartW > 0 && (
          <Svg width={chartW} height={chartH}>
            <Defs>
              <LinearGradient id="cravingArea" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={colors.ink} stopOpacity="0.08" />
                <Stop offset="1" stopColor={colors.ink} stopOpacity="0" />
              </LinearGradient>
            </Defs>
            {/* light gridlines (strong / medium craving) and the baseline */}
            {gridYs.map(y => (
              <Line
                key={y}
                x1={0}
                y1={y}
                x2={chartW}
                y2={y}
                stroke={colors.hair}
                strokeWidth={1}
                strokeDasharray="3 5"
              />
            ))}
            <Line
              x1={0}
              y1={baseY}
              x2={chartW}
              y2={baseY}
              stroke={colors.border}
              strokeWidth={1.5}
            />
            {hasData && (
              <>
                <Path d={area} fill="url(#cravingArea)" />
                <Path
                  d={curve}
                  fill="none"
                  stroke={colors.ink}
                  strokeWidth={2.4}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                {points.map(pt => (
                  <Circle key={pt.i} cx={pt.x} cy={pt.y} r={2.6} fill={colors.ink} />
                ))}
              </>
            )}
            {/* the weak spot: the one amber mark, matching the nudge below */}
            {hasData && peak && (
              <>
                <Line
                  x1={peak.x}
                  y1={peak.y + 8}
                  x2={peak.x}
                  y2={baseY}
                  stroke={colors.accent}
                  strokeWidth={1.5}
                  strokeDasharray="2 4"
                />
                <Circle cx={peak.x} cy={peak.y} r={10} fill={colors.accent} opacity={0.18} />
                <Circle
                  cx={peak.x}
                  cy={peak.y}
                  r={5.5}
                  fill={colors.accent}
                  stroke={colors.paper}
                  strokeWidth={2}
                />
              </>
            )}
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
                {
                  left: xAt(i) - AXIS_LABEL_W / 2,
                  width: AXIS_LABEL_W,
                  color: hasData && i === insights.peakBucket ? colors.ink : colors.frame,
                  fontWeight: hasData && i === insights.peakBucket ? '600' : '400',
                },
              ]}
            >
              {l}
            </Text>
          ))}
      </View>

      <View style={{height: m.h(0.05)}} />

      <Card style={[styles.tip, {height: m.h(0.12)}]}>
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

/**
 * Give empty buckets (0 = no check-ins) a value: interpolate between the
 * nearest logged buckets on either side, wrapping around the clock. With a
 * single logged bucket, the others sit at the calmest level (1).
 */
function fillBuckets(v: number[]): number[] {
  const n = v.length;
  const known = v.map((x, i) => (x > 0 ? i : -1)).filter(i => i >= 0);
  if (known.length === 0) return v.map(() => 1);
  if (known.length === 1) return v.map(x => (x > 0 ? x : 1));
  return v.map((x, i) => {
    if (x > 0) return x;
    let a = i,
      b = i,
      da = 0,
      db = 0;
    do {
      a = (a - 1 + n) % n;
      da++;
    } while (v[a] <= 0);
    do {
      b = (b + 1) % n;
      db++;
    } while (v[b] <= 0);
    return v[a] + ((v[b] - v[a]) * da) / (da + db);
  });
}

/**
 * Smooth curve through the points (Catmull-Rom as cubic Béziers). Control
 * points are clamped to the segment's own vertical range, so the curve never
 * overshoots — no dips below the baseline, no false peaks.
 */
function smoothPath(p: {x: number; y: number}[]): string {
  if (p.length === 0) return '';
  const t = 0.18;
  const clamp = (y: number, a: number, b: number) =>
    Math.min(Math.max(a, b), Math.max(Math.min(a, b), y));
  let d = `M${p[0].x},${p[0].y}`;
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[Math.max(0, i - 1)];
    const p1 = p[i];
    const p2 = p[i + 1];
    const p3 = p[Math.min(p.length - 1, i + 2)];
    const c1y = clamp(p1.y + (p2.y - p0.y) * t, p1.y, p2.y);
    const c2y = clamp(p2.y - (p3.y - p1.y) * t, p1.y, p2.y);
    d += ` C${p1.x + (p2.x - p0.x) * t},${c1y} ${p2.x - (p3.x - p1.x) * t},${c2y} ${p2.x},${p2.y}`;
  }
  return d;
}
