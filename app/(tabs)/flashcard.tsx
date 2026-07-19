import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { initDb, listVocab } from '../../src/db';
import type { VocabItem } from '../../src/types';

export default function FlashcardScreen() {
  const [items, setItems] = useState<VocabItem[]>([]);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  useFocusEffect(useCallback(() => {
    initDb();
    const next = listVocab({ query: '', script_type: 'all', jlpt_level: 'all', category: '' });
    setItems(next);
    setIndex(0);
    setRevealed(false);
  }, []));

  const item = items[index];

  function move(delta: number) {
    if (!items.length) return;
    setIndex((current) => (current + delta + items.length) % items.length);
    setRevealed(false);
  }

  if (!item) return <View style={styles.center}><Text style={styles.empty}>Belum ada kotoba.</Text></View>;

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Flashcard</Text>
      <Text style={styles.count}>{index + 1} / {items.length}</Text>
      <Pressable style={styles.card} onPress={() => setRevealed(!revealed)}>
        <Text style={styles.kana}>{item.kana}</Text>
        {revealed ? (
          <View style={styles.answerBox}>
            <Text style={styles.romaji}>{item.romaji}</Text>
            <Text style={styles.meaning}>{item.meaning_id}</Text>
          </View>
        ) : <Text style={styles.hint}>tap buat lihat arti</Text>}
      </Pressable>
      <Text style={styles.meta}>{item.script_type} · {item.jlpt_level} · {item.category}</Text>
      <View style={styles.row}>
        <Pressable style={styles.button} onPress={() => move(-1)}><Text style={styles.buttonText}>Prev</Text></Pressable>
        <Pressable style={styles.button} onPress={() => move(1)}><Text style={styles.buttonText}>Next</Text></Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 16, backgroundColor: '#f8fafc' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' },
  title: { fontSize: 28, fontWeight: '800', color: '#0f172a' },
  count: { color: '#64748b', marginTop: 4, marginBottom: 32 },
  card: { minHeight: 280, borderRadius: 24, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', padding: 24, borderWidth: 1, borderColor: '#e2e8f0' },
  kana: { fontSize: 48, fontWeight: '900', color: '#111827', textAlign: 'center' },
  answerBox: { marginTop: 24, alignItems: 'center' },
  romaji: { fontSize: 20, color: '#64748b', marginBottom: 8, textAlign: 'center' },
  meaning: { fontSize: 24, color: '#111827', fontWeight: '600', textAlign: 'center' },
  hint: { marginTop: 24, color: '#64748b' },
  meta: { textAlign: 'center', color: '#64748b', marginTop: 16 },
  row: { flexDirection: 'row', gap: 12, marginTop: 24 },
  button: { flex: 1, backgroundColor: '#2563eb', padding: 14, borderRadius: 14, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: '800' },
  empty: { color: '#64748b' }
});
