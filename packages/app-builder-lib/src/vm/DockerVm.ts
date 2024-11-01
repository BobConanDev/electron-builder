import { Lazy } from "lazy-val"
import { VmManager } from "./vm"
import { log } from "builder-util"

export class DockerVmManager extends VmManager {
  constructor() {
    super()
  }

  readonly powershellCommand = new Lazy<string>(() => {
    log.info(null, "identified inside docker container, using `pwsh` for powershell")
    return Promise.resolve("pwsh")
  })
}
