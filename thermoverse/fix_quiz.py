import re
import os

files = ['level1.html', 'level2.html', 'level3.html']
base_dir = '/Users/macair4/Documents/build/ThermoExplore/thermoverse/'

for filename in files:
    filepath = os.path.join(base_dir, filename)
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Fix the wrapper div
    content = content.replace(
        '<div class="options-grid" style="display: block; padding-left: 20px;">',
        '<div class="options-grid" style="margin-top: 12px; border:none; padding:0;">'
    )

    # Regex to catch the radio buttons.
    # Group 1: name attribute
    # Group 2: value attribute
    # Group 3: The letter (A, B, C, D)
    # Group 4: The answer text
    pattern = r'<div style="margin-bottom: 8px;"><label><input type="radio" name="([^"]+)" value="([^"]+)"> ([A-D])\)\s*(.*?)</label></div>'
    
    def replacer(match):
        name = match.group(1)
        value = match.group(2)
        letter = match.group(3)
        text = match.group(4)
        
        return f'<label class="option-btn"><input type="radio" name="{name}" value="{value}" style="display:none;"><div class="option-key">{letter}</div><div>{text}</div></label>'

    new_content = re.sub(pattern, replacer, content)

    # Check if we made changes
    if content != new_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Fixed {filename}")
    else:
        print(f"No changes in {filename}")

