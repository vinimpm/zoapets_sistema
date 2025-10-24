const bcrypt = require('bcrypt');

async function test() {
  // Generate a new hash
  const newHash = await bcrypt.hash('admin123', 10);
  console.log('New hash:', newHash);

  // Test if it matches
  const matches = await bcrypt.compare('admin123', newHash);
  console.log('New hash matches admin123:', matches);

  // Test stored hash
  const storedHash = '$2b$10$gFrKzKqrJ3cU1tzSIdn7MOIQ8/32xGj0fzFLQ/shG4eIl79fTU8n.';
  const storedMatches = await bcrypt.compare('admin123', storedHash);
  console.log('Stored hash matches admin123:', storedMatches);
}

test();
