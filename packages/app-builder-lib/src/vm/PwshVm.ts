import { Lazy } from "lazy-val"
import { isPwshAvailable, VmManager } from "./vm"
import { log } from "builder-util"

export class PwshVmManager extends VmManager {
  constructor() {
    super()
  }

  readonly powershellCommand = new Lazy<string>(async () => {
    log.info(null, "checking for `pwsh` for powershell")
    if (await isPwshAvailable.value) {
      return "pwsh"
    }
    // We don't install `powershell` in our default `wine` docker image as it adds 186mb to the image and currently is only needed for Azure Trusted Signing
    const errorMessage = `unable to find \`pwsh\` within docker container, please install per https://learn.microsoft.com/en-us/powershell/scripting/install/installing-powershell-on-linux`
    log.error(null, errorMessage)
    throw new Error(errorMessage)
  })
}
