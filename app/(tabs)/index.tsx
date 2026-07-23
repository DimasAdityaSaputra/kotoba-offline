import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, FlatList, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { deleteVocab, initDb, listVocab, updateVocab } from '../../src/db';
import { romajiToKana } from '../../src/kana';
import { kanaGroups } from '../../src/kanaGroups';
import { numberToJapanese } from '../../src/numberQuiz';
import { useTheme } from '../../src/theme';
import type { JlptLevel, ScriptType, VocabFilters, VocabItem } from '../../src/types';

const initialFilters: VocabFilters = { query: '', script_type: 'all', jlpt_level: 'all', category: '', group: '', review_status: 'all' };

export default function KotobaScreen() {
  const t = useTheme();
  const router = useRouter();
  const [filters, setFilters] = useState<VocabFilters>(initialFilters);
  const [items, setItems] = useState<VocabItem[]>([]);
  const [editing, setEditing] = useState<VocabItem | null>(null);
  const [learnMode, setLearnMode] = useState<'kotoba' | 'number' | 'letter'>('kotoba');
  const [form, setForm] = useState({ kana: '', romaji: '', meaning_id: '', category: '', group: '', jlpt_level: 'N5' as JlptLevel, script_type: 'hiragana' as ScriptType });

  const load = useCallback(() => {
    initDb();
    setItems(listVocab(filters));
  }, [filters]);

  useFocusEffect(load);

  function openEdit(item: VocabItem) {
    if (item.source !== 'user') return Alert.alert('Default word', 'Kosakata bawaan tidak bisa diedit. Tambah versi sendiri kalau mau custom.');
    setEditing(item);
    setForm({ kana: item.kana, romaji: item.romaji, meaning_id: item.meaning_id, category: item.category, group: item.group, jlpt_level: item.jlpt_level, script_type: item.script_type });
  }

  function changeRomaji(value: string) {
    setForm({ ...form, romaji: value, kana: romajiToKana(value, form.script_type) });
  }

  function changeScript(value: ScriptType) {
    setForm({ ...form, script_type: value, kana: romajiToKana(form.romaji, value) });
  }

  function saveEdit() {
    if (!editing) return;
    if (!form.kana.trim() || !form.meaning_id.trim()) return Alert.alert('Data kurang', 'Kana dan arti wajib diisi.');
    updateVocab(editing.id, form);
    setEditing(null);
    load();
  }

  function remove(item: VocabItem) {
    if (item.source !== 'user') return Alert.alert('Default word', 'Kosakata bawaan tidak bisa dihapus.');
    Alert.alert('Hapus kotoba?', `${item.kana} - ${item.meaning_id}`, [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: () => { deleteVocab(item.id); setEditing(null); load(); } }
    ]);
  }

  return (
    <View style={[styles.wrap, { backgroundColor: t.bg }]}>
      <Text style={[styles.title, { color: t.text, fontFamily: t.font }]}>Kotoba</Text>
      <View style={styles.learnGrid}>
        <LearnCard title="Kotoba" desc="Kosakata per bab" active={learnMode === 'kotoba'} onPress={() => setLearnMode('kotoba')} />
        <LearnCard title="Nomor" desc="Contoh + rumus" active={learnMode === 'number'} onPress={() => setLearnMode('number')} />
        <LearnCard title="Huruf" desc="Semua kana" active={learnMode === 'letter'} onPress={() => setLearnMode('letter')} />
      </View>
      {learnMode === 'number' && <NumberReference onQuiz={() => router.navigate('/quiz')} />}
      {learnMode === 'letter' && <KanaReference onWrite={() => router.navigate('/write')} />}
      {learnMode === 'kotoba' && <>
      <TextInput placeholderTextColor={t.sub} style={[styles.input, { backgroundColor: t.card, borderColor: t.border, color: t.text, fontFamily: t.font }]} placeholder="Cari kana, romaji, arti..." value={filters.query} onChangeText={(query) => setFilters({ ...filters, query })} />
      <View style={styles.row}>
        {(['all', 'hiragana', 'katakana'] as const).map((value) => <Chip key={value} label={value} active={filters.script_type === value} onPress={() => setFilters({ ...filters, script_type: value })} />)}
      </View>
      <View style={styles.row}>
        {(['all', 'N5', 'N4', 'uncategorized'] as const).map((value) => <Chip key={value} label={value} active={filters.jlpt_level === value} onPress={() => setFilters({ ...filters, jlpt_level: value })} />)}
      </View>
      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingBottom: 108 }}
        renderItem={({ item }) => (
          <Pressable style={[styles.card, { backgroundColor: t.card, borderColor: t.border }]} onPress={() => openEdit(item)} onLongPress={() => remove(item)}>
            <Text style={[styles.kana, { color: t.text, fontFamily: t.font }]}>{item.kana}</Text>
            <Text style={[styles.meaning, { color: t.label, fontFamily: t.font }]}>{item.romaji} · {item.meaning_id}</Text>
            <Text style={[styles.meta, { color: t.sub, fontFamily: t.font }]}>{item.script_type} · {item.jlpt_level} · {item.category} · {item.group} · {item.source}</Text>
          </Pressable>
        )}
        ListEmptyComponent={<Text style={[styles.empty, { color: t.sub, fontFamily: t.font }]}>Kosakata kosong.</Text>}
      />
      </>}

      <Modal visible={!!editing} animationType="slide" onRequestClose={() => setEditing(null)}>
        <ScrollView style={[styles.wrap, { backgroundColor: t.bg }]} contentContainerStyle={{ paddingBottom: 108 }}>
          <Text style={[styles.title, { color: t.text, fontFamily: t.font }]}>Edit Kotoba</Text>
          <Field label="Kana" value={form.kana} onChangeText={(kana) => setForm({ ...form, kana })} />
          <Field label="Romaji" value={form.romaji} onChangeText={changeRomaji} />
          <Field label="Arti" value={form.meaning_id} onChangeText={(meaning_id) => setForm({ ...form, meaning_id })} />
          <Field label="Kategori" value={form.category} onChangeText={(category) => setForm({ ...form, category })} />
          <Field label="Group/Bab" value={form.group} onChangeText={(group) => setForm({ ...form, group })} />
          <Text style={[styles.label, { color: t.label, fontFamily: t.font }]}>Script</Text>
          <View style={styles.row}>{(['hiragana', 'katakana'] as const).map((value) => <Chip key={value} label={value} active={form.script_type === value} onPress={() => changeScript(value)} />)}</View>
          <Text style={[styles.label, { color: t.label, fontFamily: t.font }]}>JLPT</Text>
          <View style={styles.row}>{(['N5', 'N4', 'uncategorized'] as const).map((value) => <Chip key={value} label={value} active={form.jlpt_level === value} onPress={() => setForm({ ...form, jlpt_level: value })} />)}</View>
          <View style={styles.actions}>
            <Pressable style={styles.button} onPress={saveEdit}><Text style={styles.buttonText}>Simpan</Text></Pressable>
            <Pressable style={[styles.button, styles.muted]} onPress={() => setEditing(null)}><Text style={styles.buttonText}>Batal</Text></Pressable>
          </View>
          {editing && <Pressable style={[styles.button, styles.danger]} onPress={() => remove(editing)}><Text style={styles.buttonText}>Hapus Kotoba</Text></Pressable>}
        </ScrollView>
      </Modal>
    </View>
  );
}

