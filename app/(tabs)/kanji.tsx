import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { basicKanji } from '../../src/kanjiData';
import { useTheme } from '../../src/theme';

export default function KanjiScreen() {
  const t = useTheme();
  const [open, setOpen] = useState(basicKanji[0]?.kanji ?? '');
  const opened = useMemo(() => new Set([open]), [open]);

  return (
    <ScrollView style={{ backgroundColor: t.bg }} contentContainerStyle={styles.wrap} showsVerticalScrollIndicator={false}>
      <View style={[styles.hero, { backgroundColor: t.card, borderColor: t.border }]}> 
        <Text style={[styles.heroTitle, { color: t.text, fontFamily: t.font }]}>Kanji basic</Text>
        <Text style={[styles.heroText, { color: t.sub, fontFamily: t.font }]}>Kanji itu huruf makna. Satu kanji bisa punya arti, onyomi, kunyomi, dan berubah bacaan saat masuk kata gabungan.</Text>
      </View>

      <View style={[styles.info, { backgroundColor: t.card2, borderColor: t.border }]}> 
        <Text style={[styles.infoTitle, { color: t.text, fontFamily: t.font }]}>Cara pakai cepat</Text>
        <Text style={[styles.infoText, { color: t.sub, fontFamily: t.font }]}>Onyomi biasanya dipakai di gabungan kanji: 日本 = にほん. Kunyomi sering dipakai saat kanji berdiri sendiri atau pakai okurigana: 大きい = おおきい. Jangan hafal bacaan sendirian doang; hafal lewat contoh kata. Lebih nempel, lebih manusia.</Text>
      </View>

      <Text style={[styles.sectionTitle, { color: t.text, fontFamily: t.font }]}>Kanji paling basic</Text>
      {basicKanji.map((item) => {
        const active = opened.has(item.kanji);
        return (
          <Pressable key={item.kanji} onPress={() => setOpen(active ? '' : item.kanji)} style={[styles.card, { backgroundColor: t.card, borderColor: active ? t.primary : t.border }]}> 
            <View style={styles.cardTop}>
              <Text style={[styles.kanji, { color: t.text, fontFamily: t.font }]}>{item.kanji}</Text>
              <View style={styles.cardBody}>
                <Text style={[styles.meaning, { color: t.text, fontFamily: t.font }]}>{item.meaning}</Text>
                <Text style={[styles.reading, { color: t.primary, fontFamily: t.font }]}>音 {item.onyomi}</Text>
                <Text style={[styles.reading, { color: t.primary, fontFamily: t.font }]}>訓 {item.kunyomi}</Text>
              </View>
            </View>
            {active && <View style={[styles.detail, { borderTopColor: t.border }]}> 
              <Text style={[styles.note, { color: t.sub, fontFamily: t.font }]}>{item.note}</Text>
              {item.examples.map((example) => <View key={`${item.kanji}-${example.word}`} style={styles.exampleRow}>
                <Text style={[styles.exampleWord, { color: t.text, fontFamily: t.font }]}>{example.word}</Text>
                <Text style={[styles.exampleText, { color: t.sub, fontFamily: t.font }]}>{example.reading} · {example.meaning}</Text>
              </View>)}
            </View>}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 16, paddingBottom: 132 },
  hero: { borderWidth: 1, borderRadius: 26, padding: 18, marginBottom: 12 },
  heroTitle: { fontSize: 28, fontWeight: '900', marginBottom: 8 },
  heroText: { lineHeight: 21, fontWeight: '700' },
  info: { borderWidth: 1, borderRadius: 22, padding: 14, marginBottom: 16 },
  infoTitle: { fontSize: 16, fontWeight: '900', marginBottom: 6 },
  infoText: { lineHeight: 20 },
  sectionTitle: { fontSize: 20, fontWeight: '900', marginBottom: 10 },
  card: { borderWidth: 1, borderRadius: 22, padding: 14, marginBottom: 10 },
  cardTop: { flexDirection: 'row', gap: 14, alignItems: 'center' },
  kanji: { fontSize: 54, fontWeight: '900', width: 72, textAlign: 'center' },
  cardBody: { flex: 1, gap: 3 },
  meaning: { fontSize: 16, fontWeight: '900' },
  reading: { fontSize: 13, fontWeight: '800' },
  detail: { borderTopWidth: 1, marginTop: 12, paddingTop: 12, gap: 8 },
  note: { lineHeight: 19, fontWeight: '700' },
  exampleRow: { gap: 2 },
  exampleWord: { fontSize: 18, fontWeight: '900' },
  exampleText: { fontWeight: '700' }
});
