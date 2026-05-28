let currentContactId = 0;
let deleteContactId = 0;
let currentPage = 1;
let pageSize = 5;
let totalPages = 1;
let totalItems = 0;
let filterTimeout = null;
let sortBy = 'name';
let sortDesc = false;

// Load contacts when page loads
document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => new bootstrap.Tooltip(el));
    loadContacts();
});

//  Sort Functions 

function toggleSort(field) {
    if (sortBy === field) {
        sortDesc = !sortDesc;
    } else {
        sortBy = field;
        sortDesc = false;
    }
    updateSortIcons();
    currentPage = 1;
    loadContacts();
}

function updateSortIcons() {
    document.querySelectorAll('.sortable').forEach(th => {
        const icon = th.querySelector('.sort-icon');
        if (!icon) return;
        const field = th.dataset.sort;
        if (field === sortBy) {
            icon.className = 'bi ' + (sortDesc ? 'bi-sort-down' : 'bi-sort-up');
            icon.style.color = '#fff';
        } else {
            icon.className = 'bi bi-arrow-down-up';
            icon.style.color = 'rgba(255,255,255,0.5)';
        }
    });
}

//  Filter Functions 

function toggleFilters() {
    const sidebar = document.getElementById('filterSidebar');
    if (window.innerWidth < 992) {
        sidebar.style.display = sidebar.style.display === 'none' ? 'block' : 'none';
    }
}

function getFilterParams() {
    const search = document.getElementById('filterSearch').value.trim();
    const countryCode = document.getElementById('filterCountryCode').value;
    const jobTitle = document.getElementById('filterJobTitle').value.trim();
    const params = new URLSearchParams();
    params.set('page', currentPage);
    params.set('pageSize', pageSize);
    params.set('sortBy', sortBy);
    params.set('sortDesc', sortDesc);
    if (search) params.set('search', search);
    if (countryCode) params.set('countryCode', countryCode);
    if (jobTitle) params.set('jobTitle', jobTitle);
    return params;
}

function onFilterChange() {
    clearTimeout(filterTimeout);
    filterTimeout = setTimeout(() => {
        currentPage = 1;
        loadContacts();
    }, 300);
}

function resetFilters() {
    document.getElementById('filterSearch').value = '';
    document.getElementById('filterCountryCode').value = '';
    document.getElementById('filterJobTitle').value = '';
    currentPage = 1;
    loadContacts();
}

function onPageSizeChange() {
    pageSize = parseInt(document.getElementById('pageSizeSelect').value);
    currentPage = 1;
    loadContacts();
}

function goToPage(page) {
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    loadContacts();
}

//  API Functions 

async function loadContacts() {
    try {
        const params = getFilterParams();
        const response = await fetch(`/api/contacts?${params.toString()}`);
        const data = await response.json();
        renderContacts(data.contacts);
        renderPagination(data.pagination);
        updateFilterStats(data.pagination);
        updateSortIcons();
    } catch (error) {
        showToast('Error', 'Failed to load contacts: ' + error.message, 'danger');
    }
}

async function getContact(id) {
    try {
        const response = await fetch(`/api/contacts/${id}`);
        if (!response.ok) throw new Error('Contact not found');
        return await response.json();
    } catch (error) {
        showToast('Error', error.message, 'danger');
        return null;
    }
}

async function checkPhoneUnique(phone, excludeId = 0) {
    if (!phone) return true;
    try {
        const response = await fetch(`/api/contacts/phone-unique?phone=${encodeURIComponent(phone)}&excludeId=${excludeId}`);
        const isUnique = await response.json();
        return isUnique;
    } catch {
        return true;
    }
}

// Phone uniqueness check on input
let phoneCheckTimeout = null;
document.addEventListener('input', function (e) {
    if (e.target.id === 'contactPhone') {
        clearTimeout(phoneCheckTimeout);
        const msgEl = document.getElementById('phoneUniqueMsg');
        const phone = e.target.value.trim();
        if (!phone || !/^\+?\d{10,15}$/.test(phone)) {
            msgEl.textContent = '';
            return;
        }
        phoneCheckTimeout = setTimeout(async () => {
            const isUnique = await checkPhoneUnique(phone, currentContactId);
            msgEl.textContent = isUnique
                ? '✓ Phone number is available'
                : '✗ This phone number is already in use';
            msgEl.className = 'form-text small ' + (isUnique ? 'text-success' : 'text-danger');
        }, 400);
    }
});

