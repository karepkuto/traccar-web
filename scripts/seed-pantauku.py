#!/usr/bin/env python3
"""Seed Pantauku demo/initial accounts through the official Traccar REST API.

Creates (if missing):
  - soka9      : customer who pays Pantauku directly
  - tempeCorp  : reseller (manager account)
  - soka23     : customer who subscribes through tempeCorp
  - supir.soka9 / supir.soka23 : driver login accounts (no device edits,
    commands only) plus a Traccar "driver" record for each
and links existing devices to soka9 / soka23.

Safe to run repeatedly: existing users, drivers and links are reused.
Default is a DRY RUN that only prints the plan. Add --apply to write.

Credentials come from environment variables, never from this file:
  TRACCAR_URL             default https://app.pantauku.my.id
  TRACCAR_ADMIN_EMAIL     admin login
  TRACCAR_ADMIN_PASSWORD  admin password
  (or TRACCAR_TOKEN       an admin API token instead of email/password)
  SEED_EMAIL_DOMAIN       default pantauku.my.id (logins become soka9@<domain>)

Examples:
  python3 seed-pantauku.py --list
  python3 seed-pantauku.py --soka9 "B Y D" --soka23 "CUV e"
  python3 seed-pantauku.py --soka9 "B Y D" --soka23 "CUV e" --apply

Device selectors accept the device name, IMEI/uniqueId or numeric id;
separate several with commas.
"""

import argparse
import base64
import json
import os
import secrets
import string
import sys
import urllib.error
import urllib.request

BASE_URL = os.environ.get('TRACCAR_URL', 'https://app.pantauku.my.id').rstrip('/')
DOMAIN = os.environ.get('SEED_EMAIL_DOMAIN', 'pantauku.my.id')
RESELLER_NAME = 'tempeCorp'


def auth_header():
    token = os.environ.get('TRACCAR_TOKEN')
    if token:
        return f'Bearer {token}'
    email = os.environ.get('TRACCAR_ADMIN_EMAIL')
    password = os.environ.get('TRACCAR_ADMIN_PASSWORD')
    if not email or not password:
        sys.exit('Set TRACCAR_ADMIN_EMAIL and TRACCAR_ADMIN_PASSWORD (or TRACCAR_TOKEN).')
    raw = f'{email}:{password}'.encode()
    return 'Basic ' + base64.b64encode(raw).decode()


AUTH = None


def api(method, path, body=None):
    data = json.dumps(body).encode() if body is not None else None
    request = urllib.request.Request(f'{BASE_URL}/api{path}', data=data, method=method)
    request.add_header('Authorization', AUTH)
    request.add_header('Accept', 'application/json')
    if data is not None:
        request.add_header('Content-Type', 'application/json')
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            text = response.read().decode()
            return json.loads(text) if text else None
    except urllib.error.HTTPError as error:
        detail = error.read().decode()[:300]
        raise RuntimeError(f'{method} {path} -> HTTP {error.code}: {detail}') from None


def new_password():
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(12))


def email_of(login):
    return f'{login}@{DOMAIN}'.lower()


