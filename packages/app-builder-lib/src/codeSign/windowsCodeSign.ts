import { log, retry } from "builder-util"
import { WindowsConfiguration } from "../options/winOptions"
import { WinPackager } from "../winPackager"

export interface WindowsSignOptions {
  readonly path: string
  readonly options: WindowsConfiguration
}

export async function signWindows(options: WindowsSignOptions, packager: WinPackager): Promise<boolean> {
  if (options.options.azureSignOptions) {
    if (options.options.signtoolOptions) {
      log.warn(null, "ignoring signtool options, using Azure Trusted Signing; please only configure one")
    }
    log.info({ path: log.filePath(options.path) }, "signing with Azure Trusted Signing (beta)")
  } else {
    log.info({ path: log.filePath(options.path) }, "signing with signtool.exe")
    const deprecatedFields = {
      sign: options.options.sign,
      signDlls: options.options.signDlls,
      signingHashAlgorithms: options.options.signingHashAlgorithms,
      certificateFile: options.options.certificateFile,
      certificatePassword: options.options.certificatePassword,
      certificateSha1: options.options.certificateSha1,
      certificateSubjectName: options.options.certificateSubjectName,
      additionalCertificateFile: options.options.additionalCertificateFile,
      rfc3161TimeStampServer: options.options.rfc3161TimeStampServer,
      timeStampServer: options.options.timeStampServer,
      publisherName: options.options.publisherName,
    }
    const fields = Object.entries(deprecatedFields)
      .filter(([, value]) => !!value)
      .map(([field]) => field)
    if (fields.length) {
      log.warn({ fields, reason: "please move to win.signtoolOptions.<field_name>" }, `deprecated field`)
    }
  }
  const packageManager = await packager.signingManager.value
  return signWithRetry(async () => packageManager.signFile(options))
}

function signWithRetry(signer: () => Promise<boolean>): Promise<boolean> {
  return retry(signer, 3, 1000, 1000, 0, (e: any) => {
    const message = e.message
    if (
      // https://github.com/electron-userland/electron-builder/issues/1414
      message?.includes("Couldn't resolve host name") ||
      // https://github.com/electron-userland/electron-builder/issues/8615
      message?.includes("being used by another process.")
    ) {
      log.warn({ error: message }, "attempt to sign failed, another attempt will be made")
      return true
    }
    return false
  })
}