async function saveContact() {
    if (!validateForm()) return;

    const phone = document.getElementById('contactPhone').value.trim();
    const isUnique = await checkPhoneUnique(phone, currentContactId);
    if (!isUnique) {
        setFieldError('contactPhone', 'phoneError', 'This phone number is already in use');
        return;
    }

    const contact = {
        id: currentContactId,
        name: document.getElementById('contactName').value.trim(),
        mobilePhone: phone,
        jobTitle: document.getElementById('contactJobTitle').value.trim(),
        birthDate: document.getElementById('contactBirthDate').value
    };

    const saveBtn = document.getElementById('saveContactBtn');
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span> Saving...';

    try {
        let response;
        if (currentContactId === 0) {
            response = await fetch('/api/contacts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(contact)
            });
        } else {
            response = await fetch(`/api/contacts/${currentContactId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(contact)
            });
        }

        if (!response.ok) {
            const errorData = await response.json();
            if (response.status === 400) {
                if (errorData.errors) { handleServerErrors(errorData.errors); return; }
                if (errorData.message) { showToast('Error', errorData.message, 'danger'); return; }
            }
            throw new Error(errorData.title || errorData.message || 'Failed to save contact');
        }

        $('#contactModal').modal('hide');
        showToast('Success', currentContactId === 0 ? 'Contact created successfully' : 'Contact updated successfully', 'success');
        loadContacts();
    } catch (error) {
        showToast('Error', error.message, 'danger');
    } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<i class="bi bi-check-lg me-1"></i>Save';
    }
}

async function confirmDelete(id) {
    deleteContactId = id;
    const contact = await getContact(id);
    if (contact) {
        document.getElementById('deleteContactName').textContent = contact.name;
        $('#deleteModal').modal('show');
    }
}

async function deleteContact() {
    const deleteBtn = document.getElementById('confirmDeleteBtn');
    deleteBtn.disabled = true;
    deleteBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span> Deleting...';

    try {
        const response = await fetch(`/api/contacts/${deleteContactId}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete contact');

        $('#deleteModal').modal('hide');
        showToast('Success', 'Contact deleted successfully', 'success');

        if (totalItems > 1 && (totalItems - 1) <= (currentPage - 1) * pageSize) {
            currentPage = Math.max(1, currentPage - 1);
        }
        loadContacts();
    } catch (error) {
        showToast('Error', error.message, 'danger');
    } finally {
        deleteBtn.disabled = false;
        deleteBtn.innerHTML = '<i class="bi bi-trash me-1"></i>Delete';
    }
}

//  UI Functions 

function renderContacts(contacts) {
    const tbody = document.getElementById('contactsTableBody');

    if (contacts.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-5 text-muted">
                    <i class="bi bi-inbox" style="font-size: 2.5rem;"></i>
                    <p class="mt-2 mb-0">No contacts found.</p>
                    <p class="small">Try adjusting your search filters or add a new contact.</p>
                </td>
            </tr>`;
        return;
    }

    tbody.innerHTML = contacts.map((contact, index) => `
        <tr style="animation-delay: ${index * 0.04}s">
            <td><strong>${escapeHtml(contact.name)}</strong></td>
            <td>
                <span class="badge bg-light text-dark fs-6 fw-normal">
                    <i class="bi bi-phone me-1"></i>${escapeHtml(contact.mobilePhone)}
                </span>
            </td>
            <td>${contact.jobTitle
                ? `<span class="badge bg-info bg-opacity-10 text-info fs-6 fw-normal"><i class="bi bi-briefcase me-1"></i>${escapeHtml(contact.jobTitle)}</span>`
                : '<span class="text-muted">—</span>'}</td>
            <td><i class="bi bi-calendar3 me-1 text-muted"></i>${formatDate(contact.birthDate)}</td>
            <td class="small text-muted">
                <i class="bi bi-clock me-1"></i>${formatDateTime(contact.createdAt)}
            </td>
            <td class="text-center">
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary" onclick="openEditModal(${contact.id})"
                            title="Edit contact" data-bs-toggle="tooltip">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-outline-danger" onclick="confirmDelete(${contact.id})"
                            title="Delete contact" data-bs-toggle="tooltip">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');

    document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => new bootstrap.Tooltip(el));
}

function renderPagination(pagination) {
    const nav = document.getElementById('paginationNav');
    const currentPageLabel = document.getElementById('currentPageLabel');
    const totalPagesLabel = document.getElementById('totalPagesLabel');
    const prevBtn = document.getElementById('prevPageBtn');
    const nextBtn = document.getElementById('nextPageBtn');
    const container = document.getElementById('pageNumbersContainer');

    totalPages = pagination.totalPages;
    totalItems = pagination.totalItems;

    // Always show nav unless there's literally nothing
    nav.style.display = 'flex';
    currentPageLabel.textContent = pagination.currentPage;
    totalPagesLabel.textContent = pagination.totalPages;

    prevBtn.classList.toggle('disabled', !pagination.hasPrevious);
    nextBtn.classList.toggle('disabled', !pagination.hasNext);

    // Build all page numbers dynamically
    const allPages = [];
    for (let i = 1; i <= pagination.totalPages; i++) {
        allPages.push(i);
    }

    // Show max 7 pages, with ellipsis for large sets
    const maxVisible = 7;
    let startPage = 1;
    let endPage = pagination.totalPages;

    if (pagination.totalPages > maxVisible) {
        const half = Math.floor(maxVisible / 2);
        startPage = Math.max(1, pagination.currentPage - half);
        endPage = Math.min(pagination.totalPages, startPage + maxVisible - 1);
        if (endPage - startPage + 1 < maxVisible) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }
    }

    let pagesHtml = '';
    if (startPage > 1) {
        pagesHtml += `<a class="page-link page-number-link" href="#" onclick="goToPage(1)" title="Page 1">1</a>`;
        if (startPage > 2) pagesHtml += `<span class="page-link disabled">…</span>`;
    }
    for (let i = startPage; i <= endPage; i++) {
        pagesHtml += `<a class="page-link page-number-link ${i === pagination.currentPage ? 'active' : ''}" href="#" onclick="goToPage(${i})">${i}</a>`;
    }
    if (endPage < pagination.totalPages) {
        if (endPage < pagination.totalPages - 1) pagesHtml += `<span class="page-link disabled">…</span>`;
        pagesHtml += `<a class="page-link page-number-link" href="#" onclick="goToPage(${pagination.totalPages})" title="Page ${pagination.totalPages}">${pagination.totalPages}</a>`;
    }

    container.innerHTML = pagesHtml;
    container.classList.remove('disabled');

    // Update pagination info with item count
    const paginationInfo = document.getElementById('paginationInfo');
    if (paginationInfo) {
        const from = totalItems === 0 ? 0 : (pagination.currentPage - 1) * pageSize + 1;
        const to = Math.min(pagination.currentPage * pageSize, totalItems);
        paginationInfo.innerHTML = `
            <strong id="currentPageLabel">${pagination.currentPage}</strong>
            of <strong id="totalPagesLabel">${pagination.totalPages}</strong>
            <span class="text-muted ms-2">(${from}–${to} of ${totalItems})</span>
        `;
    }
}

