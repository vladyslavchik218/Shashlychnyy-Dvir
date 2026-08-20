from flask import Flask
import os
import shutil
import subprocess

app = Flask(__name__)

def export_static():
    """Export Flask templates to static HTML files for Netlify"""
    
    # Create output directory
    output_dir = 'dist'
    if os.path.exists(output_dir):
        shutil.rmtree(output_dir)
    os.makedirs(output_dir)
    
    # Copy static files
    if os.path.exists('static'):
        shutil.copytree('static', f'{output_dir}/static')
    
    # Export templates
    from jinja2 import Environment, FileSystemLoader
    template_env = Environment(loader=FileSystemLoader('templates'))
    
    templates = ['index.html', 'base.html', 'about.html', 'login.html', 'basket.html']
    
    for template in templates:
        template_file = template_env.get_template(template)
        output = template_file.render()
        
        with open(f'{output_dir}/{template}', 'w', encoding='utf-8') as f:
            f.write(output)
    
    # Copy index.html to 404.html for SPA routing
    shutil.copy(f'{output_dir}/index.html', f'{output_dir}/404.html')
    
    # Create _redirects file for Netlify
    with open(f'{output_dir}/_redirects', 'w', encoding='utf-8') as f:
        f.write("/* /index.html 200\n")
    
    # Create netlify.toml configuration
    with open(f'{output_dir}/netlify.toml', 'w', encoding='utf-8') as f:
        f.write("[[build]]\n")
        f.write("  command = \"python export_static.py\"\n")
        f.write("  publish = \"dist\"\n")
        f.write("\n")
        f.write("[[build.environment]\n")
        f.write("  PYTHON_VERSION = \"3.8\"\n")
    
    print(f"Static site exported to {output_dir}/")
    print("Files exported:")
    for template in templates:
        print(f"  - {template}")
    print("  - 404.html (for SPA routing)")
    print("  - _redirects (Netlify configuration)")
    print("  - netlify.toml (Netlify configuration)")
    print("  - static/ (copied from original)")

if __name__ == "__main__":
    export_static()