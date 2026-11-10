import os
import hashlib
import json
import gzip
import time
import requests
from google.oauth2 import service_account
from google.auth.transport.requests import Request
import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Proxy configuration for local development
if os.environ.get('CI') != 'true':
    os.environ.setdefault('HTTP_PROXY', 'socks5h://127.0.0.1:10808')
    os.environ.setdefault('HTTPS_PROXY', 'socks5h://127.0.0.1:10808')

PROJECT_ID = 'us-pharmacy-web'
SITE_ID = 'us-pharmacy-web'

# Determine root & bundle directories
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if os.path.exists(os.path.join(ROOT_DIR, 'surge-deploy', 'index.html')):
    DEPLOY_DIR = os.path.join(ROOT_DIR, 'surge-deploy')
elif os.path.exists(os.path.join(ROOT_DIR, 'index.html')):
    DEPLOY_DIR = ROOT_DIR
else:
    DEPLOY_DIR = os.getcwd()

KEY_PATH = os.path.join(ROOT_DIR, 'us-pharmacy-web-firebase-adminsdk-fbsvc-2a3be0a039.json')

def get_session():
    session = requests.Session()
    session.verify = False
    return session

def deploy():
    print('=======================================================')
    print('       Deploying RxMatch US to Firebase Hosting        ')
    print('=======================================================\n')
    print(f'Deploy directory: {DEPLOY_DIR}')

    if os.environ.get('FIREBASE_SERVICE_ACCOUNT_KEY'):
        key_data = json.loads(os.environ['FIREBASE_SERVICE_ACCOUNT_KEY'])
        creds = service_account.Credentials.from_service_account_info(
            key_data,
            scopes=['https://www.googleapis.com/auth/cloud-platform', 'https://www.googleapis.com/auth/firebase']
        )
    elif os.path.exists(KEY_PATH):
        creds = service_account.Credentials.from_service_account_file(
            KEY_PATH,
            scopes=['https://www.googleapis.com/auth/cloud-platform', 'https://www.googleapis.com/auth/firebase']
        )
    else:
        raise FileNotFoundError(f'Firebase service account key not found at {KEY_PATH} and FIREBASE_SERVICE_ACCOUNT_KEY env var not set.')

    session = get_session()
    creds.refresh(Request(session=session))
    headers = {'Authorization': f'Bearer {creds.token}', 'Content-Type': 'application/json'}

    # 1. Create Version with cleanUrls & rewrites
    print('[1/5] Creating new Firebase Hosting release version...')
    body = {
        'config': {
            'rewrites': [{'glob': '**', 'path': '/index.html'}],
            'cleanUrls': True
        }
    }
    resp = session.post(
        f'https://firebasehosting.googleapis.com/v1beta1/projects/{PROJECT_ID}/sites/{SITE_ID}/versions',
        headers=headers,
        data=json.dumps(body)
    )
    if resp.status_code != 200:
        raise RuntimeError(f'Failed to create version: {resp.status_code} {resp.text}')
    version_name = resp.json()['name']
    print(f'✓ Version created: {version_name}')

    # 2. Gzip & Hash files
    print('\n[2/5] Compressing and hashing static bundle files...')
    file_hashes = {}
    gzipped_bytes_map = {} # hash -> bytes

    for root, dirs, files in os.walk(DEPLOY_DIR):
        if any(skip in root for skip in ['.git', '.github', 'node_modules', 'scripts', '.firebase', '.netlify']):
            continue
        for f in files:
            if f.endswith('.json') and 'adminsdk' in f:
                continue
            if f in ['CNAME', 'package.json', 'package-lock.json', 'README.md', 'vercel.json']:
                continue
            abs_p = os.path.join(root, f)
            rel_p = '/' + os.path.relpath(abs_p, DEPLOY_DIR).replace('\\', '/')
            with open(abs_p, 'rb') as fp:
                raw_data = fp.read()
            gz_data = gzip.compress(raw_data, 9)
            h = hashlib.sha256(gz_data).hexdigest()
            file_hashes[rel_p] = h
            gzipped_bytes_map[h] = gz_data

    print(f'✓ Prepared {len(file_hashes)} files for deployment.')

    # 3. Populate files
    print('\n[3/5] Syncing file manifests with Firebase edge...')
    pop_resp = session.post(
        f'https://firebasehosting.googleapis.com/v1beta1/{version_name}:populateFiles',
        headers=headers,
        data=json.dumps({'files': file_hashes})
    )
    if pop_resp.status_code != 200:
        raise RuntimeError(f'PopulateFiles failed: {pop_resp.status_code} {pop_resp.text}')
    
    pop_data = pop_resp.json()
    required_hashes = pop_data.get('uploadRequiredHashes', [])
    upload_url = pop_data.get('uploadUrl')
    print(f'✓ {len(file_hashes) - len(required_hashes)} files already cached on edge CDN.')
    print(f'✓ {len(required_hashes)} new/updated files to upload.')

    # 4. Upload required files reliably with retry
    if required_hashes:
        print(f'\n[4/5] Uploading {len(required_hashes)} files to Firebase edge storage...')
        for idx, h in enumerate(required_hashes):
            data = gzipped_bytes_map[h]
            uploaded = False
            for attempt in range(5):
                try:
                    up = session.post(
                        f'{upload_url}/{h}',
                        headers={'Authorization': f'Bearer {creds.token}', 'Content-Type': 'application/octet-stream'},
                        data=data,
                        timeout=30
                    )
                    if up.status_code == 200:
                        uploaded = True
                        break
                    else:
                        time.sleep(1)
                except Exception:
                    time.sleep(1)
            if not uploaded:
                raise RuntimeError(f'Failed to upload file {h} after 5 attempts.')
            if (idx + 1) % 25 == 0 or idx == len(required_hashes) - 1:
                print(f'  Uploaded {idx + 1}/{len(required_hashes)} files...', flush=True)
        print('✓ All files uploaded successfully.')
    else:
        print('\n[4/5] All files already cached, no upload needed.')

    # 5. Finalize & Release
    print('\n[5/5] Finalizing version and releasing to global production...')
    fin_resp = session.patch(
        f'https://firebasehosting.googleapis.com/v1beta1/{version_name}?update_mask=status',
        headers=headers,
        data=json.dumps({'status': 'FINALIZED'})
    )
    if fin_resp.status_code != 200:
        raise RuntimeError(f'Finalize failed: {fin_resp.status_code} {fin_resp.text}')
    print('✓ Version status: FINALIZED')

    rel_resp = session.post(
        f'https://firebasehosting.googleapis.com/v1beta1/projects/{PROJECT_ID}/sites/{SITE_ID}/releases?versionName={version_name}',
        headers=headers
    )
    if rel_resp.status_code != 200:
        raise RuntimeError(f'Release failed: {rel_resp.status_code} {rel_resp.text}')
    print(f'✓ Release live: {rel_resp.json().get("name")}')

    print('\n=======================================================')
    print('  Firebase Hosting Deployment Complete!                ')
    print('  - https://us-pharmacy-web.web.app                    ')
    print('  - https://us-pharmacy-web.firebaseapp.com            ')
    print('=======================================================\n')

if __name__ == '__main__':
    deploy()
