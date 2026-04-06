const { spawn } = require('node:child_process');
const path = require('node:path');

const rootDir = path.resolve(__dirname, '..');

const processes = [
  {
    name: 'frontend',
    color: '\x1b[36m',
    command: 'npm',
    args: ['--prefix', 'frontend', 'start'],
  },
  {
    name: 'backend',
    color: '\x1b[33m',
    command: 'npm',
    args: ['--prefix', 'backend', 'run', 'start:dev'],
  },
];

const reset = '\x1b[0m';
const children = [];

function prefixOutput(name, color, chunk) {
  const lines = chunk.toString().split(/\r?\n/);
  lines
    .filter((line) => line.length > 0)
    .forEach((line) => {
      process.stdout.write(`${color}[${name}]${reset} ${line}\n`);
    });
}

processes.forEach((processConfig) => {
  const child = spawn(processConfig.command, processConfig.args, {
    cwd: rootDir,
    shell: true,
    env: process.env,
  });

  child.stdout.on('data', (chunk) =>
    prefixOutput(processConfig.name, processConfig.color, chunk),
  );

  child.stderr.on('data', (chunk) =>
    prefixOutput(processConfig.name, processConfig.color, chunk),
  );

  child.on('exit', (code) => {
    process.stdout.write(
      `${processConfig.color}[${processConfig.name}]${reset} exited with code ${code ?? 0}\n`,
    );
  });

  children.push(child);
});

function shutdown(signal) {
  children.forEach((child) => {
    if (!child.killed) {
      child.kill(signal);
    }
  });
  process.exit();
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
