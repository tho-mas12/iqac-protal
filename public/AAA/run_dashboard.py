"""
IQAC Annual Academic Audit (AAA) 2026-2027 Dashboard Launcher
Dual-Mode Server: Serves static assets & handles API simulation locally
St. Joseph's College (Autonomous), Tiruchirappalli
"""

import http.server
import webbrowser
import threading
import json
import sys
import os

PORT = 8000

# In-memory store for local simulation
LOCAL_STORE = {
    'departments': [
        {
            'id': 1,
            'code': 'cs',
            'name': 'PG & Research Department of Computer Science',
            'school': 'School of Computing Sciences',
            'hod_name': 'Dr. S. Albert Rabara',
            'status': 'submitted',
            'audit_date': '2026-11-15',
            'is_locked': False,
            'last_updated': '2026-10-29 18:30:00',
            'metrics': {'publications': 44, 'grants_lakhs': 28.00, 'patents': 2, 'vac_cc': 4, 'mooc_pct': '92.4%'},
            'evaluation': {'grade': 'A++', 'score': 97.5}
        },
        {
            'id': 2,
            'code': 'commerce',
            'name': 'PG & Research Department of Commerce',
            'school': 'School of Management Studies',
            'hod_name': 'Dr. F. R. Alexander Pravin Durai',
            'status': 'in_progress',
            'audit_date': '2026-11-16',
            'is_locked': False,
            'last_updated': '2026-10-29 17:15:00',
            'metrics': {'publications': 31, 'grants_lakhs': 14.50, 'patents': 0, 'vac_cc': 4, 'mooc_pct': '86.2%'},
            'evaluation': {'grade': 'A+', 'score': 88.0}
        },
        {
            'id': 3,
            'code': 'physics',
            'name': 'PG & Research Department of Physics',
            'school': 'School of Physical Sciences',
            'hod_name': 'Dr. N. Lawrence',
            'status': 'in_progress',
            'audit_date': '2026-11-17',
            'is_locked': False,
            'last_updated': '2026-10-28 14:20:00',
            'metrics': {'publications': 38, 'grants_lakhs': 35.00, 'patents': 1, 'vac_cc': 2, 'mooc_pct': '79.5%'},
            'evaluation': {'grade': None, 'score': None}
        },
        {
            'id': 4,
            'code': 'chemistry',
            'name': 'PG & Research Department of Chemistry',
            'school': 'School of Chemical Sciences',
            'hod_name': 'Dr. A. Rose Venis',
            'status': 'draft',
            'audit_date': '2026-11-18',
            'is_locked': False,
            'last_updated': '2026-10-27 11:00:00',
            'metrics': {'publications': 26, 'grants_lakhs': 18.20, 'patents': 1, 'vac_cc': 3, 'mooc_pct': '74.0%'},
            'evaluation': {'grade': None, 'score': None}
        },
        {
            'id': 5,
            'code': 'maths',
            'name': 'PG & Research Department of Mathematics',
            'school': 'School of Computing Sciences',
            'hod_name': 'Dr. Y. Dominic',
            'status': 'in_progress',
            'audit_date': '2026-11-19',
            'is_locked': False,
            'last_updated': '2026-10-29 09:40:00',
            'metrics': {'publications': 29, 'grants_lakhs': 8.50, 'patents': 0, 'vac_cc': 2, 'mooc_pct': '88.0%'},
            'evaluation': {'grade': None, 'score': None}
        },
        {
            'id': 6,
            'code': 'english',
            'name': 'PG & Research Department of English',
            'school': 'School of Languages and Culture',
            'hod_name': 'Dr. V. L. Jayapaul',
            'status': 'draft',
            'audit_date': '2026-11-20',
            'is_locked': False,
            'last_updated': '2026-10-26 16:00:00',
            'metrics': {'publications': 14, 'grants_lakhs': 4.20, 'patents': 0, 'vac_cc': 3, 'mooc_pct': '81.5%'},
            'evaluation': {'grade': None, 'score': None}
        }
    ],
    'submissions': {}
}

class RobustHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def send_json(self, data, status=200):
        body = json.dumps(data, indent=2, ensure_ascii=False).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        path = self.path.split('?')[0]
        
        # API: departments list
        if path == '/api/departments.php' or path == '/api/departments':
            submitted = sum(1 for d in LOCAL_STORE['departments'] if d['status'] == 'submitted')
            audited = sum(1 for d in LOCAL_STORE['departments'] if d['status'] == 'audited')
            overview = {
                'total_departments': len(LOCAL_STORE['departments']),
                'submitted_count': submitted,
                'audited_count': audited,
                'in_progress_count': len(LOCAL_STORE['departments']) - submitted - audited,
                'total_publications': sum(d['metrics']['publications'] for d in LOCAL_STORE['departments']),
                'total_grants_lakhs': round(sum(d['metrics']['grants_lakhs'] for d in LOCAL_STORE['departments']), 2),
                'total_patents': sum(d['metrics']['patents'] for d in LOCAL_STORE['departments']),
                'total_vac_cc': sum(d['metrics']['vac_cc'] for d in LOCAL_STORE['departments'])
            }
            self.send_json({'success': True, 'departments': LOCAL_STORE['departments'], 'overview': overview})
            return

        # API: get submission
        if path == '/api/submission.php' or path == '/api/submission':
            self.send_json({'success': True, 'data': None})
            return

        # API: logout
        if path == '/api/logout.php' or path == '/api/logout':
            self.send_json({'success': True, 'message': 'Logged out.'})
            return

        # Fallback to static file server
        super().do_GET()

    def do_POST(self):
        path = self.path.split('?')[0]
        content_len = int(self.headers.get('Content-Length', 0))
        post_body = self.rfile.read(content_len).decode('utf-8') if content_len > 0 else '{}'
        
        try:
            req_data = json.loads(post_body)
        except Exception:
            req_data = {}

        # API: login
        if path == '/api/login.php' or path == '/api/login':
            username = req_data.get('username', '').strip()
            password = req_data.get('password', '').strip()

            if username == 'admin' and (password == 'admin123' or password == 'admin'):
                user = {
                    'id': 1,
                    'username': 'admin',
                    'display_name': 'IQAC Administrator',
                    'role': 'admin',
                    'department_id': None,
                    'department_name': 'All Departments'
                }
                self.send_json({'success': True, 'user': user, 'message': 'Admin login successful.'})
                return
            elif username in ['cs', 'dept_cs']:
                user = {
                    'id': 1,
                    'username': 'cs',
                    'display_name': 'HOD Computer Science',
                    'role': 'department',
                    'department_id': 1,
                    'department_name': 'PG & Research Department of Computer Science',
                    'department_code': 'cs'
                }
                self.send_json({'success': True, 'user': user, 'message': 'CS Department login successful.'})
                return
            elif username in ['commerce', 'dept_commerce']:
                user = {
                    'id': 2,
                    'username': 'commerce',
                    'display_name': 'HOD Commerce',
                    'role': 'department',
                    'department_id': 2,
                    'department_name': 'PG & Research Department of Commerce',
                    'department_code': 'commerce'
                }
                self.send_json({'success': True, 'user': user, 'message': 'Commerce Department login successful.'})
                return
            else:
                user = {
                    'id': len(LOCAL_STORE['departments']) + 1,
                    'username': username,
                    'display_name': f'HOD {username.upper()}',
                    'role': 'department',
                    'department_id': len(LOCAL_STORE['departments']) + 1,
                    'department_name': f'Department of {username.upper()}',
                    'department_code': username
                }
                self.send_json({'success': True, 'user': user, 'message': f'{username.upper()} login successful.'})
                return

        # API: add department
        if path == '/api/departments.php' or path == '/api/departments':
            name = req_data.get('name', 'New Department')
            code = req_data.get('code', 'newdept').lower()
            school = req_data.get('school', '')
            hod = req_data.get('hod_name', '')
            date = req_data.get('audit_date', '')

            new_dept = {
                'id': len(LOCAL_STORE['departments']) + 1,
                'code': code,
                'name': name,
                'school': school,
                'hod_name': hod,
                'status': 'draft',
                'audit_date': date,
                'is_locked': False,
                'last_updated': 'Just now',
                'metrics': {'publications': 0, 'grants_lakhs': 0, 'patents': 0, 'vac_cc': 0, 'mooc_pct': 'N/A'},
                'evaluation': {'grade': None, 'score': None}
            }
            LOCAL_STORE['departments'].append(new_dept)
            self.send_json({
                'success': True,
                'message': f"Department '{name}' added successfully! User account '{code}' created with password '{code}123'.",
                'department_id': new_dept['id']
            })
            return

        # API: submission save
        if path == '/api/submission.php' or path == '/api/submission':
            dept_id = req_data.get('department_id', 1)
            is_final = req_data.get('is_final_submit', False)
            for d in LOCAL_STORE['departments']:
                if d['id'] == dept_id:
                    d['status'] = 'submitted' if is_final else 'in_progress'
                    d['last_updated'] = 'Just now'
                    break
            self.send_json({'success': True, 'message': 'Submission saved successfully.'})
            return

        # API: status toggle
        if path == '/api/status.php' or path == '/api/status':
            dept_id = req_data.get('department_id', 1)
            is_locked = req_data.get('is_locked')
            for d in LOCAL_STORE['departments']:
                if d['id'] == dept_id:
                    if is_locked is not None:
                        d['is_locked'] = bool(is_locked)
                    break
            self.send_json({'success': True, 'message': 'Status updated.'})
            return

        # API: audit save
        if path == '/api/audit.php' or path == '/api/audit':
            dept_id = req_data.get('department_id', 1)
            grade = req_data.get('overall_grade', 'A+')
            for d in LOCAL_STORE['departments']:
                if d['id'] == dept_id:
                    d['status'] = 'audited'
                    d['evaluation'] = {'grade': grade, 'score': 95.0}
                    break
            self.send_json({'success': True, 'message': 'Evaluation saved!'})
            return

        self.send_json({'success': True, 'message': 'Action completed.'})

    def log_message(self, format, *args):
        sys.stderr.write(f"[{self.log_date_time_string()}] {args[0]} {args[1]}\n")

