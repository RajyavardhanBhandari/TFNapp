import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppHeader } from '../../src/components/AppHeader';
import { Screen } from '../../src/components/Screen';
import { useAppTheme, useThemePreference, type ThemeMode } from '../../src/theme';
import { supabase } from '../../src/lib/supabase';
import { useAuth } from '../../src/user/auth';

const THEME_OPTIONS: { value: ThemeMode; label: string; description: string }[] = [
  { value: 'system', label: 'System', description: 'Follow your device appearance.' },
  { value: 'light', label: 'Light', description: 'Use TFN in light mode.' },
  { value: 'dark', label: 'Dark', description: 'Use TFN in dark mode.' },
];

export default function Settings(){
  const theme=useAppTheme();const router=useRouter();const {signOut,user}=useAuth();const {mode,setMode}=useThemePreference();const [consent,setConsent]=useState(false);const [phone,setPhone]=useState('');
  useEffect(()=>{if(!user||!supabase)return;(async()=>{const {data}=await supabase.from('profiles').select('personalization_consent,phone_number').eq('id',user.id).maybeSingle();if(data){setConsent(Boolean(data.personalization_consent));setPhone(data.phone_number??'');}})()},[user]);
  async function saveConsent(next:boolean){setConsent(next);if(!supabase||!user)return;await supabase.from('profiles').update({personalization_consent:next}).eq('id',user.id);}
  function confirmDelete(){Alert.alert('Delete your TFN account?','This permanently removes your TFN account and associated profile data. This action cannot be undone.',[{text:'Cancel',style:'cancel'},{text:'Delete',style:'destructive',onPress:async()=>{if(!supabase)return;const {error}=await supabase.functions.invoke('delete-account');if(error){Alert.alert('Could not delete account','We could not complete secure account deletion. Please try again.');return;}await signOut();router.replace('/');}}]);}
  return <Screen><AppHeader title="Account & privacy" back/><View style={styles.wrap}>
    <Text style={[styles.heading,{color:theme.colors.text}]}>Appearance</Text>
    <Text style={[styles.body,{color:theme.colors.mutedText}]}>Choose how TFN looks on this device.</Text>
    <View style={styles.themeOptions}>{THEME_OPTIONS.map(option=><Pressable key={option.value} accessibilityRole="radio" accessibilityState={{selected:mode===option.value}} onPress={()=>setMode(option.value)} style={[styles.themeOption,{borderColor:mode===option.value?theme.colors.accent:theme.colors.border,backgroundColor:mode===option.value?theme.colors.surface:theme.colors.background}]}><View style={[styles.radio,{borderColor:mode===option.value?theme.colors.accent:theme.colors.border}]}>{mode===option.value?<View style={[styles.radioDot,{backgroundColor:theme.colors.accent}]} />:null}</View><View style={{flex:1}}><Text style={[styles.rowTitle,{color:theme.colors.text}]}>{option.label}</Text><Text style={[styles.body,{color:theme.colors.mutedText}]}>{option.description}</Text></View></Pressable>)}</View>
    <Text style={[styles.heading,{color:theme.colors.text}]}>Account information</Text><Text style={[styles.body,{color:theme.colors.mutedText}]}>Email</Text><Text style={[styles.value,{color:theme.colors.text}]}>{user?.email||'Not available'}</Text>{phone?<><Text style={[styles.body,{color:theme.colors.mutedText,marginTop:12}]}>Phone</Text><Text style={[styles.value,{color:theme.colors.text}]}>{phone}</Text></>:null}
    <Text style={[styles.heading,{color:theme.colors.text}]}>Privacy</Text><Text style={[styles.body,{color:theme.colors.mutedText}]}>Your profile information is used to provide the TFN account features you choose. Behavioral personalization remains controlled separately.</Text>
    <View style={[styles.row,{borderBottomColor:theme.colors.border}]}><View style={{flex:1}}><Text style={[styles.rowTitle,{color:theme.colors.text}]}>Personalization</Text><Text style={[styles.body,{color:theme.colors.mutedText}]}>Allow TFN to use your declared preferences and future preference signals to personalize content.</Text></View><Switch value={consent} onValueChange={saveConsent}/></View>
    <Text style={[styles.heading,{color:theme.colors.text}]}>Account</Text><Pressable onPress={signOut} style={[styles.secondary,{borderColor:theme.colors.border}]}><Text style={{color:theme.colors.text,fontWeight:'800'}}>Sign out</Text></Pressable><Pressable onPress={confirmDelete} style={styles.delete}><Text style={{color:theme.colors.error,fontWeight:'800'}}>Delete account</Text></Pressable>
  </View></Screen>
}
const styles=StyleSheet.create({wrap:{maxWidth:600,width:'100%',alignSelf:'center',padding:20},heading:{fontSize:22,fontWeight:'800',marginTop:12,marginBottom:10},body:{fontSize:15,lineHeight:22},value:{fontSize:16,fontWeight:'700',marginTop:4},themeOptions:{gap:8,marginTop:8,marginBottom:8},themeOption:{minHeight:68,borderWidth:1,borderRadius:14,padding:14,flexDirection:'row',alignItems:'center',gap:12},radio:{width:20,height:20,borderRadius:10,borderWidth:2,alignItems:'center',justifyContent:'center'},radioDot:{width:10,height:10,borderRadius:5},row:{flexDirection:'row',alignItems:'center',gap:16,paddingVertical:18,borderBottomWidth:StyleSheet.hairlineWidth},rowTitle:{fontSize:16,fontWeight:'800',marginBottom:4},secondary:{height:52,borderWidth:1,borderRadius:12,alignItems:'center',justifyContent:'center',marginTop:10},delete:{alignItems:'center',padding:20,marginTop:12}});
