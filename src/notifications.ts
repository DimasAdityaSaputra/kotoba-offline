import * as Notifications from 'expo-notifications';
import { getProfileValue, saveProfileValue } from './db';

const BODIES = [
  'Latihan 5 menit. Otak lu gak bakal meledak.',
  'Buka Kotoba. Satu bab dikit aja, jangan drama.',
  'Kana nungguin. Jangan cuma jadi dekorasi HP.',
  'Review kotoba dulu. Nanti lupa terus nyalahin hidup.',
  'Satu quiz pendek. Yang penting streak jalan.',
  'Cek flashcard susah. Musuh jangan dibiarkan hidup.',
  'Belajar Jepang sebentar. Scroll medsos udah cukup ngasih trauma.',
  'Tambah 3 kotoba baru. Kecil, tapi jalan.',
  'Angka Jepang dulu. Biar せん dan に gak berantem lagi.',
  'Latihan nulis kana. Jari lu butuh kerja juga.',
  'Buka app. Pilih mode campur. Hajar pelan-pelan.',
  'Review bab terakhir. Otak perlu refresh, bukan cuma kopi.',
  'Quiz cepat 10 soal. Kalau salah ya bagus, ketahuan bolongnya.',
  'Kotoba calling. Jangan pura-pura gak lihat notif ini.',
  'Satu kartu susah hari ini. Besok agak kurang bego. Progress.',
  'Latihan kana bentar. Garis kuning gak akan menggigit.',
  'Coba Jepang → arti. Kalau blank, berarti waktunya review.',
  'Coba arti → Jepang. Ini yang biasanya bikin mental retak.',
  'Nambah vocab dikit. Masa kalah sama rasa malas.',
  'Buka Kotoba dulu sebelum lupa semua kayak Windows update gagal.',
  'Tiga menit juga masuk. Yang penting gak nol.',
  'Flashcard susah minta disiksa lagi.',
  'Kana quiz. Tangan jalan, otak ikut nyusul.',
  'Belajar dikit sekarang, panik dikit nanti berkurang.',
  'Kotoba check. Jangan biarin streak mati konyol.',
  'Review angka Jepang. 1000 itu せん, bukan chaos.',
  'Buka Profile nanti lihat progress. Tapi progress perlu diisi dulu, boss.',
  'Satu sesi mini. Gak perlu heroik, perlu konsisten.',
  'Mode campur sekarang ada. Pakai, biar gak hafal urutan doang.',
  'Jepang gak akan masuk sendiri. Sayangnya belum ada DLC otak.'
];

export async function setupStudyNotifications() {
  const alreadyAsked = getProfileValue('notificationsAsked') === '1';
  const scheduled = getProfileValue('notificationsScheduled') === '1';
  const permission = await Notifications.getPermissionsAsync();
  let granted = permission.granted;

  if (!alreadyAsked && !granted) {
    const requested = await Notifications.requestPermissionsAsync();
    granted = requested.granted;
    saveProfileValue('notificationsAsked', '1');
  }

  if (!granted || scheduled) return;
  await Notifications.cancelAllScheduledNotificationsAsync();
  for (const hour of [8, 13, 19]) {
    await Notifications.scheduleNotificationAsync({
      content: { title: 'Kotoba time', body: pickBody(), sound: true },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.CALENDAR, hour, minute: 0, repeats: true }
    });
  }
  saveProfileValue('notificationsScheduled', '1');
}

function pickBody() {
  return BODIES[Math.floor(Math.random() * BODIES.length)];
}
