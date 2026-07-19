import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { initDb, listVocab } from '../../src/db';
import type { VocabItem } from '../../src/types';

export default function FlashcardScreen() {
  const [items, setItems] = useState<VocabItem[]>([]);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [groups, setGroups] = useState<string[]>([]);
  const [activeGroup, setActiveGroup] = useState('');

  const load = useCallback(() => {
    initDb();
    const allItems = listVocab({ query: '', script_type: 'all', jlpt_level: 'all', category: '', group: '' });
    setGroups([...new Set(allItems.map(i => i.group).filter(Boolean))]);
    const filtered = activeGroup ? allItems.filter(i => i.group === activeGroup) : allItems;
    setItems(filtered);
    setIndex(0);
    setRevealed(false);
  }, [activeGroup]);

  useFocusEffect(load);

  const item = items[index];

  function move(delta: number) {
    if (!items.length) return;
    setIndex((current) => (current + delta + items.length) % items.length);
    setRevealed(false);
  }

  return (
    <ScrollView style={styles.wrap} contentContainerStyle={{ paddingBottom: 24 }}>
      <Text style={styles.title}>Flashcard</Text>

      {groups.length > 0 && (
        <>
          <Text style={styles.sectionLabel}>Group</Text>
          <View style={styles.row}>
            <Chip label="Semua" active={activeGroup === ''} onPress={() => setActiveGroup('')} />
            {groups.map((g) => <Chip key={g} label={g} active={activeGroup === g} onPress={() => setActiveGroup(g)} />)}
          </View>
        </>
      )}

      <Text style={styles.count}>{items.length > 0 ? `${index + 1} / ${items.length}` : '0 / 0'}</Text>

      {!item ? (
        <View style={styles.emptyBox}><Text style={styles.empty}>Belum ada kotoba{activeGroup ? ` di group "${activeGroup}"` : ''}.</Text></View>
      ) : (
        <>
          <Pressable style={styles.card} onPress={() => setRevealed(!revealed)}>
            <Text style={styles.kana}>{item.kana}</Text>
            {revealed ? (
              <View style={styles.answerBox}>
                <Text style={styles.romaji}>{item.romaji}</Text>
                <Text style={styles.meaning}>{item.meaning_id}</Text>
              </View>
            ) : <Text style={styles.hint}>tap buat lihat arti</Text>}
          </Pressable>
          <Text style={styles.meta}>
            {item.script_type} · {item.jlpt_level} · {item.category}{item.group ? ` · ${item.group}` : ''}
          </Text>
          <View style={styles.row}>
            <Pressable style={styles.button} onPress={() => move(-1)}><Text style={styles.buttonText}>Prev</Text></Pressable>
            <Pressable style={styles.button} onPress={() => move(1)}><Text style={styles.buttonText}>Next</Text></Pressable>
          </View>
        </>
      )}
    </ScrollView>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}><Text style={active ? styles.chipTextActive : styles.chipText}>{label}</Text></Pressable>;
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 16, backgroundColor: '#f8fafc' },
  title: { fontSize: 28, fontWeight: '800', color: '#0f172a' },
  sectionLabel: { fontWeight: '700', marginTop: 12, marginBottom: 6, color: '#334155' },
  count: { color: '#64748b', marginTop: 8, marginBottom: 16 },
  card: { minHeight: 280, borderRadius: 24, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', padding: 24, borderWidth: 1, borderColor: '#e2e8f0' },
  kana: { fontSize: 48, fontWeight: '900', color: '#111827', textAlign: 'center' },
  answerBox: { marginTop: 24, alignItems: 'center' },
  romaji: { fontSize: 20, color: '#64748b', marginBottom: 8, textAlign: 'center' },
  meaning: { fontSize: 24, color: '#111827', fontWeight: '600', textAlign: 'center' },
  hint: { marginTop: 24, color: '#64748b' },
  meta: { textAlign: 'center', color: '#64748b', marginTop: 16 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  chip: { paddingVertical: 7, paddingHorizontal: 10, borderRadius: 999, backgroundColor: '#e2e8f0' },
  chipActive: { backgroundColor: '#2563eb' },
  chipText: { color: '#334155' },
  chipTextActive: { color: 'white', fontWeight: '700' },
  button: { flex: 1, backgroundColor: '#2563eb', padding: 14, borderRadius: 14, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: '800' },
  emptyBox: { alignItems: 'center', marginTop: 48 },
  empty: { color: '#64748b' }
});
