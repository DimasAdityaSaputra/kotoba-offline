import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { initDb, listGroups, listVocab, setReviewStatus } from '../../src/db';
import { useTheme } from '../../src/theme';
import type { VocabItem } from '../../src/types';

export default function FlashcardScreen() {
  const t = useTheme();
  const [items, setItems] = useState<VocabItem[]>([]);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [groups, setGroups] = useState<string[]>([]);
  const [activeGroup, setActiveGroup] = useState('');
  const [shuffle, setShuffle] = useState(false);
  const [onlyHard, setOnlyHard] = useState(false);

  const load = useCallback(() => {
    initDb();
    setGroups(listGroups());
    const filtered = listVocab({ query: '', script_type: 'all', jlpt_level: 'all', category: '', group: activeGroup, review_status: onlyHard ? 'hard' : 'all' });
    setItems(shuffle ? shuffled(filtered) : filtered);
    setIndex(0);
    setRevealed(false);
  }, [activeGroup, shuffle, onlyHard]);

  useFocusEffect(load);

  const item = items[index];

  function move(delta: number) {
    if (!items.length) return;
    setIndex((current) => (current + delta + items.length) % items.length);
    setRevealed(false);
  }

  function mark(status: VocabItem['review_status']) {
    if (!item) return;
    setReviewStatus(item.id, status);
    const nextItems = onlyHard && status !== 'hard' ? items.filter((value) => value.id !== item.id) : items.map((value) => value.id === item.id ? { ...value, review_status: status } : value);
    setItems(nextItems);
    setIndex((current) => Math.min(current, Math.max(0, nextItems.length - 1)));
    setRevealed(false);
  }

  return (
    <ScrollView style={[styles.wrap, { backgroundColor: t.bg }]} contentContainerStyle={{ paddingBottom: 108 }}>
      <Text style={[styles.title, { color: t.text, fontFamily: t.font }]}>Flashcard</Text>

      {groups.length > 0 && (
        <>
          <Text style={[styles.sectionLabel, { color: t.label, fontFamily: t.font }]}>Group</Text>
          <View style={styles.row}>
            <Chip label="Semua" active={activeGroup === ''} onPress={() => setActiveGroup('')} />
            {groups.map((g) => <Chip key={g} label={g} active={activeGroup === g} onPress={() => setActiveGroup(g)} />)}
          </View>
        </>
      )}

      <View style={styles.studyBar}>
        <Text style={[styles.count, { color: t.sub, fontFamily: t.font }]}>{items.length > 0 ? `${index + 1} / ${items.length}` : '0 / 0'}{activeGroup ? ` · ${activeGroup}` : ''}</Text>
        <View style={styles.studyActions}>
          <Pressable style={[styles.smallButton, { backgroundColor: onlyHard ? t.primary : t.card2 }]} onPress={() => setOnlyHard(!onlyHard)}><Text style={[onlyHard ? styles.smallButtonTextActive : styles.smallButtonText, { color: onlyHard ? 'white' : t.label, fontFamily: t.font }]}>Susah</Text></Pressable>
          <Pressable style={[styles.smallButton, { backgroundColor: shuffle ? t.primary : t.card2 }]} onPress={() => setShuffle(!shuffle)}><Text style={[shuffle ? styles.smallButtonTextActive : styles.smallButtonText, { color: shuffle ? 'white' : t.label, fontFamily: t.font }]}>Acak</Text></Pressable>
        </View>
      </View>

      {!item ? (
        <View style={styles.emptyBox}><Text style={[styles.empty, { color: t.sub, fontFamily: t.font }]}>Belum ada kotoba{activeGroup ? ` di group "${activeGroup}"` : ''}.</Text></View>
      ) : (
        <>
          <Pressable style={[styles.card, { backgroundColor: t.card, borderColor: t.border }]} onPress={() => setRevealed(!revealed)}>
            <Text style={[styles.kana, { color: t.text, fontFamily: t.font }]}>{item.kana}</Text>
            {revealed ? (
              <View style={styles.answerBox}>
                <Text style={[styles.romaji, { color: t.sub, fontFamily: t.font }]}>{item.romaji}</Text>
                <Text style={[styles.meaning, { color: t.label, fontFamily: t.font }]}>{item.meaning_id}</Text>
              </View>
            ) : <Text style={[styles.hint, { color: t.sub, fontFamily: t.font }]}>tap buat lihat arti</Text>}
          </Pressable>
          <Text style={[styles.meta, { color: t.sub, fontFamily: t.font }]}>
            {item.script_type} · {item.jlpt_level} · {item.category}{item.group ? ` · ${item.group}` : ''} · {statusLabel(item.review_status)}
          </Text>
          <View style={styles.row}>
            <Pressable style={[styles.button, styles.hardButton]} onPress={() => mark('hard')}><Text style={styles.buttonText}>Susah</Text></Pressable>
            <Pressable style={[styles.button, styles.knownButton]} onPress={() => mark('known')}><Text style={styles.buttonText}>Ingat</Text></Pressable>
          </View>
          <View style={styles.row}>
            <Pressable style={styles.button} onPress={() => move(-1)}><Text style={styles.buttonText}>Prev</Text></Pressable>
            <Pressable style={styles.button} onPress={() => move(1)}><Text style={styles.buttonText}>Next</Text></Pressable>
          </View>
        </>
      )}
    </ScrollView>
  );
}

function statusLabel(status: VocabItem['review_status']) {
  if (status === 'hard') return 'susah';
  if (status === 'known') return 'ingat';
  return 'baru';
}

function shuffled(items: VocabItem[]) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const t = useTheme();
  return <Pressable onPress={onPress} style={[styles.chip, { backgroundColor: active ? t.primary : t.card2 }]}><Text style={[active ? styles.chipTextActive : styles.chipText, { color: active ? 'white' : t.label, fontFamily: t.font }]}>{label}</Text></Pressable>;
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 16, backgroundColor: 'transparent' },
  title: { fontSize: 28, fontWeight: '800', color: '#0f172a' },
  sectionLabel: { fontWeight: '700', marginTop: 12, marginBottom: 6, color: '#334155' },
  studyBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 8, marginBottom: 16 },
  studyActions: { flexDirection: 'row', gap: 8 },
  count: { color: '#64748b' },
  card: { minHeight: 280, borderRadius: 24, backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center', padding: 24, borderWidth: 1, borderColor: '#e2e8f0' },
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
  hardButton: { backgroundColor: '#ea580c' },
  knownButton: { backgroundColor: '#16a34a' },
  buttonText: { color: 'white', fontWeight: '800' },
  smallButton: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999, backgroundColor: '#e2e8f0' },
  smallButtonActive: { backgroundColor: '#2563eb' },
  smallButtonText: { color: '#334155', fontWeight: '700' },
  smallButtonTextActive: { color: 'white', fontWeight: '700' },
  emptyBox: { alignItems: 'center', marginTop: 48 },
  empty: { color: '#64748b' }
});
