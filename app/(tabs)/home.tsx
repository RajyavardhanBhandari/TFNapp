import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppHeader } from '../../src/components/AppHeader';
import { ArticleCard } from '../../src/components/ArticleCard';
import { Screen } from '../../src/components/Screen';
import { getHomeContent, type HomeContent } from '../../src/content/home';
import { getArticles } from '../../src/content';
import { useAppTheme } from '../../src/theme';

function Section({ title, children, onMore }: { title: string; children: React.ReactNode; onMore?: () => void }) {
  const theme = useAppTheme();
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{title}</Text>
        {onMore ? <Pressable accessibilityRole="button" onPress={onMore}><Text style={[styles.more, { color: theme.colors.mutedText }]}>See all</Text></Pressable> : null}
      </View>
      {children}
    </View>
  );
}

function Skeleton({ large = false }: { large?: boolean }) {
  const theme = useAppTheme();
  return <View style={[styles.skeleton, { backgroundColor: theme.colors.surface }, large && styles.skeletonLarge]} />;
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
  const [error, setError] = useState<string>();

  const load = useCallback(async (refresh = false) => {
    try {
      setError(undefined);
      if (refresh) setRefreshing(true); else setLoading(true);
      const next = await getHomeContent();
      setData(next);
      setPage(1);
      setHasMore(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load TFN right now.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const loadMore = useCallback(async () => {
    if (!data || loadingMore || !hasMore) return;
    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const result = await getArticles({ page: nextPage, perPage: 12 });
      setData((current) => current ? { ...current, latest: [...current.latest, ...result.items] } : current);
      setPage(nextPage);
      setHasMore(result.pagination.hasNextPage);
    } catch {
      // Keep the current feed usable; the next scroll can retry.
    } finally {
      setLoadingMore(false);
    }
  }, [data, hasMore, loadingMore, page]);

  const openArticle = (id: number) => router.push({ pathname: '/article', params: { id: String(id) } });

  return (
    <Screen scroll={false} padding={false}>
      <AppHeader />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} tintColor={theme.colors.icon} />}
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          if (layoutMeasurement.height + contentOffset.y >= contentSize.height - 700) void loadMore();
        }}
        scrollEventThrottle={250}
      >
        {loading ? (
          <View>
            <Skeleton large />
            <Skeleton /><Skeleton /><Skeleton />
          </View>
        ) : error && !data ? (
          <View style={styles.state}>
            <Text style={[styles.stateTitle, { color: theme.colors.text }]}>TFN is temporarily unavailable</Text>
            <Text style={[styles.stateBody, { color: theme.colors.mutedText }]}>We could not load the latest stories.</Text>
            <Pressable accessibilityRole="button" onPress={() => void load()} style={[styles.retry, { backgroundColor: theme.colors.text }]}>
              <Text style={{ color: theme.colors.inverseText, fontWeight: '700' }}>Retry</Text>
            </Pressable>
          </View>
        ) : data ? (
          <>
            {data.featured ? <Section title="Featured"><ArticleCard article={data.featured} variant="featured" onPress={() => openArticle(data.featured!.id)} /></Section> : null}

            {data.forYou.length ? <Section title="For You"><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontal}>{data.forYou.map((article) => <View key={article.id} style={styles.horizontalCard}><ArticleCard article={article} variant="compact" onPress={() => openArticle(article.id)} /></View>)}</ScrollView></Section> : null}

            {data.startupStories.length ? <Section title="Startup Stories"><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontal}>{data.startupStories.slice(0, 4).map((article) => <View key={article.id} style={styles.horizontalCard}><ArticleCard article={article} variant="compact" onPress={() => openArticle(article.id)} /></View>)}</ScrollView></Section> : null}

            {data.funding.length ? <Section title="Funding"><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontal}>{data.funding.slice(0, 4).map((article) => <View key={article.id} style={styles.horizontalCard}><ArticleCard article={article} variant="compact" onPress={() => openArticle(article.id)} /></View>)}</ScrollView></Section> : null}

            {data.founderStories.length ? <Section title="Founder Stories"><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontal}>{data.founderStories.slice(0, 4).map((article) => <View key={article.id} style={styles.horizontalCard}><ArticleCard article={article} variant="compact" onPress={() => openArticle(article.id)} /></View>)}</ScrollView></Section> : null}

            {data.ai.length || data.technology.length ? <Section title="Technology & AI"><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontal}>{[...data.ai, ...data.technology].slice(0, 5).map((article) => <View key={article.id} style={styles.horizontalCard}><ArticleCard article={article} variant="compact" onPress={() => openArticle(article.id)} /></View>)}</ScrollView></Section> : null}

            <Section title="Latest">
              {data.latest.map((article, index) => <ArticleCard key={`${article.id}-${index}`} article={article} onPress={() => openArticle(article.id)} />)}
              {loadingMore ? <ActivityIndicator accessibilityLabel="Loading more stories" style={styles.loader} color={theme.colors.icon} /> : null}
              {!hasMore && data.latest.length > 1 ? <Text style={[styles.end, { color: theme.colors.mutedText }]}>You’re all caught up.</Text> : null}
            </Section>
          </>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 18, paddingTop: 18, paddingBottom: 36 },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: { fontSize: 22, lineHeight: 28, fontWeight: '800' },
  more: { fontSize: 13, fontWeight: '700' },
  horizontal: { gap: 12, paddingBottom: 2 },
  horizontalCard: { width: 300 },
  skeleton: { height: 190, borderRadius: 16, marginBottom: 12, opacity: 0.75 },
  skeletonLarge: { height: 300 },
  state: { paddingVertical: 90, alignItems: 'center' },
  stateTitle: { fontSize: 20, fontWeight: '800', textAlign: 'center' },
  stateBody: { marginTop: 8, textAlign: 'center' },
  retry: { marginTop: 18, paddingHorizontal: 22, paddingVertical: 12, borderRadius: 999 },
  loader: { marginVertical: 10 },
  end: { textAlign: 'center', fontSize: 13, marginTop: 6 },
});
