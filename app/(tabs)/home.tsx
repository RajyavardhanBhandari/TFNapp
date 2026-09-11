import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppHeader } from '../../src/components/AppHeader';
import { ArticleCard } from '../../src/components/ArticleCard';
import { Screen } from '../../src/components/Screen';
import { getArticles } from '../../src/content';
import { getHomeContent, type HomeContent } from '../../src/content/home';
import { useAppTheme } from '../../src/theme';

function Section({
  eyebrow,
  title,
  action,
  onAction,
  children,
}: {
  eyebrow?: string;
  title: string;
  action?: string;
  onAction?: () => void;
  children: ReactNode;
}) {
  const theme = useAppTheme();
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionHeading}>
          {eyebrow ? <Text style={[styles.eyebrow, { color: theme.colors.mutedText }]}>{eyebrow}</Text> : null}
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{title}</Text>
        </View>
        {action && onAction ? (
          <Pressable accessibilityRole="button" onPress={onAction} hitSlop={8}>
            <Text style={[styles.sectionAction, { color: theme.colors.text }]}>{action}</Text>
          </Pressable>
        ) : null}
      </View>
      {children}
    </View>
  );
}

function Skeleton({ large = false }: { large?: boolean }) {
  const theme = useAppTheme();
  return (
    <View
      style={[
        styles.skeleton,
        { backgroundColor: theme.colors.surface },
        large && styles.skeletonLarge,
      ]}
    />
  );
}

