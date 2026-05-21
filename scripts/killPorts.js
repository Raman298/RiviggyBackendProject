const { execSync } = require('child_process');

const ports = [5000, 3000];

function killPid(pid) {
  try {
    if (process.platform === 'win32') {
      execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
    } else {
      process.kill(pid, 'SIGKILL');
    }
    console.log(`Killed PID ${pid}`);
  } catch (err) {
    console.warn(`Failed to kill PID ${pid}: ${err.message}`);
  }
}

function findPidsForPort(port) {
  try {
    if (process.platform === 'win32') {
      const out = execSync('netstat -ano', { encoding: 'utf8' });
      const lines = out.split(/\r?\n/);
      const pids = new Set();
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 5) {
          const local = parts[1];
          const pid = parts[4];
          if (local && local.endsWith(`:${port}`)) {
            pids.add(pid);
          }
        }
      }
      return Array.from(pids).map(Number);
    } else {
      const out = execSync(`lsof -i :${port} -t || true`, { encoding: 'utf8' });
      return out.split(/\r?\n/).filter(Boolean).map(Number);
    }
  } catch (err) {
    return [];
  }
}

for (const port of ports) {
  const pids = findPidsForPort(port);
  if (pids.length === 0) {
    console.log(`No process listening on port ${port}`);
    continue;
  }
  for (const pid of pids) {
    console.log(`Port ${port} -> PID ${pid}`);
    killPid(pid);
  }
}
