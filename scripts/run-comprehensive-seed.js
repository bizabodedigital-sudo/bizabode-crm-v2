const { execSync } = require('child_process')
const path = require('path')

console.log('🌱 Running comprehensive database seeding...')

try {
  // Run the TypeScript seed file
  execSync('npx tsx scripts/comprehensive-seed.ts', {
    cwd: path.resolve(__dirname, '..'),
    stdio: 'inherit'
  })
  
  console.log('✅ Comprehensive seed data created successfully!')
} catch (error) {
  console.error('❌ Failed to run seed script:', error.message)
  process.exit(1)
}
