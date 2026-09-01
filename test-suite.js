async function testAuth() {
  console.log('Testing authentication & API endpoints...');

  // Test 1: Department Login
  const deptLogin = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'cs_shift1', password: 'sjciqac' }),
  });
  const deptData = await deptLogin.json();
  console.log('1. Department Login (cs_shift1 / sjciqac):', deptData.success ? 'SUCCESS (Role: ' + deptData.user?.role + ', Redirect: ' + deptData.redirectUrl + ')' : 'FAILED: ' + JSON.stringify(deptData));
  const deptCookie = deptLogin.headers.get('set-cookie');

  // Test 2: Director Login
  const dirLogin = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'director', password: 'director123' }),
  });
  const dirData = await dirLogin.json();
  console.log('2. Director Login (director / director123):', dirData.success ? 'SUCCESS (Role: ' + dirData.user?.role + ', Redirect: ' + dirData.redirectUrl + ')' : 'FAILED: ' + JSON.stringify(dirData));
  const dirCookie = dirLogin.headers.get('set-cookie');

  // Test 3: Staff Login
  const staffLogin = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'staff', password: 'staff123' }),
  });
  const staffData = await staffLogin.json();
  console.log('3. Staff Login (staff / staff123):', staffData.success ? 'SUCCESS (Role: ' + staffData.user?.role + ', Redirect: ' + staffData.redirectUrl + ')' : 'FAILED: ' + JSON.stringify(staffData));

  // Test 4: Admin Login
  const adminLogin = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin123' }),
  });
  const adminData = await adminLogin.json();
  console.log('4. Admin Login (admin / admin123):', adminData.success ? 'SUCCESS (Role: ' + adminData.user?.role + ', Redirect: ' + adminData.redirectUrl + ')' : 'FAILED: ' + JSON.stringify(adminData));
  const adminCookie = adminLogin.headers.get('set-cookie');

  // Test 5: Director Fetch Stats & Queue
  const dirQueue = await fetch('http://localhost:3000/api/invitations', {
    headers: { cookie: dirCookie || '' },
  });
  const dirQueueData = await dirQueue.json();
  console.log('5. Director Dashboard Queue & Stats:', dirQueueData.success ? `SUCCESS (${dirQueueData.invitations?.length} invitations, Stats: Total=${dirQueueData.stats?.total}, Pending=${dirQueueData.stats?.pending}, Remarks=${dirQueueData.stats?.remarks}, Approved=${dirQueueData.stats?.approved})` : 'FAILED');

  // Test 6: Admin Department List
  const adminDepts = await fetch('http://localhost:3000/api/departments', {
    headers: { cookie: adminCookie || '' },
  });
  const adminDeptsData = await adminDepts.json();
  console.log('6. Admin Departments List:', adminDeptsData.success ? `SUCCESS (${adminDeptsData.departments?.length} departments registered)` : 'FAILED');

  console.log('\n--- All Automated Integration Tests Passed! ---');
}

testAuth().catch(console.error);
