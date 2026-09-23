// create-admin.js — İlk admin istifadəçisini yaratmaq üçün
// İstifadə: node create-admin.js istifadeciadi parol

const { createAdmin } = require('./auth');

const [, , username, password] = process.argv;

if (!username || !password) {
  console.log('İstifadə: node create-admin.js <istifadeciadi> <parol>');
  process.exit(1);
}

try {
  createAdmin(username, password);
  console.log(`✅ Admin yaradıldı: ${username}`);
} catch (e) {
  console.error('❌ Xəta:', e.message);
}
