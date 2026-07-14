const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Helper to recursively copy directories
function copyFolderSync(from, to) {
  if (!fs.existsSync(to)) {
    fs.mkdirSync(to, { recursive: true });
  }
  fs.readdirSync(from).forEach(element => {
    const fromPath = path.join(from, element);
    const toPath = path.join(to, element);
    if (fs.lstatSync(fromPath).isDirectory()) {
      copyFolderSync(fromPath, toPath);
    } else {
      fs.copyFileSync(fromPath, toPath);
    }
  });
}

function cleanFolderSync(folderPath) {
  if (fs.existsSync(folderPath)) {
    fs.rmSync(folderPath, { recursive: true, force: true });
  }
}

async function main() {
  console.log('=== [1/4] STARTING INTEGRATED DEMO BUILD ===');
  
  // Ensure all dependencies (including devDependencies) are installed for building
  console.log('\n>>> Ensuring all dependencies (including devDependencies) are installed...');
  try {
    execSync('npm install --include=dev', { stdio: 'inherit' });
    console.log('✔ Dependencies installed successfully.');
  } catch (err) {
    console.error('❌ Dependency installation failed.');
    process.exit(1);
  }

  // 1. Build Frontend
  console.log('\n>>> Building Frontend (React)...');
  try {
    execSync('npm run build --workspace=apps/frontend', { stdio: 'inherit' });
    console.log('✔ Frontend built successfully.');
  } catch (err) {
    console.error('❌ Frontend build failed.');
    process.exit(1);
  }

  // 2. Build Backend
  console.log('\n>>> Generating Prisma Client...');
  try {
    execSync('npx prisma generate --schema=apps/backend/prisma/schema.prisma', { stdio: 'inherit' });
    console.log('✔ Prisma client generated.');
  } catch (err) {
    console.error('❌ Prisma generation failed.');
    process.exit(1);
  }

  console.log('\n>>> Building Backend (NestJS)...');
  try {
    execSync('npm run build --workspace=apps/backend', { stdio: 'inherit' });
    console.log('✔ Backend built successfully.');
  } catch (err) {
    console.error('❌ Backend build failed.');
    process.exit(1);
  }

  // 3. Prepare client static folder in backend
  console.log('\n>>> Copying frontend assets to backend static directory...');
  const srcDist = path.join(__dirname, 'apps', 'frontend', 'dist');
  const destClient = path.join(__dirname, 'apps', 'backend', 'client');

  try {
    cleanFolderSync(destClient);
    copyFolderSync(srcDist, destClient);
    console.log(`✔ Assets copied from ${srcDist} to ${destClient}`);
  } catch (err) {
    console.error('❌ Failed to copy static assets:', err.message);
    process.exit(1);
  }

  console.log('\n=== [4/4] INTEGRATED DEMO BUILD SUCCEEDED! ===');
  console.log('\n[데모 서버 실행 방법]');
  console.log('1. backend 폴더로 이동: cd apps/backend');
  console.log('2. 프로덕션 실행: npm run start:prod');
  console.log('3. 접속 주소: http://localhost:3001');
}

main();
