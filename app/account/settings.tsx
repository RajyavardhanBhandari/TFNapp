import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppHeader } from '../../src/components/AppHeader';
import { Screen } from '../../src/components/Screen';
import { useAppTheme } from '../../src/theme';
import { supabase } from '../../src/lib/supabase';
import { useAuth } from '../../src/user/auth';

export default function Settings(){
  const theme=useAppTheme();const router=useRouter();const {signOut,user}=useAuth();const [consent,setConsent]=useState(false);const [phone,setPhone]=useState('');const [busy,setBusy]=useState(false);
  useEffect(()=>{if(!user||!supabase)return;(async()=>{const {data}=await supabase.from('profiles').select('personalization_consent,phone_number').eq('id',user.id).maybeSingle();if(data){setConsent(Boolean(data.personalization_consent));setPhone(data.phone_number??'');}})()},[user]);
  async function saveConsent(next:boolean){setConsent(next);if(!supabase||!user)return;await supabase.from('profiles').update({personalization_consent:next}).eq('id',user.id);}
  async function doSignOut(){if(busy)return;setBusy(true);try{await signOut();router.replace('/');}catch(e){Alert.alert('Could not sign out',e instanceof Error?e.message:'Please try again.');}finally{setBusy(false);}}
  function confirmDelete(){Alert.alert('Delete your TFN account?','This permanently removes your TFN account and associated profile data. This action cannot be undone.',[{text:'Cancel',style:'cancel'},{text:'Delete',style:'destructive',onPress:async()=>{if(!supabase||busy)return;setBusy(true);try{const {error}=await supabase.functions.invoke('delete-account',{method:'POST'});if(error)throw error;await supabase.auth.signOut();router.replace('/');}catch(e){Alert.alert('Could not delete account',e instanceof Error?e.message:'Please try again.');}finally{setBusy(false);}}}] );}
  return <Screen><AppHeader title="Account & privacy" back/><View style={styles.wrap}>
    <Text style={[styles.heading,{color:theme.colors.text}]}>Account information</Text><Text style={[styles.body,{color:theme.colors.mutedText}]}>Email</Text><Text style={[styles.value,{color:theme.colors.text}]}>{user?.email||'Not available'}</Text>{phone?<><Text style={[styles.body,{color:theme.colors.mutedText,marginTop:12}]}>Phone</Text><Text style={[styles.value,{color:theme.colors.text}]}>{phone}</Text></>:null}
    <Text style={[styles.heading,{color:theme.colors.text}]}>Privacy</Text><Text style={[styles.body,{color:theme.colors.mutedText}]}>Your profile information is used to provide the TFN account features you choose. Behavioral personalization remains controlled separately.</Text>
    <View style={styles.row}><View style={{flex:1}}><Text style={[styles.rowTitle,{color:theme.colors.text}]}>Personalization</Text><Text style={[styles.body,{color:theme.colors.mutedText}]}>Allow TFN to use your declared preferences and future preference signals to personalize content.</Text></View><Switch value={consent} onValueChange={saveConsent}/></View>
    <Text style={[styles.heading,{color:theme.colors.text}]}>Account</Text><Pressable disabled={busy} onPress={doSignOut} style={[styles.secondary,{borderColor:theme.colors.border,opacity:busy?0.6:1}]}><Text style={{color:theme.colors.text,fontWeight:'800'}}>{busy?'Please wait…':'Sign out'}</Text></Pressable><Pressable disabled={busy} onPress={confirmDelete} style={[styles.delete,{opacity:busy?0.6:1}]}><Text style={{color:'#C62828',fontWeight:'800'}}>Delete account</Text></Pressable>
  </View></Screen>
}
const styles=StyleSheet.create({wrap:{maxWidth:600,width:'100%',alignSelf:'center',padding:20},heading:{fontSize:22,fontWeight:'800',marginTop:12,marginBottom:10},body:{fontSize:15,lineHeight:22},value:{fontSize:16,fontWeight:'700',marginTop:4},row:{flexDirection:'row',alignItems:'center',gap:16,paddingVertical:18,borderBottomWidth:StyleSheet.hairlineWidth,borderBottomColor:'#D0D0D0'},rowTitle:{fontSize:16,fontWeight:'800',marginBottom:4},secondary:{height:52,borderWidth:1,borderRadius:12,alignItems:'center',justifyContent:'center',marginTop:10},delete:{alignItems:'center',padding:20,marginTop:12}});
