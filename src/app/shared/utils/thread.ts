import { ExecException, exec, spawn, ChildProcess } from "child_process";

export function threadKill(pid: number, callback: (error: ExecException, stdout?: string, stderr?: string) => void = (err) => {
  if(err) {
    console.error(err);
  }
}, signal?: string | number): void {
  const tree: {[key:number]: Array<number>;} = {};
  const pidsToProcess: {[key:number]: number;} = {};
  tree[pid] = [];
  pidsToProcess[pid] = 1;
  switch (process.platform) {
    // win32
    case "win32":
      exec("taskkill /pid " + pid + " /T /F", callback);
      break;
    // darwin
    case "darwin":
      buildProcessTree(pid, tree, pidsToProcess, (parentPid) => spawn("pgrep", ["-P", parentPid]), () => killAll(tree, callback, signal));
      break;
    // linux
    default:
      buildProcessTree(pid, tree, pidsToProcess, (parentPid) => spawn("ps", ["-o", "pid", "--no-headers", "--ppid", parentPid]), () => killAll(tree, callback, signal));
      break;
  }
}

function killAll(tree: {[key:number]: Array<number>;}, callback: (error: ExecException, stdout?: string, stderr?: string) => void = (err) => {
  if(err) {
    console.error(err);
  }
}, signal?: string | number) {
  var killed: {[key: string]: number} = {};
  try {
    for(const pid of Object.keys(tree)) {
      tree[pid].forEach((pidpid: string) => {
        if (!killed[pidpid]) {
          killPid(pidpid, signal);
          killed[pidpid] = 1;
        }
      });
      if (!killed[pid]) {
        killPid(pid, signal);
        killed[pid] = 1;
      }
    }
    if (callback) {
      callback(undefined);
    }
  } catch (error) {
    if (callback) {
      callback(error);
    } else {
      throw error;
    }
  }
}

function killPid(pid: string, signal?: string | number) {
  try {
    process.kill(parseInt(pid, 10), signal);
  } catch (error) {
    if (error.code !== "ESRCH") throw error;
  }
}

function buildProcessTree(parentPid: number, tree: {[key:number]: Array<number>;}, pidsToProcess: {[key:number]: number;}, spawnChildProcessesList: (parentPid: string) => ChildProcess, callback: () => void) {
  let allData: string = "";
  const ps = spawnChildProcessesList(parentPid.toString());
  ps.stdout.on("data", (data) => allData = allData + data.toString("ascii"));
  ps.on("close", (code: number) => {
    delete pidsToProcess[parentPid];
    if (code !== 0) {
      // no more parent processes
      if (Object.keys(pidsToProcess).length === 0) {
        callback();
      }
      return;
    }
    for(const pid of allData.match(/\d+/g)) {
      const id = parseInt(pid, 10);
      tree[parentPid].push(id);
      tree[id] = [];
      pidsToProcess[id] = 1;
      buildProcessTree(id, tree, pidsToProcess, spawnChildProcessesList, callback);
    }
  });
}

export function portKill(port: number) {
  const command = (process.platform == "win32" ? "netstat -ano | findstr " : "netstat -ntp | grep ") + ':' + port;
  console.log(command);
  exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(error);
        return;
      }
      console.log(command);
      console.log(stdout);
      if(stdout && stdout !== '') {
        const res = new Set(stdout.split("\n").map((line) => {
          const p = line.trim().split(/\s+/);
          let pid: string = p[p.length - 1];
          if(process.platform !== "win32") {
            pid = pid.slice(0, pid.indexOf('\\'));
          }
          return pid;
        }));
        res.forEach((pid) => {
          if(parseInt(pid)) {
            console.log('thread ' + pid + ' will be killed.');
            process.kill(parseInt(pid));
          }
        })
      }
    }
  );
}
