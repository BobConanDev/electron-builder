import { Lazy } from "lazy-val"
import { VmManager } from "./vm"
import { log } from "builder-util"

export class DockerVmManager extends VmManager {
  constructor() {
    super()
  }

  readonly powershellCommand = new Lazy<string>(async () => {
    log.info(null, "identified inside docker container, checking for `pwsh` for powershell")
    const executable = "pwsh"
    try {
      await this.exec(executable, ["--version"])
      return Promise.resolve(executable)
    } catch (error: any) {
      // We don't install `powershell` in our default `wine` docker image as it adds 186mb to the image and currently is only needed for Azure Trusted Signing
      const errorMessage = `unable to find \`${executable}\` within docker container, please install per https://learn.microsoft.com/en-us/powershell/scripting/install/installing-powershell-on-linux`
      log.error({ executable, message: error.message ?? error.stack }, errorMessage)
      throw new Error(error.message ?? error.stack)
    }
  })
}
