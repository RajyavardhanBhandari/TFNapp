import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Image, PanResponder, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { AppHeader } from '../../src/components/AppHeader';
import { Screen } from '../../src/components/Screen';
import { getQuickFeed } from '../../src/content/quick';
import type { TfnArticle } from '../../src/content/types';
import { recordQuickSignal, undoQuickSignal } from '../../src/content/signals';
import { useAuth } from '../../src/user/auth';
import { useAppTheme } from '../../src/theme';

const SWIPE_RATIO = 0.28;

type Action = { article: TfnArticle; signalId?: string; direction: 'left' | 'right' };

export default function QuickScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { user } = useAuth();
  const [articles, setArticles] = useState<TfnArticle[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lastAction, setLastAction] = useState<Action>();
  const position = useRef(new Animated.ValueXY()).current;
  const threshold = Math.max(90, width * SWIPE_RATIO);

  const load = useCallback(async () => {
    try { setLoading(true); setError(false); const feed = await getQuickFeed(); setArticles(feed); setIndex(0); } catch { setError(true); } finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const current = articles[index];
  const next = articles[index + 1];
  const commit = useCallback(async (direction: 'left' | 'right') => {
    if (!current) return;
    const signalType = direction === 'right' ? 'right_swipe' : 'left_swipe';
    const result = await recordQuickSignal(current.id, signalType);
    setLastAction({ article: current, direction });
    setIndex((value) => value + 1);
    position.setValue({ x: 0, y: 0 });
    void result;
  }, [current, position]);
  const panResponder = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 8,
    onPanResponderMove: (_, g) => position.setValue({ x: g.dx, y: g.dy }),
    onPanResponderRelease: (_, g) => {
      if (Math.abs(g.dx) >= threshold) {
        const direction = g.dx > 0 ? 'right' : 'left';
        Animated.timing(position, { toValue: { x: direction === 'right' ? width * 1.3 : -width * 1.3, y: g.dy }, duration: 220, useNativeDriver: true }).start(() => void commit(direction));
      } else Animated.spring(position, { toValue: { x: 0, y: 0 }, useNativeDriver: true }).start();
    },
  }), [commit, position, threshold, width]);

  const undo = async () => { if (!lastAction || index === 0) return; setIndex((value) => value - 1); setLastAction(undefined); };
  const rotate = position.x.interpolate({ inputRange: [-width, 0, width], outputRange: ['-12deg', '0deg', '12deg'] });
  const feedback = position.x.interpolate({ inputRange: [-threshold, 0, threshold], outputRange: [1, 0, 1], extrapolate: 'clamp' });

  return <Screen scroll={false}><AppHeader title="Quick" />
    <View style={styles.header}><Text style={[styles.heading, { color: theme.colors.text }]}>Discover faster.</Text><Text style={[styles.subheading, { color: theme.colors.mutedText }]}>{articles.length ? `${Math.min(index + 1, articles.length)} of ${articles.length} stories` : 'TFN stories, one at a time'}</Text></View>
    {loading ? <View style={styles.center}><ActivityIndicator color={theme.colors.icon} /><Text style={{ color: theme.colors.mutedText }}>Loading TFN stories…</Text></View> : error ? <View style={styles.center}><Text style={[styles.stateTitle, { color: theme.colors.text }]}>Unable to load Quick</Text><Text style={{ color: theme.colors.mutedText }}>Check your connection and try again.</Text><Pressable onPress={() => void load()} style={[styles.button, { backgroundColor: theme.colors.text }]}><Text style={{ color: theme.colors.inverseText }}>Retry</Text></Pressable></View> : !current ? <View style={styles.center}><Text style={[styles.stateTitle, { color: theme.colors.text }]}>You’re all caught up.</Text><Text style={{ color: theme.colors.mutedText }}>Explore more TFN stories soon.</Text><Pressable onPress={() => void load()} style={[styles.button, { backgroundColor: theme.colors.text }]}><Text style={{ color: theme.colors.inverseText }}>Refresh stories</Text></Pressable></View> : <>
      <View style={styles.stack}>{next ? <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }, styles.backCard]}><Text style={{ color: theme.colors.mutedText }}>Next story</Text></View> : null}
        <Animated.View {...panResponder.panHandlers} style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }, { transform: [{ translateX: position.x }, { translateY: position.y }, { rotate }] }]}>
          {current.featuredImage?.url ? <Image source={{ uri: current.featuredImage.url }} accessibilityLabel={current.featuredImage.alt || current.title} resizeMode="cover" style={styles.image} /> : <View style={[styles.image, { backgroundColor: theme.colors.border }]} />}
          <View style={styles.cardCopy}><Text style={[styles.category, { color: theme.colors.mutedText }]}>{current.categories[0]?.name || 'TFN'}</Text><Text style={[styles.title, { color: theme.colors.text }]}>{current.title}</Text>{current.excerpt ? <Text numberOfLines={3} style={[styles.excerpt, { color: theme.colors.mutedText }]}>{current.excerpt}</Text> : null}<Pressable accessibilityRole="button" accessibilityLabel="Open article" onPress={() => { void recordQuickSignal(current.id, 'article_opened'); router.push({ pathname: '/article/[id]', params: { id: String(current.id) } }); }}><Text style={[styles.read, { color: theme.colors.text }]}>Tap to read full story →</Text></Pressable></View>
          <Animated.View pointerEvents="none" style={[styles.feedback, { left: 18, opacity: position.x.interpolate({ inputRange: [-threshold, 0], outputRange: [1, 0], extrapolate: 'clamp' }) }]}><Text style={styles.feedbackText}>NOT FOR ME</Text></Animated.View><Animated.View pointerEvents="none" style={[styles.feedback, { right: 18, opacity: position.x.interpolate({ inputRange: [0, threshold], outputRange: [0, 1], extrapolate: 'clamp' }) }]}><Text style={styles.feedbackText}>INTERESTED</Text></Animated.View>
        </Animated.View>
      </View>
      <View style={styles.actions}><Pressable accessibilityRole="button" accessibilityLabel="Not interested" onPress={() => { Animated.timing(position, { toValue: { x: -width * 1.3, y: 0 }, duration: 220, useNativeDriver: true }).start(() => void commit('left')); }} style={[styles.action, { borderColor: theme.colors.border }]}><Text style={{ color: theme.colors.text }}>← Not for me</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel="Undo last swipe" disabled={!lastAction} onPress={() => void undo()} style={[styles.action, { borderColor: theme.colors.border, opacity: lastAction ? 1 : 0.4 }]}><Text style={{ color: theme.colors.text }}>↶ Undo</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel="Interested" onPress={() => { Animated.timing(position, { toValue: { x: width * 1.3, y: 0 }, duration: 220, useNativeDriver: true }).start(() => void commit('right')); }} style={[styles.action, { borderColor: theme.colors.border }]}><Text style={{ color: theme.colors.text }}>Interested →</Text></Pressable></View>
    </>}
  </Screen>;
}

