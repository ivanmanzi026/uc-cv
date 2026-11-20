/**
 * ProCV - Builder Logic
 * User-friendly editor that loads templates from Firestore
 * Users can edit content (text, images, data) but NOT design
 */

console.log('🚀 Builder loading...');

// ============================================================
// STATE
// ============================================================
let cvData = {
    fullName: 'Manzi Ivan',
    professionalTitle: 'Web Dev',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    website: '',
    summary: 'Professional summary goes here. Describe your experience, skills, and career goals.',
    education: [
        { school: 'University Name', degree: 'Your Degree', field: 'Field of Study', startDate: '2014', endDate: '2018', description: 'Additional details about your education.' }
    ],
    experience: [
        { company: 'Company Name', position: 'Your Position', startDate: '2020', endDate: 'Present', description: 'Describe your role and achievements here.' },
        { company: 'Previous Company', position: 'Previous Role', startDate: '2016', endDate: '2020', description: 'Describe your previous role and achievements here.' }
    ],
    skills: ['Skill 1', 'Skill 2', 'Skill 3'],
    projects: [],
    languages: [],
    profileImage: null
};

let currentTemplate = null;
let currentTemplateId = null;
let zoomLevel = 1;
let autoSaveTimeout = null;
let templateElements = [];
let editableFields = {};

// ============================================================
// DOM REFS
// ============================================================
const formFields = {
    fullName: document.getElementById('fullName'),
    professionalTitle: document.getElementById('professionalTitle'),
    email: document.getElementById('email'),
    phone: document.getElementById('phone'),
    location: document.getElementById('location'),
    linkedin: document.getElementById('linkedin'),
    website: document.getElementById('website'),
    summary: document.getElementById('summary'),
};

// ============================================================
// LOAD TEMPLATE FROM FIRESTORE (The one admin built)
// ============================================================
async function loadTemplateFromFirestore(templateId) {
    console.log('🔄 Loading template from Firestore:', templateId);
    
    try {
        const db = getDB();
        if (!db) {
            console.warn('⚠️ Firestore not available, using default');
            return loadDefaultTemplate();
        }
        
        // Try to get the template from Firestore
        const doc = await db.collection('templates').doc(templateId).get();
        
        if (doc.exists) {
            const template = { id: doc.id, ...doc.data() };
            console.log('✅ Template loaded from Firestore:', template.name);
            return template;
        }
        
        console.warn('⚠️ Template not found in Firestore, checking cache...');
        
        // Check localStorage cache
        const cached = localStorage.getItem(APP_CONFIG.templatesCacheKey);
        if (cached) {
            const parsed = JSON.parse(cached);
            const cachedTemplate = parsed.find(t => t.id == templateId);
            if (cachedTemplate) {
                console.log('✅ Template loaded from cache:', cachedTemplate.name);
                return cachedTemplate;
            }
        }
        
        return loadDefaultTemplate();
        
    } catch (error) {
        console.error('❌ Error loading template from Firestore:', error);
        return loadDefaultTemplate();
    }
}

// ============================================================
// LOAD DEFAULT TEMPLATE (Fallback)
// ============================================================
function loadDefaultTemplate() {
    console.log('📋 Using default template');
    return {
        id: 'default',
        name: 'Classic Professional',
        category: 'cv',
        plan: 'free',
        style: 'classic',
        isPortfolio: false,
        pages: [{
            elements: [
                { type: 'name', content: '{{fullName}}', x: 50, y: 50, width: 694, height: 50, style: { fontFamily: 'Inter', fontSize: 32, fontWeight: '800', color: '#0F172A', textAlign: 'center' } },
                { type: 'jobtitle', content: '{{professionalTitle}}', x: 50, y: 105, width: 694, height: 30, style: { fontFamily: 'Inter', fontSize: 16, fontWeight: '500', color: '#64748B', textAlign: 'center' } },
                { type: 'shape', shapeType: 'divider', x: 200, y: 145, width: 394, height: 2, style: { backgroundColor: '#2563EB' } },
                { type: 'field', fieldType: 'summary', content: '{{summary}}', x: 50, y: 175, width: 694, height: 80, style: { fontFamily: 'Inter', fontSize: 14, fontWeight: '400', color: '#475569', lineHeight: 1.6 } },
                { type: 'component', componentType: 'experience', x: 50, y: 275, width: 694, height: 200, componentData: { title: 'Experience', items: cvData.experience } },
                { type: 'component', componentType: 'education', x: 50, y: 495, width: 694, height: 150, componentData: { title: 'Education', items: cvData.education } },
                { type: 'component', componentType: 'skills', x: 50, y: 665, width: 694, height: 120, componentData: { title: 'Skills', items: cvData.skills.map(s => ({ name: s, level: 50 })) } }
            ]
        }],
        design: { primaryColor: '#2563EB', secondaryColor: '#0F172A', bgColor: '#FFFFFF', font: 'Inter' }
    };
}

