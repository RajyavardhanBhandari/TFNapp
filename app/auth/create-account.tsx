import { useState } from 'react';
import { Link, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Screen } from '../../src/components/Screen';
import { BrandMark } from '../../src/components/BrandMark';
import { useAppTheme } from '../../src/theme';
import { supabase } from '../../src/lib/supabase';
import { signInWithProvider } from '../../src/user/oauth';

export default function CreateAccountScreen(){
  const theme=useAppTheme(); const router=useRouter(); const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [busy,setBusy]=useState(false); const [error,setError]=useState('');
  async function submit(){
    if(!supabase){setError('Account services are not configured yet.');return;}
    if(!email.includes('@')||password.length<8){setError('Use a valid email and a password of at least 8 characters.');return;}
    setBusy(true);setError('');
    const {data,error:e}=await supabase.auth.signUp({email:email.trim(),password});
    setBusy(false);
    if(e){setError('We could not create your account. Please try again.');return;}
    if(data.session){ router.replace('/onboarding/profile'); return; }
    router.replace({pathname:'/auth/confirm-email',params:{email:email.trim()}});
  }
  async function social(provider:'google'|'apple'){
    try{setBusy(true);setError('');await signInWithProvider(provider);}catch(e){setError(e instanceof Error?e.message:'Social sign-in could not be started.');}finally{setBusy(false);}
  }
  return <Screen><View style={styles.wrap}>
    <BrandMark /><Text style={[styles.title,{color:theme.colors.text}]}>Join The Founder Nation</Text><Text style={[styles.sub,{color:theme.colors.mutedText}]}>Create your account and make TFN more relevant to you.</Text>
    <Pressable disabled={busy} onPress={()=>social('google')} style={[styles.social,{borderColor:theme.colors.border,backgroundColor:theme.colors.surface}]}><Text style={{color:theme.colors.text,fontWeight:'800'}}>Continue with Google</Text></Pressable>
    <Pressable disabled={busy} onPress={()=>social('apple')} style={[styles.social,{borderColor:theme.colors.border,backgroundColor:theme.colors.surface}]}><Text style={{color:theme.colors.text,fontWeight:'800'}}>Continue with Apple</Text></Pressable>
    <Link href="/auth/phone" style={[styles.phone,{color:theme.colors.text}]}>Sign in with phone</Link>
    <Text style={[styles.or,{color:theme.colors.mutedText}]}>or create with email</Text>
    <TextInput autoCapitalize="none" keyboardType="email-address" placeholder="Email" placeholderTextColor={theme.colors.mutedText} value={email} onChangeText={setEmail} style={[styles.input,{color:theme.colors.text,borderColor:theme.colors.border,backgroundColor:theme.colors.surface}]}/>
    <TextInput secureTextEntry placeholder="Password" placeholderTextColor={theme.colors.mutedText} value={password} onChangeText={setPassword} style={[styles.input,{color:theme.colors.text,borderColor:theme.colors.border,backgroundColor:theme.colors.surface}]}/>{error?<Text style={[styles.error,{color:theme.colors.error}]}>{error}</Text>:null}
    <Pressable disabled={busy} onPress={submit} style={[styles.button,{backgroundColor:theme.colors.accent}]}><Text style={[styles.buttonText,{color:theme.colors.inverseText}]}>{busy?'Creating…':'Create account'}</Text></Pressable>
    <Link href="/auth/sign-in" style={[styles.link,{color:theme.colors.text}]}>Already have an account? Sign in</Link>
  </View></Screen>
}
const styles=StyleSheet.create({wrap:{maxWidth:460,width:'100%',alignSelf:'center',paddingTop:48},logo:{fontSize:20,fontWeight:'900',letterSpacing:3},title:{fontSize:34,fontWeight:'800',marginTop:34},sub:{fontSize:16,lineHeight:24,marginTop:8,marginBottom:22},social:{height:50,borderWidth:1,borderRadius:12,alignItems:'center',justifyContent:'center',marginBottom:10},phone:{fontWeight:'800',textAlign:'center',padding:12},or:{textAlign:'center',marginVertical:14},input:{height:52,borderWidth:1,borderRadius:12,paddingHorizontal:16,fontSize:16,marginBottom:12},button:{height:52,borderRadius:12,alignItems:'center',justifyContent:'center'},buttonText:{fontWeight:'800',fontSize:16},link:{fontWeight:'700',textAlign:'center',marginTop:20},error:{marginBottom:8}});
