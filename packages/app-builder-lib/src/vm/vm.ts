import { DebugLogger, exec, exists, ExtraSpawnOptions, InvalidConfigurationError, log, spawn } from "builder-util"
import { ExecFileOptions, SpawnOptions } from "child_process"
import { readFile } from "fs-extra"
import { Lazy } from "lazy-val"
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

  readonly powershellCommand = new Lazy(() => {
    return this.exec("powershell.exe", ["-NoProfile", "-NonInteractive", "-Command", `Get-Command pwsh.exe`])
      .then(() => {
        log.info(null, "identified pwsh.exe")
        return "pwsh.exe"
      })
      .catch(() => {
        log.info(null, "unable to find pwsh.exe, falling back to powershell.exe")
        return "powershell.exe"
      })
  })
}

export async function getWindowsVm(debugLogger: DebugLogger): Promise<VmManager> {
  if (await isDocker.value) {
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

const isDocker = new Lazy(async () => {
  try {
    return (await exists("/.dockerenv")) || (await readFile("/proc/self/cgroup", "utf8")).includes("docker")
  } catch {
    return false
  }
})
