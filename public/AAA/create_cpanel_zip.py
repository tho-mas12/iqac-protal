"""
Helper script to package the IQAC AAA Dashboard for cPanel deployment.
Generates 'iqac_aaa_cpanel.zip' ready to upload to public_html.
"""
import os
import zipfile

OUTPUT_ZIP = 'iqac_aaa_cpanel.zip'

EXCLUDE_PATTERNS = [
    OUTPUT_ZIP,
    'create_cpanel_zip.py',
    'generate_samples.py',
    'run_dashboard.py',
    'start_dashboard.bat',
    '.git',
    '.gitignore',
    '__pycache__',
    'node_modules'
]

def make_zip():
    print(f"Creating {OUTPUT_ZIP} for cPanel deployment...")
    with zipfile.ZipFile(OUTPUT_ZIP, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk('.'):
            # Prune excluded dirs
            dirs[:] = [d for d in dirs if d not in EXCLUDE_PATTERNS and not d.startswith('.')]
            
            for file in files:
                if any(pat in file for pat in EXCLUDE_PATTERNS):
                    continue
                if file.endswith('.pyc') or file.startswith('.'):
                    # Keep .htaccess even if it starts with .
                    if file != '.htaccess':
                        continue
                
                filepath = os.path.join(root, file)
                arcname = os.path.relpath(filepath, '.')
                print(f"  + Packing: {arcname}")
                zipf.write(filepath, arcname)
                
    file_size_mb = os.path.getsize(OUTPUT_ZIP) / (1024 * 1024)
    print(f"\n[OK] Package created: {OUTPUT_ZIP} ({file_size_mb:.2f} MB)")
    print("Upload this zip file to your cPanel File Manager and extract it!")

if __name__ == '__main__':
    make_zip()
