import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { allVocab, createBackup, getProfile, getProfileValue, initDb, insertMany, quizStats, resetDefaultVocab, restoreBackup, saveProfile, saveProfileValue } from '../../src/db';
import { parseCsv, toCsv } from '../../src/csv';
import { useTheme, useThemeMode } from '../../src/theme';
import { clearVoiceCache, listJapaneseVoices, speakJapanese } from '../../src/speech';
import type { VocabItem } from '../../src/types';

export default function ProfileScreen() {
  const t = useTheme();
  const { mode, setMode } = useThemeMode();
  const [items, setItems] = useState<VocabItem[]>([]);
  const [profile, setProfile] = useState({ username: 'Dimas', avatar: 'D', avatarUri: '' });
  const [selectedDay, setSelectedDay] = useState<{ date: string; count: number } | null>(null);
  const [stats, setStats] = useState({ attempts: 0, bestScore: 0, bestTotal: 0, answered: 0 });
  const [voices, setVoices] = useState<Awaited<ReturnType<typeof listJapaneseVoices>>>([]);
  const [voiceId, setVoiceId] = useState('');

  const load = useCallback(() => {
    initDb();
    setItems(allVocab());
    setProfile(getProfile());
    setStats(quizStats());
    setVoiceId(getProfileValue('ttsVoiceId'));
    listJapaneseVoices().then(setVoices).catch(() => setVoices([]));
  }, []);

  useFocusEffect(load);

  async function importCsv() {
    initDb();
    const picked = await DocumentPicker.getDocumentAsync({ type: 'text/*', copyToCacheDirectory: true });
    if (picked.canceled) return;
    const uri = picked.assets[0]?.uri;
    if (!uri) return;
    const text = await FileSystem.readAsStringAsync(uri);
    const parsed = parseCsv(text);
    insertMany(parsed.rows, 'user');
    load();
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

  async function exportBackup() {
    const uri = `${FileSystem.cacheDirectory}kotoba-backup.json`;
    await FileSystem.writeAsStringAsync(uri, JSON.stringify(createBackup(), null, 2));
    if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri, { mimeType: 'application/json', dialogTitle: 'Backup Kotoba' });
    else Alert.alert('Backup selesai', uri);
  }

  async function importBackup() {
    const picked = await DocumentPicker.getDocumentAsync({ type: 'application/json', copyToCacheDirectory: true });
    if (picked.canceled) return;
    const uri = picked.assets[0]?.uri;
    if (!uri) return;
    try {
      restoreBackup(JSON.parse(await FileSystem.readAsStringAsync(uri)));
      load();
      Alert.alert('Restore selesai', 'Data backup digabung ke data lokal.');
    } catch {
      Alert.alert('Restore gagal', 'File backup rusak atau bukan backup Kotoba.');
    }
  }

  async function pickAvatar() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return Alert.alert('Izin ditolak', 'Gallery permission dibutuhkan buat ganti foto profile.');
    const picked = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (picked.canceled) return;
    const uri = picked.assets[0]?.uri;
    if (!uri) return;
    const next = { ...profile, avatarUri: uri };
    setProfile(next);
    saveProfile(next);
  }

  function resetDefaults() {
    Alert.alert('Reset semua kotoba?', 'Semua data user akan dihapus, lalu kosakata default dimuat ulang.', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Reset semua', style: 'destructive', onPress: () => { initDb(); resetDefaultVocab(); load(); Alert.alert('Selesai', 'Semua kotoba direset ke default.'); } }
    ]);
  }

  const progress = getProgress(items);
  const userItems = progress.userItems;
  const progressItems = progress.progressItems;
  const contributions = contributionDays(progressItems);
  const contribList = contributionList(progressItems);
  const totalContrib = progressItems.length;

  return (
    <ScrollView style={[styles.wrap, { backgroundColor: t.bg }]} contentContainerStyle={{ paddingBottom: 108 }}>
      <View style={[styles.profileCard, { backgroundColor: t.card, borderColor: t.border }]}>
        <Pressable style={styles.avatar} onPress={pickAvatar}>
          {profile.avatarUri ? <Image source={{ uri: profile.avatarUri }} style={styles.avatarImage} /> : <Text style={styles.avatarText}>{profile.avatar}</Text>}
        </Pressable>
        <View style={{ flex: 1 }}>
          <TextInput placeholderTextColor={t.sub} style={[styles.usernameInput, { color: t.text, fontFamily: t.font }]} value={profile.username} onChangeText={(username) => setProfile({ ...profile, username })} onBlur={() => saveProfile(profile)} placeholder="Username" />
          <TextInput placeholderTextColor={t.sub} style={[styles.avatarInput, { color: t.sub, fontFamily: t.font }]} value={profile.avatar} onChangeText={(avatar) => setProfile({ ...profile, avatar: avatar.slice(0, 2).toUpperCase() })} onBlur={() => saveProfile(profile)} placeholder="Fallback avatar" autoCapitalize="characters" />
          <Text style={[styles.note, { color: t.sub, fontFamily: t.font }]}>Tap foto buat ganti dari gallery · offline mode</Text>
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: t.text, fontFamily: t.font }]}>Progress</Text>
      <View style={styles.statsGrid}>
        <Stat label="Highscore" value={stats.bestTotal ? `${stats.bestScore}/${stats.bestTotal}` : '-'} />
        <Stat label="Quiz selesai" value={`${stats.attempts}`} />
        <Stat label="Soal dijawab" value={`${stats.answered}`} />
        <Stat label="Total kotoba" value={`${items.length}`} />
        <Stat label="Kotoba user" value={`${userItems.length}`} />
        <Stat label="Bab" value={`${progress.groups}`} />
      </View>

      <Text style={[styles.sectionTitle, { color: t.text, fontFamily: t.font }]}>Progress</Text>
      <Text style={[styles.note, { color: t.sub, fontFamily: t.font }]}>{totalContrib} progress tersimpan · {new Date().getFullYear()}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.yearScroll}>
        {contributions.map((month) => <MonthGrid key={month.month} month={month} onSelect={setSelectedDay} />)}
      </ScrollView>
      <View style={styles.legend}><Text style={[styles.small, { color: t.sub, fontFamily: t.font }]}>Less</Text><View style={[styles.square, levelStyle(0, t.dark)]} /><View style={[styles.square, levelStyle(5, t.dark)]} /><View style={[styles.square, levelStyle(15, t.dark)]} /><View style={[styles.square, levelStyle(30, t.dark)]} /><Text style={[styles.small, { color: t.sub, fontFamily: t.font }]}>More</Text></View>
      {selectedDay && <Text style={[styles.selectedDay, { color: t.text, fontFamily: t.font }]}>{formatDate(selectedDay.date)} · {selectedDay.count}/30 progress</Text>}

      <Text style={[styles.sectionTitle, { color: t.text, fontFamily: t.font }]}>Progress list</Text>
      {contribList.length === 0 ? <Text style={[styles.note, { color: t.sub, fontFamily: t.font }]}>Belum ada progress. Tambah kotoba atau kerjain quiz dulu.</Text> : contribList.map((item) => (
        <View key={item.date} style={[styles.contribRow, { backgroundColor: t.card, borderColor: t.border }]}>
          <Text style={[styles.contribDate, { color: t.text, fontFamily: t.font }]}>{item.date}</Text>
          <Text style={[styles.contribText, { color: t.sub, fontFamily: t.font }]}>{item.count}/30 progress</Text>
        </View>
      ))}

      <Text style={[styles.sectionTitle, { color: t.text, fontFamily: t.font }]}>Japanese voice</Text>
      <Text style={[styles.note, { color: t.sub, fontFamily: t.font }]}>Pilih yang suaranya sama kayak Google TTS. Tap voice buat tes + simpan.</Text>
      {voices.length === 0 ? <Text style={[styles.note, { color: t.sub, fontFamily: t.font }]}>Voice Jepang belum kebaca. Install Japanese voice pack dulu.</Text> : voices.map((voice) => (
        <Pressable key={voice.identifier} style={[styles.voiceRow, { backgroundColor: voiceId === voice.identifier ? t.primary : t.card, borderColor: t.border }]} onPress={() => { saveProfileValue('ttsVoiceId', voice.identifier); clearVoiceCache(); setVoiceId(voice.identifier); speakJapanese('こんにちは'); }}>
          <Text style={[styles.voiceName, { color: voiceId === voice.identifier ? 'white' : t.text, fontFamily: t.font }]} numberOfLines={1}>{voice.name || voice.identifier}</Text>
          <Text style={[styles.voiceMeta, { color: voiceId === voice.identifier ? 'rgba(255,255,255,0.78)' : t.sub, fontFamily: t.font }]} numberOfLines={1}>{voice.language} · {voice.quality} · {voice.identifier}</Text>
        </Pressable>
      ))}
      <Button label="Tes voice sekarang" onPress={() => speakJapanese('こんにちは。私は日本語を勉強しています。')} />

      <Text style={[styles.sectionTitle, { color: t.text, fontFamily: t.font }]}>Theme</Text>
      <View style={styles.themeRow}>
        {(['system', 'light', 'dark'] as const).map((value) => <Pressable key={value} style={[styles.themeChip, { backgroundColor: mode === value ? t.primary : t.card2 }]} onPress={() => setMode(value)}><Text style={[styles.themeText, { color: mode === value ? 'white' : t.label, fontFamily: t.font }]}>{value}</Text></Pressable>)}
      </View>

      <Text style={[styles.sectionTitle, { color: t.text, fontFamily: t.font }]}>Settings</Text>
      <Text style={[styles.note, { color: t.sub, fontFamily: t.font }]}>Full offline. Data disimpan di SQLite lokal HP.</Text>
      <Button label="Backup JSON" onPress={exportBackup} />
      <Button label="Restore JSON" onPress={importBackup} />
      <Button label="Import CSV" onPress={importCsv} />
      <Button label="Export CSV" onPress={exportCsv} />
      <Button label="Reset semua kotoba" danger onPress={resetDefaults} />
      <Text style={[styles.small, { color: t.sub, fontFamily: t.font }]}>CSV header: kana,romaji,meaning_id,category,jlpt_level,script_type,group</Text>
    </ScrollView>
  );
}

