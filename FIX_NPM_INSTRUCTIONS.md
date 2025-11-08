# 🔧 Fix Frontend npm Installation

## Problem

You're experiencing `ENOTEMPTY` errors and peer dependency conflicts when trying to install npm packages.

---

## Solution

### **Option 1: Run the Fix Script (Recommended)**

Open **WSL terminal** (not PowerShell) and run:

```bash
cd /mnt/c/Users/kharm/Desktop/Production\ Projects/EncryptedMedia/frontend
chmod +x fix-npm-install.sh
./fix-npm-install.sh
```

This will:
1. ✓ Remove node_modules and package-lock.json
2. ✓ Clear npm cache
3. ✓ Reinstall all dependencies with proper flags
4. ✓ Install framer-motion for the new creation wizards

---

### **Option 2: Manual Steps**

If the script doesn't work, run these commands **in WSL**:

```bash
# Navigate to frontend
cd /mnt/c/Users/kharm/Desktop/Production\ Projects/EncryptedMedia/frontend

# Remove old files
rm -rf node_modules package-lock.json

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
npm install --legacy-peer-deps

# Install framer-motion
npm install framer-motion --legacy-peer-deps
```

---

### **Option 3: Nuclear Option (If still failing)**

If you're still having issues, try this:

```bash
cd /mnt/c/Users/kharm/Desktop/Production\ Projects/EncryptedMedia/frontend

# Close ALL VS Code windows and terminals first!

# Remove node_modules (Windows might lock files)
rm -rf node_modules

# If that fails, use PowerShell AS ADMIN:
# Remove-Item -Recurse -Force node_modules

# Then in WSL:
rm -f package-lock.json
npm cache clean --force
npm install --force
npm install framer-motion --force
```

---

## Why `--legacy-peer-deps`?

Your project uses **React 19** but some packages (like `@keystonehq/sdk`, `valtio`) expect React 16/17/18. The `--legacy-peer-deps` flag tells npm to ignore these version mismatches (they're just warnings, not breaking issues).

---

## After Installation

Once npm install succeeds, you can:

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Test the new creation pages:**
   - Navigate to any `/artist/*/create` route
   - Experience the new multi-step wizard!
   - First-time tutorial will guide you through

---

## Still Having Issues?

### **ENOTEMPTY Error Persists?**

This is a WSL/Windows file system issue. Try:

1. **Close ALL applications** that might be accessing the frontend folder
   - VS Code
   - Terminal windows
   - File Explorer

2. **Restart WSL:**
   ```bash
   wsl --shutdown
   # Then open WSL again
   ```

3. **Run from native WSL path** (avoid /mnt/c):
   ```bash
   # Copy project to WSL home
   cp -r /mnt/c/Users/kharm/Desktop/Production\ Projects/EncryptedMedia ~/EncryptedMedia
   cd ~/EncryptedMedia/frontend
   npm install --legacy-peer-deps
   ```

### **Peer Dependency Warnings?**

These are **safe to ignore**. They're just warnings that some packages prefer older React versions. Your app will work fine with React 19.

---

## Quick Reference

**Good command (WSL):**
```bash
npm install --legacy-peer-deps
```

**Bad command (PowerShell):**
```powershell
npm install  # Won't work, npm not in PATH
```

**Where to run commands:**
- ✅ **WSL Terminal** (Ubuntu/Linux)
- ❌ **PowerShell** (npm not available)
- ❌ **CMD** (npm not available)

---

## Summary

1. Open **WSL**
2. `cd` to frontend folder
3. Run `./fix-npm-install.sh`
4. Wait for installation to complete
5. Run `npm run dev`
6. Test new creation pages! 🎉

