#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// Files and their catch parameter fixes to apply
const fixes = [
  // Apps/web files with simple catch parameter fixes
  {
    file: "apps/web/src/lib/performance-optimization.tsx",
    line: 166,
    old: "} catch (_error) {",
    new: "} catch {",
  },
  {
    file: "apps/web/src/components/telemedicine/routes/TelemedicineDashboard.tsx",
    line: 202,
    old: "} catch (error) {",
    new: "} catch {",
  },
  {
    file: "apps/web/src/components/telemedicine/routes/TelemedicineDashboard.tsx",
    line: 211,
    old: "} catch (error) {",
    new: "} catch {",
  },
  {
    file: "apps/web/src/components/telemedicine/routes/TelemedicineDashboard.tsx",
    line: 223,
    old: "} catch (error) {",
    new: "} catch {",
  },
  {
    file: "apps/web/src/components/telemedicine/VideoConsultation.tsx",
    line: 267,
    old: "} catch (error) {",
    new: "} catch {",
  },
  {
    file: "apps/web/src/components/telemedicine/VideoConsultation.tsx",
    line: 283,
    old: "} catch (error) {",
    new: "} catch {",
  },
  {
    file: "apps/web/src/components/telemedicine/VideoConsultation.tsx",
    line: 300,
    old: "} catch (error) {",
    new: "} catch {",
  },
  {
    file: "apps/web/src/components/telemedicine/VideoConsultation.tsx",
    line: 315,
    old: "} catch (error) {",
    new: "} catch {",
  },
  {
    file: "apps/web/src/components/telemedicine/VideoConsultation.tsx",
    line: 330,
    old: "} catch (error) {",
    new: "} catch {",
  },
  {
    file: "apps/web/src/components/ai-agent/ai-chat.tsx",
    line: 209,
    old: "} catch (_error) {",
    new: "} catch {",
  },
  {
    file: "apps/web/src/components/ai-agent/ai-chat-ws.tsx",
    line: 224,
    old: "} catch (_error) {",
    new: "} catch {",
  },
];

console.log("🔧 Fixing catch parameter warnings...\n");

fixes.forEach(({ file, line, old, new: replacement }) => {
  const filePath = path.join(__dirname, file);

  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${file}`);
    return;
  }

  try {
    const content = fs.readFileSync(filePath, "utf8");
    const lines = content.split("\n");

    if (line - 1 >= lines.length) {
      console.log(`❌ Line ${line} not found in ${file}`);
      return;
    }

    const currentLine = lines[line - 1];
    if (currentLine.trim().includes(old.trim())) {
      lines[line - 1] = currentLine.replace(old, replacement);
      fs.writeFileSync(filePath, lines.join("\n"));
      console.log(`✅ Fixed ${file}:${line}`);
    } else {
      console.log(
        `⚠️  Line ${line} in ${file} doesn't match expected pattern:`,
      );
      console.log(`   Expected: ${old}`);
      console.log(`   Found: ${currentLine.trim()}`);
    }
  } catch (error) {
    console.log(`❌ Error processing ${file}: ${error.message}`);
  }
});

console.log("\n🎉 Catch parameter fixes completed!");