const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

function getProgress(items: VocabItem[]) {
  const userItems: VocabItem[] = [];
  const progressItems: VocabItem[] = [];
  const groups = new Set<string>();
  for (const item of items) {
    if (item.source === 'user') userItems.push(item);
    if (item.source === 'user' || item.review_status === 'known') progressItems.push(item);
    if (item.group) groups.add(item.group);
  }
  return { userItems, progressItems, groups: groups.size };
}

function contributionDays(items: VocabItem[]) {
  const counts = new Map(contributionList(items).map((item) => [item.date, item.count]));
  const year = new Date().getFullYear();
  return monthLabels.map((label, month) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, index) => {
      const date = localDateKey(new Date(year, month, index + 1));
      return { date, count: counts.get(date) ?? 0, day: index + 1 };
    });
    return { label, month, days };
  });
}

function contributionList(items: VocabItem[]) {
  const counts = new Map<string, number>();
  for (const item of items) {
    const date = (item.review_status === 'known' ? item.updated_at : item.created_at).slice(0, 10);
    counts.set(date, (counts.get(date) ?? 0) + 1);
  }
  return [...counts.entries()].map(([date, count]) => ({ date, count })).sort((a, b) => b.date.localeCompare(a.date));
}

function localDateKey(date: Date) {
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function formatDate(date: string) {
  const [year, month, day] = date.split('-').map(Number);
  return `${day} ${monthLabels[month - 1]} ${year}`;
}

function MonthGrid({ month, onSelect }: { month: ReturnType<typeof contributionDays>[number]; onSelect: (day: { date: string; count: number }) => void }) {
  const t = useTheme();
  const rows = [0, 1, 2, 3, 4, 5, 6].map((row) => month.days.filter((day) => (day.day - 1) % 7 === row));
  return (
    <View style={styles.monthBlock}>
      <Text style={[styles.monthLabel, { color: t.sub, fontFamily: t.font }]}>{month.label}</Text>
      <View style={styles.monthGrid}>
        {rows.map((row, index) => (
          <View key={index} style={styles.monthGridRow}>
            {row.map((day) => <Pressable key={day.date} onPress={() => onSelect(day)} style={[styles.square, levelStyle(day.count, t.dark)]} />)}
          </View>
        ))}
      </View>
    </View>
  );
}

function levelStyle(count: number, dark: boolean) {
  if (count >= 30) return dark ? styles.dl3 : styles.l3;
  if (count >= 15) return dark ? styles.dl2 : styles.l2;
  if (count >= 5) return dark ? styles.dl1 : styles.l1;
  return dark ? styles.dl0 : styles.l0;
}


function Stat({ label, value }: { label: string; value: string }) {
  const t = useTheme();
  return <View style={[styles.statCard, { backgroundColor: t.card, borderColor: t.border }]}><Text style={[styles.statValue, { color: t.text, fontFamily: t.font }]}>{value}</Text><Text style={[styles.statLabel, { color: t.sub, fontFamily: t.font }]}>{label}</Text></View>;
}

function Button({ label, onPress, danger }: { label: string; onPress: () => void; danger?: boolean }) {
  const t = useTheme();
  return <Pressable style={[styles.button, { backgroundColor: danger ? t.danger : t.primary }]} onPress={onPress}><Text style={[styles.buttonText, { fontFamily: t.font }]}>{label}</Text></Pressable>;
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 16, backgroundColor: 'transparent' },
  title: { fontSize: 30, fontWeight: '900', marginBottom: 12 },
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: 'transparent', padding: 16, borderRadius: 20, borderWidth: 1, borderColor: '#e2e8f0' },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatarImage: { width: 72, height: 72 },
  avatarText: { color: 'white', fontSize: 34, fontWeight: '900' },
  usernameInput: { fontSize: 26, fontWeight: '900', color: '#0f172a', padding: 0 },
  avatarInput: { color: '#64748b', padding: 0, marginBottom: 2 },
  sectionTitle: { fontSize: 20, fontWeight: '900', color: '#0f172a', marginTop: 22, marginBottom: 8 },
  note: { color: '#475569', lineHeight: 20 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: { width: '48%', borderWidth: 1, borderRadius: 18, padding: 14 },
  statValue: { fontSize: 22, fontWeight: '900' },
  statLabel: { fontSize: 12, fontWeight: '800', marginTop: 3 },
  yearScroll: { gap: 14, paddingVertical: 12 },
  monthBlock: { width: 96 },
  monthLabel: { color: '#64748b', fontSize: 12, fontWeight: '800', marginBottom: 6 },
  monthGrid: { gap: 3 },
  monthGridRow: { flexDirection: 'row', gap: 3 },
  square: { width: 14, height: 14, borderRadius: 3 },
  l0: { backgroundColor: '#e2e8f0' },
  l1: { backgroundColor: '#93c5fd' },
  l2: { backgroundColor: '#3b82f6' },
  l3: { backgroundColor: '#1d4ed8' },
  dl0: { backgroundColor: '#27272a' },
  dl1: { backgroundColor: '#1e3a8a' },
  dl2: { backgroundColor: '#2563eb' },
  dl3: { backgroundColor: '#60a5fa' },
  legend: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8 },
  selectedDay: { marginTop: 8, color: '#0f172a', fontWeight: '800' },
  themeRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  themeChip: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 999 },
  themeText: { fontWeight: '800', textTransform: 'capitalize' },
  contribRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: 'transparent', padding: 12, borderRadius: 14, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 8 },
  contribDate: { color: '#0f172a', fontWeight: '800' },
  contribText: { color: '#64748b', fontWeight: '700' },
  voiceRow: { borderWidth: 1, borderRadius: 14, padding: 12, marginBottom: 8 },
  voiceName: { fontSize: 15, fontWeight: '900' },
  voiceMeta: { fontSize: 12, fontWeight: '700', marginTop: 3 },
  button: { backgroundColor: '#2563eb', padding: 14, borderRadius: 14, marginBottom: 12, alignItems: 'center' },
  danger: { backgroundColor: '#dc2626' },
  buttonText: { color: 'white', fontWeight: '800' },
  small: { color: '#64748b', lineHeight: 20 }
});
