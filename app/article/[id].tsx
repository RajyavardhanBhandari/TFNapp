import { useCallback, useEffect, useMemo, useState } from 'react';
import { Image, Linking, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import RenderHTML from 'react-native-render-html';
import { AppHeader } from '../../src/components/AppHeader';
import { ArticleCard } from '../../src/components/ArticleCard';
import { Screen } from '../../src/components/Screen';
import { getArticleById, getRelatedArticlesForArticle, type TfnArticle } from '../../src/content';
import { getArticleReadingTime, getRelatedArticles, sanitizeArticleHtml } from '../../src/content/article';
import { useAppTheme } from '../../src/theme';

function Skeleton({ height }: { height: number }) {
  const theme = useAppTheme();
  return <View style={[styles.skeleton, { height, backgroundColor: theme.colors.surface }]} />;
}

export default function ArticleDetailScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [article, setArticle] = useState<TfnArticle>();
  const [related, setRelated] = useState<TfnArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string>();

  const load = useCallback(async (refresh = false) => {
    const articleId = Number(id);
    if (!Number.isInteger(articleId) || articleId <= 0) {
      setError('This article could not be found.');
      setLoading(false);
      return;
    }
    try {
      setError(undefined);
      if (refresh) setRefreshing(true); else setLoading(true);
      const result = await getArticleById(articleId);
      setArticle(result);
      try {
        const candidates = await getRelatedArticlesForArticle(result);
        setRelated(getRelatedArticles(result, candidates));
      } catch {
        setRelated([]);
      }
    } catch {
      setError('This article could not be loaded.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => { void load(); }, [load]);

  const html = useMemo(() => article ? sanitizeArticleHtml(article.contentHtml) : '', [article]);
  const contentWidth = Math.max(280, width - 36);

  const share = useCallback(async () => {
    if (!article?.canonicalUrl) return;
    try { await Linking.openURL(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(article.canonicalUrl)}`); } catch { /* sharing is best effort until native share boundary is added */ }
  }, [article]);

  return (
    <Screen scroll={false} padding={false}>
      <AppHeader back title="TFN" />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} tintColor={theme.colors.icon} />}
      >
        {loading ? <><Skeleton height={28} /><Skeleton height={104} /><Skeleton height={230} /><Skeleton height={18} /><Skeleton height={18} /><Skeleton height={18} /></> : null}
        {error ? (
          <View style={styles.state}>
            <Text style={[styles.stateTitle, { color: theme.colors.text }]}>{error}</Text>
            <Text style={[styles.stateBody, { color: theme.colors.mutedText }]}>Check your connection and try again.</Text>
            <Pressable accessibilityRole="button" onPress={() => void load()} style={[styles.retry, { backgroundColor: theme.colors.text }]}><Text style={{ color: theme.colors.inverseText, fontWeight: '700' }}>Retry</Text></Pressable>
          </View>
        ) : null}
        {article ? <>
          <Text style={[styles.category, { color: theme.colors.mutedText }]}>{article.categories[0]?.name ?? 'TFN'}</Text>
          <Text accessibilityRole="header" style={[styles.title, { color: theme.colors.text }]}>{article.title}</Text>
          {article.excerpt ? <Text style={[styles.excerpt, { color: theme.colors.mutedText }]}>{article.excerpt}</Text> : null}
          <View style={styles.metaRow}>
            {article.author?.avatar ? <Image accessibilityLabel={article.author.name} source={{ uri: article.author.avatar }} style={styles.avatar} /> : null}
            <View style={styles.metaCopy}>
              {article.author?.name ? <Text style={[styles.author, { color: theme.colors.text }]}>{article.author.name}</Text> : null}
              <Text style={[styles.meta, { color: theme.colors.mutedText }]}>{new Date(article.publishedAt).toLocaleDateString()} · {getArticleReadingTime(article)} min read</Text>
            </View>
          </View>
          {article.featuredImage?.url ? <Image accessibilityLabel={article.featuredImage.alt || article.title} source={{ uri: article.featuredImage.url }} resizeMode="cover" style={[styles.hero, { backgroundColor: theme.colors.surface, aspectRatio: article.featuredImage.width && article.featuredImage.height ? article.featuredImage.width / article.featuredImage.height : 16 / 9 }]} /> : null}
          <View style={[styles.actions, { borderColor: theme.colors.border }]}>
            <Pressable accessibilityRole="button" accessibilityLabel="Save article" onPress={() => undefined} style={styles.action}><Text style={[styles.actionText, { color: theme.colors.text }]}>Save</Text></Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel="Share article" onPress={() => void share()} style={styles.action}><Text style={[styles.actionText, { color: theme.colors.text }]}>Share</Text></Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel="Open article on website" onPress={() => void Linking.openURL(article.canonicalUrl)} style={styles.action}><Text style={[styles.actionText, { color: theme.colors.text }]}>Website</Text></Pressable>
          </View>
          <View style={styles.body}>
            <RenderHTML
              contentWidth={contentWidth}
              source={{ html }}
              baseStyle={{ color: theme.colors.text, fontSize: 17, lineHeight: 29 }}
              tagsStyles={{
                p: { marginTop: 0, marginBottom: 18 },
                h2: { color: theme.colors.text, fontSize: 25, lineHeight: 32, fontWeight: '800', marginTop: 22, marginBottom: 12 },
                h3: { color: theme.colors.text, fontSize: 21, lineHeight: 28, fontWeight: '800', marginTop: 20, marginBottom: 10 },
                a: { color: theme.colors.accent, textDecorationLine: 'underline' },
                blockquote: { borderLeftWidth: 3, borderLeftColor: theme.colors.border, paddingLeft: 14, fontStyle: 'italic', marginVertical: 12 },
                li: { marginBottom: 7 },
                img: { marginVertical: 8 },
              }}
              renderersProps={{ a: { onPress: (_event, href) => { if (href) void Linking.openURL(href); } } }}
            />
          </View>
          {related.length ? <View style={styles.related}>
            <Text style={[styles.relatedTitle, { color: theme.colors.text }]}>Related stories</Text>
            {related.map((item) => <ArticleCard key={item.id} article={item} onPress={() => router.push({ pathname: '/article/[id]', params: { id: String(item.id) } })} />)}
          </View> : null}
        </> : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 18, paddingBottom: 48 },
  skeleton: { borderRadius: 12, marginTop: 16, opacity: 0.7 },
  category: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 18, marginBottom: 10 },
  title: { fontSize: 34, lineHeight: 40, fontWeight: '900', letterSpacing: -0.6 },
  excerpt: { fontSize: 17, lineHeight: 25, marginTop: 14 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 18, marginBottom: 18 },
  avatar: { width: 34, height: 34, borderRadius: 17, marginRight: 10 },
  metaCopy: { flex: 1 },
  author: { fontSize: 14, fontWeight: '800' },
  meta: { fontSize: 12, marginTop: 3 },
  hero: { width: '100%', maxHeight: 420, borderRadius: 16, backgroundColor: '#E7E7EA' },
  actions: { flexDirection: 'row', borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, marginVertical: 20 },
  action: { flex: 1, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  actionText: { fontSize: 13, fontWeight: '800' },
  body: { marginTop: 2 },
  related: { marginTop: 28 },
  relatedTitle: { fontSize: 22, fontWeight: '900', marginBottom: 12 },
  state: { alignItems: 'center', paddingVertical: 90 },
  stateTitle: { fontSize: 20, fontWeight: '800', textAlign: 'center' },
  stateBody: { marginTop: 8, fontSize: 14, textAlign: 'center' },
  retry: { marginTop: 18, paddingHorizontal: 22, paddingVertical: 12, borderRadius: 999 },
});
