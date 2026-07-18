declare module 'node:child_process' {
  export function execFile(
    file: string,
    args: string[],
    options: { encoding: 'utf8'; timeout: number; windowsHide: boolean },
    callback: (error: unknown, stdout: string, stderr: string) => void,
  ): void
}
