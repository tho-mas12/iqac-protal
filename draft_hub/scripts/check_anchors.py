with open('src/app/admin/central/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

handler_anchor = "  // --- 7. Live Checklist Handlers (Matching tho-mas12/IQAC) ---"
print("Handler anchor in code:", handler_anchor in code)

subtab_nav_fragment = "onClick={() => setAaaSubTab('faculty_tracker')}"
print("subtab_nav_fragment in code:", subtab_nav_fragment in code)

faculty_tracker_end_fragment = "View Portfolio"
print("faculty_tracker_end_fragment in code:", faculty_tracker_end_fragment in code)

user_modal_anchor = "{/* MODAL: Create / Edit User */}"
print("user_modal_anchor in code:", user_modal_anchor in code)

appraisal_header_anchor = "Select questions from AAA Attributes, Course Plans & Event Invitations"
print("appraisal_header_anchor in code:", appraisal_header_anchor in code)
