from flask import Flask, url_for
import os
import shutil
import subprocess

app = Flask(__name__, static_folder='static')
app.config['SERVER_NAME'] = 'localhost'
app.config['APPLICATION_ROOT'] = '/'
app.config['PREFERRED_URL_SCHEME'] = 'https'

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
    
    # Export templates with Flask context
    with app.test_request_context():
        templates = ['index.html', 'base.html', 'about.html', 'login.html', 'basket.html']
        
        for template in templates:
            # Use Flask's render_template to get proper url_for resolution
            from flask import render_template
            output = render_template(template)
            
            with open(f'{output_dir}/{template}', 'w', encoding='utf-8') as f:
                f.write(output)
    
    # Copy index.html to 404.html for SPA routing
    shutil.copy(f'{output_dir}/index.html', f'{output_dir}/404.html')
    
    # Create _redirects file for Netlify
    with open(f'{output_dir}/_redirects', 'w', encoding='utf-8') as f:
        f.write("/* /index.html 200\n")
    
    print(f"Static site exported to {output_dir}/")
    print("Files exported:")
    for template in templates:
        print(f"  - {template}")
    print("  - 404.html (for SPA routing)")
    print("  - _redirects (Netlify configuration)")
    print("  - static/ (copied from original)")

if __name__ == "__main__":
    export_static()