export default function HomeScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const [data, setData] = useState<HomeContent>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async (refresh = false) => {
    try {
      setError(false);
      if (refresh) setRefreshing(true);
      else setLoading(true);
      setData(await getHomeContent());
      setPage(1);
      setHasMore(true);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const loadMore = useCallback(async () => {
    if (!data || loadingMore || !hasMore) return;
    try {
      setLoadingMore(true);
      const next = page + 1;
      const result = await getArticles({ page: next, perPage: 8, includeContent: false });
      setData((current) => (current ? { ...current, latest: [...current.latest, ...result.items] } : current));
      setPage(next);
      setHasMore(result.pagination.hasNextPage);
    } finally {
      setLoadingMore(false);
    }
  }, [data, hasMore, loadingMore, page]);

  const open = (id: number) =>
    router.push({ pathname: '/article/[id]', params: { id: String(id) } });

  const horizontal = (
    eyebrow: string,
    title: string,
    items: HomeContent['latest'],
  ) =>
    items.length ? (
      <Section eyebrow={eyebrow} title={title} action="See all" onAction={() => router.push('/(tabs)/discover')}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontal}
        >
          {items.slice(0, 4).map((article) => (
            <View key={article.id} style={styles.horizontalCard}>
              <ArticleCard article={article} variant="compact" onPress={() => open(article.id)} />
            </View>
          ))}
        </ScrollView>
      </Section>
    ) : null;

  return (
    <Screen scroll={false} padding={false}>
      <AppHeader />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void load(true)}
            tintColor={theme.colors.icon}
          />
        }
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          if (layoutMeasurement.height + contentOffset.y >= contentSize.height - 700) void loadMore();
        }}
        scrollEventThrottle={250}
      >
        {loading ? (
          <>
            <Skeleton large />
            <Skeleton />
            <Skeleton />
          </>
        ) : error && !data ? (
          <View style={styles.state}>
            <Text style={[styles.stateKicker, { color: theme.colors.mutedText }]}>THE FOUNDER NATION</Text>
            <Text style={[styles.stateTitle, { color: theme.colors.text }]}>Your startup briefing is taking a break.</Text>
            <Text style={[styles.stateBody, { color: theme.colors.mutedText }]}>We could not load the latest stories.</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => void load()}
              style={({ pressed }) => [styles.retry, { backgroundColor: theme.colors.text }, pressed && styles.pressed]}
            >
              <Text style={{ color: theme.colors.inverseText, fontWeight: '800' }}>Try again</Text>
            </Pressable>
          </View>
        ) : data ? (
          <>
            {data.featured ? (
              <Section eyebrow="TOP STORY" title="What matters now">
                <ArticleCard article={data.featured} variant="featured" onPress={() => open(data.featured!.id)} />
              </Section>
            ) : null}

            {horizontal('PERSONALISED FEED', 'For You', data.forYou)}
            {horizontal('STARTUPS', 'Startup Stories', data.startupStories)}
            {horizontal('CAPITAL', 'Funding', data.funding)}
            {horizontal('FOUNDERS', 'Founder Stories', data.founderStories)}
            {horizontal('INNOVATION', 'Technology & AI', [...data.ai, ...data.technology])}

            <Section
              eyebrow="THE ECOSYSTEM"
              title="Trending"
              action="Explore"
              onAction={() => router.push('/(tabs)/discover')}
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Open Trending"
                onPress={() => router.push('/(tabs)/discover')}
                style={({ pressed }) => [
                  styles.trending,
                  { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.trendingCopy}>
                  <Text style={[styles.trendingTitle, { color: theme.colors.text }]}>What founders are talking about</Text>
                  <Text style={[styles.trendingBody, { color: theme.colors.mutedText }]}>Explore the wider TFN stream and discover what is moving through the startup ecosystem.</Text>
                </View>
                <Text style={[styles.arrow, { color: theme.colors.text }]}>→</Text>
              </Pressable>
            </Section>

            <Section eyebrow="JUST IN" title="Latest News">
              {data.latest.map((article, index) => (
                <ArticleCard key={`${article.id}-${index}`} article={article} onPress={() => open(article.id)} />
              ))}
              {loadingMore ? <ActivityIndicator style={styles.loader} color={theme.colors.icon} /> : null}
              {!hasMore ? <Text style={[styles.end, { color: theme.colors.mutedText }]}>You’re all caught up.</Text> : null}
            </Section>
          </>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 18, paddingTop: 20, paddingBottom: 44 },
  section: { marginBottom: 30 },
  sectionHeader: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 12 },
  sectionHeading: { flex: 1, paddingRight: 12 },
  eyebrow: { fontSize: 10, lineHeight: 14, fontWeight: '900', letterSpacing: 1.2, marginBottom: 3 },
  sectionTitle: { fontSize: 24, lineHeight: 29, fontWeight: '800', letterSpacing: -0.3 },
  sectionAction: { fontSize: 13, fontWeight: '800', marginBottom: 3 },
  horizontal: { gap: 14, paddingBottom: 2 },
  horizontalCard: { width: 292 },
  skeleton: { height: 180, borderRadius: 18, marginBottom: 14, opacity: 0.7 },
  skeletonLarge: { height: 310 },
  trending: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 18, padding: 18, flexDirection: 'row', alignItems: 'center' },
  trendingCopy: { flex: 1, paddingRight: 8 },
  trendingTitle: { fontSize: 18, lineHeight: 23, fontWeight: '800' },
  trendingBody: { fontSize: 13, lineHeight: 19, marginTop: 6 },
  arrow: { fontSize: 25, fontWeight: '700', paddingLeft: 8 },
  state: { paddingVertical: 100, alignItems: 'center', paddingHorizontal: 24 },
  stateKicker: { fontSize: 10, fontWeight: '900', letterSpacing: 1.5, marginBottom: 10 },
  stateTitle: { fontSize: 25, lineHeight: 31, fontWeight: '800', textAlign: 'center', letterSpacing: -0.3 },
  stateBody: { marginTop: 9, textAlign: 'center', fontSize: 14 },
  retry: { marginTop: 20, paddingHorizontal: 22, paddingVertical: 12, borderRadius: 999 },
  pressed: { opacity: 0.78 },
  loader: { marginVertical: 12 },
  end: { textAlign: 'center', fontSize: 13, marginTop: 8 },
});
