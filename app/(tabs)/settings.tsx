import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { allVocab, initDb, insertMany, resetDefaultVocab } from '../../src/db';
import { parseCsv, toCsv } from '../../src/csv';

export default function SettingsScreen() {
  async function importCsv() {
    initDb();
    const picked = await DocumentPicker.getDocumentAsync({ type: 'text/*', copyToCacheDirectory: true });
    if (picked.canceled) return;
    const uri = picked.assets[0]?.uri;
    if (!uri) return;
    const text = await FileSystem.readAsStringAsync(uri);
    const parsed = parseCsv(text);
    insertMany(parsed.rows, 'user');
    Alert.alert('Import selesai', `Masuk: ${parsed.rows.length}\nSkip: ${parsed.skipped}`);
  }

  async function exportCsv() {
    initDb();
    const csv = toCsv(allVocab());
    const uri = `${FileSystem.cacheDirectory}kotoba-export.csv`;
    await FileSystem.writeAsStringAsync(uri, csv);
    if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri, { mimeType: 'text/csv', dialogTitle: 'Export Kotoba CSV' });
    else Alert.alert('Export selesai', uri);
  }

  function resetDefaults() {
    Alert.alert('Reset default?', 'Kosakata bawaan akan dimuat ulang. Data user tetap aman.', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: () => { initDb(); resetDefaultVocab(); Alert.alert('Selesai', 'Default vocabulary dimuat ulang.'); } }
    ]);
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.note}>Full offline. Data disimpan di SQLite lokal HP.</Text>
      <Button label="Import CSV" onPress={importCsv} />
      <Button label="Export CSV" onPress={exportCsv} />
      <Button label="Reset default kotoba" danger onPress={resetDefaults} />
      <Text style={styles.small}>CSV header: kana,romaji,meaning_id,category,jlpt_level,script_type</Text>
    </View>
  );
}

function Button({ label, onPress, danger }: { label: string; onPress: () => void; danger?: boolean }) {
  return <Pressable style={[styles.button, danger && styles.danger]} onPress={onPress}><Text style={styles.buttonText}>{label}</Text></Pressable>;
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 16, backgroundColor: '#f8fafc' },
  title: { fontSize: 28, fontWeight: '800', color: '#0f172a', marginBottom: 8 },
  note: { color: '#475569', marginBottom: 20 },
  button: { backgroundColor: '#2563eb', padding: 14, borderRadius: 14, marginBottom: 12, alignItems: 'center' },
  danger: { backgroundColor: '#dc2626' },
  buttonText: { color: 'white', fontWeight: '800' },
  small: { marginTop: 16, color: '#64748b', lineHeight: 20 }
});
