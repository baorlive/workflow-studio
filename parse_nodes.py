import re
import json
import os

def parse_nodes(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    nodes = []
    current_node = None

    for line in lines:
        line = line.strip()
        if not line:
            continue

        # Check for property line (starts with *)
        if line.startswith('*'):
            if current_node:
                # Parse property
                # Format: * Name (Type): Description
                # or * Name (Type): (optional) Description
                match = re.match(r'\* (.*?) \((.*?)\): (.*)', line)
                if match:
                    name, type_, desc = match.groups()
                    is_optional = "(optional)" in desc
                    desc = desc.replace("(optional)", "").strip()
                    
                    # Clean up type
                    type_ = type_.strip()
                    
                    # Try to extract options if present in description "Select from options: ..."
                    options = []
                    if "Select from options:" in desc:
                        opt_part = desc.split("Select from options:")[-1]
                        # Split by comma, handle potential "...." at end
                        opts = [o.strip().rstrip('.') for o in opt_part.split(',')]
                        options = [o for o in opts if o]
                        # Remove the options text from description to clean it up? Maybe keep it.
                    
                    prop = {
                        "name": name.strip(),
                        "type": type_,
                        "description": desc,
                        "required": not is_optional,
                        "options": options
                    }
                    current_node['properties'].append(prop)
            continue

        # If not a property line, check if it's a description
        if line.startswith('Description:'):
            if current_node:
                current_node['description'] = line.replace('Description:', '').strip()
            continue

        # Otherwise, it's likely a new node name
        # If we have a current node, save it
        if current_node:
            nodes.append(current_node)
        
        current_node = {
            "type": line, # Use name as type key for now
            "title": line,
            "description": "",
            "properties": []
        }

    # Add last node
    if current_node:
        nodes.append(current_node)

    return nodes

def categorize_node(node):
    name = node['title'].lower()
    
    if any(x in name for x in ['compute', 'classify', 'classifier', 'score', 'scoring', 'normalize']):
        return 'Compute Tools'
    if any(x in name for x in ['google', 'gmail', 'drive', 'sheet', 'doc', 'calendar']):
        return 'Google Ecosystem'
    if any(x in name for x in ['facebook', 'instagram', 'twitter', 'linkedin', 'slack', 'discord', 'telegram', 'viber', 'whatsapp', 'wechat', 'teams']):
        return 'Social & Messaging'
    if any(x in name for x in ['alchemy', 'infura', 'quicknode', 'moralis', 'zan', 'helio', 'helius', 'footprint', 'snowtrace', 'solscan', 'etherscan', 'arbiscan', 'optimism scan', 'polygonscan', 'ton scan']):
        return 'Blockchain Providers'
    if any(x in name for x in ['binance', 'kucoin', 'uniswap', 'pancakeswap', 'coinbase']):
        return 'Crypto Exchanges'
    if any(x in name for x in ['wallet', 'transaction', 'erc20', 'erc721', 'erc1155', 'solidity', 'contract', 'account', 'balance', 'transfer', 'mint', 'burn', 'approve', 'sign', 'verify']):
        return 'Blockchain Core'
    if any(x in name for x in ['http', 'graphql', 'webhook', 'api', 'rabbitmq', 'mqtt']):
        return 'Network & API'
    if any(x in name for x in ['mysql', 'postgres', 'redis', 'mongodb', 'supabase', 'tidb', 'database', 'sql']):
        return 'Database'
    if any(x in name for x in ['json', 'csv', 'excel', 'pdf', 'file', 's3', 'ipfs', 'pinata']):
        return 'Data & Storage'
    if any(x in name for x in ['loop', 'if else', 'switch', 'wait', 'schedule', 'trigger']):
        return 'Logic & Flow'
    if any(x in name for x in ['browser', 'playwright', 'puppeteer']):
        return 'Browser Automation'
    
    return 'Other'

def generate_specs_md(nodes, output_file):
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("# Node Specifications\n\n")
        
        categories = {}
        for node in nodes:
            cat = categorize_node(node)
            if cat not in categories:
                categories[cat] = []
            categories[cat].append(node)
            
        for cat in sorted(categories.keys()):
            f.write(f"## {cat}\n\n")
            for node in categories[cat]:
                f.write(f"### {node['title']}\n")
                f.write(f"**Description:** {node['description']}\n\n")
                f.write("| Property | Type | Required | Description |\n")
                f.write("| --- | --- | --- | --- |\n")
                for prop in node['properties']:
                    req = "Yes" if prop['required'] else "No"
                    desc = prop['description'].replace('\n', ' ')
                    if prop['options']:
                        desc += f" <br>Options: {', '.join(prop['options'])}"
                    f.write(f"| {prop['name']} | {prop['type']} | {req} | {desc} |\n")
                f.write("\n")

def generate_constants_json(nodes, output_file):
    # Convert to format suitable for constants/index.js
    # We need a dictionary where key is node type (slugified)
    
    schema_map = {}
    
    for node in nodes:
        # Create a slug for the key
        key = node['title'].lower().replace(' ', '_').replace('-', '_')
        
        props_obj = {}
        for prop in node['properties']:
            # Map types to UI component types
            ui_type = 'string'
            if prop['type'].lower() in ['string', 'text']:
                ui_type = 'string'
            elif prop['type'].lower() in ['number', 'integer', 'float']:
                ui_type = 'number'
            elif prop['type'].lower() in ['boolean', 'bool']:
                ui_type = 'boolean'
            elif prop['type'].lower() in ['options', 'selection field', 'select']:
                ui_type = 'select'
            elif prop['type'].lower() in ['multi-options', 'multiselect']:
                ui_type = 'multiselect'
            elif prop['type'].lower() in ['json', 'array', 'object']:
                ui_type = 'json'
            elif prop['type'].lower() in ['code']:
                ui_type = 'code'
            elif prop['type'].lower() in ['file']:
                ui_type = 'file'
            elif prop['type'].lower() in ['auth', 'credential']:
                ui_type = 'credential'
            
            prop_key = prop['name'].lower().replace(' ', '_')
            
            prop_def = {
                'type': ui_type,
                'label': prop['name'],
                'value': '', # Default value
                'required': prop['required'],
                'description': prop['description']
            }
            
            if prop['options']:
                prop_def['options'] = prop['options']
                prop_def['value'] = prop['options'][0] if prop['options'] else ''
                
            props_obj[prop_key] = prop_def
            
        schema_map[key] = props_obj
        
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(schema_map, f, indent=2)

def generate_selector_structure(nodes, output_file):
    # Generate the structure for NodeSelectorPanel
    categories = {}
    for node in nodes:
        cat = categorize_node(node)
        if cat not in categories:
            categories[cat] = []
        
        key = node['title'].lower().replace(' ', '_').replace('-', '_')
        categories[cat].append({
            'type': key,
            'label': node['title'],
            'description': node['description']
        })
        
    # Convert to list format
    items = []
    for cat, node_list in categories.items():
        items.append({
            'type': 'folder',
            'title': cat,
            'items': sorted(node_list, key=lambda x: x['label'])
        })
        
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(items, f, indent=2)

if __name__ == "__main__":
    nodes = parse_nodes('/Users/bao/Downloads/workflow-studio/nodes-formatted.txt')
    generate_specs_md(nodes, 'NODE_SPECS.md')
    generate_constants_json(nodes, 'node_schemas.json')
    generate_selector_structure(nodes, 'node_selector.json')
    print(f"Processed {len(nodes)} nodes.")
