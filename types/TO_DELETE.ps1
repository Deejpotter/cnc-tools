# PowerShell script to delete unused type files
Remove-Item -Path "types\types.ts" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "types\materials.ts" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "types\hui-types.d.ts" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "types\navigation.d.ts" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "types\stylis.d.ts" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "types\images.d.ts" -Force -ErrorAction SilentlyContinue