function NumberReference({ onQuiz }: { onQuiz: () => void }) {
  const t = useTheme();
  const [numberInput, setNumberInput] = useState('121');
  const value = Math.max(0, Math.min(100000, Number(numberInput.replace(/\D/g, '') || 0)));
  const converted = numberToJapanese(value);
  const examples = [121,1230,1670,1989,0,1,2,3,4,5,6,7,8,9,10,11,20,21,100,300,600,800,1000,3000,8000,10000,25000,100000];
  return <ScrollView style={styles.referenceBox} contentContainerStyle={{ paddingBottom: 108 }}>
    <Text style={[styles.refTitle, { color: t.text, fontFamily: t.font }]}>Nomor Jepang</Text>
    <Text style={[styles.refNote, { color: t.sub, fontFamily: t.font }]}>Cara mikirnya: pecah angka dari kiri ke kanan. Ribuan → ratusan → puluhan → satuan. Kalau digit 1 di depan hyaku/sen biasanya nama satuannya dibuang: 100 = hyaku, 1000 = sen. Tapi 10000 tetap ichiman.</Text>

    <View style={[styles.ruleCard, { backgroundColor: t.card, borderColor: t.border }]}>
      <Text style={[styles.ruleHead, { color: t.text, fontFamily: t.font }]}>Rumus inti</Text>
      {[
        '1-9: ichi, ni, san, yon, go, roku, nana, hachi, kyuu',
        '10: juu. 11 = juu ichi. 20 = ni juu. 21 = ni juu ichi',
        '100: hyaku. 200 = ni hyaku. 300 = sanbyaku. 600 = roppyaku. 800 = happyaku',
        '1000: sen. 2000 = ni sen. 3000 = sanzen. 8000 = hassen',
        '10000: ichi man. 25000 = ni man go sen'
      ].map((row) => <Text key={row} style={[styles.ruleText, { color: t.label, fontFamily: t.font }]}>{row}</Text>)}
    </View>

    <View style={[styles.ruleCard, { backgroundColor: t.card, borderColor: t.border }]}>
      <Text style={[styles.ruleHead, { color: t.text, fontFamily: t.font }]}>Contoh dibedah</Text>
      {[
        ['121', '100 + 20 + 1', 'hyaku + ni juu + ichi', 'hyaku ni juu ichi'],
        ['1230', '1000 + 200 + 30', 'sen + ni hyaku + san juu', 'sen ni hyaku san juu'],
        ['1670', '1000 + 600 + 70', 'sen + roppyaku + nana juu', 'sen roppyaku nana juu'],
        ['1989', '1000 + 900 + 80 + 9', 'sen + kyuu hyaku + hachi juu + kyuu', 'sen kyuu hyaku hachi juu kyuu']
      ].map(([num, split, parts, final]) => <View key={num} style={styles.breakdown}><Text style={[styles.ruleHead, { color: t.text, fontFamily: t.font }]}>{num}</Text><Text style={[styles.ruleText, { color: t.label, fontFamily: t.font }]}>{split}</Text><Text style={[styles.ruleText, { color: t.label, fontFamily: t.font }]}>{parts}</Text><Text style={[styles.refRomaji, { color: t.primary, fontFamily: t.font }]}>{final}</Text><Text style={[styles.refMini, { color: t.sub, fontFamily: t.font }]}>{romajiToKana(final, 'hiragana', true)}</Text></View>)}
    </View>

    <Text style={[styles.refTitle, { color: t.text, fontFamily: t.font }]}>Coba angka sendiri</Text>
    <TextInput keyboardType="number-pad" placeholderTextColor={t.sub} style={[styles.input, { backgroundColor: t.card, borderColor: t.border, color: t.text, fontFamily: t.font }]} value={numberInput} onChangeText={setNumberInput} placeholder="contoh: 1989" />
    <View style={[styles.ruleCard, { backgroundColor: t.card, borderColor: t.border }]}>
      <Text style={[styles.refKana, { color: t.text, fontFamily: t.font }]}>{value}</Text>
      <Text style={[styles.refRomaji, { color: t.primary, fontFamily: t.font }]}>{converted}</Text>
      <Text style={[styles.refKana, { color: t.text, fontFamily: t.font }]}>{romajiToKana(converted, 'hiragana', true)}</Text>
    </View>

    <View style={styles.numberGrid}>{examples.map((item) => <View key={item} style={[styles.refCell, { backgroundColor: t.card, borderColor: t.border }]}><Text style={[styles.refKana, { color: t.text, fontFamily: t.font }]}>{item}</Text><Text style={[styles.refRomaji, { color: t.sub, fontFamily: t.font }]}>{numberToJapanese(item)}</Text><Text style={[styles.refMini, { color: t.sub, fontFamily: t.font }]}>{romajiToKana(numberToJapanese(item), 'hiragana', true)}</Text></View>)}</View>
    <Pressable style={[styles.fullButton, { backgroundColor: t.primary }]} onPress={onQuiz}><Text style={styles.buttonText}>Latihan quiz nomor</Text></Pressable>
  </ScrollView>;
}

