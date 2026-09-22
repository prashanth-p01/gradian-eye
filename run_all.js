const { spawn, execSync } = require('child_process');
const path = require('path');

console.log('🚀 Starting GuardianEye Platform setup and startup...');

// 1. Install frontend dependencies if needed
const frontendDir = path.join(__dirname, 'frontend');
const backendDir = path.join(__dirname, 'backend');

console.log('📦 Checking frontend npm packages...');
try {
  execSync('npm install', { cwd: frontendDir, stdio: 'inherit' });
} catch (err) {
  console.error('Error installing frontend dependencies:', err);
}

// 2. Start Node.js Express Backend
console.log('⚡ Launching GuardianEye Express Backend Server (Port 5000)...');
const backendProcess = spawn('node', ['server.js'], { cwd: backendDir, stdio: 'inherit', shell: true });

// 3. Start React Vite Frontend
console.log('🎨 Launching GuardianEye React Dashboard Server (Port 5173)...');
const frontendProcess = spawn('npx', ['vite'], { cwd: frontendDir, stdio: 'inherit', shell: true });

process.on('SIGINT', () => {
  backendProcess.kill();
  frontendProcess.kill();
  process.exit();
});
