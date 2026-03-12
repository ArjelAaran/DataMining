import re
import os
import sys

def strip_comments(text, ext):
    if ext == '.py':
        regex = r'(\"\"\"[\s\S]*?\"\"\"|\'\'\'[\s\S]*?\'\'\'|\"(?:\\.|[^\"\n])*\"|\'(?:\\.|[^\'\n])*\')|(#.*$)'
        def replace(match):
            if match.group(2) is not None:
                return ""
            elif match.group(1).startswith('"""') or match.group(1).startswith("'''"):
                return "" 
            else:
                return match.group(1)
        text = re.sub(regex, replace, text, flags=re.MULTILINE)
        text = "\n".join(line.rstrip() for line in text.splitlines())
        text = re.sub(r'^\s*$\n', '', text, flags=re.MULTILINE)
        return text
    
    elif ext in ['.ts', '.tsx', '.js', '.jsx', '.css']:
        regex = r'(\"(?:\\.|[^\"\n])*\"|\'(?:\\.|[^\'\n])*\'|`(?:\\.|[^`])*`)|(/\*[\s\S]*?\*/|//.*$)'
        def replace(match):
            if match.group(2) is not None:
                return ""
            else:
                return match.group(1)
        text = re.sub(regex, replace, text, flags=re.MULTILINE)
        text = "\n".join(line.rstrip() for line in text.splitlines())
        text = re.sub(r'^\s*$\n', '', text, flags=re.MULTILINE)
        return text
    
    elif ext in ['.html', '.md']:
        text = re.sub(r'<!--[\s\S]*?-->', '', text)
        text = "\n".join(line.rstrip() for line in text.splitlines())
        return text
    
    return text

def process_file(filepath):
    _, ext = os.path.splitext(filepath)
    ext = ext.lower()
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        new_content = strip_comments(content, ext)
        
        # Final cleanup for multiple newlines
        new_content = re.sub(r'\n{3,}', '\n\n', new_content)
        
        if content != new_content:
            with open(filepath, 'w', encoding='utf-8', newline='\n') as f:
                f.write(new_content)
            print(f"Processed: {filepath}")
        else:
            print(f"No comments found in: {filepath}")
    except Exception as e:
        print(f"Error processing {filepath}: {e}")

if __name__ == "__main__":
    paths = sys.argv[1:]
    if not paths:
        paths = ['.']
    for p in paths:
        if os.path.isfile(p):
            process_file(p)
        elif os.path.isdir(p):
             for root, dirs, filenames in os.walk(p):
                 if 'node_modules' in dirs:
                     dirs.remove('node_modules')
                 if '.git' in dirs:
                     dirs.remove('.git')
                 for filename in filenames:
                     if filename.endswith(('.py', '.ts', '.tsx', '.js', '.jsx', '.css', '.html', '.md')):
                         process_file(os.path.join(root, filename))