const styles = StyleSheet.create({ header: { marginTop: 12, marginBottom: 14 }, heading: { fontSize: 30, fontWeight: '900' }, subheading: { marginTop: 5, fontSize: 13 }, center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingVertical: 90 }, stateTitle: { fontSize: 22, fontWeight: '800' }, button: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 999, marginTop: 10 }, stack: { minHeight: 500, justifyContent: 'center' }, card: { borderWidth: 1, borderRadius: 22, overflow: 'hidden', width: '100%', minHeight: 500 }, backCard: { position: 'absolute', top: 12, left: 8, right: 8, minHeight: 490, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 20 }, image: { width: '100%', height: 245 }, cardCopy: { padding: 20, gap: 10 }, category: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8 }, title: { fontSize: 25, lineHeight: 31, fontWeight: '900' }, excerpt: { fontSize: 15, lineHeight: 22 }, read: { fontWeight: '800', marginTop: 4 }, feedback: { position: 'absolute', top: 22, borderWidth: 2, borderColor: '#FFFFFF', paddingHorizontal: 10, paddingVertical: 6, transform: [{ rotate: '-8deg' }] }, feedbackText: { color: '#FFFFFF', fontWeight: '900', fontSize: 14 }, actions: { flexDirection: 'row', gap: 8, marginTop: 18 }, action: { flex: 1, minHeight: 46, borderWidth: 1, borderRadius: 999, alignItems: 'center', justifyContent: 'center' } });