function KanaReference({ onWrite }: { onWrite: () => void }) {
  const t = useTheme();
  return <ScrollView style={styles.referenceBox} contentContainerStyle={{ paddingBottom: 108 }}>
    <Text style={[styles.refTitle, { color: t.text, fontFamily: t.font }]}>Huruf Kana</Text>
    <Text style={[styles.refNote, { color: t.sub, fontFamily: t.font }]}>Hiragana buat kata Jepang asli. Katakana buat serapan/nama/penekanan. Yōon pakai huruf kecil: き + ゃ = きゃ.</Text>
    {kanaGroups.map((group) => <View key={group.label} style={[styles.kanaGroup, { backgroundColor: t.card, borderColor: t.border }]}><Text style={[styles.groupTitle, { color: t.text, fontFamily: t.font }]}>{group.label}</Text><View style={styles.kanaGrid}>{group.romaji.map((romaji, index) => <View key={`${group.label}-${romaji}-${index}`} style={[styles.kanaCell, { backgroundColor: t.card2 }]}><Text style={[styles.refKana, { color: t.text, fontFamily: t.font }]}>{group.hiragana[index]}</Text><Text style={[styles.refKana, { color: t.text, fontFamily: t.font }]}>{group.katakana[index]}</Text><Text style={[styles.refRomaji, { color: t.sub, fontFamily: t.font }]}>{romaji}</Text></View>)}</View></View>)}
    <Pressable style={[styles.fullButton, { backgroundColor: t.primary }]} onPress={onWrite}><Text style={styles.buttonText}>Latihan nulis huruf</Text></Pressable>
  </ScrollView>;
}

