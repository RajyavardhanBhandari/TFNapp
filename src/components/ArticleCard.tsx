import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';
import type { TfnArticle } from '../content';
import { useAppTheme } from '../theme';

type Props = { article: TfnArticle; variant?: 'standard' | 'compact' | 'featured'; onPress: () => void };

function meta(article: TfnArticle) {
  const category = article.categories[0]?.name;
  const date = new Date(article.publishedAt);
  const published = Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
  return [category, published].filter(Boolean).join(' · ');
}

export function ArticleCard({ article, variant = 'standard', onPress }: Props) {
  const theme = useAppTheme();
  const [imageFailed, setImageFailed] = useState(false);
  const image = article.featuredImage;
  const imageUrl = variant === 'featured' ? image?.url : image?.thumbnailUrl ?? image?.url;
  const showImage = Boolean(imageUrl) && !imageFailed;
  const fallbackLabel = `${article.title} image unavailable`;

  if (variant === 'compact') {
    return (
      <Pressable accessibilityRole="button" accessibilityLabel={`Open ${article.title}`} onPress={onPress} style={({ pressed }) => [styles.compact, pressed && styles.pressed]}>
        {showImage ? (
          <Image
            source={{ uri: imageUrl }}
            accessibilityLabel={image?.alt || article.title}
            onError={() => setImageFailed(true)}
            resizeMode="cover"
            style={styles.compactImage}
          />
        ) : (
          <View accessibilityLabel={fallbackLabel} style={[styles.compactImage, { backgroundColor: theme.colors.accentSoft }]} />
        )}
        <View style={styles.compactCopy}>
          <Text numberOfLines={2} style={[styles.compactTitle, { color: theme.colors.text }]}>{article.title}</Text>
          <Text numberOfLines={1} style={[styles.meta, { color: theme.colors.accent }]}>{meta(article)}</Text>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`Open ${article.title}`} onPress={onPress} style={({ pressed }) => [styles.card, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }, variant === 'featured' && styles.featured, pressed && styles.pressed]}>
      {showImage ? (
        <Image
          source={{ uri: imageUrl }}
          accessibilityLabel={image?.alt || article.title}
          onError={() => setImageFailed(true)}
          resizeMode="cover"
          style={[styles.image, variant === 'featured' && styles.featuredImage]}
        />
      ) : (
        <View accessibilityLabel={fallbackLabel} style={[styles.image, variant === 'featured' && styles.featuredImage, { backgroundColor: theme.colors.accentSoft }]} />
      )}
      <View style={styles.copy}>
        <Text numberOfLines={1} style={[styles.meta, { color: theme.colors.accent }]}>{meta(article)}</Text>
        <Text numberOfLines={variant === 'featured' ? 3 : 2} style={[variant === 'featured' ? styles.featuredTitle : styles.title, { color: theme.colors.text }]}>{article.title}</Text>
        {variant === 'featured' && article.excerpt ? <Text numberOfLines={2} style={[styles.excerpt, { color: theme.colors.mutedText }]}>{article.excerpt}</Text> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 18, overflow: 'hidden', marginBottom: 12 },
  featured: { borderWidth: 0 },
  image: { width: '100%', height: 160 },
  featuredImage: { height: 250 },
  copy: { padding: 15 },
  meta: { fontSize: 11, fontWeight: '800', letterSpacing: 0.3, marginBottom: 7, textTransform: 'uppercase' },
  title: { fontSize: 17, lineHeight: 22, fontWeight: '700' },
  featuredTitle: { fontSize: 27, lineHeight: 32, fontWeight: '800', letterSpacing: -0.4 },
  excerpt: { fontSize: 14, lineHeight: 20, marginTop: 9 },
  compact: { flexDirection: 'row', gap: 12, marginBottom: 14, minHeight: 84 },
  compactImage: { width: 112, height: 84, borderRadius: 12 },
  compactCopy: { flex: 1, justifyContent: 'space-between', paddingVertical: 1 },
  compactTitle: { fontSize: 15, lineHeight: 20, fontWeight: '700' },
  pressed: { opacity: 0.78 },
});
