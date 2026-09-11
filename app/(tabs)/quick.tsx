import { AppHeader } from '../../src/components/AppHeader';
import { Screen } from '../../src/components/Screen';
import { StyleSheet, Text } from 'react-native';
import { useAppTheme } from '../../src/theme';
export default function QuickScreen() { const theme = useAppTheme(); return <Screen><AppHeader title="Quick" /><Text style={[styles.title,{color:theme.colors.text}]}>Quick</Text><Text style={[styles.body,{color:theme.colors.mutedText}]}>Quick discovery interactions will be added in a later phase.</Text></Screen>; }
const styles=StyleSheet.create({title:{fontSize:32,fontWeight:'800',marginTop:18},body:{fontSize:16,lineHeight:24,marginTop:8}});
