import { VmManager } from "./vm";

export class DockerVmManager extends VmManager {
  constructor() {
    super()
  }

  getPSCmd(): Promise<string> {
    return Promise.resolve("pwsh")
  }
}
