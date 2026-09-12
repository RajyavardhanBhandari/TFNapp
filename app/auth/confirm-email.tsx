import { useLocalSearchParams, Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../src/components/Screen';
import { useAppTheme } from '../../src/theme';

export default function ConfirmEmailScreen(){
  const theme=useAppTheme();
  const {email}=useLocalSearchParams<{email?:string}>();
  return <Screen><View style={styles.wrap}><Text style={[styles.eyebrow,{color:theme.colors.mutedText}]}>ALMOST THERE</Text><Text style={[styles.title,{color:theme.colors.text}]}>Confirm your email</Text><Text style={[styles.body,{color:theme.colors.mutedText}]}>We created your TFN account. Check {email ? String(email) : 'your inbox'} and confirm your email to continue.</Text><Text style={[styles.body,{color:theme.colors.mutedText}]}>Once confirmed, reopen TFN and your saved session will continue automatically.</Text><Link href="/auth/sign-in" style={[styles.link,{color:theme.colors.text}]}>Back to sign in</Link></View></Screen>
}
const styles=StyleSheet.create({wrap:{maxWidth:520,width:'100%',alignSelf:'center',paddingTop:72},eyebrow:{fontSize:12,fontWeight:'800',letterSpacing:1.5},title:{fontSize:34,fontWeight:'800',marginTop:10},body:{fontSize:16,lineHeight:25,marginTop:14},link:{fontWeight:'800',marginTop:26,textAlign:'center'}});
