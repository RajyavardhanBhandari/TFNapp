import { Image, StyleSheet, View } from 'react-native';
import { useColorScheme } from 'react-native';

type Props = { compact?: boolean };

const LIGHT_LOGO = require('../../assets/logos/tfn-logo-light.png');
const DARK_LOGO = require('../../assets/logos/tfn-logo-dark.png');

export function BrandMark({ compact = false }: Props) {
  const scheme = useColorScheme();

  return (
    <View style={styles.wrap}>
      <Image
        accessibilityLabel="The Founder Nation"
        resizeMode="contain"
        source={scheme === 'dark' ? DARK_LOGO : LIGHT_LOGO}
        style={compact ? styles.compactLogo : styles.logo}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'flex-start', justifyContent: 'center' },
  logo: { width: 160, height: 64 },
  compactLogo: { width: 86, height: 38 },
});
