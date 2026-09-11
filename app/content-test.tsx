import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { getArticles, getWordPressCapabilities, TfnApiError, TfnArticle, TfnWordPressCapabilities } from '../src/content';

export default function ContentTestScreen() {
  const [articles, setArticles] = useState<TfnArticle[]>([]);
  const [capabilities, setCapabilities] = useState<TfnWordPressCapabilities>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [capabilityWarning, setCapabilityWarning] = useState<string>();

  const load = async () => {
    setLoading(true);
    setError(undefined);
    setCapabilityWarning(undefined);

    try {
      const result = await getArticles({ page: 1, perPage: 10 });
      setArticles(result.items);

      try {
        const wpCapabilities = await getWordPressCapabilities();
        setCapabilities(wpCapabilities);
      } catch (err) {
        const message = err instanceof TfnApiError ? err.message : 'WordPress capability discovery failed.';
        setCapabilityWarning(message);
      }
    } catch (err) {
      setError(err instanceof TfnApiError ? err.message : 'Unable to load TFN content.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  if (loading) return <View style={styles.center}><ActivityIndicator /><Text style={styles.muted}>Loading real TFN content from WordPress…</Text></View>;
  if (error) return <View style={styles.center}><Text style={styles.error}>{error}</Text><Pressable onPress={() => void load()} style={styles.button}><Text style={styles.buttonText}>Retry</Text></Pressable></View>;
  if (!articles.length) return <View style={styles.center}><Text>No published TFN articles were returned.</Text><Pressable onPress={() => void load()} style={styles.button}><Text style={styles.buttonText}>Retry</Text></Pressable></View>;

  return <FlatList
    contentContainerStyle={styles.list}
    data={articles}
    keyExtractor={(item) => String(item.id)}
    ListHeaderComponent={
      <View style={styles.headerBlock}>
        <Text style={styles.header}>TFN Content Engine Test</Text>
        <Text style={styles.status}>WordPress posts endpoint returned {articles.length} article(s).</Text>
        <Text style={styles.status}>
          {capabilities
            ? `Capability discovery: ${capabilities.postTypes.length} post types • ${capabilities.taxonomies.length} taxonomies`
            : 'Capability discovery: unavailable'}
        </Text>
        {capabilityWarning ? <Text style={styles.warning}>Capability warning: {capabilityWarning}</Text> : null}
        <Text style={styles.status}>
          Posts route: {capabilities?.postTypes.find((type) => type.restBase === 'posts')?.restBase ?? 'verified by content request'}
        </Text>
      </View>
    }
    renderItem={({ item }) => <View style={styles.card}>
      {item.featuredImage?.url ? <Image source={{ uri: item.featuredImage.url }} style={styles.image} /> : null}
      <Text style={styles.category}>{item.categories[0]?.name ?? 'TFN'}</Text>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.meta}>{item.author?.name ?? 'TFN'} · {new Date(item.publishedAt).toLocaleDateString()}</Text>
      <Text numberOfLines={3} style={styles.excerpt}>{item.excerpt}</Text>
    </View>}
  />;
}

const styles = StyleSheet.create({
  list: { padding: 20, gap: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  headerBlock: { gap: 6, marginBottom: 4 },
  header: { fontSize: 24, fontWeight: '800' },
  status: { fontSize: 12, opacity: 0.65 },
  warning: { fontSize: 12, color: '#8a5a00' },
  card: { borderRadius: 16, padding: 14, backgroundColor: '#f4f4f4', gap: 7 },
  image: { width: '100%', height: 190, borderRadius: 12, backgroundColor: '#ddd' },
  category: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', opacity: 0.6 },
  title: { fontSize: 19, fontWeight: '700' },
  meta: { fontSize: 12, opacity: 0.6 },
  excerpt: { fontSize: 14, lineHeight: 20 },
  muted: { opacity: 0.6, textAlign: 'center' },
  error: { textAlign: 'center', color: '#b00020' },
  button: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10, backgroundColor: '#111' },
  buttonText: { color: '#fff', fontWeight: '700' },
});