function LearnCard({ title, desc, active, onPress }: { title: string; desc: string; active?: boolean; onPress?: () => void }) {
  const t = useTheme();
  return <Pressable onPress={onPress} style={[styles.learnCard, { backgroundColor: active ? t.primary : t.card, borderColor: active ? t.primary : t.border }]}><Text style={[styles.learnTitle, { color: active ? 'white' : t.text, fontFamily: t.font }]}>{title}</Text><Text style={[styles.learnDesc, { color: active ? '#dbeafe' : t.sub, fontFamily: t.font }]}>{desc}</Text></Pressable>;
}

function Field(props: { label: string; value: string; onChangeText: (value: string) => void }) {
  const t = useTheme();
  return <View><Text style={[styles.label, { color: t.label, fontFamily: t.font }]}>{props.label}</Text><TextInput placeholderTextColor={t.sub} style={[styles.input, { backgroundColor: t.card, borderColor: t.border, color: t.text, fontFamily: t.font }]} {...props} /></View>;
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const t = useTheme();
  return <Pressable onPress={onPress} style={[styles.chip, { backgroundColor: active ? t.primary : t.card2 }]}><Text style={[active ? styles.chipTextActive : styles.chipText, { color: active ? 'white' : t.label, fontFamily: t.font }]}>{label}</Text></Pressable>;
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 16, backgroundColor: 'transparent' },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 12, color: '#0f172a' },
  input: { backgroundColor: 'transparent', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 10 },
  label: { fontWeight: '700', marginBottom: 6, marginTop: 12, color: '#334155' },
  learnGrid: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  learnCard: { flex: 1, borderWidth: 1, borderRadius: 16, padding: 12, minHeight: 74 },
  learnTitle: { fontWeight: '900', marginBottom: 4 },
  learnDesc: { fontSize: 12, lineHeight: 16 },
  referenceBox: { flex: 1 },
  refTitle: { fontSize: 22, fontWeight: '900', marginBottom: 8 },
  refNote: { lineHeight: 20, marginBottom: 12 },
  ruleCard: { borderWidth: 1, borderRadius: 16, padding: 12, marginBottom: 12, gap: 6 },
  ruleHead: { fontSize: 16, fontWeight: '900', marginBottom: 2 },
  ruleText: { fontWeight: '800', lineHeight: 20 },
  breakdown: { marginBottom: 12 },
  numberGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  refCell: { width: '31.8%', borderWidth: 1, borderRadius: 16, padding: 10, minHeight: 96 },
  refKana: { fontSize: 22, fontWeight: '900' },
  refRomaji: { fontWeight: '800', marginTop: 4 },
  refMini: { marginTop: 4, fontSize: 12 },
  kanaGroup: { borderWidth: 1, borderRadius: 18, padding: 12, marginBottom: 12 },
  groupTitle: { fontSize: 16, fontWeight: '900', marginBottom: 8 },
  kanaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  kanaCell: { width: 74, borderRadius: 14, padding: 10, alignItems: 'center' },
  fullButton: { alignItems: 'center', padding: 14, borderRadius: 16, marginTop: 6, marginBottom: 12 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  chip: { paddingVertical: 7, paddingHorizontal: 10, borderRadius: 999, backgroundColor: '#e2e8f0' },
  chipActive: { backgroundColor: '#2563eb' },
  chipText: { color: '#334155' },
  chipTextActive: { color: 'white', fontWeight: '700' },
  card: { backgroundColor: 'transparent', padding: 14, borderRadius: 16, marginBottom: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  kana: { fontSize: 30, fontWeight: '800', color: '#111827' },
  meaning: { fontSize: 16, color: '#334155', marginTop: 4 },
  meta: { color: '#64748b', marginTop: 8 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 20, marginBottom: 10 },
  button: { flex: 1, backgroundColor: '#2563eb', padding: 14, borderRadius: 14, alignItems: 'center' },
  muted: { backgroundColor: '#64748b' },
  danger: { backgroundColor: '#dc2626' },
  buttonText: { color: 'white', fontWeight: '800' },
  empty: { color: '#64748b', textAlign: 'center', marginTop: 32 }
});