function updateFilterStats(pagination) {
    document.getElementById('shownCount').textContent = pagination.totalItems;
    document.getElementById('totalCount').textContent = pagination.totalItems;
}

function openCreateModal() {
    currentContactId = 0;
    document.getElementById('contactModalLabel').innerHTML = '<i class="bi bi-person-plus-fill me-2"></i>Add Contact';
    document.getElementById('contactForm').reset();
    document.getElementById('contactId').value = '0';
    document.getElementById('phoneUniqueMsg').textContent = '';
    document.getElementById('phoneUniqueMsg').className = 'form-text small text-muted';
    clearValidationErrors();
    $('#contactModal').modal('show');
}

async function openEditModal(id) {
    const contact = await getContact(id);
    if (!contact) return;

    currentContactId = contact.id;
    document.getElementById('contactModalLabel').innerHTML = '<i class="bi bi-pencil-fill me-2"></i>Edit Contact';
    document.getElementById('contactId').value = contact.id;
    document.getElementById('contactName').value = contact.name;
    document.getElementById('contactPhone').value = contact.mobilePhone;
    document.getElementById('contactJobTitle').value = contact.jobTitle || '';
    document.getElementById('contactBirthDate').value = formatDateInput(contact.birthDate);
    document.getElementById('phoneUniqueMsg').textContent = '';
    document.getElementById('phoneUniqueMsg').className = 'form-text small text-muted';
    clearValidationErrors();
    $('#contactModal').modal('show');
}

//  Validation Functions 

