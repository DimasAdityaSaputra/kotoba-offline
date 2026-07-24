import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { initDb, listGroups, listVocab, markCorrect, saveQuizResult } from '../../src/db';
import { romajiToKana } from '../../src/kana';
import { normalizeAnswer, numberToJapanese } from '../../src/numberQuiz';
import { isQuizAnswerCorrect } from '../../src/quizCheck';
import { KanaStrokePad } from '../../src/KanaStrokePad';
import { kanaGroups, kanaItems, type KanaScript } from '../../src/kanaGroups';
import { useTheme } from '../../src/theme';
import type { VocabItem } from '../../src/types';

type Mode = 'number-ja' | 'number-id' | 'kana-meaning' | 'kana-romaji' | 'meaning-kana' | 'letter-romaji' | 'kana-letter';
type Question = { prompt: string; answer: string; alt?: string; kind: 'number' | 'kana' | 'letter'; mode: Mode; inputKana?: boolean; inputScript?: 'hiragana' | 'katakana'; vocabId?: number };
type Wrong = Question & { given: string };

const numberLevels = [10, 100, 1000, 10000, 100000];
const questionCounts = [5, 10, 20, 50];
const modes: { value: Mode; label: string }[] = [
  { value: 'number-ja', label: 'Angka → Jepang' },
  { value: 'number-id', label: 'Jepang → angka' },
  { value: 'kana-meaning', label: 'Jepang → arti' },
  { value: 'kana-romaji', label: 'Jepang → romaji' },
  { value: 'meaning-kana', label: 'Arti → Jepang' },
  { value: 'letter-romaji', label: 'Huruf → romaji' },
  { value: 'kana-letter', label: 'Jepang → huruf' }
];

