const fs = require('fs');
let code = fs.readFileSync('src/pages/dashboard/DashboardLayout.tsx', 'utf8');

const startIndex = code.indexOf('<div className=\"crm-content\"');

if (startIndex !== -1) {
  const tail = 
        <div className=\"crm-content\" style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', background: '#fcfcfd' }}>
          <Outlet context={{
            user, uid, userProfile, displayName, firstName, userInitials,
            toast, setToast, sideOpen, setSideOpen, search, setSearch,
            notif, setNotif, setView
          }} />
        </div>
      </div>
    </div>
  );
}
;
  const newCode = code.substring(0, startIndex) + tail;
  fs.writeFileSync('src/pages/dashboard/DashboardLayout.tsx', newCode);
}