function validateForm() {
    let isValid = true;
    clearValidationErrors();

    const name = document.getElementById('contactName').value.trim();
    if (!name) { setFieldError('contactName', 'nameError', 'Name is required'); isValid = false; }
    else if (name.length < 2) { setFieldError('contactName', 'nameError', 'Name must be at least 2 characters'); isValid = false; }
    else if (name.length > 100) { setFieldError('contactName', 'nameError', 'Name cannot exceed 100 characters'); isValid = false; }
    else if (!/^[a-zA-Zа-яА-ЯёЁ\s\-']+$/.test(name)) { setFieldError('contactName', 'nameError', 'Name can only contain letters, spaces, hyphens and apostrophes'); isValid = false; }

    const phone = document.getElementById('contactPhone').value.trim();
    if (!phone) { setFieldError('contactPhone', 'phoneError', 'Mobile phone is required'); isValid = false; }
    else if (!/^\+?\d{10,15}$/.test(phone)) { setFieldError('contactPhone', 'phoneError', 'Enter a valid phone number (10-15 digits, optionally starting with +)'); isValid = false; }

    const jobTitle = document.getElementById('contactJobTitle').value.trim();
    if (jobTitle && jobTitle.length > 100) { setFieldError('contactJobTitle', 'jobTitleError', 'Job title cannot exceed 100 characters'); isValid = false; }

    const birthDateStr = document.getElementById('contactBirthDate').value;
    if (!birthDateStr) { setFieldError('contactBirthDate', 'birthDateError', 'Birth date is required'); isValid = false; }
    else {
        const birthDate = new Date(birthDateStr);
        const today = new Date(); today.setHours(0, 0, 0, 0);
        if (isNaN(birthDate.getTime())) { setFieldError('contactBirthDate', 'birthDateError', 'Invalid date'); isValid = false; }
        else if (birthDate > today) { setFieldError('contactBirthDate', 'birthDateError', 'Birth date cannot be in the future'); isValid = false; }
        else if (birthDate < new Date('1900-01-01')) { setFieldError('contactBirthDate', 'birthDateError', 'Birth date cannot be earlier than 1900'); isValid = false; }
    }

    if (!isValid) {
        const el = document.querySelector('.modal-body');
        if (el) el.scrollTop = 0;
    }

    return isValid;
}

function setFieldError(inputId, errorId, message) {
    const input = document.getElementById(inputId);
    const error = document.getElementById(errorId);
    if (input) input.classList.add('is-invalid');
    if (error) error.textContent = message;
}

function clearValidationErrors() {
    document.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
    document.querySelectorAll('.invalid-feedback').forEach(el => el.textContent = '');
}

function handleServerErrors(errors) {
    clearValidationErrors();
    for (const key in errors) {
        if (errors.hasOwnProperty(key)) {
            const errorMsg = errors[key].join(', ');
            const errorMap = {
                name: { input: 'contactName', error: 'nameError' },
                mobilePhone: { input: 'contactPhone', error: 'phoneError' },
                jobTitle: { input: 'contactJobTitle', error: 'jobTitleError' },
                birthDate: { input: 'contactBirthDate', error: 'birthDateError' }
            };
            const map = errorMap[key] || errorMap[key.toLowerCase()];
            if (map) setFieldError(map.input, map.error, errorMsg);
        }
    }
}

//  Helper Functions 

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatDateTime(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        + ' ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function formatDateInput(dateStr) {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function showToast(title, message, type = 'info') {
    const toast = document.getElementById('toastNotification');
    const toastTitle = document.getElementById('toastTitle');
    const toastMessage = document.getElementById('toastMessage');

    toastTitle.textContent = title;
    toastMessage.textContent = message;

    toast.classList.remove('bg-success', 'bg-danger', 'bg-warning', 'bg-info');
    toastTitle.classList.remove('text-white');

    if (type === 'success') { toast.classList.add('bg-success'); toastTitle.classList.add('text-white'); }
    else if (type === 'danger') { toast.classList.add('bg-danger'); toastTitle.classList.add('text-white'); }
    else if (type === 'warning') { toast.classList.add('bg-warning'); }
    else { toast.classList.add('bg-info'); }

    const bsToast = new bootstrap.Toast(toast, { delay: 3000 });
    bsToast.show();
}

document.addEventListener('input', function (e) {
    if (e.target.closest('#contactForm')) {
        const input = e.target;
        if (input.classList.contains('is-invalid')) {
            input.classList.remove('is-invalid');
            const errorId = input.id.replace('contact', '').toLowerCase() + 'Error';
            const errorEl = document.getElementById(errorId);
            if (errorEl) errorEl.textContent = '';
        }
    }
});

window.addEventListener('resize', function () {
    const sidebar = document.getElementById('filterSidebar');
    if (window.innerWidth >= 992) {
        sidebar.style.display = '';
    }
});