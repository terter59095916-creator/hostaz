const db = require('./db');

const now = new Date();
const dailyStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

console.log('Server hazirki vaxti (UTC):', now.toISOString());
console.log('Gunluk baslangic (hesablanmis):', dailyStart);

const allRows = db.prepare("SELECT * FROM transactions WHERE type = 'total_kisses_period' ORDER BY id DESC LIMIT 20").all();
console.log('Son 20 total_kisses_period yazisi:');
allRows.forEach(r => console.log('  user_id=' + r.user_id + ' created_at=' + r.created_at));

const dailyRows = db.prepare("SELECT user_id, SUM(amount) as cnt FROM transactions WHERE type = 'total_kisses_period' AND created_at >= ? GROUP BY user_id").all(dailyStart);
console.log('Gunluk sorgu neticesi:');
console.log(JSON.stringify(dailyRows));
