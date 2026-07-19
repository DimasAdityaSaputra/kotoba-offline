import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { addVocab, initDb } from '../../src/db';
import type { JlptLevel, ScriptType } from '../../src/types';

export default function AddScreen() {
  const [kana, setKana] = useState('');
  const [romaji, setRomaji] = useState('');
  const [meaning, setMeaning] = useState('');
  const [category, setCategory] = useState('uncategorized');
  const [jlpt, setJlpt] = useState<JlptLevel>('N5');
  const [script, setScript] = useState<ScriptType>('hiragana');
  const [error, setError] = useState('');

  function save() {
    initDb();
    if (!kana.trim() || !meaning.trim()) {
      setError('Kana dan arti wajib diisi. Jangan ngadi-ngadi.');
      return;
    }
    addVocab({ kana, romaji, meaning_id: meaning, category, jlpt_level: jlpt, script_type: script });
    setKana(''); setRomaji(''); setMeaning(''); setCategory('uncategorized'); setJlpt('N5'); setScript('hiragana'); setError('');
    Alert.alert('Tersimpan', 'Kotoba masuk ke database offline.');
  }

  return (
    <ScrollView style={styles.wrap} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.title}>Tambah Kotoba</Text>
      {!!error && <Text style={styles.error}>{error}</Text>}
      <Field label="Kana" value={kana} onChangeText={setKana} placeholder="おはよう / コーヒー" />
      <Field label="Romaji" value={romaji} onChangeText={setRomaji} placeholder="ohayou" />
      <Field label="Arti Indonesia" value={meaning} onChangeText={setMeaning} placeholder="selamat pagi" />
      <Field label="Kategori" value={category} onChangeText={setCategory} placeholder="greeting" />
      <Text style={styles.label}>Script</Text>
      <View style={styles.row}>{(['hiragana', 'katakana'] as const).map((v) => <Chip key={v} label={v} active={script === v} onPress={() => setScript(v)} />)}</View>
      <Text style={styles.label}>JLPT</Text>
      <View style={styles.row}>{(['N5', 'N4', 'uncategorized'] as const).map((v) => <Chip key={v} label={v} active={jlpt === v} onPress={() => setJlpt(v)} />)}</View>
      <Pressable style={styles.button} onPress={save}><Text style={styles.buttonText}>Simpan</Text></Pressable>
    </ScrollView>
  );
}

function Field(props: { label: string; value: string; onChangeText: (value: string) => void; placeholder: string }) {
  return <View><Text style={styles.label}>{props.label}</Text><TextInput style={styles.input} {...props} /></View>;
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}><Text style={active ? styles.chipTextActive : styles.chipText}>{label}</Text></Pressable>;
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 16, backgroundColor: '#f8fafc' },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 16, color: '#0f172a' },
  label: { fontWeight: '700', marginBottom: 6, marginTop: 12, color: '#334155' },
  input: { backgroundColor: 'white', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  chip: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, backgroundColor: '#e2e8f0' },
  chipActive: { backgroundColor: '#2563eb' },
  chipText: { color: '#334155' },
  chipTextActive: { color: 'white', fontWeight: '700' },
  button: { backgroundColor: '#2563eb', padding: 14, borderRadius: 14, marginTop: 20, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: '800', fontSize: 16 },
  error: { backgroundColor: '#fee2e2', color: '#991b1b', padding: 10, borderRadius: 10 }
});
