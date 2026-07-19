import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { deleteVocab, initDb, listVocab } from '../../src/db';
import type { VocabFilters, VocabItem } from '../../src/types';

const initialFilters: VocabFilters = { query: '', script_type: 'all', jlpt_level: 'all', category: '' };

export default function KotobaScreen() {
  const [filters, setFilters] = useState<VocabFilters>(initialFilters);
  const [items, setItems] = useState<VocabItem[]>([]);

  const load = useCallback(() => {
    initDb();
    setItems(listVocab(filters));
  }, [filters]);

  useFocusEffect(load);

  function remove(item: VocabItem) {
    if (item.source !== 'user') return Alert.alert('Default word', 'Kosakata bawaan tidak bisa dihapus.');
    Alert.alert('Hapus kotoba?', `${item.kana} - ${item.meaning_id}`, [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: () => { deleteVocab(item.id); load(); } }
    ]);
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Kotoba</Text>
      <TextInput style={styles.input} placeholder="Cari kana, romaji, arti..." value={filters.query} onChangeText={(query) => setFilters({ ...filters, query })} />
      <View style={styles.row}>
        {(['all', 'hiragana', 'katakana'] as const).map((value) => <Chip key={value} label={value} active={filters.script_type === value} onPress={() => setFilters({ ...filters, script_type: value })} />)}
      </View>
      <View style={styles.row}>
        {(['all', 'N5', 'N4', 'uncategorized'] as const).map((value) => <Chip key={value} label={value} active={filters.jlpt_level === value} onPress={() => setFilters({ ...filters, jlpt_level: value })} />)}
      </View>
      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingBottom: 24 }}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onLongPress={() => remove(item)}>
            <Text style={styles.kana}>{item.kana}</Text>
            <Text style={styles.meaning}>{item.romaji} · {item.meaning_id}</Text>
            <Text style={styles.meta}>{item.script_type} · {item.jlpt_level} · {item.category} · {item.source}</Text>
          </Pressable>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Kosakata kosong.</Text>}
      />
    </View>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}><Text style={active ? styles.chipTextActive : styles.chipText}>{label}</Text></Pressable>;
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 16, backgroundColor: '#f8fafc' },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 12, color: '#0f172a' },
  input: { backgroundColor: 'white', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 10 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  chip: { paddingVertical: 7, paddingHorizontal: 10, borderRadius: 999, backgroundColor: '#e2e8f0' },
  chipActive: { backgroundColor: '#2563eb' },
  chipText: { color: '#334155' },
  chipTextActive: { color: 'white', fontWeight: '700' },
  card: { backgroundColor: 'white', padding: 14, borderRadius: 16, marginBottom: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  kana: { fontSize: 30, fontWeight: '800', color: '#111827' },
  meaning: { fontSize: 16, color: '#334155', marginTop: 4 },
  meta: { color: '#64748b', marginTop: 8 },
  empty: { color: '#64748b', textAlign: 'center', marginTop: 32 }
});
