import { StyleSheet, Text } from 'react-native';
import { AppHeader } from '../../src/components/AppHeader';
import { Screen } from '../../src/components/Screen';
import { useAppTheme } from '../../src/theme';
export default function Interests(){const theme=useAppTheme();return <Screen><AppHeader title="Interests" back/><Text style={[styles.title,{color:theme.colors.text}]}>Interests</Text><Text style={[styles.body,{color:theme.colors.mutedText}]}>Interest selection and personalization are part of Phase 7. Nothing is being collected here yet.</Text></Screen>}
const styles=StyleSheet.create({title:{fontSize:32,fontWeight:'800',margin:20},body:{fontSize:16,lineHeight:24,marginHorizontal:20}});
