const { createClient } = require('@libsql/client');
const path = require('path');
const crypto = require('crypto');

const tursoUrl = process.env.TURSO_DATABASE_URL || `file:${path.join(__dirname, '..', 'data', 'us_rx.db').replace(/\\/g, '/')}`;
const tursoToken = process.env.TURSO_AUTH_TOKEN;

const newPassword = process.argv[2];
const username = process.argv[3] || 'admin';

if (!newPassword) {
  console.log('\n❌ Ошибка: Укажите новый пароль.');
  console.log('Использование:');
  console.log('  node scripts/change_admin_password.js <новый_пароль> [логин]\n');
  console.log('Пример:');
  console.log('  node scripts/change_admin_password.js MyNewPass2026! admin\n');
  process.exit(1);
}

async function run() {
  try {
    const client = createClient({ url: tursoUrl, authToken: tursoToken });
    const user = await client.execute({
      sql: 'SELECT id, username FROM admin_users WHERE username = ?',
      args: [username]
    });

    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(newPassword, salt, 10000, 32, 'sha256').toString('hex');
    const passwordHash = `${salt}:${hash}`;

    if (user.rows.length === 0) {
      await client.execute({
        sql: `INSERT INTO admin_users (username, password_hash, name, role) VALUES (?, ?, 'Administrator', 'superadmin')`,
        args: [username, passwordHash]
      });
      console.log(`\n✅ Создан новый администратор "${username}" с указанным паролем!`);
    } else {
      await client.execute({
        sql: 'UPDATE admin_users SET password_hash = ? WHERE username = ?',
        args: [passwordHash, username]
      });
      console.log(`\n✅ Пароль для пользователя "${username}" успешно изменен!`);
    }

    console.log(`🔑 Логин: ${username}`);
    console.log(`🔒 Новый пароль: ${newPassword}\n`);
  } catch (err) {
    console.error('\n❌ Ошибка при смене пароля:', err.message);
    process.exit(1);
  }
}

run();
