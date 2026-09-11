import { AppHeader } from '../src/components/AppHeader';
import { Screen } from '../src/components/Screen';
import { StyleSheet, Text } from 'react-native';
import { useAppTheme } from '../src/theme';
export default function NotificationsScreen() { const theme=useAppTheme(); return <Screen><AppHeader title="Notifications" back/><Text style={[styles.title,{color:theme.colors.text}]}>Notifications</Text><Text style={[styles.body,{color:theme.colors.mutedText}]}>Notification center and push infrastructure will be connected in the Notifications phase.</Text></Screen>; }
const styles=StyleSheet.create({title:{fontSize:32,fontWeight:'800',marginTop:18},body:{fontSize:16,lineHeight:24,marginTop:8}});
