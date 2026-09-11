import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Keyboard, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppHeader } from '../src/components/AppHeader';
import { ArticleCard } from '../src/components/ArticleCard';
import { Screen } from '../src/components/Screen';
import { addSearchHistory, clearSearchHistory, getSearchHistory, removeSearchHistory } from '../src/content/searchHistory';
import { searchArticles } from '../src/content';
import type { TfnArticle } from '../src/content';
import { useAppTheme } from '../src/theme';

const DEBOUNCE_MS = 450;

export default function SearchScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const inputRef = useRef<TextInput>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestRef = useRef(0);
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [results, setResults] = useState<TfnArticle[]>([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => { void getSearchHistory().then(setHistory); return () => { if (timerRef.current) clearTimeout(timerRef.current); }; }, []);

  const executeSearch = useCallback(async (rawQuery: string, nextPage = 1) => {
    const normalized = rawQuery.trim();
    if (!normalized) return;
    const requestId = ++requestRef.current;
    if (nextPage === 1) { setLoading(true); setError(false); setResults([]); } else setLoadingMore(true);
    try {
      const response = await searchArticles(normalized, { page: nextPage });
      if (requestId !== requestRef.current) return;
      setSubmittedQuery(normalized);
      setPage(nextPage);
      setHasNextPage(response.pagination.hasNextPage);
      setResults((current) => nextPage === 1 ? response.items : [...current, ...response.items.filter((item) => !current.some((existing) => existing.id === item.id))]);
      if (nextPage === 1) setHistory(await addSearchHistory(normalized));
    } catch {
      if (requestId === requestRef.current) setError(true);
    } finally {
      if (requestId === requestRef.current) { setLoading(false); setLoadingMore(false); }
    }
  }, []);

  const onChangeQuery = (value: string) => {
    setQuery(value);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!value.trim()) { requestRef.current += 1; setSubmittedQuery(''); setResults([]); setError(false); setLoading(false); return; }
    timerRef.current = setTimeout(() => void executeSearch(value), DEBOUNCE_MS);
  };

  const submit = () => { Keyboard.dismiss(); if (timerRef.current) clearTimeout(timerRef.current); void executeSearch(query); };
  const openHistory = (value: string) => { setQuery(value); void executeSearch(value); };
  const clearAll = async () => { await clearSearchHistory(); setHistory([]); };
  const removeOne = async (value: string) => setHistory(await removeSearchHistory(value));

  return (
    <Screen scroll={false} padding={false}>
      <AppHeader title="Search" back />
      <View style={styles.container}>
        <View style={[styles.inputWrap, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Text style={[styles.searchIcon, { color: theme.colors.mutedText }]}>⌕</Text>
          <TextInput
            ref={inputRef}
            value={query}
            onChangeText={onChangeQuery}
            onSubmitEditing={submit}
            returnKeyType="search"
            placeholder="Search TFN stories"
            placeholderTextColor={theme.colors.mutedText}
            accessibilityLabel="Search TFN stories"
            autoFocus
            style={[styles.input, { color: theme.colors.text }]}
          />
          {query ? <Pressable accessibilityRole="button" accessibilityLabel="Clear search" onPress={() => { setQuery(''); inputRef.current?.focus(); onChangeQuery(''); }} style={styles.clear}><Text style={[styles.clearText, { color: theme.colors.mutedText }]}>×</Text></Pressable> : null}
        </View>

        {!submittedQuery && !loading ? <View style={styles.historySection}>
          <View style={styles.sectionHeader}><Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Recent searches</Text>{history.length ? <Pressable accessibilityRole="button" accessibilityLabel="Clear search history" onPress={() => void clearAll()}><Text style={[styles.clearAll, { color: theme.colors.mutedText }]}>Clear all</Text></Pressable> : null}</View>
          {history.length ? history.map((item) => <View key={item.toLowerCase()} style={[styles.historyRow, { borderBottomColor: theme.colors.border }]}><Pressable accessibilityRole="button" accessibilityLabel={`Search for ${item}`} onPress={() => openHistory(item)} style={styles.historyPress}><Text style={[styles.historyText, { color: theme.colors.text }]}>{item}</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel={`Remove ${item} from search history`} onPress={() => void removeOne(item)} style={styles.remove}><Text style={[styles.removeText, { color: theme.colors.mutedText }]}>×</Text></Pressable></View>) : <Text style={[styles.hint, { color: theme.colors.mutedText }]}>Search startups, founders, funding, AI, technology and more.</Text>}
        </View> : null}

        {loading ? <View style={styles.state}><ActivityIndicator color={theme.colors.icon} /><Text style={[styles.stateBody, { color: theme.colors.mutedText }]}>Searching TFN…</Text></View> : null}
        {!loading && error ? <View style={styles.state}><Text style={[styles.stateTitle, { color: theme.colors.text }]}>Search couldn’t load</Text><Text style={[styles.stateBody, { color: theme.colors.mutedText }]}>Check your connection and try again.</Text><Pressable accessibilityRole="button" onPress={() => void executeSearch(submittedQuery || query)} style={[styles.retry, { backgroundColor: theme.colors.text }]}><Text style={{ color: theme.colors.inverseText, fontWeight: '800' }}>Retry</Text></Pressable></View> : null}
        {!loading && !error && submittedQuery && results.length === 0 ? <View style={styles.state}><Text style={[styles.stateTitle, { color: theme.colors.text }]}>No stories found</Text><Text style={[styles.stateBody, { color: theme.colors.mutedText }]}>Try a different keyword or search term.</Text></View> : null}

        {!loading && !error && results.length > 0 ? <FlatList
          data={results}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <ArticleCard article={item} onPress={() => router.push({ pathname: '/article/[id]', params: { id: String(item.id) } })} />}
          contentContainerStyle={styles.results}
          keyboardShouldPersistTaps="handled"
          onEndReachedThreshold={0.5}
          onEndReached={() => { if (!loadingMore && hasNextPage) void executeSearch(submittedQuery, page + 1); }}
          ListHeaderComponent={<Text style={[styles.resultsTitle, { color: theme.colors.text }]}>Results for “{submittedQuery}”</Text>}
          ListFooterComponent={loadingMore ? <ActivityIndicator color={theme.colors.icon} style={styles.footer} /> : null}
        /> : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inputWrap: { marginHorizontal: 18, marginTop: 14, height: 52, borderWidth: 1, borderRadius: 14, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 },
  searchIcon: { fontSize: 25, width: 30, textAlign: 'center' },
  input: { flex: 1, fontSize: 16, minHeight: 48 },
  clear: { width: 36, height: 44, alignItems: 'center', justifyContent: 'center' },
  clearText: { fontSize: 28, lineHeight: 30 },
  historySection: { paddingHorizontal: 18, paddingTop: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 19, fontWeight: '900' },
  clearAll: { fontSize: 13, fontWeight: '800' },
  historyRow: { minHeight: 48, borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: 'row', alignItems: 'center' },
  historyPress: { flex: 1, justifyContent: 'center', minHeight: 48 },
  historyText: { fontSize: 15, fontWeight: '600' },
  remove: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  removeText: { fontSize: 22 },
  hint: { fontSize: 14, lineHeight: 21, marginTop: 4 },
  state: { alignItems: 'center', justifyContent: 'center', padding: 60 },
  stateTitle: { fontSize: 20, fontWeight: '900', textAlign: 'center' },
  stateBody: { marginTop: 8, fontSize: 14, textAlign: 'center' },
  retry: { marginTop: 18, paddingHorizontal: 22, paddingVertical: 12, borderRadius: 999 },
  results: { paddingHorizontal: 18, paddingTop: 22, paddingBottom: 40 },
  resultsTitle: { fontSize: 19, fontWeight: '900', marginBottom: 14 },
  footer: { paddingVertical: 18 },
});
