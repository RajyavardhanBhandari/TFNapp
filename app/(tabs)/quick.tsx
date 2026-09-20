import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Image,
  Modal,
  PanResponder,
  Pressable,
  Share,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';

import { AppHeader } from '../../src/components/AppHeader';
import { Screen } from '../../src/components/Screen';
import { getQuickFeed } from '../../src/content/quick';
import type { TfnArticle } from '../../src/content/types';
import { recordQuickSignal, undoQuickSignal } from '../../src/content/signals';
import { useAppTheme } from '../../src/theme';

const SWIPE_RATIO = 0.22;

type Action = {
  article: TfnArticle;
  signalId?: string;
  direction: 'interested' | 'not_interested';
};

type GestureAction = 'next' | 'previous' | 'interested' | 'not_interested';

export default function QuickScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const [articles, setArticles] = useState<TfnArticle[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lastAction, setLastAction] = useState<Action>();
  const [menuOpen, setMenuOpen] = useState(false);
  const position = useRef(new Animated.ValueXY()).current;
  const threshold = Math.max(75, Math.min(width, height) * SWIPE_RATIO);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(false);
      const feed = await getQuickFeed(6);
      setArticles(feed);
      setIndex(0);
      setLastAction(undefined);
      position.setValue({ x: 0, y: 0 });
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [position]);

  useEffect(() => {
    void load();
  }, [load]);

  const current = articles[index];

  const recordFeedback = useCallback(
    async (type: 'interested' | 'not_interested') => {
      if (!current) return;
      const signalType = type === 'interested' ? 'right_swipe' : 'left_swipe';
      const result = await recordQuickSignal(current.id, signalType);
      setLastAction({
        article: current,
        signalId: result.recorded ? result.id : undefined,
        direction: type,
      });
      setIndex((value) => Math.min(value + 1, articles.length));
      position.setValue({ x: 0, y: 0 });
    },
    [articles.length, current, position],
  );

  const navigate = useCallback(
    (direction: 'next' | 'previous') => {
      setMenuOpen(false);
      setLastAction(undefined);
      setIndex((value) =>
        direction === 'next'
          ? Math.min(value + 1, articles.length)
          : Math.max(value - 1, 0),
      );
      position.setValue({ x: 0, y: 0 });
    },
    [articles.length, position],
  );

  const runGesture = useCallback(
    (action: GestureAction) => {
      if (!current) return;
      setMenuOpen(false);

      if (action === 'next' || action === 'previous') {
        const targetX = action === 'next' ? width * 1.15 : -width * 1.15;
        Animated.timing(position, {
          toValue: { x: targetX, y: 0 },
          duration: 180,
          useNativeDriver: true,
        }).start(() => navigate(action));
        return;
      }

      const targetY = action === 'interested' ? -height * 0.9 : height * 0.9;
      Animated.timing(position, {
        toValue: { x: 0, y: targetY },
        duration: 180,
        useNativeDriver: true,
      }).start(() => void recordFeedback(action));
    },
    [current, height, navigate, position, recordFeedback, width],
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
          Math.max(Math.abs(gesture.dx), Math.abs(gesture.dy)) > 8,
        onPanResponderMove: (_, gesture) => {
          position.setValue({ x: gesture.dx, y: gesture.dy });
        },
        onPanResponderRelease: (_, gesture) => {
          const horizontal = Math.abs(gesture.dx) >= Math.abs(gesture.dy);
          if (horizontal && Math.abs(gesture.dx) >= threshold) {
            runGesture(gesture.dx > 0 ? 'next' : 'previous');
            return;
          }
          if (!horizontal && Math.abs(gesture.dy) >= threshold) {
            runGesture(gesture.dy < 0 ? 'interested' : 'not_interested');
            return;
          }
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: true,
          }).start();
        },
      }),
    [position, runGesture, threshold],
  );

  const undo = async () => {
    if (!lastAction || index === 0) return;
    if (lastAction.signalId) await undoQuickSignal(lastAction.signalId);
    setIndex((value) => value - 1);
    setLastAction(undefined);
    position.setValue({ x: 0, y: 0 });
    setMenuOpen(false);
  };

  const shareCurrent = async () => {
    if (!current) return;
    setMenuOpen(false);
    try {
      await Share.share({
        title: current.title,
        message: current.canonicalUrl
          ? `${current.title}\n\n${current.canonicalUrl}`
          : current.title,
        url: current.canonicalUrl,
      });
    } catch {
      // Sharing can be cancelled by the user.
    }
  };

  const rotate = position.x.interpolate({
    inputRange: [-width, 0, width],
    outputRange: ['-9deg', '0deg', '9deg'],
  });

  const interestedOpacity = position.y.interpolate({
    inputRange: [-threshold, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  const notInterestedOpacity = position.y.interpolate({
    inputRange: [0, threshold],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  const nextOpacity = position.x.interpolate({
    inputRange: [0, threshold],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  const previousOpacity = position.x.interpolate({
    inputRange: [-threshold, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return (
    <Screen scroll={false}>
      <AppHeader title="Quick" />

      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={[styles.heading, { color: theme.colors.text }]}>
            Discover faster.
          </Text>
          <Text style={[styles.subheading, { color: theme.colors.mutedText }]}>
            {articles.length
              ? `${Math.min(index + 1, articles.length)} of ${articles.length} stories`
              : 'Swipe to navigate and react'}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Quick actions"
          hitSlop={8}
          onPress={() => setMenuOpen(true)}
          style={[styles.menuButton, { borderColor: theme.colors.border }]}
        >
          <Text style={[styles.menuDots, { color: theme.colors.text }]}>⋮</Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={theme.colors.icon} />
          <Text style={{ color: theme.colors.mutedText }}>Loading TFN stories…</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={[styles.stateTitle, { color: theme.colors.text }]}>Unable to load Quick</Text>
          <Text style={{ color: theme.colors.mutedText }}>Check your connection and try again.</Text>
          <Pressable onPress={() => void load()} style={[styles.button, { backgroundColor: theme.colors.text }]}>
            <Text style={{ color: theme.colors.inverseText }}>Retry</Text>
          </Pressable>
        </View>
      ) : !current ? (
        <View style={styles.center}>
          <Text style={[styles.stateTitle, { color: theme.colors.text }]}>You’re all caught up.</Text>
          <Text style={{ color: theme.colors.mutedText }}>Swipe back for the previous story or refresh for more.</Text>
          <Pressable onPress={() => void load()} style={[styles.button, { backgroundColor: theme.colors.text }]}>
            <Text style={{ color: theme.colors.inverseText }}>Refresh stories</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <View style={styles.gestureHint}>
            <Text style={[styles.hint, { color: theme.colors.mutedText }]}>
              ← Previous · Next → · ↑ Interested · ↓ Not interested
            </Text>
          </View>

          <View style={styles.stack}>
            <View
              style={[
                styles.card,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
                styles.backCard,
              ]}
            >
              <Text style={{ color: theme.colors.mutedText }}>Next story</Text>
            </View>

            <Animated.View
              {...panResponder.panHandlers}
              style={[
                styles.card,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
                {
                  transform: [
                    { translateX: position.x },
                    { translateY: position.y },
                    { rotate },
                  ],
                },
              ]}
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Open story"
                onPress={() =>
                  router.push({
                    pathname: '/article/[id]',
                    params: { id: String(current.id) },
                  })
                }
                style={styles.cardPress}
              >
                {current.featuredImage?.url ? (
                  <Image
                    source={{ uri: current.featuredImage.url }}
                    accessibilityLabel={current.featuredImage.alt || current.title}
                    resizeMode="cover"
                    style={styles.image}
                  />
                ) : (
                  <View style={[styles.image, { backgroundColor: theme.colors.border }]} />
                )}

                <View style={styles.cardCopy}>
                  <Text style={[styles.category, { color: theme.colors.mutedText }]}>
                    {current.categories[0]?.name || 'TFN'}
                  </Text>
                  <Text style={[styles.title, { color: theme.colors.text }]}>{current.title}</Text>
                  {current.excerpt ? (
                    <Text numberOfLines={3} style={[styles.excerpt, { color: theme.colors.mutedText }]}>
                      {current.excerpt}
                    </Text>
                  ) : null}
                  <Text style={[styles.read, { color: theme.colors.text }]}>Tap to read full story →</Text>
                </View>
              </Pressable>

              <Animated.View pointerEvents="none" style={[styles.feedback, styles.feedbackNext, { opacity: nextOpacity }]}>
                <Text style={[styles.feedbackText, { color: theme.colors.inverseText, backgroundColor: theme.colors.text }]}>NEXT</Text>
              </Animated.View>
              <Animated.View pointerEvents="none" style={[styles.feedback, styles.feedbackPrevious, { opacity: previousOpacity }]}>
                <Text style={[styles.feedbackText, { color: theme.colors.inverseText, backgroundColor: theme.colors.text }]}>PREVIOUS</Text>
              </Animated.View>
              <Animated.View pointerEvents="none" style={[styles.feedback, styles.feedbackTop, { opacity: interestedOpacity }]}>
                <Text style={[styles.feedbackText, { color: theme.colors.inverseText, backgroundColor: theme.colors.text }]}>INTERESTED</Text>
              </Animated.View>
              <Animated.View pointerEvents="none" style={[styles.feedback, styles.feedbackBottom, { opacity: notInterestedOpacity }]}>
                <Text style={[styles.feedbackText, { color: theme.colors.inverseText, backgroundColor: theme.colors.text }]}>NOT INTERESTED</Text>
              </Animated.View>
            </Animated.View>
          </View>
        </>
      )}

      <Modal transparent visible={menuOpen} animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setMenuOpen(false)}>
          <Pressable
            onPress={(event) => event.stopPropagation()}
            style={[styles.menu, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
          >
            <View style={styles.menuTitleRow}>
              <Text style={[styles.menuTitle, { color: theme.colors.text }]}>Quick actions</Text>
              <Pressable onPress={() => setMenuOpen(false)} accessibilityLabel="Close menu">
                <Text style={[styles.close, { color: theme.colors.mutedText }]}>×</Text>
              </Pressable>
            </View>

            <Pressable style={styles.menuItem} onPress={() => void recordFeedback('interested')}>
              <Text style={[styles.menuItemTitle, { color: theme.colors.text }]}>Interested</Text>
              <Text style={[styles.menuItemBody, { color: theme.colors.mutedText }]}>Save this signal for personalization and move on</Text>
            </Pressable>

            <Pressable style={styles.menuItem} onPress={() => void recordFeedback('not_interested')}>
              <Text style={[styles.menuItemTitle, { color: theme.colors.text }]}>Not interested</Text>
              <Text style={[styles.menuItemBody, { color: theme.colors.mutedText }]}>Tell TFN you want less of this type of story</Text>
            </Pressable>

            <Pressable style={styles.menuItem} onPress={() => void shareCurrent()}>
              <Text style={[styles.menuItemTitle, { color: theme.colors.text }]}>Share story</Text>
              <Text style={[styles.menuItemBody, { color: theme.colors.mutedText }]}>Share the article outside TFN</Text>
            </Pressable>

            <Pressable style={styles.menuItem} onPress={() => navigate('previous')} disabled={index === 0}>
              <Text style={[styles.menuItemTitle, { color: theme.colors.text, opacity: index === 0 ? 0.4 : 1 }]}>Previous story</Text>
            </Pressable>

            <Pressable style={styles.menuItem} onPress={() => navigate('next')}>
              <Text style={[styles.menuItemTitle, { color: theme.colors.text }]}>Next story</Text>
            </Pressable>

            {lastAction ? (
              <Pressable style={styles.menuItem} onPress={() => void undo()}>
                <Text style={[styles.menuItemTitle, { color: theme.colors.text }]}>Undo last reaction</Text>
              </Pressable>
            ) : null}

            <Pressable style={styles.menuItem} onPress={() => { setMenuOpen(false); void load(); }}>
              <Text style={[styles.menuItemTitle, { color: theme.colors.text }]}>Refresh Quick</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginTop: 12, marginBottom: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerCopy: { flex: 1 },
  heading: { fontSize: 30, fontWeight: '900' },
  subheading: { marginTop: 5, fontSize: 13 },
  menuButton: { width: 42, height: 42, borderWidth: StyleSheet.hairlineWidth, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  menuDots: { fontSize: 26, lineHeight: 28, fontWeight: '800' },
  gestureHint: { alignItems: 'center', marginBottom: 8 },
  hint: { fontSize: 11, textAlign: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  stateTitle: { fontSize: 20, fontWeight: '800' },
  button: { marginTop: 18, paddingHorizontal: 22, paddingVertical: 12, borderRadius: 999 },
  stack: { flex: 1, minHeight: 0, justifyContent: 'center', marginBottom: 10 },
  card: { width: '100%', borderWidth: StyleSheet.hairlineWidth, borderRadius: 20, overflow: 'hidden', position: 'absolute', left: 0, right: 0 },
  backCard: { top: 8, bottom: -8, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 14 },
  cardPress: { width: '100%' },
  image: { width: '100%', height: 300, backgroundColor: '#222' },
  cardCopy: { padding: 18, paddingBottom: 20 },
  category: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8 },
  title: { fontSize: 25, lineHeight: 31, fontWeight: '900', marginTop: 8 },
  excerpt: { fontSize: 14, lineHeight: 20, marginTop: 10 },
  read: { fontSize: 13, fontWeight: '800', marginTop: 14 },
  feedback: { position: 'absolute', zIndex: 3 },
  feedbackNext: { right: 18, top: 18 },
  feedbackPrevious: { left: 18, top: 18 },
  feedbackTop: { alignSelf: 'center', top: 18 },
  feedbackBottom: { alignSelf: 'center', bottom: 18 },
  feedbackText: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7, fontSize: 12, fontWeight: '900', letterSpacing: 0.7 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end', padding: 16 },
  menu: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 20, padding: 8, maxHeight: '78%' },
  menuTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingTop: 8, paddingBottom: 6 },
  menuTitle: { fontSize: 18, fontWeight: '900' },
  close: { fontSize: 28, lineHeight: 28 },
  menuItem: { paddingHorizontal: 12, paddingVertical: 13, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(127,127,127,0.18)' },
  menuItemTitle: { fontSize: 15, fontWeight: '800' },
  menuItemBody: { fontSize: 12, lineHeight: 17, marginTop: 3 },
});
