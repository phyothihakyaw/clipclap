interface FileSystemHandlePermissionDescriptor {
  mode?: "read" | "readwrite";
}

interface FileSystemHandle {
  queryPermission(
    descriptor?: FileSystemHandlePermissionDescriptor,
  ): Promise<PermissionState>;
  requestPermission(
    descriptor?: FileSystemHandlePermissionDescriptor,
  ): Promise<PermissionState>;
}

interface FileSystemDirectoryHandle {
  queryPermission(
    descriptor?: FileSystemHandlePermissionDescriptor,
  ): Promise<PermissionState>;
  requestPermission(
    descriptor?: FileSystemHandlePermissionDescriptor,
  ): Promise<PermissionState>;
}

interface ShowDirectoryPickerOptions {
  id?: string;
  mode?: "read" | "readwrite";
  startIn?: FileSystemHandle | string;
}

interface Window {
  showDirectoryPicker(
    options?: ShowDirectoryPickerOptions,
  ): Promise<FileSystemDirectoryHandle>;
}

declare module "turndown-plugin-gfm" {
  import type { Plugin } from "turndown";
  export const gfm: Plugin;
  export const tables: Plugin;
  export const strikethrough: Plugin;
  export const taskListItems: Plugin;
}
