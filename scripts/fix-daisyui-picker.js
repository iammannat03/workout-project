#!/usr/bin/env node

/**
 * Script to fix invalid CSS pseudo-elements in DaisyUI files
 * Removes unsupported pseudo-elements: ::picker, ::details-content, etc.
 * This runs after npm install to ensure the fix is always applied
 * Fixes both CSS files and JavaScript source files that generate CSS
 */

const fs = require('fs');
const path = require('path');

// Files to fix - both CSS and JS source files
const filesToFix = [
  'node_modules/daisyui/components/select.css',
  'node_modules/daisyui/daisyui.css',
  'node_modules/daisyui/components/select/object.js',
  'node_modules/daisyui/components/input.css',
  'node_modules/daisyui/components/calendar.css',
  'node_modules/daisyui/components/collapse.css',
  'node_modules/daisyui/components/collapse/object.js',
];

function fixFile(filePath) {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    return false;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  const originalContent = content;
  
  // Remove all unsupported pseudo-element references as they're not supported by the CSS parser
  // These pseudo-elements cause parsing errors: ::picker, ::details-content, etc.
  
  // Remove ::picker pseudo-element references
  content = content.replace(/["']&::picker\(select\),\s*select::picker\(select\)["']:\s*\{[^}]*\}/g, '');
  content = content.replace(/["']&::picker\(select\)["']:\s*\{[^}]*\}/g, '');
  content = content.replace(/["']select::picker\(select\)["']:\s*\{[^}]*\}/g, '');
  content = content.replace(/["'][^"']*::picker[^"']*["']:\s*\{[^}]*\}/g, '');
  content = content.replace(/::picker\(select\)/g, '');
  content = content.replace(/::picker/g, '');
  
  // Remove ::details-content pseudo-element references
  content = content.replace(/::details-content/g, '');
  content = content.replace(/["'][^"']*::details-content[^"']*["']:\s*\{[^}]*\}/g, '');
  
  // Remove any other unsupported pseudo-elements that might cause issues
  // Pattern: ::pseudo-element-name (but keep common ones like ::before, ::after, ::placeholder)
  const supportedPseudoElements = ['before', 'after', 'placeholder', 'first-line', 'first-letter', 'selection', 'backdrop'];
  const unsupportedPattern = /::(?!\b(?:before|after|placeholder|first-line|first-letter|selection|backdrop)\b)[a-z-]+/g;
  content = content.replace(unsupportedPattern, '');
  
  // Clean up empty objects and trailing commas
  content = content.replace(/,\s*,\s*/g, ',');
  content = content.replace(/,\s*}/g, '}');
  content = content.replace(/{\s*,/g, '{');
  
  if (content !== originalContent) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✓ Fixed ${filePath}`);
    return true;
  }
  
  return false;
}

let fixedCount = 0;
filesToFix.forEach((filePath) => {
  if (fixFile(filePath)) {
    fixedCount++;
  }
});

if (fixedCount > 0) {
  console.log(`DaisyUI picker fix applied successfully! Fixed ${fixedCount} file(s).`);
} else {
  console.log('DaisyUI picker fix: No files needed fixing (already fixed or not found).');
}