# Account definitions. Restrictions match the recommended Pantauku defaults.
ACCOUNTS = [
    {
        'key': 'tempecorp',
        'name': RESELLER_NAME,
        'login': 'tempecorp',
        'role': 'reseller',
        'fields': {'userLimit': 20, 'deviceLimit': 0, 'deviceReadonly': True, 'limitCommands': True},
        'attributes': {'billingRole': 'reseller'},
    },
    {
        'key': 'soka9',
        'name': 'soka9',
        'login': 'soka9',
        'role': 'customer (bayar langsung)',
        'fields': {'userLimit': 0, 'deviceLimit': 0, 'deviceReadonly': True, 'limitCommands': True},
        'attributes': {'billingBilledTo': 'direct'},
    },
    {
        'key': 'soka23',
        'name': 'soka23',
        'login': 'soka23',
        'role': f'customer (via {RESELLER_NAME})',
        'manager': 'tempecorp',
        'fields': {'userLimit': 0, 'deviceLimit': 0, 'deviceReadonly': True, 'limitCommands': True},
        'attributes': {'billingBilledTo': f'reseller:{RESELLER_NAME}'},
    },
    {
        'key': 'supir.soka9',
        'name': 'Supir soka9',
        'login': 'supir.soka9',
        'role': 'pengemudi soka9',
        'devicesOf': 'soka9',
        'fields': {'deviceReadonly': True, 'limitCommands': True, 'disableReports': True},
        'attributes': {},
        'driverUniqueId': 'SUPIR-SOKA9',
    },
    {
        'key': 'supir.soka23',
        'name': 'Supir soka23',
        'login': 'supir.soka23',
        'role': 'pengemudi soka23',
        'devicesOf': 'soka23',
        'manager': 'tempecorp',
        'fields': {'deviceReadonly': True, 'limitCommands': True, 'disableReports': True},
        'attributes': {},
        'driverUniqueId': 'SUPIR-SOKA23',
    },
]


def select_devices(devices, selector):
    if not selector:
        return []
    picked = []
    for token in [part.strip() for part in selector.split(',') if part.strip()]:
        matches = [
            d for d in devices
            if str(d['id']) == token or d.get('uniqueId') == token or d.get('name', '').lower() == token.lower()
        ]
        if len(matches) != 1:
            sys.exit(f'Device "{token}" matched {len(matches)} devices. Use the IMEI or id instead.')
        picked.append(matches[0])
    return picked


