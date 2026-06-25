import json
import re
import os

# Paths
SCHEMAS_PATH = 'node_schemas.json'
SELECTOR_PATH = 'node_selector.json'
CONSTANTS_PATH = 'src/constants/index.js'
SELECTOR_COMPONENT_PATH = 'src/components/workflow/NodeSelectorPanel.jsx'

def clean_type(type_str):
    return re.match(r'^[a-zA-Z0-9_]+$', type_str) is not None

def format_js_object(obj, indent_level=0):
    """Simple formatter to make JSON look more like JS object (keys unquoted if possible)"""
    indent = "    " * indent_level
    if isinstance(obj, dict):
        lines = []
        lines.append("{")
        for k, v in obj.items():
            key_str = k if re.match(r'^[a-zA-Z_$][a-zA-Z0-9_$]*$', k) else f"'{k}'"
            val_str = format_js_object(v, indent_level + 1)
            lines.append(f"{indent}    {key_str}: {val_str},")
        lines.append(f"{indent}}}")
        return "\n".join(lines)
    elif isinstance(obj, list):
        lines = []
        lines.append("[")
        for item in obj:
            val_str = format_js_object(item, indent_level + 1)
            lines.append(f"{indent}    {val_str},")
        lines.append(f"{indent}]")
        return "\n".join(lines)
    elif isinstance(obj, str):
        escaped_str = obj.replace(chr(39), r"\'")
        return f"'{escaped_str}'" # Escape single quotes
    elif isinstance(obj, bool):
        return "true" if obj else "false"
    elif obj is None:
        return "null"
    else:
        return str(obj)

def update_constants():
    print("Updating constants...")
    with open(SCHEMAS_PATH, 'r') as f:
        schemas = json.load(f)
    
    # Filter valid schemas
    valid_schemas = {k: v for k, v in schemas.items() if clean_type(k)}
    
    with open(CONSTANTS_PATH, 'r') as f:
        content = f.read()
    
    # Find the insertion point (end of DEFAULT_PARAMS)
    # We look for "        // Social Media Nodes" or the end of the object
    # But it's safer to find the closing brace of DEFAULT_PARAMS.
    # DEFAULT_PARAMS starts at `DEFAULT_PARAMS: {`
    
    match = re.search(r'DEFAULT_PARAMS:\s*\{', content)
    if not match:
        print("Could not find DEFAULT_PARAMS")
        return

    start_idx = match.end()
    
    # Simple brace counting to find the end
    brace_count = 1
    i = start_idx
    while i < len(content) and brace_count > 0:
        if content[i] == '{':
            brace_count += 1
        elif content[i] == '}':
            brace_count -= 1
        i += 1
    
    end_idx = i - 1 # The position of the closing brace
    
    # Prepare the new content
    new_entries_str = "\n        // --- New Parsed Nodes ---\n"
    
    for key, value in valid_schemas.items():
        # Check if key already exists to avoid duplication
        if f"{key}: {{" in content:
            continue
            
        # Format the object manually to match indentation
        js_obj = format_js_object(value, 3) # Indent level 3 (12 spaces)
        # Fix the first line indentation
        js_obj = js_obj.strip()
        new_entries_str += f"        {key}: {js_obj},\n"

    # Insert before the closing brace
    new_content = content[:end_idx] + new_entries_str + content[end_idx:]
    
    with open(CONSTANTS_PATH, 'w') as f:
        f.write(new_content)
    print("Constants updated.")

def update_selector():
    print("Updating selector...")
    with open(SELECTOR_PATH, 'r') as f:
        selector_data = json.load(f)
        
    with open(SELECTOR_COMPONENT_PATH, 'r') as f:
        content = f.read()
        
    # Map for styling new categories
    category_styles = {
        "Blockchain Providers": {"id": "blockchain_providers", "icon": "database", "color": "text-indigo-600", "bgColor": "bg-indigo-50"},
        "Blockchain Core": {"id": "blockchain_core", "icon": "cpu", "color": "text-blue-600", "bgColor": "bg-blue-50"},
        "Crypto Exchanges": {"id": "crypto_exchanges", "icon": "dollarSign", "color": "text-green-600", "bgColor": "bg-green-50"},
        "Compute Tools": {"id": "compute_tools", "icon": "cpu", "color": "text-purple-600", "bgColor": "bg-purple-50"},
        "Network & API": {"id": "network_api", "icon": "globe", "color": "text-cyan-600", "bgColor": "bg-cyan-50"},
        "Data & Storage": {"id": "data_storage", "icon": "hardDrive", "color": "text-slate-600", "bgColor": "bg-slate-50"},
        "Logic & Flow": {"id": "logic_flow_extended", "icon": "gitBranch", "color": "text-orange-600", "bgColor": "bg-orange-50"},
    }

    new_categories_js = ""
    
    for cat in selector_data:
        title = cat['title']
        if title == "Other": continue # Skip garbage
        
        # Filter items
        valid_items = []
        for item in cat['items']:
            if clean_type(item['type']):
                # Map to UI structure
                ui_item = {
                    "type": item['type'],
                    "title": item['label'],
                    "description": item['description'] or item['label'],
                    # "badge": "New" 
                }
                valid_items.append(ui_item)
        
        if not valid_items:
            continue
            
        style = category_styles.get(title, {"id": title.lower().replace(" ", "_"), "icon": "box", "color": "text-gray-600", "bgColor": "bg-gray-50"})
        
        # Construct JS object string for the category
        items_list = []
        for item in valid_items:
            title_esc = item['title'].replace(chr(39), r"\'")
            desc_esc = item['description'].replace(chr(39), r"\'")
            items_list.append(f"{{ type: '{item['type']}', title: '{title_esc}', icon: 'zap', description: '{desc_esc}' }}")

        items_str = ",\n            ".join(items_list)
        
        cat_str = f"""
    {{
        id: '{style['id']}',
        title: '{title}',
        icon: '{style['icon']}',
        description: '{title} Integration Nodes',
        color: '{style['color']}',
        bgColor: '{style['bgColor']}',
        items: [
            {items_str}
        ]
    }},"""
        new_categories_js += cat_str

    # Insert before the 'utility' category or at the end of the list
    # The list ends with ];
    # We can look for "id: 'utility'" and insert before it
    
    match = re.search(r'\{\s*id: \'utility\'', content)
    if match:
        insert_idx = match.start()
        # Find the start of the line
        while insert_idx > 0 and content[insert_idx] != '\n':
            insert_idx -= 1
        
        new_content = content[:insert_idx] + new_categories_js + content[insert_idx:]
        
        with open(SELECTOR_COMPONENT_PATH, 'w') as f:
            f.write(new_content)
        print("Selector updated.")
    else:
        print("Could not find utility category to insert before.")

if __name__ == "__main__":
    update_constants()
    update_selector()