def run_server():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    port = PORT
    while port < 8050:
        try:
            server_cls = getattr(http.server, 'ThreadingHTTPServer', http.server.HTTPServer)
            server_address = ('127.0.0.1', port)
            httpd = server_cls(server_address, RobustHandler)
            
            url = f"http://localhost:{port}"
            print("=" * 70)
            print("  IQAC ANNUAL ACADEMIC AUDIT (AAA) 2026-2027 PLATFORM")
            print("  St. Joseph's College (Autonomous), Tiruchirappalli")
            print("  Admin Console & Meeting Controller Server Ready")
            print("=" * 70)
            print(f"  Local Web Server running at: {url}")
            print("  Opening default web browser...")
            print("  Press Ctrl+C in this terminal to stop the server.")
            print("=" * 70)
            
            threading.Timer(0.8, lambda: webbrowser.open(url)).start()
            httpd.serve_forever()
            break
        except OSError as e:
            if "address already in use" in str(e).lower() or "[winerror 10048]" in str(e).lower() or "[winerror 10013]" in str(e).lower() or "forbidden" in str(e).lower():
                port += 1
            else:
                raise e

if __name__ == "__main__":
    try:
        run_server()
    except KeyboardInterrupt:
        print("\nStopping IQAC AAA Dashboard server. Goodbye!")
        sys.exit(0)
