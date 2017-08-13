export class NsisScriptGenerator {
  private readonly lines: Array<string> = []

  addIncludeDir(file: string) {
    this.lines.push(`!addincludedir "${file}"`)
  }

  addPluginDir(pluginArch: string, dir: string) {
    this.lines.push(`!addplugindir /${pluginArch} "${dir}"`)
  }

  include(file: string) {
    this.lines.push(`!include "${file}"`)
  }

  macro(name: string, lines: Array<string> | NsisScriptGenerator) {
    this.lines.push(
      `!macro ${name}`,
      `  ${(Array.isArray(lines) ? lines : (lines as NsisScriptGenerator).lines).join("\n  ")}`,
      `!macroend\n`
    )
  }

  file(outputName: string, file: string) {
    this.lines.push(`File "/oname=${outputName}" "${file}"`)
  }

  insertMacro(name: string, parameters: string) {
    this.lines.push(`!insertmacro ${name} ${parameters}`)
  }

  flags(flags: Array<string>) {
    for (const flagName of flags) {
      const variableName = "is" + flagName[2].toUpperCase() + flagName.substring(3)
        .replace(/[\-]+(\w|$)/g, (m, p1) => p1.toUpperCase())
      this.lines.push(`!macro _${variableName} _a _b _t _f
  ClearErrors
  $\{GetParameters} $R9
  $\{GetOptions} $R9 "${flagName}" $R8
  IfErrors \`$\{_f}\` \`$\{_t}\`
!macroend
!define ${variableName} \`"" ${variableName} ""\`
`)
    }
  }

  build() {
    return this.lines.join("\n") + "\n"
  }
}