export default function QuizScreen() {
  const t = useTheme();
  const [vocab, setVocab] = useState<VocabItem[]>([]);
  const [groups, setGroups] = useState<string[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [mode, setMode] = useState<Mode>('number-ja');
  const [selectedModes, setSelectedModes] = useState<Mode[]>(['number-ja']);
  const [level, setLevel] = useState(10);
  const [total, setTotal] = useState(10);
  const [letterScript, setLetterScript] = useState<KanaScript>('hiragana');
  const [selectedKanaGroups, setSelectedKanaGroups] = useState<string[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [wrong, setWrong] = useState<Wrong[]>([]);
  const [score, setScore] = useState<number | null>(null);
  const [drawMisses, setDrawMisses] = useState(0);
  const [questionStartedAt, setQuestionStartedAt] = useState(Date.now());

  useFocusEffect(useCallback(() => {
    initDb();
    setGroups(listGroups());
    setVocab(listVocab({ query: '', script_type: 'all', jlpt_level: 'all', category: '', group: '', review_status: 'all' }));
  }, []));

  const current = questions[index];
  const currentMode = current?.mode ?? mode;

  function start() {
    const quizVocab = isNumberMode(mode) || isLetterMode(mode) || selectedGroups.length === 0 ? vocab : vocab.filter((item) => selectedGroups.includes(item.group));
    const activeModes = selectedModes.length ? selectedModes : [mode];
    const next = buildMixedQuestions(activeModes, total, level, quizVocab, letterScript, selectedKanaGroups);
    setQuestions(next);
    setIndex(0);
    setAnswer('');
    setWrong([]);
    setScore(null);
    setDrawMisses(0);
    setQuestionStartedAt(Date.now());
  }

  function backToSetup() {
    setQuestions([]);
    setIndex(0);
    setAnswer('');
    setWrong([]);
    setScore(null);
    setDrawMisses(0);
    setQuestionStartedAt(Date.now());
  }

  function practiceWrong() {
    setQuestions(wrong.map(({ given, ...question }) => question));
    setIndex(0);
    setAnswer('');
    setWrong([]);
    setScore(null);
    setDrawMisses(0);
    setQuestionStartedAt(Date.now());
  }

  function submit() {
    if (!current) return;
    const correct = isQuizAnswerCorrect(answer, current.answer, current.alt, current.inputKana, current.inputScript);
    if (correct && current.vocabId) markCorrect(current.vocabId);
    const nextWrong = correct ? wrong : [...wrong, { ...current, given: answer }];
    if (index + 1 >= questions.length) {
      setWrong(nextWrong);
      setScore(questions.length - nextWrong.length);
      saveQuizResult(selectedModes.length ? selectedModes : [mode], questions.length - nextWrong.length, questions.length);
      return;
    }
    setWrong(nextWrong);
    setIndex(index + 1);
    setAnswer('');
    setDrawMisses(0);
    setQuestionStartedAt(Date.now());
  }

  function missDrawing() {
    setDrawMisses((current) => current + 1);
  }

  function passDrawing() {
    if (!current) return;
    const seconds = Math.round((Date.now() - questionStartedAt) / 1000);
    const nextWrong = seconds > 20 || drawMisses >= 5 ? [...wrong, { ...current, given: `${seconds}s, ${drawMisses} miss` }] : wrong;
    if (index + 1 >= questions.length) {
      setWrong(nextWrong);
      setScore(questions.length - nextWrong.length);
      saveQuizResult(selectedModes.length ? selectedModes : [mode], questions.length - nextWrong.length, questions.length);
      return;
    }
    setWrong(nextWrong);
    setIndex(index + 1);
    setDrawMisses(0);
    setQuestionStartedAt(Date.now());
  }

  function changeAnswer(value: string) {
    setAnswer(current?.inputKana ? romajiToKana(value, current.inputScript ?? 'hiragana', false) : value);
  }

  function toggleMode(nextMode: Mode) {
    setMode(nextMode);
    setSelectedModes((current) => current.includes(nextMode) ? current.filter((item) => item !== nextMode) : [...current, nextMode]);
  }

  function toggleGroup(group: string) {
    setSelectedGroups((current) => current.includes(group) ? current.filter((item) => item !== group) : [...current, group]);
  }

  function toggleKanaGroup(group: string) {
    setSelectedKanaGroups((current) => current.includes(group) ? current.filter((item) => item !== group) : [...current, group]);
  }

  if (score !== null) {
    return (
      <ScrollView style={[styles.wrap, { backgroundColor: t.bg }]} contentContainerStyle={{ paddingBottom: 108 }}>
        <Text style={[styles.title, { color: t.text, fontFamily: t.font }]}>Hasil Quiz</Text>
        <Text style={[styles.score, { color: t.text, fontFamily: t.font }]}>{score} / {questions.length}</Text>
        <Text style={[styles.note, { color: t.sub, fontFamily: t.font }]}>Score: {Math.round(score / questions.length * 100)}%</Text>
        <View style={styles.actions}>
          <Pressable style={styles.button} onPress={start}><Text style={styles.buttonText}>Ulang Quiz</Text></Pressable>
          <Pressable style={[styles.button, styles.muted]} onPress={backToSetup}><Text style={styles.buttonText}>Ganti Quiz</Text></Pressable>
        </View>
        {wrong.length > 0 && <Pressable style={[styles.button, styles.warn]} onPress={practiceWrong}><Text style={styles.buttonText}>Latih yang salah</Text></Pressable>}
        <Text style={[styles.sectionLabel, { color: t.label, fontFamily: t.font }]}>Salah</Text>
        {wrong.length === 0 ? <Text style={[styles.note, { color: t.sub, fontFamily: t.font }]}>Bersih. Tumben otak nggak sabotase.</Text> : wrong.map((item, i) => (
          <View key={`${item.prompt}-${i}`} style={[styles.card, { backgroundColor: t.card, borderColor: t.border }]}>
            <Text style={[styles.prompt, { color: t.text, fontFamily: t.font }]}>{item.prompt}</Text>
            <Text style={[styles.meta, { color: t.sub, fontFamily: t.font }]}>Jawaban lu: {item.given || '-'}</Text>
            <Text style={[styles.answer, { fontFamily: t.font }]}>Benar: {item.answer}</Text>
          </View>
        ))}
      </ScrollView>
    );
  }

  return (
    <ScrollView style={[styles.wrap, { backgroundColor: t.bg }]} contentContainerStyle={{ paddingBottom: 108 }}>

      {!current ? (
        <>
          <Text style={[styles.sectionLabel, { color: t.label, fontFamily: t.font }]}>Mode</Text>
          <View style={styles.row}>{modes.map((item) => <Chip key={item.value} label={item.label} active={selectedModes.includes(item.value)} onPress={() => toggleMode(item.value)} />)}</View>
          <Text style={[styles.note, { color: t.sub, fontFamily: t.font }]}>Bisa pilih banyak mode. Minimal satu, kalau kosong nanti fallback ke mode terakhir.</Text>
          {selectedModes.some(isLetterMode) && <>
            <Text style={[styles.sectionLabel, { color: t.label, fontFamily: t.font }]}>Script huruf</Text>
            <View style={styles.row}>{(['hiragana', 'katakana'] as const).map((value) => <Chip key={value} label={value} active={letterScript === value} onPress={() => setLetterScript(value)} />)}</View>
            <Text style={[styles.sectionLabel, { color: t.label, fontFamily: t.font }]}>Group huruf</Text>
            <View style={styles.row}>
              <Chip label="Semua" active={selectedKanaGroups.length === 0} onPress={() => setSelectedKanaGroups([])} />
              {kanaGroups.map((group) => <Chip key={group.label} label={group.label} active={selectedKanaGroups.includes(group.label)} onPress={() => toggleKanaGroup(group.label)} />)}
            </View>
          </>}
          {selectedModes.some(isNumberMode) && <>
            <Text style={[styles.sectionLabel, { color: t.label, fontFamily: t.font }]}>Level angka</Text>
            <View style={styles.row}>{numberLevels.map((value) => <Chip key={value} label={`0-${value}`} active={level === value} onPress={() => setLevel(value)} />)}</View>
          </>}
          {selectedModes.some((item) => !isNumberMode(item) && !isLetterMode(item)) && groups.length > 0 && <>
            <Text style={[styles.sectionLabel, { color: t.label, fontFamily: t.font }]}>Bab kotoba</Text>
            <View style={styles.row}>
              <Chip label="Semua" active={selectedGroups.length === 0} onPress={() => setSelectedGroups([])} />
              {groups.map((group) => <Chip key={group} label={group} active={selectedGroups.includes(group)} onPress={() => toggleGroup(group)} />)}
            </View>
          </>}
          <Text style={[styles.sectionLabel, { color: t.label, fontFamily: t.font }]}>Jumlah soal</Text>
          <View style={styles.row}>{questionCounts.map((value) => <Chip key={value} label={`${value}`} active={total === value} onPress={() => setTotal(value)} />)}</View>
          <Pressable style={styles.button} onPress={start}><Text style={styles.buttonText}>Mulai</Text></Pressable>
          {selectedModes.some((item) => !isNumberMode(item) && !isLetterMode(item)) && <>
            <Text style={[styles.sectionLabel, { color: t.label, fontFamily: t.font }]}>Progress per Bab</Text>
            {groupProgress(vocab).map((item) => (
              <View key={item.group} style={[styles.progressCard, { backgroundColor: t.card, borderColor: t.border }]}>
                <Text style={[styles.progressTitle, { color: t.text, fontFamily: t.font }]}>{item.group}</Text>
                <Text style={[styles.meta, { color: t.sub, fontFamily: t.font }]}>{item.known}/{item.total} ingat · {item.hard} susah · {item.newCount} baru</Text>
              </View>
            ))}
          </>}
          <Text style={[styles.note, { color: t.sub, fontFamily: t.font }]}>Mode kotoba pakai database lu. Mode angka + huruf offline total.</Text>
        </>
      ) : (
        <>
          <Text style={[styles.modeTitle, { color: t.text, fontFamily: t.font }]}>{modeLabel(currentMode)} · campur {selectedModes.length || 1} mode</Text>
          <Text style={[styles.count, { color: t.sub, fontFamily: t.font }]}>{index + 1} / {questions.length}</Text>
          <Text style={[styles.instruction, { color: t.primary, fontFamily: t.font }]}>{modeInstruction(currentMode)}</Text>
          <View style={[styles.bigCard, { backgroundColor: t.card, borderColor: t.border }]}><Text style={[styles.bigPrompt, { color: t.text, fontFamily: t.font }]}>{current.prompt}</Text></View>
          {currentMode === 'kana-letter' ? <>
            <Text style={[styles.note, { color: t.sub, fontFamily: t.font }]}>Gambar huruf Jepang di atas. Guide kuning muncul otomatis setelah 5× meleset. Nilai ngikut waktu + jumlah miss.</Text>
            <KanaStrokePad char={current.answer} misses={drawMisses} onMiss={missDrawing} onCorrect={passDrawing} height={300} />
            <Text style={[styles.meta, { color: t.sub, fontFamily: t.font }]}>Miss: {drawMisses} / 5 sebelum guide muncul</Text>
          </> : <>
            <TextInput placeholderTextColor={t.sub} style={[styles.input, { backgroundColor: t.card, borderColor: t.border, color: t.text, fontFamily: t.font }]} value={answer} onChangeText={changeAnswer} placeholder={current.inputKana ? `ketik romaji, auto jadi ${current.inputScript ?? 'hiragana'}` : 'jawaban'} autoCapitalize="none" />
            <Pressable style={styles.button} onPress={submit}><Text style={styles.buttonText}>Jawab</Text></Pressable>
          </>}
        </>
      )}
    </ScrollView>
  );
}


function buildMixedQuestions(modes: Mode[], total: number, level: number, vocab: VocabItem[], letterScript: KanaScript, selectedKanaGroups: string[]): Question[] {
  const pools = modes.map((item) => buildQuestions(item, total, level, vocab, letterScript, selectedKanaGroups));
  const mixed: Question[] = [];
  let cursor = 0;
  while (mixed.length < total && pools.some((pool) => pool.length)) {
    const pool = pools[cursor % pools.length];
    const next = pool.shift();
    if (next) mixed.push(next);
    cursor += 1;
  }
  return shuffled(mixed).slice(0, total);
}

function buildQuestions(mode: Mode, total: number, level: number, vocab: VocabItem[], letterScript: KanaScript, selectedKanaGroups: string[]): Question[] {
  if (mode === 'number-ja' || mode === 'number-id') {
    return shuffled(Array.from({ length: level + 1 }, (_, value) => {
      const ja = numberToJapanese(value);
      const kana = romajiToKana(ja, 'hiragana', true);
      return mode === 'number-ja'
        ? { prompt: String(value), answer: kana, alt: ja, kind: 'number' as const, mode, inputKana: true, inputScript: 'hiragana' as const }
        : { prompt: kana, answer: String(value), kind: 'number' as const, mode };
    })).slice(0, total);
  }

  if (mode === 'letter-romaji' || mode === 'kana-letter') {
    const items = selectedKanaGroups.length ? kanaItems(letterScript).filter((item) => selectedKanaGroups.includes(item.group)) : kanaItems(letterScript);
    return shuffled(items).slice(0, total).map((item) => mode === 'letter-romaji'
      ? { prompt: item.kana, answer: item.romaji, kind: 'letter' as const, mode }
      : { prompt: item.kana, answer: item.kana, alt: item.romaji, kind: 'letter' as const, mode, inputKana: true, inputScript: letterScript });
  }

  return shuffled(vocab).slice(0, total).map((item) => {
    if (mode === 'kana-meaning') return { prompt: item.kana, answer: item.meaning_id, kind: 'kana' as const, mode, vocabId: item.id };
    if (mode === 'kana-romaji') return { prompt: item.kana, answer: item.romaji, kind: 'kana' as const, mode, vocabId: item.id };
    return { prompt: item.meaning_id, answer: item.kana, alt: item.romaji, kind: 'kana' as const, mode, inputKana: true, inputScript: item.script_type, vocabId: item.id };
  });
}

function isNumberMode(value: Mode) {
  return value === 'number-ja' || value === 'number-id';
}

function isLetterMode(value: Mode) {
  return value === 'letter-romaji' || value === 'kana-letter';
}

function groupProgress(vocab: VocabItem[]) {
  const stats = new Map<string, { group: string; total: number; known: number; hard: number; newCount: number }>();
  for (const item of vocab) {
    const group = item.group || 'Tanpa bab';
    const current = stats.get(group) ?? { group, total: 0, known: 0, hard: 0, newCount: 0 };
    current.total += 1;
    if (item.review_status === 'known') current.known += 1;
    else if (item.review_status === 'hard') current.hard += 1;
    else current.newCount += 1;
    stats.set(group, current);
  }
  return [...stats.values()].sort((a, b) => a.group.localeCompare(b.group));
}

function modeLabel(value: Mode) {
  return modes.find((item) => item.value === value)?.label ?? 'Quiz';
}

function modeInstruction(value: Mode) {
  if (value === 'number-ja') return 'Tugas: angka → Jepang. Ketik romaji, otomatis jadi hiragana.';
  if (value === 'number-id') return 'Tugas: Jepang → angka. Ketik angka biasa.';
  if (value === 'kana-meaning') return 'Tugas: Jepang → arti Indonesia.';
  if (value === 'kana-romaji') return 'Tugas: Jepang → romaji.';
  if (value === 'meaning-kana') return 'Tugas: arti Indonesia → Jepang. Ketik romaji, otomatis jadi kana.';
  if (value === 'letter-romaji') return 'Tugas: huruf Jepang → romaji.';
  return 'Tugas: gambar huruf Jepang sesuai prompt.';
}

function shuffled<T>(items: T[]) {
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
  title: { fontSize: 28, fontWeight: '800', color: '#0f172a', marginBottom: 12 },
  sectionLabel: { fontWeight: '700', marginTop: 12, marginBottom: 6, color: '#334155' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  chip: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, backgroundColor: '#e2e8f0' },
  chipActive: { backgroundColor: '#2563eb' },
  chipText: { color: '#334155' },
  chipTextActive: { color: 'white', fontWeight: '700' },
  actions: { flexDirection: 'row', gap: 10, marginTop: 14 },
  button: { flex: 1, backgroundColor: '#2563eb', padding: 14, borderRadius: 14, marginTop: 14, alignItems: 'center' },
  muted: { backgroundColor: '#64748b' },
  warn: { backgroundColor: '#ea580c' },
  buttonText: { color: 'white', fontWeight: '800' },
  note: { color: '#64748b', marginTop: 12, lineHeight: 20 },
  modeTitle: { color: '#0f172a', fontWeight: '800', marginBottom: 4 },
  count: { color: '#64748b', marginBottom: 8 },
  instruction: { fontWeight: '800', marginBottom: 12, lineHeight: 20 },
  bigCard: { minHeight: 220, borderRadius: 24, backgroundColor: 'transparent', borderWidth: 1, borderColor: '#e2e8f0', alignItems: 'center', justifyContent: 'center', padding: 24, marginBottom: 16 },
  bigPrompt: { fontSize: 42, fontWeight: '900', color: '#111827', textAlign: 'center' },
  input: { backgroundColor: 'transparent', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  score: { fontSize: 48, fontWeight: '900', color: '#111827' },
  card: { backgroundColor: 'transparent', padding: 14, borderRadius: 16, marginTop: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  progressCard: { backgroundColor: 'transparent', padding: 12, borderRadius: 14, marginBottom: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  progressTitle: { color: '#111827', fontWeight: '800' },
  prompt: { fontSize: 22, fontWeight: '800', color: '#111827' },
  meta: { color: '#64748b', marginTop: 8 },
  answer: { color: '#16a34a', marginTop: 6, fontWeight: '700' }
});
