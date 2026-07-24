import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { addVocab, initDb, listGroups } from '../../src/db';
import { romajiToKana } from '../../src/kana';
import { useTheme } from '../../src/theme';
import type { JlptLevel, ScriptType } from '../../src/types';

export default function AddScreen() {
  const t = useTheme();
  const [kana, setKana] = useState('');
  const [romaji, setRomaji] = useState('');
  const [meaning, setMeaning] = useState('');
  const [category, setCategory] = useState('uncategorized');
  const [group, setGroup] = useState('');
  const [jlpt, setJlpt] = useState<JlptLevel>('N5');
  const [script, setScript] = useState<ScriptType>('hiragana');
  const [error, setError] = useState('');
  const [groups, setGroups] = useState<string[]>([]);

  useFocusEffect(useCallback(() => {
    initDb();
    setGroups(listGroups());
  }, []));

  function changeKana(value: string) {
    setKana(value);
  }

  function changeRomaji(value: string) {
    setRomaji(value);
    setKana(romajiToKana(value, script));
  }

  function changeScript(value: ScriptType) {
    setScript(value);
    setKana(romajiToKana(romaji, value));
  }

  function save() {
    initDb();
    if (!kana.trim() || !meaning.trim()) {
      setError('Kana dan arti wajib diisi. Jangan ngadi-ngadi.');
      return;
    }
    addVocab({ kana, romaji, meaning_id: meaning, category, jlpt_level: jlpt, script_type: script, group });
    setGroups(listGroups());
    setKana(''); setRomaji(''); setMeaning(''); setCategory('uncategorized'); setGroup(''); setJlpt('N5'); setScript('hiragana'); setError('');
    Alert.alert('Tersimpan', 'Kotoba masuk ke database offline.');
  }

  return (
    <ScrollView style={[styles.wrap, { backgroundColor: t.bg }]} contentContainerStyle={{ paddingBottom: 108 }}>
      <Text style={[styles.title, { color: t.text, fontFamily: t.font }]}>Tambah Kotoba</Text>
      {!!error && <Text style={styles.error}>{error}</Text>}
      <Field label="Kana" value={kana} onChangeText={changeKana} placeholder="おはよう / コーヒー" />
      <Field label="Romaji" value={romaji} onChangeText={changeRomaji} placeholder="ohayou" />
      <Field label="Arti Indonesia" value={meaning} onChangeText={setMeaning} placeholder="selamat pagi" />
      <Field label="Kategori" value={category} onChangeText={setCategory} placeholder="greeting" />
      <Field label="Group/Bab" value={group} onChangeText={setGroup} placeholder="Bab 1 Minna" />
      {groups.length > 0 && <>
        <Text style={[styles.hint, { color: t.sub, fontFamily: t.font }]}>Pilih bab lama, atau ketik bab baru di atas.</Text>
        <View style={styles.row}>{groups.map((name) => <Chip key={name} label={name} active={group.trim() === name} onPress={() => setGroup(name)} />)}</View>
      </>}
      <Text style={[styles.label, { color: t.label, fontFamily: t.font }]}>Script</Text>
      <View style={styles.row}>{(['hiragana', 'katakana'] as const).map((v) => <Chip key={v} label={v} active={script === v} onPress={() => changeScript(v)} />)}</View>
      <Text style={[styles.label, { color: t.label, fontFamily: t.font }]}>JLPT</Text>
      <View style={styles.row}>{(['N5', 'N4', 'uncategorized'] as const).map((v) => <Chip key={v} label={v} active={jlpt === v} onPress={() => setJlpt(v)} />)}</View>
      <Pressable style={styles.button} onPress={save}><Text style={styles.buttonText}>Simpan</Text></Pressable>
    </ScrollView>
  );
}

function Field(props: { label: string; value: string; onChangeText: (value: string) => void; placeholder: string }) {
  const t = useTheme();
  return <View><Text style={[styles.label, { color: t.label, fontFamily: t.font }]}>{props.label}</Text><TextInput placeholderTextColor={t.sub} style={[styles.input, { backgroundColor: t.card, borderColor: t.border, color: t.text, fontFamily: t.font }]} {...props} /></View>;
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const t = useTheme();
  return <Pressable onPress={onPress} style={[styles.chip, { backgroundColor: active ? t.primary : t.card2 }]}><Text style={[active ? styles.chipTextActive : styles.chipText, { color: active ? 'white' : t.label, fontFamily: t.font }]}>{label}</Text></Pressable>;
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 16, backgroundColor: 'transparent' },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 16, color: '#0f172a' },
  label: { fontWeight: '700', marginBottom: 6, marginTop: 12, color: '#334155' },
  input: { backgroundColor: 'transparent', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  chip: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, backgroundColor: '#e2e8f0' },
  chipActive: { backgroundColor: '#2563eb' },
  chipText: { color: '#334155' },
  chipTextActive: { color: 'white', fontWeight: '700' },
  button: { backgroundColor: '#2563eb', padding: 14, borderRadius: 14, marginTop: 20, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: '800', fontSize: 16 },
  error: { backgroundColor: '#fee2e2', color: '#991b1b', padding: 10, borderRadius: 10 },
  hint: { marginTop: 8, marginBottom: 4, color: '#64748b' }
});
