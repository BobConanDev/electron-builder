import { DebugLogger, exec, ExtraSpawnOptions, InvalidConfigurationError, orIfFileNotExist, orNullIfFileNotExist, spawn } from "builder-util"
import { ExecFileOptions, SpawnOptions } from "child_process"
import { readFileSync, statSync } from "fs-extra"
import * as path from "path"

export class VmManager {
  get pathSep(): string {
    return path.sep
  }

  exec(file: string, args: Array<string>, options?: ExecFileOptions, isLogOutIfDebug = true): Promise<string> {
    return exec(file, args, options, isLogOutIfDebug)
  }

  spawn(file: string, args: Array<string>, options?: SpawnOptions, extraOptions?: ExtraSpawnOptions): Promise<any> {
    return spawn(file, args, options, extraOptions)
  }

  toVmFile(file: string): string {
    return file
  }

  getPSCmd(): Promise<string> {
    return this.exec("powershell.exe", ["-NoProfile", "-NonInteractive", "-Command", `Get-Command pwsh.exe`])
      .then(() => {
        return "pwsh.exe"
      })
      .catch(() => {
        return "powershell.exe"
      })
  }
}

export async function getWindowsVm(debugLogger: DebugLogger): Promise<VmManager> {
  if (isDocker()) {
    const dockerVmModule = await import("./DockerVm")
    return new dockerVmModule.DockerVmManager()
  }
  const parallelsVmModule = await import("./ParallelsVm")
  const vmList = (await parallelsVmModule.parseVmList(debugLogger)).filter(it => ["win-10", "win-11"].includes(it.os))
  if (vmList.length === 0) {
    throw new InvalidConfigurationError("Cannot find suitable Parallels Desktop virtual machine (Windows 10 is required)")
  }

  // prefer running or suspended vm
  return new parallelsVmModule.ParallelsVmManager(vmList.find(it => it.state === "running") || vmList.find(it => it.state === "suspended") || vmList[0])
}

let isDockerCached: boolean | undefined

function hasDockerEnv() {
  try {
    statSync("/.dockerenv")
    return true
  } catch {
    return false
  }
}

function hasDockerCGroup() {
  try {
    return readFileSync("/proc/self/cgroup", "utf8").includes("docker")
  } catch {
    return false
  }
}

function isDocker() {
  // TODO: Use `??=` when targeting Node.js 16.
  if (isDockerCached === undefined) {
    isDockerCached = hasDockerEnv() || hasDockerCGroup()
  }

  return isDockerCached
}
