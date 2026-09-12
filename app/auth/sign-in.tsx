import { useState } from 'react';
import { Link, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Screen } from '../../src/components/Screen';
import { useAppTheme } from '../../src/theme';
import { supabase } from '../../src/lib/supabase';
import { signInWithProvider } from '../../src/user/oauth';

export default function SignInScreen() {
  const theme = useAppTheme(); const router = useRouter();
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [busy, setBusy] = useState(false); const [error, setError] = useState('');

  async function signIn() {
    if (!supabase) { setError('Account services are not configured yet.'); return; }
    if (!email.includes('@') || password.length < 6) { setError('Enter a valid email and password.'); return; }
    setBusy(true); setError('');
    const { error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (authError) { setError('We could not sign you in. Check your details and try again.'); return; }
    router.replace('/');
  }

  async function social(provider: 'google' | 'apple') {
    try { setBusy(true); setError(''); await signInWithProvider(provider); }
    catch (e) { setError(e instanceof Error ? e.message : 'Social sign-in could not be started.'); }
    finally { setBusy(false); }
  }

  return <Screen><View style={styles.wrap}>
    <Text style={[styles.logo,{color:theme.colors.text}]}>TFN</Text>
    <Text style={[styles.title,{color:theme.colors.text}]}>Welcome back</Text>
    <Text style={[styles.sub,{color:theme.colors.mutedText}]}>Sign in to your Founder Nation account.</Text>
    <Pressable disabled={busy} onPress={()=>social('google')} style={[styles.social,{borderColor:theme.colors.border,backgroundColor:theme.colors.surface}]}><Text style={{color:theme.colors.text,fontWeight:'800'}}>Continue with Google</Text></Pressable>
    <Pressable disabled={busy} onPress={()=>social('apple')} style={[styles.social,{borderColor:theme.colors.border,backgroundColor:theme.colors.surface}]}><Text style={{color:theme.colors.text,fontWeight:'800'}}>Continue with Apple</Text></Pressable>
    <Link href="/auth/phone" style={[styles.phone,{color:theme.colors.text}]}>Continue with phone</Link>
    <Text style={[styles.or,{color:theme.colors.mutedText}]}>or use email</Text>
    <TextInput autoCapitalize="none" keyboardType="email-address" placeholder="Email" placeholderTextColor={theme.colors.mutedText} value={email} onChangeText={setEmail} style={[styles.input,{color:theme.colors.text,borderColor:theme.colors.border,backgroundColor:theme.colors.surface}]}/>
    <TextInput secureTextEntry placeholder="Password" placeholderTextColor={theme.colors.mutedText} value={password} onChangeText={setPassword} style={[styles.input,{color:theme.colors.text,borderColor:theme.colors.border,backgroundColor:theme.colors.surface}]}/>
    {error ? <Text style={styles.error}>{error}</Text> : null}
    <Pressable disabled={busy} onPress={signIn} style={[styles.button,{backgroundColor:theme.colors.accent}]}><Text style={[styles.buttonText,{color:theme.colors.inverseText}]}>{busy?'Signing in…':'Sign in'}</Text></Pressable>
    <Link href="/auth/forgot-password" style={[styles.link,{color:theme.colors.text}]}>Forgot password?</Link>
    <Text style={[styles.or,{color:theme.colors.mutedText}]}>New to TFN?</Text>
    <Link href="/auth/create-account" style={[styles.link,{color:theme.colors.text}]}>Create an account</Link>
  </View></Screen>;
}
const styles=StyleSheet.create({wrap:{maxWidth:460,width:'100%',alignSelf:'center',paddingTop:48},logo:{fontSize:20,fontWeight:'900',letterSpacing:3},title:{fontSize:34,fontWeight:'800',marginTop:34},sub:{fontSize:16,lineHeight:24,marginTop:8,marginBottom:22},social:{height:50,borderWidth:1,borderRadius:12,alignItems:'center',justifyContent:'center',marginBottom:10},phone:{fontWeight:'800',textAlign:'center',padding:12},or:{textAlign:'center',marginVertical:14},input:{height:52,borderWidth:1,borderRadius:12,paddingHorizontal:16,fontSize:16,marginBottom:12},button:{height:52,borderRadius:12,alignItems:'center',justifyContent:'center',marginTop:4},buttonText:{fontWeight:'800',fontSize:16},link:{fontWeight:'700',textAlign:'center',marginTop:18},error:{color:'#C62828',marginBottom:8}});
