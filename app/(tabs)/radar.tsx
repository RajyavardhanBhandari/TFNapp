import { AppHeader } from '../../src/components/AppHeader';
import { Screen } from '../../src/components/Screen';
import { StyleSheet, Text } from 'react-native';
import { useAppTheme } from '../../src/theme';
export default function RadarScreen() { const theme=useAppTheme(); return <Screen><AppHeader title="Radar"/><Text style={[styles.title,{color:theme.colors.text}]}>Radar</Text><Text style={[styles.body,{color:theme.colors.mutedText}]}>Your startup ecosystem radar will be built in the Radar phase.</Text></Screen>; }
const styles=StyleSheet.create({title:{fontSize:32,fontWeight:'800',marginTop:18},body:{fontSize:16,lineHeight:24,marginTop:8}});