def main():
    global AUTH
    parser = argparse.ArgumentParser(description='Seed Pantauku accounts (dry run by default).')
    parser.add_argument('--list', action='store_true', help='list devices and users, then exit')
    parser.add_argument('--soka9', help='devices for soka9 (name, IMEI or id; comma separated)')
    parser.add_argument('--soka23', help='devices for soka23 (name, IMEI or id; comma separated)')
    parser.add_argument('--apply', action='store_true', help='actually write changes')
    args = parser.parse_args()

    AUTH = auth_header()
    session = api('GET', '/session')
    if not session.get('administrator'):
        sys.exit('The account in TRACCAR_ADMIN_EMAIL must be an administrator.')

    devices = api('GET', '/devices?all=true')
    users = api('GET', '/users')

    if args.list:
        print('DEVICES (id | uniqueId | name | expiration)')
        for d in devices:
            print(f"  {d['id']} | {d.get('uniqueId')} | {d.get('name')} | {d.get('expirationTime') or '-'}")
        print('USERS (id | email | name)')
        for u in users:
            print(f"  {u['id']} | {u.get('email')} | {u.get('name')}")
        return

    device_plan = {
        'soka9': select_devices(devices, args.soka9),
        'soka23': select_devices(devices, args.soka23),
    }
    overlap = {d['id'] for d in device_plan['soka9']} & {d['id'] for d in device_plan['soka23']}
    if overlap:
        sys.exit(f'Device ids {sorted(overlap)} are assigned to both soka9 and soka23.')
    if not device_plan['soka9'] and not device_plan['soka23']:
        print('NOTE: no devices given. Use --list, then --soka9 / --soka23 to assign devices.\n')

    mode = 'APPLY' if args.apply else 'DRY RUN (nothing is written; add --apply)'
    print(f'== {mode} on {BASE_URL}\n')

    by_email = {(u.get('email') or '').lower(): u for u in users}
    created = {}
    passwords = {}

    # 1. Users
    for account in ACCOUNTS:
        email = email_of(account['login'])
        existing = by_email.get(email)
        if existing:
            print(f"[user] {account['name']:<14} exists (id {existing['id']}, {email})")
            created[account['key']] = existing
            continue
        password = new_password()
        payload = {
            'name': account['name'],
            'email': email,
            'password': password,
            'disabled': False,
            'administrator': False,
            'attributes': {'language': 'id', 'timezone': 'Asia/Jakarta', **account['attributes']},
            **account['fields'],
        }
        print(f"[user] {account['name']:<14} create  ({account['role']}, login {email})")
        if args.apply:
            created[account['key']] = api('POST', '/users', payload)
            passwords[account['key']] = password
        else:
            created[account['key']] = {'id': f"<new {account['key']}>"}

    def link(body, label):
        print(f'[link] {label}')
        if not args.apply:
            return
        try:
            api('POST', '/permissions', body)
        except RuntimeError as error:
            # Traccar rejects duplicates; treat an existing link as success.
            if 'Duplicate' in str(error) or 'duplicate' in str(error) or 'HTTP 400' in str(error):
                print('       (already linked)')
            else:
                raise

    # 2. Reseller manages its customers and their drivers
    for account in ACCOUNTS:
        manager_key = account.get('manager')
        if manager_key:
            link(
                {'userId': created[manager_key]['id'], 'managedUserId': created[account['key']]['id']},
                f"{RESELLER_NAME} manages {account['name']}",
            )

    # 3. Devices -> customers (+ reseller for soka23, + driver accounts)
    for customer, assigned in device_plan.items():
        for device in assigned:
            link({'userId': created[customer]['id'], 'deviceId': device['id']},
                 f"device \"{device['name']}\" -> {customer}")
            if customer == 'soka23':
                link({'userId': created['tempecorp']['id'], 'deviceId': device['id']},
                     f"device \"{device['name']}\" -> {RESELLER_NAME}")
            driver_account = next(a for a in ACCOUNTS if a.get('devicesOf') == customer)
            link({'userId': created[driver_account['key']]['id'], 'deviceId': device['id']},
                 f"device \"{device['name']}\" -> {driver_account['name']}")

            billed_to = 'direct' if customer == 'soka9' else f'reseller:{RESELLER_NAME}'
            print(f"[device] \"{device['name']}\" billingBilledTo = {billed_to}")
            if args.apply:
                latest = api('GET', f"/devices/{device['id']}")
                latest['attributes'] = {**(latest.get('attributes') or {}), 'billingBilledTo': billed_to}
                api('PUT', f"/devices/{device['id']}", latest)

    # 4. Traccar driver records (for RFID / driver reports), linked to devices
    drivers = api('GET', '/drivers?all=true')
    for account in [a for a in ACCOUNTS if a.get('driverUniqueId')]:
        existing = next((d for d in drivers if d.get('uniqueId') == account['driverUniqueId']), None)
        if existing:
            print(f"[driver] {account['name']:<14} exists (id {existing['id']})")
            driver = existing
        else:
            print(f"[driver] {account['name']:<14} create (uniqueId {account['driverUniqueId']})")
            driver = (
                api('POST', '/drivers', {'name': account['name'], 'uniqueId': account['driverUniqueId']})
                if args.apply else {'id': f"<new driver {account['key']}>"}
            )
        customer = account['devicesOf']
        link({'userId': created[customer]['id'], 'driverId': driver['id']},
             f"driver {account['name']} visible to {customer}")
        for device in device_plan[customer]:
            link({'deviceId': device['id'], 'driverId': driver['id']},
                 f"driver {account['name']} -> device \"{device['name']}\"")

    if passwords:
        print('\n== NEW PASSWORDS (shown once; store them safely and share privately)')
        for key, password in passwords.items():
            account = next(a for a in ACCOUNTS if a['key'] == key)
            print(f"  {email_of(account['login']):<32} {password}")
    print('\nDone.' if args.apply else '\nDry run finished. Re-run with --apply to write.')


if __name__ == '__main__':
    try:
        main()
    except RuntimeError as error:
        sys.exit(f'ERROR: {error}')
