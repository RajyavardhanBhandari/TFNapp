import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '../../src/components/AppHeader';
import { Screen } from '../../src/components/Screen';
import { useAppTheme } from '../../src/theme';
import { supabase } from '../../src/lib/supabase';
import { PROFILE_INTERESTS } from '../../src/user/types';

export default function Interests(){
  const theme=useAppTheme();const [selected,setSelected]=useState<string[]>([]);const [busy,setBusy]=useState(false);const [message,setMessage]=useState('');
  useEffect(()=>{(async()=>{if(!supabase)return;const {data:{user}}=await supabase.auth.getUser();if(!user)return;const {data}=await supabase.from('profiles').select('interests').eq('id',user.id).maybeSingle();setSelected(data?.interests??[]);})()},[]);
  function toggle(item:string){setSelected(current=>current.includes(item)?current.filter(x=>x!==item):[...current,item]);}
  async function save(){if(!supabase)return;const {data:{user}}=await supabase.auth.getUser();if(!user)return;setBusy(true);setMessage('');const {error}=await supabase.from('profiles').update({interests:selected}).eq('id',user.id);setBusy(false);setMessage(error?'Could not save your interests.':'Interests saved.');}
  return <Screen><AppHeader title="Interests" back/><ScrollView contentContainerStyle={styles.wrap}><Text style={[styles.title,{color:theme.colors.text}]}>What do you want to follow?</Text><Text style={[styles.body,{color:theme.colors.mutedText}]}>Your choices help TFN understand what matters to you. Deeper behavioral personalization will be handled separately.</Text><View style={styles.chips}>{PROFILE_INTERESTS.map(item=><Pressable key={item} onPress={()=>toggle(item)} style={[styles.chip,{borderColor:selected.includes(item)?theme.colors.accent:theme.colors.border,backgroundColor:selected.includes(item)?theme.colors.accent:theme.colors.surface}]}><Text style={{color:selected.includes(item)?theme.colors.inverseText:theme.colors.text,fontWeight:'700'}}>{item}</Text></Pressable>)}</View>{message?<Text style={[styles.message,{color:theme.colors.mutedText}]}>{message}</Text>:null}<Pressable disabled={busy} onPress={save} style={[styles.button,{backgroundColor:theme.colors.accent}]}><Text style={{color:theme.colors.inverseText,fontWeight:'800'}}>{busy?'Saving…':'Save interests'}</Text></Pressable></ScrollView></Screen>
}
const styles=StyleSheet.create({wrap:{maxWidth:620,width:'100%',alignSelf:'center',padding:20,paddingBottom:48},title:{fontSize:32,fontWeight:'800'},body:{fontSize:16,lineHeight:24,marginTop:10,marginBottom:24},chips:{flexDirection:'row',flexWrap:'wrap',gap:8},chip:{paddingHorizontal:13,paddingVertical:11,borderWidth:1,borderRadius:20},button:{height:52,borderRadius:12,alignItems:'center',justifyContent:'center',marginTop:24},message:{marginTop:12}});
