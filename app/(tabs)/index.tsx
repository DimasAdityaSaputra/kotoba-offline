import { useFocusEffect, useRouter } from 'expo-router';
import { memo, useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Animated, FlatList, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { deleteVocab, initDb, listVocab, updateVocab } from '../../src/db';
import { romajiToKana } from '../../src/kana';
import { kanaGroups } from '../../src/kanaGroups';
import { BASIC_DRILLS, BASIC_FLOW, BASIC_LESSONS, BASIC_PATTERNS, BASIC_PHRASES, BASIC_SENTENCES } from '../../src/basicLessons';
import { numberToJapanese } from '../../src/numberQuiz';
import { speakJapanese } from '../../src/speech';
import { useTheme } from '../../src/theme';
import type { JlptLevel, ScriptType, VocabFilters, VocabItem } from '../../src/types';

const initialFilters: VocabFilters = { query: '', script_type: 'all', jlpt_level: 'all', category: '', group: '', review_status: 'all' };

export default function KotobaScreen() {
  const t = useTheme();
  const router = useRouter();
  const [filters, setFilters] = useState<VocabFilters>(initialFilters);
  const [items, setItems] = useState<VocabItem[]>([]);
  const [editing, setEditing] = useState<VocabItem | null>(null);
  const [learnMode, setLearnMode] = useState<'kotoba' | 'number' | 'letter' | 'basic'>('kotoba');
  const [menuOpen, setMenuOpen] = useState(false);
  const [form, setForm] = useState({ kana: '', romaji: '', meaning_id: '', category: '', group: '', jlpt_level: 'N5' as JlptLevel, script_type: 'hiragana' as ScriptType });
  const deferredQuery = useDeferredValue(filters.query);
  const dbFilters = useMemo(() => ({ ...filters, query: deferredQuery }), [filters, deferredQuery]);

  const load = useCallback(() => {
    initDb();
    setItems(listVocab(dbFilters));
  }, [dbFilters]);

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

  const stats = useMemo(() => getKotobaStats(items), [items]);

  return (
    <View style={[styles.wrap, { backgroundColor: t.bg }]}>
      <View style={styles.kotobaShell}>
        <View style={styles.contentPane}>
          {learnMode === 'kotoba' && <>
            <View style={[styles.compactHead, { backgroundColor: t.card, borderColor: t.border }]}>
              <Pressable style={[styles.menuButton, { backgroundColor: t.card2 }]} onPress={() => setMenuOpen(true)}><Text style={[styles.menuIcon, { color: t.text, fontFamily: t.font }]}>☰</Text></Pressable>
              <View style={styles.compactTitleBox}>
                <Text style={[styles.heroKicker, { color: t.primary, fontFamily: t.font }]}>Library</Text>
                <Text style={[styles.compactTitle, { color: t.text, fontFamily: t.font }]}>Kotoba</Text>
              </View>
              <Pressable style={[styles.heroAction, { backgroundColor: t.primary }]} onPress={() => router.navigate('/add')}>
                <Text style={[styles.heroActionText, { fontFamily: t.font }]}>＋</Text>
              </Pressable>
            </View>
            <View style={styles.miniStats}>
              <Stat label="Total" value={String(stats.total)} />
              <Stat label="N5" value={String(stats.n5)} />
              <Stat label="User" value={String(stats.user)} />
            </View>
            <View style={[styles.searchPanel, { backgroundColor: t.card, borderColor: t.border }]}>
              <TextInput placeholderTextColor={t.sub} style={[styles.searchInput, { backgroundColor: t.card2, color: t.text, fontFamily: t.font }]} placeholder="Cari..." value={filters.query} onChangeText={(query) => setFilters({ ...filters, query })} />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
                {(['all', 'hiragana', 'katakana'] as const).map((value) => <Chip key={value} label={value} active={filters.script_type === value} onPress={() => setFilters({ ...filters, script_type: value })} />)}
                {(['all', 'N5', 'N4', 'uncategorized'] as const).map((value) => <Chip key={value} label={value} active={filters.jlpt_level === value} onPress={() => setFilters({ ...filters, jlpt_level: value })} />)}
              </ScrollView>
            </View>
            <FlatList
              data={items}
              keyExtractor={(item) => String(item.id)}
              contentContainerStyle={{ paddingBottom: 108 }}
              initialNumToRender={10}
              maxToRenderPerBatch={10}
              windowSize={7}
              removeClippedSubviews
              renderItem={({ item }) => (
                <Pressable style={[styles.card, { backgroundColor: t.card, borderColor: t.border }]} onPress={() => openEdit(item)} onLongPress={() => remove(item)}>
                  <View style={styles.cardMain}>
                    <View style={styles.wordTop}><Text style={[styles.kana, { color: t.text, fontFamily: t.font }]}>{item.kana}</Text><Pressable style={[styles.speakButton, { backgroundColor: t.card2 }]} onPress={() => speakJapanese(item.kana)}><Text style={[styles.speakText, { color: t.primary }]}>▶</Text></Pressable></View>
                    <Text style={[styles.meaning, { color: t.text, fontFamily: t.font }]} numberOfLines={1}>{item.meaning_id}</Text>
                    <Text style={[styles.romaji, { color: t.primary, fontFamily: t.font }]} numberOfLines={1}>{item.romaji}</Text>
                    <View style={styles.tagRow}><Pill text={item.script_type} /><Pill text={item.jlpt_level} /><Pill text={item.group || 'bab'} /></View>
                  </View>
                </Pressable>
              )}
              ListEmptyComponent={<Text style={[styles.empty, { color: t.sub, fontFamily: t.font }]}>Kosakata kosong.</Text>}
            />
          </>}
          {learnMode === 'basic' && <>
            <MiniHeader title="Basic" onMenu={() => setMenuOpen(true)} />
            <BasicReference />
          </>}
          {learnMode === 'letter' && <>
            <MiniHeader title="Huruf" onMenu={() => setMenuOpen(true)} />
            <KanaReference onWrite={() => router.navigate('/write')} />
          </>}
          {learnMode === 'number' && <>
            <MiniHeader title="Nomor" onMenu={() => setMenuOpen(true)} />
            <NumberReference onQuiz={() => router.navigate('/quiz')} />
          </>}
        </View>
      </View>
      <Modal transparent visible={menuOpen} animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <Pressable style={styles.menuBackdrop} onPress={() => setMenuOpen(false)}>
          <View style={[styles.menuSheet, { backgroundColor: t.card, borderColor: t.border }]}>
            <MenuItem title="Kotoba" active={learnMode === 'kotoba'} onPress={() => { setLearnMode('kotoba'); setMenuOpen(false); }} />
            <MenuItem title="Basic" active={learnMode === 'basic'} onPress={() => { setLearnMode('basic'); setMenuOpen(false); }} />
            <MenuItem title="Huruf" active={learnMode === 'letter'} onPress={() => { setLearnMode('letter'); setMenuOpen(false); }} />
            <MenuItem title="Nomor" active={learnMode === 'number'} onPress={() => { setLearnMode('number'); setMenuOpen(false); }} />
          </View>
        </Pressable>
      </Modal>

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

const NUMBER_EXAMPLES = [121,1230,1670,1989,0,1,2,3,4,5,6,7,8,9,10,11,20,21,100,300,600,800,1000,3000,8000,10000,25000,100000];
const NUMBER_RULES = [
  '1-9: ichi, ni, san, yon, go, roku, nana, hachi, kyuu',
  '10: juu. 11 = juu ichi. 20 = ni juu. 21 = ni juu ichi',
  '100: hyaku. 200 = ni hyaku. 300 = sanbyaku. 600 = roppyaku. 800 = happyaku',
  '1000: sen. 2000 = ni sen. 3000 = sanzen. 8000 = hassen',
  '10000: ichi man. 25000 = ni man go sen'
];
const NUMBER_BREAKDOWNS = [
  ['121', '100 + 20 + 1', 'hyaku + ni juu + ichi', 'hyaku ni juu ichi'],
  ['1230', '1000 + 200 + 30', 'sen + ni hyaku + san juu', 'sen ni hyaku san juu'],
  ['1670', '1000 + 600 + 70', 'sen + roppyaku + nana juu', 'sen roppyaku nana juu'],
  ['1989', '1000 + 900 + 80 + 9', 'sen + kyuu hyaku + hachi juu + kyuu', 'sen kyuu hyaku hachi juu kyuu']
];


type BasicSection = 'flow' | 'patterns' | 'sentences' | 'particles' | 'phrases' | 'drills';

function BasicReference() {
  const t = useTheme();
  const [section, setSection] = useState<BasicSection>('flow');
  return <ScrollView style={styles.referenceBox} contentContainerStyle={{ paddingBottom: 108 }}>
    <Text style={[styles.refTitle, { color: t.text, fontFamily: t.font }]}>Basic Jepang</Text>
    <Text style={[styles.refNote, { color: t.sub, fontFamily: t.font }]}>Pilih kategori. Belajar pendek-pendek biar otak nggak jadi gorengan.</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
      <Chip label="Mulai" active={section === 'flow'} onPress={() => setSection('flow')} />
      <Chip label="Pola" active={section === 'patterns'} onPress={() => setSection('patterns')} />
      <Chip label="+ / -" active={section === 'sentences'} onPress={() => setSection('sentences')} />
      <Chip label="Partikel" active={section === 'particles'} onPress={() => setSection('particles')} />
      <Chip label="Harian" active={section === 'phrases'} onPress={() => setSection('phrases')} />
      <Chip label="Latihan" active={section === 'drills'} onPress={() => setSection('drills')} />
    </ScrollView>

    {section === 'flow' && <>
      <View style={[styles.ruleCard, { backgroundColor: t.card, borderColor: t.border }]}>
        <Text style={[styles.ruleHead, { color: t.text, fontFamily: t.font }]}>Urutan belajar</Text>
        {BASIC_FLOW.map((row, index) => <Text key={row} style={[styles.ruleText, { color: t.label, fontFamily: t.font }]}>{index + 1}. {row}</Text>)}
      </View>
    </>}

    {section === 'patterns' && <>
      <Text style={[styles.refTitle, { color: t.text, fontFamily: t.font }]}>Pola kalimat inti</Text>
      {BASIC_PATTERNS.map((pattern) => <View key={pattern.title} style={[styles.lessonCard, { backgroundColor: t.card, borderColor: t.border }]}>
        <Text style={[styles.lessonSubtitle, { color: t.primary, fontFamily: t.font }]}>{pattern.title}</Text>
        <Text style={[styles.ruleHead, { color: t.text, fontFamily: t.font }]}>{pattern.formula}</Text>
        <Text style={[styles.ruleText, { color: t.label, fontFamily: t.font }]}>{pattern.use}</Text>
        <ExampleRow label="Contoh" text={pattern.example} good />
        <Text style={[styles.refMini, { color: t.sub, fontFamily: t.font }]}>{pattern.meaning}</Text>
        <Text style={[styles.ruleText, { color: t.label, fontFamily: t.font }]}>{pattern.note}</Text>
      </View>)}
    </>}

    {section === 'sentences' && <>
      <Text style={[styles.refTitle, { color: t.text, fontFamily: t.font }]}>Positif & negatif</Text>
      <Text style={[styles.refNote, { color: t.sub, fontFamily: t.font }]}>Sopan untuk orang baru/guru/kerja. Casual untuk teman dekat.</Text>
      {BASIC_SENTENCES.map((row) => <View key={`${row.category}-${row.polite}`} style={[styles.lessonCard, { backgroundColor: t.card, borderColor: t.border }]}>
        <Text style={[styles.lessonSubtitle, { color: t.primary, fontFamily: t.font }]}>{row.category}</Text>
        <Text style={[styles.ruleText, { color: t.label, fontFamily: t.font }]}>{row.pattern}</Text>
        <ExampleRow label="Sopan" text={row.polite} good />
        <ExampleRow label="Casual" text={row.casual} good />
        <Text style={[styles.refMini, { color: t.sub, fontFamily: t.font }]}>{row.meaning}</Text>
        <Text style={[styles.ruleText, { color: t.label, fontFamily: t.font }]}>{row.note}</Text>
      </View>)}
    </>}

    {section === 'particles' && <>
      <Text style={[styles.refTitle, { color: t.text, fontFamily: t.font }]}>Partikel inti</Text>
      <Text style={[styles.refNote, { color: t.sub, fontFamily: t.font }]}>Partikel itu penanda fungsi kata. Hafal fungsi, bukan terjemahan mentah.</Text>
      {BASIC_LESSONS.map((lesson) => <View key={lesson.title} style={[styles.lessonCard, { backgroundColor: t.card, borderColor: t.border }]}>
        <View style={styles.lessonHead}>
          <Text style={[styles.lessonParticle, { color: t.text, fontFamily: t.font }]}>{lesson.title}</Text>
          <View style={{ flex: 1 }}><Text style={[styles.lessonSubtitle, { color: t.primary, fontFamily: t.font }]}>{lesson.subtitle}</Text><Text style={[styles.ruleText, { color: t.label, fontFamily: t.font }]}>{lesson.use}</Text></View>
        </View>
        <ExampleRow label="Benar" text={lesson.right} good />
        <ExampleRow label="Salah" text={lesson.wrong} />
        <Text style={[styles.refMini, { color: t.sub, fontFamily: t.font }]}>{lesson.meaning}</Text>
        <Text style={[styles.ruleText, { color: t.label, fontFamily: t.font }]}>{lesson.note}</Text>
      </View>)}
    </>}

    {section === 'phrases' && <>
      <Text style={[styles.refTitle, { color: t.text, fontFamily: t.font }]}>Frasa harian</Text>
      <Text style={[styles.refNote, { color: t.sub, fontFamily: t.font }]}>Kata tanya, waktu, lokasi, dan survival phrase. Ini yang kepake duluan di dunia nyata.</Text>
      {BASIC_PHRASES.map((phrase) => <View key={`${phrase.group}-${phrase.kana}`} style={[styles.lessonCard, { backgroundColor: t.card, borderColor: t.border }]}>
        <Text style={[styles.lessonSubtitle, { color: t.primary, fontFamily: t.font }]}>{phrase.group}</Text>
        <ExampleRow label="Kana" text={phrase.kana} good />
        <Text style={[styles.refMini, { color: t.sub, fontFamily: t.font }]}>{phrase.meaning}</Text>
        <Text style={[styles.ruleText, { color: t.label, fontFamily: t.font }]}>{phrase.use}</Text>
      </View>)}
    </>}

    {section === 'drills' && <>
      <Text style={[styles.refTitle, { color: t.text, fontFamily: t.font }]}>Latihan cepat</Text>
      {BASIC_DRILLS.map((drill) => <View key={drill.prompt} style={[styles.lessonCard, { backgroundColor: t.card, borderColor: t.border }]}>
        <Text style={[styles.ruleHead, { color: t.text, fontFamily: t.font }]}>{drill.prompt}</Text>
        <Text style={[styles.refRomaji, { color: t.primary, fontFamily: t.font }]}>Jawaban: {drill.answer}</Text>
        <Text style={[styles.ruleText, { color: t.label, fontFamily: t.font }]}>{drill.reason}</Text>
      </View>)}
    </>}
  </ScrollView>;
}

function ExampleRow({ label, text, good }: { label: string; text: string; good?: boolean }) {
  const t = useTheme();
  return <View style={[styles.exampleRow, { backgroundColor: t.card2 }]}>
    <Text style={[styles.exampleLabel, { color: good ? '#16a34a' : t.danger, fontFamily: t.font }]}>{label}</Text>
    <Text style={[styles.exampleText, { color: t.text, fontFamily: t.font }]}>{text}</Text>
    <Pressable style={[styles.speakButton, { backgroundColor: t.card }]} onPress={() => speakJapanese(text)}><Text style={[styles.speakText, { color: t.primary }]}>▶</Text></Pressable>
  </View>;
}

const NumberReference = memo(function NumberReference({ onQuiz }: { onQuiz: () => void }) {
  const t = useTheme();
  const [numberInput, setNumberInput] = useState('121');
  const value = Math.max(0, Math.min(100000, Number(numberInput.replace(/\D/g, '') || 0)));
  const converted = numberToJapanese(value);
  return <ScrollView style={styles.referenceBox} contentContainerStyle={{ paddingBottom: 108 }}>
    <Text style={[styles.refTitle, { color: t.text, fontFamily: t.font }]}>Nomor Jepang</Text>
    <Text style={[styles.refNote, { color: t.sub, fontFamily: t.font }]}>Cara mikirnya: pecah angka dari kiri ke kanan. Ribuan → ratusan → puluhan → satuan. Kalau digit 1 di depan hyaku/sen biasanya nama satuannya dibuang: 100 = hyaku, 1000 = sen. Tapi 10000 tetap ichiman.</Text>

    <View style={[styles.ruleCard, { backgroundColor: t.card, borderColor: t.border }]}>
      <Text style={[styles.ruleHead, { color: t.text, fontFamily: t.font }]}>Rumus inti</Text>
      {NUMBER_RULES.map((row) => <Text key={row} style={[styles.ruleText, { color: t.label, fontFamily: t.font }]}>{row}</Text>)}
    </View>

    <View style={[styles.ruleCard, { backgroundColor: t.card, borderColor: t.border }]}>
      <Text style={[styles.ruleHead, { color: t.text, fontFamily: t.font }]}>Contoh dibedah</Text>
      {NUMBER_BREAKDOWNS.map(([num, split, parts, final]) => <View key={num} style={styles.breakdown}><Text style={[styles.ruleHead, { color: t.text, fontFamily: t.font }]}>{num}</Text><Text style={[styles.ruleText, { color: t.label, fontFamily: t.font }]}>{split}</Text><Text style={[styles.ruleText, { color: t.label, fontFamily: t.font }]}>{parts}</Text><Text style={[styles.refRomaji, { color: t.primary, fontFamily: t.font }]}>{final}</Text><Text style={[styles.refMini, { color: t.sub, fontFamily: t.font }]}>{romajiToKana(final, 'hiragana', true)}</Text></View>)}
    </View>

    <Text style={[styles.refTitle, { color: t.text, fontFamily: t.font }]}>Coba angka sendiri</Text>
    <TextInput keyboardType="number-pad" placeholderTextColor={t.sub} style={[styles.input, { backgroundColor: t.card, borderColor: t.border, color: t.text, fontFamily: t.font }]} value={numberInput} onChangeText={setNumberInput} placeholder="contoh: 1989" />
    <View style={[styles.ruleCard, { backgroundColor: t.card, borderColor: t.border }]}>
      <Text style={[styles.refKana, { color: t.text, fontFamily: t.font }]}>{value}</Text>
      <Text style={[styles.refRomaji, { color: t.primary, fontFamily: t.font }]}>{converted}</Text>
      <Text style={[styles.refKana, { color: t.text, fontFamily: t.font }]}>{romajiToKana(converted, 'hiragana', true)}</Text>
      <Pressable style={[styles.fullButton, { backgroundColor: t.primary }]} onPress={() => speakJapanese(romajiToKana(converted, 'hiragana', true))}><Text style={styles.buttonText}>Dengar Jepang</Text></Pressable>
    </View>

    <View style={styles.numberGrid}>{NUMBER_EXAMPLES.map((item) => <View key={item} style={[styles.refCell, { backgroundColor: t.card, borderColor: t.border }]}><Text style={[styles.refKana, { color: t.text, fontFamily: t.font }]}>{item}</Text><Text style={[styles.refRomaji, { color: t.sub, fontFamily: t.font }]}>{numberToJapanese(item)}</Text><Text style={[styles.refMini, { color: t.sub, fontFamily: t.font }]}>{romajiToKana(numberToJapanese(item), 'hiragana', true)}</Text></View>)}</View>
    <Pressable style={[styles.fullButton, { backgroundColor: t.primary }]} onPress={onQuiz}><Text style={styles.buttonText}>Latihan quiz nomor</Text></Pressable>
  </ScrollView>;
});

const KanaReference = memo(function KanaReference({ onWrite }: { onWrite: () => void }) {
  const t = useTheme();
  return <ScrollView style={styles.referenceBox} contentContainerStyle={{ paddingBottom: 108 }}>
    <Text style={[styles.refTitle, { color: t.text, fontFamily: t.font }]}>Huruf Kana</Text>
    <Text style={[styles.refNote, { color: t.sub, fontFamily: t.font }]}>Hiragana buat kata Jepang asli. Katakana buat serapan/nama/penekanan. Yōon pakai huruf kecil: き + ゃ = きゃ.</Text>
    {kanaGroups.map((group) => <View key={group.label} style={[styles.kanaGroup, { backgroundColor: t.card, borderColor: t.border }]}><Text style={[styles.groupTitle, { color: t.text, fontFamily: t.font }]}>{group.label}</Text><View style={styles.kanaGrid}>{group.romaji.map((romaji, index) => <Pressable key={`${group.label}-${romaji}-${index}`} onPress={() => speakJapanese(group.hiragana[index])} style={[styles.kanaCell, { backgroundColor: t.card2 }]}><Text style={[styles.refKana, { color: t.text, fontFamily: t.font }]}>{group.hiragana[index]}</Text><Text style={[styles.refKana, { color: t.text, fontFamily: t.font }]}>{group.katakana[index]}</Text><Text style={[styles.refRomaji, { color: t.sub, fontFamily: t.font }]}>{romaji}</Text></Pressable>)}</View></View>)}
    <Pressable style={[styles.fullButton, { backgroundColor: t.primary }]} onPress={onWrite}><Text style={styles.buttonText}>Latihan nulis huruf</Text></Pressable>
  </ScrollView>;
});

function getKotobaStats(items: VocabItem[]) {
  return {
    total: items.length,
    n5: items.filter((item) => item.jlpt_level === 'N5').length,
    user: items.filter((item) => item.source === 'user').length
  };
}

function Stat({ label, value }: { label: string; value: string }) {
  const t = useTheme();
  return <View style={[styles.statCard, { backgroundColor: t.card2 }]}><Text style={[styles.statValue, { color: t.text, fontFamily: t.font }]}>{value}</Text><Text style={[styles.statLabel, { color: t.sub, fontFamily: t.font }]}>{label}</Text></View>;
}

function Pill({ text }: { text: string }) {
  const t = useTheme();
  return <Text style={[styles.pill, { backgroundColor: t.card2, color: t.sub, fontFamily: t.font }]} numberOfLines={1}>{text}</Text>;
}

function MiniHeader({ title, onMenu }: { title: string; onMenu: () => void }) {
  const t = useTheme();
  return <View style={[styles.compactHead, { backgroundColor: t.card, borderColor: t.border }]}>
    <Pressable style={[styles.menuButton, { backgroundColor: t.card2 }]} onPress={onMenu}><Text style={[styles.menuIcon, { color: t.text, fontFamily: t.font }]}>☰</Text></Pressable>
    <Text style={[styles.compactTitle, { color: t.text, fontFamily: t.font }]}>{title}</Text>
  </View>;
}

function MenuItem({ title, active, onPress }: { title: string; active: boolean; onPress: () => void }) {
  const t = useTheme();
  return <Pressable onPress={onPress} style={[styles.menuItem, { backgroundColor: active ? t.primary : t.card2 }]}><Text style={[styles.menuText, { color: active ? 'white' : t.label, fontFamily: t.font }]}>{title}</Text></Pressable>;
}

function SideTab({ title, active, onPress }: { title: string; active: boolean; onPress: () => void }) {
  const t = useTheme();
  const scale = useRef(new Animated.Value(1)).current;
  useEffect(() => { Animated.spring(scale, { toValue: active ? 1.04 : 1, useNativeDriver: true, stiffness: 260, damping: 20 }).start(); }, [active, scale]);
  return <Animated.View style={{ transform: [{ scale }] }}><Pressable onPress={onPress} style={[styles.sideTab, { backgroundColor: active ? t.primary : t.card2 }]}><Text style={[styles.sideTabText, { color: active ? 'white' : t.label, fontFamily: t.font }]}>{title}</Text></Pressable></Animated.View>;
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
  wrap: { flex: 1, paddingHorizontal: 12, paddingBottom: 12, paddingTop: 0, backgroundColor: 'transparent' },
  kotobaShell: { flex: 1 },
  sideRail: { width: 76, borderWidth: 1, borderRadius: 22, padding: 8, gap: 8, alignSelf: 'flex-start' },
  sideTab: { minHeight: 54, borderRadius: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  sideTabText: { fontSize: 12, fontWeight: '900' },
  contentPane: { flex: 1, minWidth: 0 },
  compactHead: { borderWidth: 1, borderRadius: 18, padding: 10, marginBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  compactTitleBox: { flex: 1 },
  menuButton: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  menuIcon: { fontSize: 22, fontWeight: '900' },
  menuBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', paddingTop: 118, paddingHorizontal: 16 },
  menuSheet: { width: 172, borderWidth: 1, borderRadius: 22, padding: 8, gap: 8 },
  menuItem: { minHeight: 48, borderRadius: 15, justifyContent: 'center', paddingHorizontal: 14 },
  menuText: { fontSize: 15, fontWeight: '900' },
  compactTitle: { fontSize: 22, fontWeight: '900' },
  miniStats: { flexDirection: 'row', gap: 6, marginBottom: 8 },
  hero: { borderWidth: 1, borderRadius: 24, padding: 16, marginBottom: 12 },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  heroKicker: { fontSize: 12, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 3 },
  heroTitle: { fontSize: 24, fontWeight: '900' },
  heroAction: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  heroActionText: { color: 'white', fontSize: 26, fontWeight: '900', marginTop: -2 },
  statsRow: { flexDirection: 'row', gap: 8 },
  statCard: { flex: 1, borderRadius: 16, padding: 10 },
  statValue: { fontSize: 20, fontWeight: '900' },
  statLabel: { fontSize: 12, fontWeight: '800', marginTop: 2 },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 12, color: '#0f172a' },
  input: { backgroundColor: 'transparent', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 10 },
  searchPanel: { borderWidth: 1, borderRadius: 16, padding: 8, marginBottom: 8 },
  searchInput: { borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 8, minHeight: 38 },
  filterLabel: { fontSize: 12, fontWeight: '900', textTransform: 'uppercase', marginBottom: 7 },
  label: { fontWeight: '700', marginBottom: 6, marginTop: 12, color: '#334155' },
  learnGrid: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  learnCard: { flex: 1, borderWidth: 1, borderRadius: 16, padding: 12, minHeight: 74 },
  learnTitle: { fontWeight: '900', marginBottom: 4 },
  learnDesc: { fontSize: 12, lineHeight: 16 },
  referenceBox: { flex: 1 },
  refTitle: { fontSize: 22, fontWeight: '900', marginBottom: 8 },
  refNote: { lineHeight: 20, marginBottom: 12 },
  ruleCard: { borderWidth: 1, borderRadius: 16, padding: 12, marginBottom: 12, gap: 6 },
  lessonCard: { borderWidth: 1, borderRadius: 16, padding: 12, marginBottom: 10, gap: 8 },
  lessonHead: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  lessonParticle: { width: 48, fontSize: 34, lineHeight: 42, fontWeight: '900', textAlign: 'center' },
  lessonSubtitle: { fontSize: 15, fontWeight: '900', marginBottom: 4 },
  exampleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 12, padding: 8 },
  exampleLabel: { width: 42, fontSize: 12, fontWeight: '900' },
  exampleText: { flex: 1, fontSize: 16, fontWeight: '900' },
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
  filterRow: { gap: 6, paddingRight: 4 },
  chip: { paddingVertical: 5, paddingHorizontal: 9, borderRadius: 999, backgroundColor: '#e2e8f0' },
  chipActive: { backgroundColor: '#2563eb' },
  chipText: { color: '#334155' },
  chipTextActive: { color: 'white', fontWeight: '700' },
  card: { backgroundColor: 'transparent', padding: 10, borderRadius: 16, marginBottom: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  cardMain: { gap: 4 },
  kanaBadge: { width: 64, height: 64, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  wordInfo: { flex: 1, minWidth: 0 },
  kana: { flex: 1, flexShrink: 1, fontSize: 24, lineHeight: 32, fontWeight: '900', color: '#111827' },
  meaning: { fontSize: 17, color: '#334155', fontWeight: '900' },
  romaji: { fontSize: 14, fontWeight: '800', marginTop: 3 },
  tagRow: { flexDirection: 'row', gap: 6, marginTop: 6, overflow: 'hidden' },
  wordTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  speakButton: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  speakText: { fontSize: 13, fontWeight: '900' },
  pill: { maxWidth: 92, borderRadius: 999, paddingVertical: 4, paddingHorizontal: 8, fontSize: 11, fontWeight: '800', overflow: 'hidden' },
  meta: { color: '#64748b', marginTop: 8 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 20, marginBottom: 10 },
  button: { flex: 1, backgroundColor: '#2563eb', padding: 14, borderRadius: 14, alignItems: 'center' },
  muted: { backgroundColor: '#64748b' },
  danger: { backgroundColor: '#dc2626' },
  buttonText: { color: 'white', fontWeight: '800' },
  empty: { color: '#64748b', textAlign: 'center', marginTop: 32 }
});
