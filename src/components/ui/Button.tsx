import { Pressable, PressableProps, StyleSheet } from 'react-native';

import { Text } from './Text';
import { useTheme } from '@/src/theme/ThemeProvider';

type ButtonProps = PressableProps & {
  label: string;
};

export function Button({ label, style, ...props }: ButtonProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      {...props}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: theme.colors.accent, opacity: pressed ? 0.75 : 1 },
        typeof style === 'function' ? style({ pressed }) : style,
      ]}
    >
      <Text style={[styles.label, { color: theme.colors.accentContrast }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontWeight: '700',
  },
});
