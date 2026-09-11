import { AppHeader } from '../src/components/AppHeader';
import { Screen } from '../src/components/Screen';
import { StyleSheet, Text } from 'react-native';
import { useAppTheme } from '../src/theme';
export default function SearchScreen() { const theme=useAppTheme(); return <Screen><AppHeader title="Search" back/><Text style={[styles.title,{color:theme.colors.text}]}>Search</Text><Text style={[styles.body,{color:theme.colors.mutedText}]}>Search UI and history will be implemented in the Search phase.</Text></Screen>; }
const styles=StyleSheet.create({title:{fontSize:32,fontWeight:'800',marginTop:18},body:{fontSize:16,lineHeight:24,marginTop:8}});
