/**
 * engine.js — Spawns the C++ SchedViz engine binary as a child process.
 *
 * Protocol:
 *   - Write JSON input to the child's stdin (then close stdin)
 *   - Collect stdout until process exits
 *   - Collect stderr separately
 *   - On exit code 0: parse and return stdout as JSON
 *   - On non-zero exit or stderr content: throw an error
 *   - Timeout after 10 seconds (kill the process)
 */

const { spawn } = require('child_process');
const path = require('path');

/**
 * Runs the C++ engine with the given input payload.
 * @param {Object} payload - The JSON object to send to the engine via stdin
 * @returns {Promise<Object>} - Parsed JSON result from the engine
 */
function runEngine(payload) {
  return new Promise((resolve, reject) => {
    // Resolve engine path relative to this file's location
    const enginePath = path.resolve(
      __dirname,
      process.env.ENGINE_PATH || '../../engine/bin/schedviz_engine'
    );

    const child = spawn(enginePath, [], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';
    let timedOut = false;

    // Set a 10-second timeout to prevent hanging
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill('SIGKILL');
      reject(new Error('Engine process timed out after 10 seconds'));
    }, 10000);

    // Collect stdout
    child.stdout.on('data', (data) => { stdout += data.toString(); });

    // Collect stderr (engine writes errors here)
    child.stderr.on('data', (data) => { stderr += data.toString(); });

    // Handle process exit
    child.on('close', (code) => {
      clearTimeout(timer);
      if (timedOut) return; // already rejected

      if (code !== 0) {
        const errMsg = stderr.trim() || `Engine exited with code ${code}`;
        return reject(new Error(`Engine error: ${errMsg}`));
      }

      try {
        const result = JSON.parse(stdout.trim());
        resolve(result);
      } catch (parseErr) {
        reject(new Error(`Failed to parse engine output: ${stdout.trim()}`));
      }
    });

    child.on('error', (err) => {
      clearTimeout(timer);
      if (err.code === 'ENOENT') {
        reject(new Error(
          `Engine binary not found at: ${enginePath}. ` +
          'Please compile the engine first using: cd engine && bash build.sh'
        ));
      } else {
        reject(err);
      }
    });

    // Write input JSON to stdin and close it
    const inputJson = JSON.stringify(payload);
    child.stdin.write(inputJson);
    child.stdin.end();
  });
}

module.exports = { runEngine };