// ============================================================
// RENDER TEMPLATE FROM ELEMENTS (Like visual-editor)
// ============================================================
function renderTemplateFromElements(template) {
    console.log('🎨 Rendering template from elements...');
    
    const container = document.getElementById('cvPreview');
    if (!container) {
        console.error('❌ cvPreview container not found!');
        return;
    }
    
    currentTemplate = template;
    
    // Get the first page's elements
    const page = template.pages?.[0] || { elements: [] };
    const elements = page.elements || [];
    
    // Store elements for later use
    templateElements = elements;
    
    // Build the CV HTML from elements
    let html = buildCVFromElements(elements, template.design || {});
    container.innerHTML = html;
    
    // Apply editable fields
    applyEditableFields();
    
    console.log('✅ Template rendered with', elements.length, 'elements');
}

// ============================================================
// BUILD CV FROM ELEMENTS
// ============================================================
function buildCVFromElements(elements, design) {
    const bgColor = design.bgColor || '#FFFFFF';
    const primaryColor = design.primaryColor || '#2563EB';
    const secondaryColor = design.secondaryColor || '#0F172A';
    const font = design.font || 'Inter';
    
    let html = `
        <div style="position:relative;width:100%;height:100%;min-height:1123px;background:${bgColor};padding:40px;font-family:'${font}',sans-serif;color:${secondaryColor};">
    `;
    
    // Sort elements by zIndex
    const sorted = [...elements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
    
    sorted.forEach(el => {
        if (el.hidden) return;
        html += renderElement(el, design);
    });
    
    html += `</div>`;
    return html;
}

// ============================================================
// RENDER SINGLE ELEMENT
// ============================================================
function renderElement(el, design) {
    const style = el.style || {};
    const left = el.x || 0;
    const top = el.y || 0;
    const width = el.width || 200;
    const height = el.height || 40;
    
    let styles = `
        position:absolute;
        left:${left}px;
        top:${top}px;
        width:${width}px;
        height:${height}px;
        font-family:${style.fontFamily || design.font || 'Inter'};
        font-size:${style.fontSize || 14}px;
        font-weight:${style.fontWeight || '400'};
        color:${style.color || design.secondaryColor || '#0F172A'};
        text-align:${style.textAlign || 'left'};
        line-height:${style.lineHeight || '1.5'};
        ${style.backgroundColor ? `background:${style.backgroundColor};` : ''}
        ${style.border ? `border:${style.border};` : ''}
        ${style.borderRadius ? `border-radius:${style.borderRadius}px;` : ''}
        ${style.opacity !== undefined ? `opacity:${style.opacity};` : ''}
        ${el.rotation ? `transform:rotate(${el.rotation}deg);` : ''}
        overflow:hidden;
        word-wrap:break-word;
        padding:4px;
    `;
    
    let content = '';
    
    switch(el.type) {
        case 'name':
            content = `<span class="editable-field" data-field="fullName">${cvData.fullName || 'Your Name'}</span>`;
            break;
            
        case 'jobtitle':
            content = `<span class="editable-field" data-field="professionalTitle">${cvData.professionalTitle || 'Your Job Title'}</span>`;
            break;
            
        case 'field':
            const fieldKey = el.field || el.fieldType || 'summary';
            content = `<span class="editable-field" data-field="${fieldKey}">${cvData[fieldKey] || el.content || ''}</span>`;
            break;
            
        case 'heading':
            content = el.content || 'Heading';
            break;
            
        case 'paragraph':
            content = el.content || 'Paragraph text';
            break;
            
        case 'shape':
            if (el.shapeType === 'divider') {
                styles += `background:${style.backgroundColor || '#E2E8F0'};height:2px;padding:0;`;
                content = '';
            } else {
                const shapeStyle = el.shapeType === 'circle' ? 'border-radius:50%;' : 
                                  el.shapeType === 'rounded' ? 'border-radius:12px;' : '';
                content = `<div style="width:100%;height:100%;background:${style.backgroundColor || '#E2E8F0'};${shapeStyle}"></div>`;
            }
            break;
            
        case 'profilephoto':
            const imageData = cvData.profileImage || el.imageData || '';
            if (imageData) {
                content = `<img src="${imageData}" style="width:100%;height:100%;object-fit:cover;border-radius:${el.photoShape === 'circle' ? '50%' : el.photoShape === 'rounded' ? '12px' : '0'};border:${el.borderWidth || 0}px solid ${el.borderColor || '#E2E8F0'};">
                    <button class="photo-upload-btn" onclick="event.stopPropagation();uploadProfilePhoto()" style="position:absolute;bottom:4px;right:4px;background:#2563EB;color:white;border:none;border-radius:50%;width:28px;height:28px;cursor:pointer;font-size:12px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.2);z-index:10;">📷</button>`;
            } else {
                content = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#F1F5F9;border-radius:${el.photoShape === 'circle' ? '50%' : el.photoShape === 'rounded' ? '12px' : '0'};border:${el.borderWidth || 0}px solid ${el.borderColor || '#E2E8F0'};font-size:48px;color:#CBD5E1;position:relative;">
                    <i class="fas fa-user-circle"></i>
                    <button class="photo-upload-btn" onclick="event.stopPropagation();uploadProfilePhoto()" style="position:absolute;bottom:4px;right:4px;background:#2563EB;color:white;border:none;border-radius:50%;width:28px;height:28px;cursor:pointer;font-size:12px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.2);z-index:10;">📷</button>
                </div>`;
            }
            break;
            
        case 'component':
            content = renderComponent(el);
            break;
            
        default:
            content = el.content || 'Element';
    }
    
    return `<div style="${styles}">${content}</div>`;
}

// ============================================================
// RENDER COMPONENT
// ============================================================
function renderComponent(el) {
    const data = el.componentData || {};
    const items = data.items || [];
    const title = data.title || el.componentType || 'Component';
    const type = el.componentType || 'experience';
    
    let html = `<div style="font-weight:600;font-size:16px;color:#0F172A;margin-bottom:8px;">${title}</div>`;
    
    switch(type) {
        case 'experience':
            if (items.length === 0) {
                html += `<div style="font-size:13px;color:#94A3B8;font-style:italic;">No experience added</div>`;
            } else {
                items.forEach((item, index) => {
                    html += `
                        <div style="margin-bottom:12px;padding:8px;background:#F8FAFC;border-radius:4px;border-left:3px solid var(--primary, #2563EB);">
                            <div style="display:flex;justify-content:space-between;font-weight:500;font-size:14px;">
                                <span class="editable-field" data-field="experience_${index}_company">${item.company || 'Company'}</span>
                                <span style="font-weight:400;color:#64748B;font-size:12px;">
                                    <span class="editable-field" data-field="experience_${index}_startDate">${item.startDate || ''}</span> - 
                                    <span class="editable-field" data-field="experience_${index}_endDate">${item.endDate || ''}</span>
                                </span>
                            </div>
                            <div style="font-size:13px;color:#475569;font-weight:500;">
                                <span class="editable-field" data-field="experience_${index}_position">${item.position || 'Position'}</span>
                            </div>
                            <div style="font-size:13px;color:#64748B;margin-top:4px;">
                                <span class="editable-field" data-field="experience_${index}_description">${item.description || 'Description'}</span>
                            </div>
                        </div>
                    `;
                });
            }
            break;
            
        case 'education':
            if (items.length === 0) {
                html += `<div style="font-size:13px;color:#94A3B8;font-style:italic;">No education added</div>`;
            } else {
                items.forEach((item, index) => {
                    html += `
                        <div style="margin-bottom:10px;padding:8px;background:#F8FAFC;border-radius:4px;border-left:3px solid var(--primary, #2563EB);">
                            <div style="display:flex;justify-content:space-between;font-weight:500;font-size:14px;">
                                <span class="editable-field" data-field="education_${index}_school">${item.school || 'School'}</span>
                                <span style="font-weight:400;color:#64748B;font-size:12px;">
                                    <span class="editable-field" data-field="education_${index}_startDate">${item.startDate || ''}</span> - 
                                    <span class="editable-field" data-field="education_${index}_endDate">${item.endDate || ''}</span>
                                </span>
                            </div>
                            <div style="font-size:13px;color:#475569;">
                                <span class="editable-field" data-field="education_${index}_degree">${item.degree || ''}</span>
                                ${item.field ? ` - <span class="editable-field" data-field="education_${index}_field">${item.field}</span>` : ''}
                            </div>
                            ${item.description ? `<div style="font-size:12px;color:#64748B;margin-top:2px;"><span class="editable-field" data-field="education_${index}_description">${item.description}</span></div>` : ''}
                        </div>
                    `;
                });
            }
            break;
            
        case 'skills':
            if (items.length === 0) {
                html += `<div style="font-size:13px;color:#94A3B8;font-style:italic;">No skills added</div>`;
            } else {
                const skillItems = items.map(item => item.name || 'Skill');
                html += `
                    <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:4px;">
                        ${skillItems.map(skill => `
                            <span class="editable-field" style="background:#F1F5F9;padding:4px 14px;border-radius:4px;font-size:13px;color:#475569;" data-field="skills_${skill}">${skill}</span>
                        `).join('')}
                    </div>
                `;
            }
            break;
            
        default:
            html += `<div style="font-size:13px;color:#64748B;">${title} component</div>`;
    }
    
    return html;
}

// ============================================================
// APPLY EDITABLE FIELDS (User can click to edit)
// ============================================================
function applyEditableFields() {
    document.querySelectorAll('.editable-field').forEach(el => {
        const field = el.dataset.field;
        if (!field) return;
        
        // Make it look editable
        el.style.cursor = 'pointer';
        el.style.borderBottom = '1px dashed #2563EB';
        el.style.transition = 'all 0.2s ease';
        el.title = 'Click to edit';
        
        // Click to edit
        el.addEventListener('click', function(e) {
            e.stopPropagation();
            const currentValue = this.textContent.trim();
            const newValue = prompt(`Edit ${field.replace(/_/g, ' ')}:`, currentValue);
            if (newValue !== null) {
                this.textContent = newValue;
                updateCVDataFromFields();
            }
        });
        
        // Hover effect
        el.addEventListener('mouseenter', function() {
            this.style.backgroundColor = 'rgba(37, 99, 235, 0.05)';
            this.style.borderColor = '#2563EB';
        });
        el.addEventListener('mouseleave', function() {
            this.style.backgroundColor = 'transparent';
            this.style.borderColor = '#2563EB';
        });
    });
}

// ============================================================
// UPDATE CV DATA FROM FIELDS
// ============================================================
function updateCVDataFromFields() {
    // Update simple fields
    document.querySelectorAll('.editable-field[data-field]').forEach(el => {
        const field = el.dataset.field;
        const value = el.textContent.trim();
        
        // Check if it's a nested field (experience_0_company)
        if (field.includes('_')) {
            const parts = field.split('_');
            const type = parts[0];
            const index = parseInt(parts[1]);
            const subField = parts.slice(2).join('_');
            
            if (type === 'experience' && cvData.experience[index]) {
                cvData.experience[index][subField] = value;
            } else if (type === 'education' && cvData.education[index]) {
                cvData.education[index][subField] = value;
            }
        } else {
            // Simple field like 'fullName', 'summary', etc.
            cvData[field] = value;
        }
    });
    
    // Update skills from component
    document.querySelectorAll('.editable-field[data-field^="skills_"]').forEach(el => {
        const skillName = el.textContent.trim();
        const field = el.dataset.field;
        const index = parseInt(field.replace('skills_', ''));
        if (!isNaN(index) && cvData.skills[index]) {
            cvData.skills[index] = skillName;
        }
    });
    
    autoSave();
    console.log('✅ CV Data updated from fields:', cvData);
}

// ============================================================
// UPLOAD PROFILE PHOTO
// ============================================================
function uploadProfilePhoto() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';
    document.body.appendChild(input);
    
    input.onchange = function(e) {
        const file = this.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(event) {
            cvData.profileImage = event.target.result;
            // Re-render the template
            if (currentTemplate) {
                renderTemplateFromElements(currentTemplate);
            }
            showToast('✅ Profile photo updated!');
            autoSave();
        };
        reader.readAsDataURL(file);
        document.body.removeChild(input);
    };
    
    input.click();
}

// ============================================================
// LOAD SELECTED TEMPLATE INTO BUILDER
// ============================================================
async function loadSelectedTemplateIntoBuilder() {
    console.log('📋 Loading selected template into builder...');
    
    const templateId = localStorage.getItem('procv_selected_template') || 'classic';
    currentTemplateId = templateId;
    
    // Load from Firestore
    const template = await loadTemplateFromFirestore(templateId);
    
    // Extract data from template if it has it
    if (template.pages && template.pages.length > 0) {
        // Try to extract cvData from template
        const elements = template.pages[0].elements || [];
        elements.forEach(el => {
            if (el.type === 'name') {
                cvData.fullName = el.content?.replace('{{fullName}}', '') || 'Manzi Ivan';
            }
            if (el.type === 'jobtitle') {
                cvData.professionalTitle = el.content?.replace('{{professionalTitle}}', '') || 'Web Dev';
            }
            if (el.type === 'field' && el.fieldType === 'summary') {
                cvData.summary = el.content?.replace('{{summary}}', '') || 'Professional summary...';
            }
            if (el.type === 'component' && el.componentType === 'experience' && el.componentData?.items) {
                cvData.experience = el.componentData.items;
            }
            if (el.type === 'component' && el.componentType === 'education' && el.componentData?.items) {
                cvData.education = el.componentData.items;
            }
            if (el.type === 'component' && el.componentType === 'skills' && el.componentData?.items) {
                cvData.skills = el.componentData.items.map(i => i.name || 'Skill');
            }
        });
    }
    
    // Render the template
    renderTemplateFromElements(template);
    
    // Update UI
    updateTemplateBadge(template);
    updateSavePortfolioButton(template);
    updateBuilderTitle(template);
    populateForm();
    
    console.log('✅ Template loaded:', template.name);
    return template;
}

// ============================================================
// UPDATE UI ELEMENTS
// ============================================================
function updateTemplateBadge(template) {
    const badge = document.getElementById('templateBadge');
    if (!badge) return;
    
    const isPro = template?.plan === 'pro' || template?.plan === 'premium';
    const isPortfolio = template?.category === 'portfolio' || template?.isPortfolio || false;
    
    let text = isPro ? '⭐ Premium' : 'Free';
    if (isPortfolio) text += ' 🎨 Portfolio';
    
    badge.textContent = text;
    badge.className = 'template-badge' + (isPortfolio ? ' portfolio' : '');
}

function updateSavePortfolioButton(template) {
    const btn = document.getElementById('savePortfolioBtn');
    if (!btn) return;
    
    const isPortfolio = template?.category === 'portfolio' || template?.isPortfolio || false;
    
    if (isPortfolio) {
        btn.style.display = 'inline-flex';
    } else {
        btn.style.display = 'none';
    }
}

function updateBuilderTitle(template) {
    const title = document.getElementById('builderTitle');
    if (!title) return;
    
    const name = template?.name || 'CV';
    title.textContent = `📄 ${name}`;
}

// ============================================================
// POPULATE FORM
// ============================================================
function populateForm() {
    if (formFields.fullName) formFields.fullName.value = cvData.fullName || '';
    if (formFields.professionalTitle) formFields.professionalTitle.value = cvData.professionalTitle || '';
    if (formFields.email) formFields.email.value = cvData.email || '';
    if (formFields.phone) formFields.phone.value = cvData.phone || '';
    if (formFields.location) formFields.location.value = cvData.location || '';
    if (formFields.linkedin) formFields.linkedin.value = cvData.linkedin || '';
    if (formFields.website) formFields.website.value = cvData.website || '';
    if (formFields.summary) formFields.summary.value = cvData.summary || '';
}

// ============================================================
// SETUP FORM LISTENERS
// ============================================================
function setupFormListeners() {
    console.log('🔧 Setting up form listeners...');
    
    Object.keys(formFields).forEach(key => {
        const el = formFields[key];
        if (el) {
            el.addEventListener('input', function() {
                cvData[key] = this.value;
                // Update the preview
                if (currentTemplate) {
                    renderTemplateFromElements(currentTemplate);
                }
                autoSave();
            });
        }
    });
}

// ============================================================
// AUTO SAVE
// ============================================================
function autoSave() {
    clearTimeout(autoSaveTimeout);
    autoSaveTimeout = setTimeout(() => {
        try {
            localStorage.setItem('procv_data', JSON.stringify(cvData));
            localStorage.setItem('procv_template', currentTemplateId || 'classic');
            if (currentTemplate) {
                localStorage.setItem('procv_template_data', JSON.stringify(currentTemplate));
            }
        } catch (e) {
            console.error('Auto-save error:', e);
        }
    }, 500);
}

// ============================================================
// SAVE AS PORTFOLIO (Only for Portfolio templates)
// ============================================================
async function saveAsPortfolio() {
    const user = typeof getCurrentUser !== 'undefined' ? getCurrentUser() : null;
    if (!user) {
        showToast('Please login first', 'error');
        if (typeof openLoginModal !== 'undefined') openLoginModal();
        return;
    }
    
    const template = currentTemplate;
    if (!template || !(template.category === 'portfolio' || template.isPortfolio)) {
        showToast('Save as Portfolio is only available for Portfolio templates.', 'warning');
        return;
    }
    
    // Check if Pro
    const isPro = localStorage.getItem('procv_is_pro') === 'true';
    if ((template.plan === 'pro' || template.plan === 'premium') && !isPro) {
        showToast('This Portfolio template requires Pro subscription.', 'warning');
        if (typeof showUpgradeModal !== 'undefined') {
            showUpgradeModal(template.id);
        }
        return;
    }
    
    const cvDataToSave = { ...cvData };
    const cvId = Date.now().toString();
    const baseUrl = window.location.origin;
    const liveLink = `${baseUrl}/cv.html?userId=${user.uid}&cvId=${cvId}`;
    
    const cvRecord = {
        id: cvId,
        templateId: template.id || 'default',
        templateName: template.name || 'Template',
        style: template.style || 'classic',
        data: cvDataToSave,
        isPortfolio: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        liveLink: liveLink
    };
    
    if (typeof saveCvToUser !== 'undefined') {
        saveCvToUser(user.uid, cvRecord);
        showToast('✅ Portfolio CV saved! Live link generated!');
        
        if (typeof showLiveLinkModalWithUrl !== 'undefined') {
            showLiveLinkModalWithUrl(liveLink);
        } else {
            alert('Your Portfolio CV is saved!\n\nShare this link:\n' + liveLink);
        }
    } else {
        showToast('Error saving portfolio CV', 'error');
    }
}

// ============================================================
// ZOOM CONTROLS
// ============================================================
function zoomIn() {
    zoomLevel = Math.min(zoomLevel + 0.1, 1.5);
    updateZoom();
}

function zoomOut() {
    zoomLevel = Math.max(zoomLevel - 0.1, 0.5);
    updateZoom();
}

function updateZoom() {
    const preview = document.querySelector('.cv-preview');
    if (preview) {
        preview.style.transform = `scale(${zoomLevel})`;
        preview.style.transformOrigin = 'top center';
    }
    document.getElementById('zoomLevel').textContent = Math.round(zoomLevel * 100) + '%';
}

// ============================================================
// DOWNLOAD FUNCTIONS
// ============================================================
function toggleDownloadDropdown() {
    const dropdown = document.getElementById('downloadDropdown');
    if (dropdown) {
        dropdown.classList.toggle('active');
        setTimeout(() => {
            document.addEventListener('click', function closeDropdown(e) {
                if (!e.target.closest('.download-dropdown')) {
                    dropdown.classList.remove('active');
                    document.removeEventListener('click', closeDropdown);
                }
            });
        }, 100);
    }
}

function downloadPDF() {
    window.print();
    closeDownloadDropdown();
}

function downloadDOCX() {
    const content = generateCVContent();
    const blob = new Blob([content], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${cvData.fullName || 'CV'}.docx`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('📄 DOCX downloaded');
    closeDownloadDropdown();
}

function downloadTXT() {
    const content = generateCVContent();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${cvData.fullName || 'CV'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('📄 TXT downloaded');
    closeDownloadDropdown();
}

function generateCVContent() {
    let text = '';
    text += `${cvData.fullName || 'Your Name'}\n`;
    text += `${'='.repeat(40)}\n`;
    text += `${cvData.professionalTitle || 'Professional Title'}\n\n`;
    
    if (cvData.summary) {
        text += `PROFESSIONAL SUMMARY\n${'-'.repeat(40)}\n${cvData.summary}\n\n`;
    }
    
    if (cvData.experience && cvData.experience.length > 0) {
        text += `WORK EXPERIENCE\n${'-'.repeat(40)}\n`;
        cvData.experience.forEach(exp => {
            text += `${exp.company || 'Company'}\n  ${exp.position || 'Position'}`;
            if (exp.startDate || exp.endDate) {
                text += ` (${exp.startDate || ''} - ${exp.endDate || ''})`;
            }
            text += `\n  ${exp.description || ''}\n\n`;
        });
    }
    
    if (cvData.education && cvData.education.length > 0) {
        text += `EDUCATION\n${'-'.repeat(40)}\n`;
        cvData.education.forEach(edu => {
            text += `${edu.school || 'School'}\n  ${edu.degree || ''}${edu.field ? ' - ' + edu.field : ''}`;
            if (edu.startDate || edu.endDate) {
                text += ` (${edu.startDate || ''} - ${edu.endDate || ''})`;
            }
            text += `\n  ${edu.description || ''}\n\n`;
        });
    }
    
    if (cvData.skills && cvData.skills.length > 0) {
        text += `SKILLS\n${'-'.repeat(40)}\n  ${cvData.skills.join(', ')}\n\n`;
    }
    
    return text;
}

function closeDownloadDropdown() {
    const dropdown = document.getElementById('downloadDropdown');
    if (dropdown) dropdown.classList.remove('active');
}

// ============================================================
// TOAST
// ============================================================
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) {
        const newContainer = document.createElement('div');
        newContainer.id = 'toastContainer';
        newContainer.className = 'toast-container';
        document.body.appendChild(newContainer);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast-item ${type}`;
    const icon = type === 'success' ? 'fa-check-circle' : 
                 type === 'error' ? 'fa-exclamation-circle' : 
                 type === 'warning' ? 'fa-exclamation-triangle' :
                 'fa-info-circle';
    toast.innerHTML = `<i class="fas ${icon}"></i> ${message}`;
    document.getElementById('toastContainer').appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ============================================================
// LIVE LINK MODAL FUNCTIONS
// ============================================================
function showLiveLinkModalWithUrl(url) {
    let modal = document.getElementById('liveLinkModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'liveLinkModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-link"></i> Your Live CV Link</h3>
                    <button class="modal-close" onclick="closeLiveLinkModal()">×</button>
                </div>
                <div class="modal-body">
                    <p style="color:var(--gray-600);margin-bottom:12px;">Your portfolio CV has been saved! Share this link:</p>
                    <div style="display:flex;gap:8px;margin-bottom:16px;">
                        <input type="text" id="liveLinkInput" value="${url}" readonly style="flex:1;padding:10px;border:2px solid var(--gray-200);border-radius:8px;font-size:14px;background:var(--gray-100);">
                        <button class="btn btn-primary" onclick="copyLiveLink()">
                            <i class="fas fa-copy"></i> Copy
                        </button>
                    </div>
                    <div style="padding:12px;background:#fefce8;border:1px solid #fde68a;border-radius:6px;font-size:13px;color:#92400e;">
                        <i class="fas fa-info-circle"></i> This link is permanently hosted on ProCV.
                    </div>
                    <div style="margin-top:12px;">
                        <button class="btn btn-outline btn-sm" onclick="window.location.href='my-cvs.html'" style="width:100%;">
                            <i class="fas fa-folder"></i> View All My CVs
                        </button>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeLiveLinkModal()">Close</button>
                    <button class="btn btn-success" onclick="openLiveLink()">
                        <i class="fas fa-external-link-alt"></i> Open
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    const input = document.getElementById('liveLinkInput');
    if (input) input.value = url;
    modal.classList.add('active');
}

function closeLiveLinkModal() {
    const modal = document.getElementById('liveLinkModal');
    if (modal) modal.classList.remove('active');
}

function copyLiveLink() {
    const input = document.getElementById('liveLinkInput');
    if (input) {
        input.select();
        document.execCommand('copy');
        showToast('✅ Link copied to clipboard!');
    }
}

function openLiveLink() {
    const input = document.getElementById('liveLinkInput');
    if (input) {
        window.open(input.value, '_blank');
    }
}

// ============================================================
// NAV TOGGLE
// ============================================================
function setupNavToggle() {
    const toggle = document.getElementById('navToggle');
    const links = document.getElementById('navLinks');
    if (toggle && links) {
        toggle.addEventListener('click', function() {
            links.classList.toggle('active');
            this.querySelector('i').classList.toggle('fa-bars');
            this.querySelector('i').classList.toggle('fa-times');
        });
    }
}

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Builder initializing...');
    
    setupNavToggle();
    
    // Load saved data
    try {
        const saved = localStorage.getItem('procv_data');
        if (saved) {
            const parsed = JSON.parse(saved);
            cvData = { ...cvData, ...parsed };
            console.log('📂 Loaded saved data');
        }
    } catch (e) {
        console.error('Error loading saved data:', e);
    }
    
    // Load template
    setTimeout(function() {
        loadSelectedTemplateIntoBuilder();
    }, 300);
    
    // Setup form listeners
    setTimeout(function() {
        setupFormListeners();
    }, 400);
    
    // Check if user is logged in
    setTimeout(function() {
        const user = typeof getCurrentUser !== 'undefined' ? getCurrentUser() : null;
        if (user) {
            if (formFields.email) formFields.email.value = user.email || '';
            if (formFields.fullName) formFields.fullName.value = user.displayName || '';
        }
    }, 500);
});

// ============================================================
// EXPOSE GLOBALLY
// ============================================================
window.loadSelectedTemplateIntoBuilder = loadSelectedTemplateIntoBuilder;
window.uploadProfilePhoto = uploadProfilePhoto;
window.zoomIn = zoomIn;
window.zoomOut = zoomOut;
window.saveAsPortfolio = saveAsPortfolio;
window.downloadPDF = downloadPDF;
window.downloadDOCX = downloadDOCX;
window.downloadTXT = downloadTXT;
window.toggleDownloadDropdown = toggleDownloadDropdown;
window.closeDownloadDropdown = closeDownloadDropdown;
window.showLiveLinkModalWithUrl = showLiveLinkModalWithUrl;
window.closeLiveLinkModal = closeLiveLinkModal;
window.copyLiveLink = copyLiveLink;
window.openLiveLink = openLiveLink;
window.showToast = showToast;

console.log('✅ builder.js loaded');