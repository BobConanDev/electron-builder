import { Lazy } from "lazy-val"
import { VmManager } from "./vm"
import { log } from "builder-util"

export class DockerVmManager extends VmManager {
  constructor() {
    super()
  }

  readonly powershellCommand = new Lazy<string>(async () => {
    log.info(null, "identified inside docker container, checking for `pwsh` for powershell")
    try {
      await this.exec("pwsh", ["--version"])
      return Promise.resolve("pwsh")
    } catch (error: any) {
      const errorMessage = "unable to find `pwsh` within docker container, please install per https://learn.microsoft.com/en-us/powershell/scripting/install/installing-powershell-on-linux"
      log.error({ executable: "pwsh", message: error.message ?? error.stack }, errorMessage)
      throw new Error(error.message ?? error.stack)
    }
  })
}
