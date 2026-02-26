import os
import re
import json
import argparse
from pathlib import Path

def extract_strings_from_file(file_path):
    """
    Extract hardcoded strings from a .tsx or .ts file.
    This is a heuristic implementation focused on common React patterns.
    """
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Heuristic: Find text between JSX tags
    # Example: <div>Hello World</div> -> "Hello World"
    jsx_text = re.findall(r'>([^<{}>]+)<', content)
    
    # Heuristic: Find string literals in common props like placeholder, label, etc.
    # Example: placeholder="Enter name" -> "Enter name"
    prop_text = re.findall(r'(?:placeholder|label|title|description|text)="([^"]+)"', content)
    
    # Heuristic: Find toast messages or alerts
    toast_text = re.findall(r'(?:toast\.success|toast\.error|AlertDescription)\(\s*[\'"]([^\'"]+)[\'"]', content)

    # Clean and filter
    found_strings = set()
    for s in jsx_text + prop_text + toast_text:
        s = s.strip()
        # Filter out numbers, single characters, icons (looks like Icon...), or code-like strings
        if len(s) > 1 and not s.startswith('Icon') and not s.replace(' ', '').isalnum() is False:
             # Basic check to avoid common false positives like "icon", "sm", "lg", etc.
             if s.lower() not in ['sm', 'lg', 'md', 'xl', '2xl', 'default', 'outline', 'ghost']:
                 found_strings.add(s)

    return found_strings

def main():
    parser = argparse.ArgumentParser(description='Extract hardcoded strings from TSX/TS files for i18n.')
    parser.add_argument('--dir', type=str, default='src', help='Directory to scan')
    parser.add_argument('--output', type=str, default='extracted_strings.json', help='Output JSON file')
    args = parser.parse_args()

    all_strings = set()
    root_dir = Path(args.dir)

    print(f"Scanning directory: {root_dir}")

    for file_path in root_dir.rglob('*.tsx'):
        strings = extract_strings_from_file(file_path)
        all_strings.update(strings)
        
    for file_path in root_dir.rglob('*.ts'):
        # Skip certain files like middleware, types, generated files
        if any(skip in str(file_path) for skip in ['__generated__', 'types', 'middleware', 'request.ts']):
            continue
        strings = extract_strings_from_file(file_path)
        all_strings.update(strings)

    # Convert to a basic JSON structure
    output_data = {
        "Extracted": { s.replace(' ', '_').lower(): s for s in sorted(list(all_strings)) }
    }

    with open(args.output, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, indent=2, ensure_ascii=False)

    print(f"Extraction complete! Found {len(all_strings)} strings.")
    print(f"Saved to: {args.output}")

if __name__ == "__main__":
    main()
