/**
 * ProCV - Template Display Module
 * Complete with Portfolio Templates (Free & Premium)
 * Syncs with Firestore + LocalStorage
 */

console.log('📁 templates.js loading...');

// ============================================================
// RENDER CV FUNCTION
// ============================================================
function renderCV(data, template = 'classic') {
    console.log('🎨 Rendering CV with template:', template);
    
    const container = document.getElementById('cvPreview');
    if (!container) {
        console.error('❌ cvPreview container not found!');
        return;
    }

    // Build Education HTML
    let educationHtml = '';
    if (data.education && data.education.length > 0) {
        educationHtml = `
            <div style="margin-bottom:16px;">
                <div style="font-size:16px;font-weight:700;text-transform:uppercase;border-bottom:1px solid #ddd;padding-bottom:4px;margin-bottom:8px;">Education</div>
                ${data.education.map((edu, index) => `
                    <div style="margin-bottom:14px;padding-bottom:14px;${index < data.education.length - 1 ? 'border-bottom:1px solid #f0f0f0;' : ''}">
                        ${edu.school ? `<div style="font-weight:600;font-size:14px;">${edu.school}</div>` : ''}
                        ${edu.degree || edu.field ? `<div style="font-size:13px;color:#555;margin-top:2px;">${edu.degree || ''}${edu.degree && edu.field ? ' - ' : ''}${edu.field || ''}</div>` : ''}
                        ${edu.startDate || edu.endDate ? `<div style="font-size:12px;color:#666;margin-top:2px;">${edu.startDate || ''}${edu.startDate && edu.endDate ? ' - ' : ''}${edu.endDate || ''}</div>` : ''}
                        ${edu.description ? `<div style="font-size:13px;color:#333;margin-top:4px;word-wrap:break-word;white-space:pre-wrap;">${edu.description}</div>` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    }

    // Build Experience HTML
    let experienceHtml = '';
    if (data.experience && data.experience.length > 0) {
        experienceHtml = `
            <div style="margin-bottom:16px;">
                <div style="font-size:16px;font-weight:700;text-transform:uppercase;border-bottom:1px solid #ddd;padding-bottom:4px;margin-bottom:8px;">Work Experience</div>
                ${data.experience.map((exp, index) => `
                    <div style="margin-bottom:14px;padding-bottom:14px;${index < data.experience.length - 1 ? 'border-bottom:1px solid #f0f0f0;' : ''}">
                        ${exp.company ? `<div style="font-weight:600;font-size:14px;">${exp.company}</div>` : ''}
                        ${exp.position ? `<div style="font-size:13px;color:#555;margin-top:2px;">${exp.position}</div>` : ''}
                        ${exp.startDate || exp.endDate ? `<div style="font-size:12px;color:#666;margin-top:2px;">${exp.startDate || ''}${exp.startDate && exp.endDate ? ' - ' : ''}${exp.endDate || ''}</div>` : ''}
                        ${exp.description ? `<div style="font-size:13px;color:#333;margin-top:4px;line-height:1.6;word-wrap:break-word;white-space:pre-wrap;">${exp.description}</div>` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    }

    // Build Projects HTML
    let projectsHtml = '';
    if (data.projects && data.projects.length > 0) {
        projectsHtml = `
            <div style="margin-bottom:16px;">
                <div style="font-size:16px;font-weight:700;text-transform:uppercase;border-bottom:1px solid #ddd;padding-bottom:4px;margin-bottom:8px;">Projects</div>
                ${data.projects.map((proj, index) => `
                    <div style="margin-bottom:14px;padding-bottom:14px;${index < data.projects.length - 1 ? 'border-bottom:1px solid #f0f0f0;' : ''}">
                        ${proj.name ? `<div style="font-weight:600;font-size:14px;">${proj.name}</div>` : ''}
                        ${proj.description ? `<div style="font-size:13px;color:#444;margin-top:4px;word-wrap:break-word;white-space:pre-wrap;">${proj.description}</div>` : ''}
                        ${proj.technologies ? `<div style="font-size:12px;color:#888;margin-top:4px;font-weight:500;">Technologies: ${proj.technologies}</div>` : ''}
                        ${proj.link ? `<div style="font-size:12px;color:#2563EB;margin-top:4px;word-wrap:break-word;"><a href="${proj.link}" target="_blank" style="color:#2563EB;text-decoration:none;">🔗 ${proj.link}</a></div>` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    }

    // Build Skills HTML
    let skillsHtml = '';
    if (data.skills && data.skills.length > 0) {
        skillsHtml = `
            <div style="margin-bottom:16px;">
                <div style="font-size:16px;font-weight:700;text-transform:uppercase;border-bottom:1px solid #ddd;padding-bottom:4px;margin-bottom:8px;">Skills</div>
                <div style="display:flex;flex-wrap:wrap;gap:8px;">
                    ${data.skills.map(skill => `<span style="background:#f0f0f0;padding:4px 12px;border-radius:4px;font-size:13px;">${skill}</span>`).join('')}
                </div>
            </div>
        `;
    }

    // Build Languages HTML
    let languagesHtml = '';
    if (data.languages && data.languages.length > 0) {
        languagesHtml = `
            <div>
                <div style="font-size:16px;font-weight:700;text-transform:uppercase;border-bottom:1px solid #ddd;padding-bottom:4px;margin-bottom:8px;">Languages</div>
                <div style="display:flex;flex-wrap:wrap;gap:16px;font-size:13px;color:#444;">
                    ${data.languages.map(lang => `<span>${lang.language || ''}${lang.proficiency ? ' — ' + lang.proficiency : ''}</span>`).join('')}
                </div>
            </div>
        `;
    }

    // Build the complete CV HTML
    let html = `
        <div style="padding:40px;font-family:'Inter',sans-serif;max-width:100%;background:white;min-height:297mm;color:#1a1a1a;overflow:hidden;">
            <div style="text-align:center;border-bottom:3px solid #1a1a1a;padding-bottom:16px;margin-bottom:20px;">
                <div style="font-size:28px;font-weight:700;text-transform:uppercase;letter-spacing:2px;">${data.fullName || 'Your Name'}</div>
                <div style="font-size:16px;color:#555;margin-top:4px;">${data.professionalTitle || 'Professional Title'}</div>
                <div style="display:flex;justify-content:center;gap:16px;font-size:12px;color:#555;margin-top:8px;flex-wrap:wrap;">
                    ${data.email ? `<span style="word-wrap:break-word;max-width:200px;">✉️ ${data.email}</span>` : ''}
                    ${data.phone ? `<span>📱 ${data.phone}</span>` : ''}
                    ${data.location ? `<span>📍 ${data.location}</span>` : ''}
                    ${data.linkedin ? `<span style="word-wrap:break-word;max-width:200px;">🔗 ${data.linkedin}</span>` : ''}
                    ${data.website ? `<span style="word-wrap:break-word;max-width:200px;">🌐 ${data.website}</span>` : ''}
                </div>
            </div>
            
            ${data.summary ? `
            <div style="margin-bottom:16px;">
                <div style="font-size:16px;font-weight:700;text-transform:uppercase;border-bottom:1px solid #ddd;padding-bottom:4px;margin-bottom:8px;">Professional Summary</div>
                <div style="font-size:14px;line-height:1.8;color:#333;word-wrap:break-word;white-space:pre-wrap;max-width:100%;overflow-wrap:break-word;">${data.summary}</div>
            </div>
            ` : ''}
            
            ${experienceHtml}
            ${educationHtml}
            ${skillsHtml}
            ${projectsHtml}
            ${languagesHtml}
        </div>
    `;
    
    container.innerHTML = html;
    console.log('✅ CV rendered successfully');
}

// ============================================================
// DEFAULT TEMPLATES (Fallback - Will ALWAYS show these)
// ============================================================
const DEFAULT_TEMPLATES = [
    {
        id: 'standard-executive',
        name: 'Standard Executive',
        description: 'Clean white page with stark black border and crisp serif fonts',
        plan: 'free',
        style: 'standard-executive',
        coverImage: '📄',
        isPortfolio: false,
        hasLiveLink: false,
        type: 'standard',
        category: 'standard'
    },
    {
        id: 'ats-scholar',
        name: 'ATS Scholar',
        description: 'Left-aligned, no icons, spacious margins for ATS scanning',
        plan: 'free',
        style: 'ats-scholar',
        coverImage: '📄',
        isPortfolio: false,
        hasLiveLink: false,
        type: 'standard',
        category: 'standard'
    },
    {
        id: 'classic',
        name: 'Classic Professional',
        description: 'Traditional black and white design for corporate roles',
        plan: 'free',
        style: 'classic',
        coverImage: '📄',
        isPortfolio: false,
        hasLiveLink: false,
        type: 'standard',
        category: 'standard'
    },
    {
        id: 'minimal',
        name: 'Minimalist Developer',
        description: 'Clean, ATS-friendly design for tech roles',
        plan: 'free',
        style: 'minimal',
        coverImage: '📄',
        isPortfolio: false,
        hasLiveLink: false,
        type: 'standard',
        category: 'standard'
    },
    {
        id: 'modern',
        name: 'Modern Executive',
        description: 'Clean design with accent colors for executives',
        plan: 'pro',
        style: 'modern',
        coverImage: '📄',
        isPortfolio: false,
        hasLiveLink: false,
        type: 'standard',
        category: 'standard'
    },
    {
        id: 'graduate',
        name: 'Creative Graduate',
        description: 'Eye-catching design for recent graduates',
        plan: 'pro',
        style: 'graduate',
        coverImage: '📄',
        isPortfolio: false,
        hasLiveLink: false,
        type: 'standard',
        category: 'standard'
    },
    {
        id: 'portfolio-free-student',
        name: 'Student Portfolio (Free)',
        description: 'Perfect for students with education focus and projects',
        plan: 'free',
        style: 'portfolio-free-student',
        coverImage: '📁',
        isPortfolio: true,
        hasLiveLink: true,
        type: 'portfolio',
        category: 'portfolio'
    },
    {
        id: 'portfolio-two-column',
        name: 'Two-Column Portfolio (Premium)',
        description: 'Dark sidebar for skills with wide column for project highlights',
        plan: 'pro',
        style: 'portfolio-two-column',
        coverImage: '📁',
        isPortfolio: true,
        hasLiveLink: true,
        type: 'portfolio',
        category: 'portfolio'
    },
    {
        id: 'portfolio-infographic',
        name: 'Infographic Creative (Premium)',
        description: 'Visual timelines and skill meter bars for creative professionals',
        plan: 'pro',
        style: 'portfolio-infographic',
        coverImage: '📁',
        isPortfolio: true,
        hasLiveLink: true,
        type: 'portfolio',
        category: 'portfolio'
    }
];

// ============================================================
// LOAD TEMPLATES FROM FIRESTORE + LOCALSTORAGE
// ============================================================
async function loadTemplatesFromFirestore() {
    console.log('🔄 Loading templates from Firestore...');
    
    try {
        const db = getDB();
        if (db) {
            const snapshot = await db.collection('templates')
                .where('status', '==', 'published')
                .get();
            
            const templates = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                templates.push({
                    id: doc.id,
                    ...data,
                    isPortfolio: data.category === 'portfolio' || data.isPortfolio || false,
                    hasLiveLink: data.category === 'portfolio',
                    type: data.category === 'portfolio' ? 'portfolio' : 'standard',
                    category: data.category || 'standard',
                    coverImage: data.thumbnail || '📄',
                    style: data.style || 'classic'
                });
            });
            
            if (templates.length > 0) {
                console.log('✅ Loaded', templates.length, 'templates from Firestore');
                // Save to localStorage as cache
                localStorage.setItem(APP_CONFIG.templatesCacheKey, JSON.stringify(templates));
                return templates;
            } else {
                console.log('⚠️ No templates found in Firestore');
            }
        } else {
            console.log('⚠️ Firestore not available');
        }
    } catch (error) {
        console.warn('⚠️ Firestore template load failed:', error.message);
    }
    
    // Fallback to LocalStorage cache
    try {
        const cached = localStorage.getItem(APP_CONFIG.templatesCacheKey);
        if (cached) {
            const parsed = JSON.parse(cached);
            if (parsed && parsed.length > 0) {
                console.log('✅ Loaded', parsed.length, 'templates from LocalStorage cache');
                return parsed;
            }
        }
    } catch (error) {
        console.warn('⚠️ LocalStorage template load failed:', error.message);
    }
    
    // Final fallback to default templates
    console.log('📋 Using default templates (', DEFAULT_TEMPLATES.length, 'templates)');
    return DEFAULT_TEMPLATES;
}

// ============================================================
// LOAD TEMPLATES - MAIN (FIXED - Always shows templates)
// ============================================================
function loadTemplates() {
    console.log('🔄 Loading templates...');
    
    const grid = document.getElementById('templatesGrid');
    if (!grid) {
        console.log('⚠️ templatesGrid not found');
        return;
    }
    
    // Show loading state
    grid.innerHTML = `
        <div class="loading-templates">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Loading templates...</p>
        </div>
    `;
    
    // Load from Firestore with fallback
    loadTemplatesFromFirestore()
        .then(templates => {
            console.log('📋 Templates loaded:', templates.length);
            
            // Ensure we have templates
            if (!templates || templates.length === 0) {
                templates = DEFAULT_TEMPLATES;
                console.log('📋 Using default templates (fallback)');
            }
            
            const isPro = typeof isProUser !== 'undefined' ? isProUser() : false;
            
            const templateCvs = templates.filter(t => t.isPortfolio !== true);
            const portfolioCvs = templates.filter(t => t.isPortfolio === true);
            
            console.log('📋 Template CVs:', templateCvs.length);
            console.log('🎨 Portfolio CVs:', portfolioCvs.length);
            
            renderTemplates(grid, templateCvs, portfolioCvs, isPro);
        })
        .catch(error => {
            console.error('❌ Error loading templates:', error);
            // Show default templates on error
            const isPro = typeof isProUser !== 'undefined' ? isProUser() : false;
            const templateCvs = DEFAULT_TEMPLATES.filter(t => t.isPortfolio !== true);
            const portfolioCvs = DEFAULT_TEMPLATES.filter(t => t.isPortfolio === true);
            renderTemplates(grid, templateCvs, portfolioCvs, isPro);
        });
}

// ============================================================
// RENDER TEMPLATES
// ============================================================
function renderTemplates(grid, templateCvs, portfolioCvs, isPro) {
    console.log('🎨 Rendering templates...');
    console.log('📋 Template CVs:', templateCvs.length);
    console.log('🎨 Portfolio CVs:', portfolioCvs.length);
    
    let html = '';

    // === TEMPLATE CVs SECTION ===
    html += `
        <div style="grid-column:1/-1;margin:20px 0 16px 0;padding-bottom:12px;border-bottom:2px solid var(--gray-200);">
            <h2 style="font-size:20px;font-weight:700;color:var(--dark);">
                <i class="fas fa-file-alt" style="color:var(--primary);"></i> Template CVs
            </h2>
            <p style="font-size:14px;color:var(--gray-500);">Standard CV templates for professional use</p>
        </div>
    `;

    if (templateCvs.length === 0) {
        html += `<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--gray-500);">No template CVs available</div>`;
    } else {
        html += templateCvs.map(template => renderTemplateCard(template, isPro)).join('');
    }

    // === PORTFOLIO CVs SECTION ===
    html += `
        <div style="grid-column:1/-1;margin:40px 0 16px 0;padding-bottom:12px;border-bottom:2px solid var(--gray-200);">
            <h2 style="font-size:20px;font-weight:700;color:var(--dark);">
                <i class="fas fa-palette" style="color:#7C3AED;"></i> Portfolio CVs
            </h2>
            <p style="font-size:14px;color:var(--gray-500);">Creative portfolio-style CVs with live links (Free & Premium)</p>
        </div>
    `;

    if (portfolioCvs.length === 0) {
        html += `
            <div style="grid-column:1/-1;text-align:center;padding:40px;background:var(--gray-100);border-radius:var(--radius);border:2px dashed var(--gray-300);">
                <i class="fas fa-paint-brush" style="font-size:48px;color:var(--gray-300);display:block;margin-bottom:12px;"></i>
                <h3 style="font-size:18px;font-weight:600;color:var(--gray-600);">No Portfolio CVs Available</h3>
                <p style="color:var(--gray-500);">Check back later for creative portfolio templates</p>
            </div>
        `;
    } else {
        html += portfolioCvs.map(template => renderTemplateCard(template, isPro)).join('');
    }
    
    grid.innerHTML = html;
    console.log('✅ Templates rendered successfully');
}

// ============================================================
// RENDER INDIVIDUAL TEMPLATE CARD
// ============================================================
function renderTemplateCard(template, isPro) {
    const isPremium = template.plan === 'pro' || template.plan === 'premium';
    const isLocked = isPremium && !isPro;
    const isPortfolio = template.isPortfolio === true;
    const hasLiveLink = template.hasLiveLink === true && !isLocked;
    const coverImage = template.coverImage || template.thumbnail || '📄';
    const planLabel = isPremium ? '⭐ Premium' : 'Free';
    const typeLabel = isPortfolio ? '🎨 Portfolio' : '📄 Standard';
    
    const showLiveLink = isPortfolio && !isLocked;
    
    return `
        <div class="template-preview-card" style="background:var(--white);border-radius:var(--radius);overflow:hidden;box-shadow:var(--shadow);transition:var(--transition);border:2px solid transparent;cursor:pointer;">
            <div class="preview-image" style="width:100%;aspect-ratio:210/297;background:var(--gray-100);overflow:hidden;position:relative;">
                ${coverImage && (coverImage.startsWith('data:image') || coverImage.startsWith('http')) ? 
                    `<img src="${coverImage}" alt="${template.name}" style="width:100%;height:100%;object-fit:cover;display:block;">` :
                    `<span style="font-size:64px;display:flex;align-items:center;justify-content:center;height:100%;">${coverImage || '📄'}</span>`
                }
                <span style="position:absolute;top:10px;right:10px;${isPremium ? 'background:linear-gradient(135deg,#F59E0B,#D97706);color:white;' : 'background:var(--gray-200);color:var(--gray-600);'}padding:2px 12px;border-radius:50px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">${planLabel}</span>
                ${isPortfolio ? `<span style="position:absolute;top:40px;right:10px;background:linear-gradient(135deg,#7C3AED,#2563EB);color:white;padding:2px 12px;border-radius:50px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">🎨 Portfolio</span>` : ''}
                ${isLocked ? `<span style="position:absolute;top:70px;right:10px;background:var(--gray-700);color:white;padding:2px 12px;border-radius:50px;font-size:9px;font-weight:700;text-transform:uppercase;">🔒 Locked</span>` : ''}
            </div>
            <div style="padding:16px;">
                <h3 style="font-size:16px;font-weight:700;color:var(--dark);">${template.name}</h3>
                <p style="font-size:13px;color:var(--gray-600);margin-top:4px;">${template.description || 'Professional CV template'}</p>
                <div style="display:flex;gap:8px;margin-top:6px;flex-wrap:wrap;">
                    <span style="display:inline-block;padding:2px 10px;border-radius:50px;font-size:10px;font-weight:600;background:var(--gray-100);color:var(--gray-600);">${typeLabel}</span>
                    <span style="display:inline-block;padding:2px 10px;border-radius:50px;font-size:10px;font-weight:600;${isPremium ? 'background:linear-gradient(135deg,#F59E0B,#D97706);color:white;' : 'background:var(--gray-200);color:var(--gray-600);'}">${planLabel}</span>
                </div>
                <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap;">
                    <button class="btn btn-outline btn-sm" onclick="previewTemplate('${template.id}')" style="flex:1;justify-content:center;font-size:13px;padding:8px 16px;">
                        <i class="fas fa-eye"></i> Preview
                    </button>
                    ${isLocked ? 
                        `<button class="btn btn-primary btn-sm" onclick="showUpgradeModal('${template.id}')" style="flex:1;justify-content:center;font-size:13px;padding:8px 16px;">
                            <i class="fas fa-crown"></i> Unlock
                        </button>` :
                        `<button class="btn btn-primary btn-sm" onclick="customizeTemplate('${template.id}')" style="flex:1;justify-content:center;font-size:13px;padding:8px 16px;">
                            <i class="fas fa-pen"></i> Customize
                        </button>`
                    }
                </div>
                ${showLiveLink ? `
                    <div style="margin-top:8px;">
                        <button class="btn btn-success btn-sm" onclick="generateLiveLink('${template.id}')" style="width:100%;font-size:12px;padding:6px 12px;">
                            <i class="fas fa-link"></i> Get Live Link
                        </button>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

// ============================================================
// PREVIEW TEMPLATE
// ============================================================
function previewTemplate(templateId) {
    console.log('👁️ Previewing template:', templateId);
    
    let template = null;
    
    // Try to get from cache
    const cached = localStorage.getItem(APP_CONFIG.templatesCacheKey);
    if (cached) {
        try {
            const parsed = JSON.parse(cached);
            template = parsed.find(t => t.id == templateId);
        } catch (e) {}
    }
    
    // Fallback to default
    if (!template) {
        template = DEFAULT_TEMPLATES.find(t => t.id == templateId);
    }
    
    if (!template) {
        showToast('Template not found', 'error');
        return;
    }
    
    showTemplatePreview(template);
}

// ============================================================
// SHOW TEMPLATE PREVIEW MODAL
// ============================================================
function showTemplatePreview(template) {
    console.log('📋 Showing preview for:', template.name);
    
    let modal = document.getElementById('templatePreviewModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'templatePreviewModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content modal-lg">
                <div class="modal-header">
                    <h3 id="previewModalTitle">Template Preview</h3>
                    <button class="modal-close" onclick="closeTemplatePreview()">×</button>
                </div>
                <div class="modal-body" style="background:#f0f0f0;padding:20px;display:flex;justify-content:center;max-height:80vh;overflow:auto;">
                    <div id="previewModalContent" style="width:794px;height:1123px;background:white;box-shadow:0 4px 24px rgba(0,0,0,0.12);flex-shrink:0;transform:scale(0.65);transform-origin:top center;overflow:hidden;position:relative;border:1px solid #e2e8f0;">
                        <!-- Template preview rendered here -->
                    </div>
                </div>
                <div class="modal-footer">
                    <span id="previewPlanBadge" style="margin-right:auto;padding:4px 12px;border-radius:50px;font-size:12px;font-weight:600;"></span>
                    <button class="btn btn-secondary" onclick="closeTemplatePreview()">Close</button>
                    <button class="btn btn-primary" id="previewCustomizeBtn">
                        <i class="fas fa-pen"></i> Customize This Template
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    document.getElementById('previewModalTitle').textContent = template.name;
    
    const isPremium = template.plan === 'pro' || template.plan === 'premium';
    const isPro = typeof isProUser !== 'undefined' ? isProUser() : false;
    const isLocked = isPremium && !isPro;
    
    const badge = document.getElementById('previewPlanBadge');
    if (isPremium) {
        badge.textContent = '⭐ Premium Template';
        badge.style.background = 'linear-gradient(135deg,#F59E0B,#D97706)';
        badge.style.color = 'white';
    } else {
        badge.textContent = 'Free Template';
        badge.style.background = 'var(--gray-200)';
        badge.style.color = 'var(--gray-600)';
    }
    
    const customizeBtn = document.getElementById('previewCustomizeBtn');
    if (isLocked) {
        customizeBtn.innerHTML = '<i class="fas fa-crown"></i> Upgrade to Use';
        customizeBtn.onclick = function() {
            closeTemplatePreview();
            showUpgradeModal(template.id);
        };
    } else {
        customizeBtn.innerHTML = '<i class="fas fa-pen"></i> Customize This Template';
        customizeBtn.onclick = function() {
            closeTemplatePreview();
            customizeTemplate(template.id);
        };
    }
    
    // Sample data for preview
    const sampleData = {
        fullName: 'Jane Doe',
        professionalTitle: 'Front-End Developer',
        email: 'jane@example.com',
        phone: '+1 234 567 890',
        location: 'San Francisco, CA',
        linkedin: 'linkedin.com/in/janedoe',
        website: 'janedoe.dev',
        summary: 'Passionate front-end developer with 5+ years of experience building responsive web applications. Strong focus on user experience and clean code.',
        skills: ['JavaScript', 'React', 'CSS', 'Git', 'TypeScript', 'TailwindCSS'],
        experience: [
            { company: 'TechCorp Inc.', position: 'Senior Front-End Developer', startDate: '2020', endDate: 'Present', description: 'Led front-end development for 3 major product lines.' },
            { company: 'Digital Solutions', position: 'Front-End Developer', startDate: '2018', endDate: '2020', description: 'Built responsive web applications using React and Redux.' }
        ],
        education: [
            { school: 'University of California', degree: 'B.S.', field: 'Computer Science', startDate: '2015', endDate: '2019', description: 'GPA: 3.8' }
        ],
        projects: [
            { name: 'E-Commerce Platform', description: 'Full-stack e-commerce platform with payment integration', technologies: 'React, Node.js, MongoDB' }
        ],
        languages: [
            { language: 'English', proficiency: 'Native' },
            { language: 'Spanish', proficiency: 'Intermediate' }
        ]
    };
    
    // Render preview directly into the modal
    const content = document.getElementById('previewModalContent');
    renderPreviewContent(content, sampleData);
    modal.classList.add('active');
    console.log('✅ Preview modal opened');
}

function renderPreviewContent(container, data) {
    // Build Education HTML
    let educationHtml = '';
    if (data.education && data.education.length > 0) {
        educationHtml = `
            <div style="margin-bottom:16px;">
                <div style="font-size:16px;font-weight:700;text-transform:uppercase;border-bottom:1px solid #ddd;padding-bottom:4px;margin-bottom:8px;">Education</div>
                ${data.education.map((edu, index) => `
                    <div style="margin-bottom:14px;padding-bottom:14px;${index < data.education.length - 1 ? 'border-bottom:1px solid #f0f0f0;' : ''}">
                        ${edu.school ? `<div style="font-weight:600;font-size:14px;">${edu.school}</div>` : ''}
                        ${edu.degree || edu.field ? `<div style="font-size:13px;color:#555;margin-top:2px;">${edu.degree || ''}${edu.degree && edu.field ? ' - ' : ''}${edu.field || ''}</div>` : ''}
                        ${edu.startDate || edu.endDate ? `<div style="font-size:12px;color:#666;margin-top:2px;">${edu.startDate || ''}${edu.startDate && edu.endDate ? ' - ' : ''}${edu.endDate || ''}</div>` : ''}
                        ${edu.description ? `<div style="font-size:13px;color:#333;margin-top:4px;">${edu.description}</div>` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    }

    // Build Experience HTML
    let experienceHtml = '';
    if (data.experience && data.experience.length > 0) {
        experienceHtml = `
            <div style="margin-bottom:16px;">
                <div style="font-size:16px;font-weight:700;text-transform:uppercase;border-bottom:1px solid #ddd;padding-bottom:4px;margin-bottom:8px;">Work Experience</div>
                ${data.experience.map((exp, index) => `
                    <div style="margin-bottom:14px;padding-bottom:14px;${index < data.experience.length - 1 ? 'border-bottom:1px solid #f0f0f0;' : ''}">
                        ${exp.company ? `<div style="font-weight:600;font-size:14px;">${exp.company}</div>` : ''}
                        ${exp.position ? `<div style="font-size:13px;color:#555;margin-top:2px;">${exp.position}</div>` : ''}
                        ${exp.startDate || exp.endDate ? `<div style="font-size:12px;color:#666;margin-top:2px;">${exp.startDate || ''}${exp.startDate && exp.endDate ? ' - ' : ''}${exp.endDate || ''}</div>` : ''}
                        ${exp.description ? `<div style="font-size:13px;color:#333;margin-top:4px;line-height:1.6;">${exp.description}</div>` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    }

    // Build Projects HTML
    let projectsHtml = '';
    if (data.projects && data.projects.length > 0) {
        projectsHtml = `
            <div style="margin-bottom:16px;">
                <div style="font-size:16px;font-weight:700;text-transform:uppercase;border-bottom:1px solid #ddd;padding-bottom:4px;margin-bottom:8px;">Projects</div>
                ${data.projects.map((proj, index) => `
                    <div style="margin-bottom:14px;padding-bottom:14px;${index < data.projects.length - 1 ? 'border-bottom:1px solid #f0f0f0;' : ''}">
                        ${proj.name ? `<div style="font-weight:600;font-size:14px;">${proj.name}</div>` : ''}
                        ${proj.description ? `<div style="font-size:13px;color:#444;margin-top:4px;">${proj.description}</div>` : ''}
                        ${proj.technologies ? `<div style="font-size:12px;color:#888;margin-top:4px;font-weight:500;">Technologies: ${proj.technologies}</div>` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    }

    // Build Skills HTML
    let skillsHtml = '';
    if (data.skills && data.skills.length > 0) {
        skillsHtml = `
            <div style="margin-bottom:16px;">
                <div style="font-size:16px;font-weight:700;text-transform:uppercase;border-bottom:1px solid #ddd;padding-bottom:4px;margin-bottom:8px;">Skills</div>
                <div style="display:flex;flex-wrap:wrap;gap:8px;">
                    ${data.skills.map(skill => `<span style="background:#f0f0f0;padding:4px 12px;border-radius:4px;font-size:13px;">${skill}</span>`).join('')}
                </div>
            </div>
        `;
    }

    // Build Languages HTML
    let languagesHtml = '';
    if (data.languages && data.languages.length > 0) {
        languagesHtml = `
            <div>
                <div style="font-size:16px;font-weight:700;text-transform:uppercase;border-bottom:1px solid #ddd;padding-bottom:4px;margin-bottom:8px;">Languages</div>
                <div style="display:flex;flex-wrap:wrap;gap:16px;font-size:13px;color:#444;">
                    ${data.languages.map(lang => `<span>${lang.language || ''}${lang.proficiency ? ' — ' + lang.proficiency : ''}</span>`).join('')}
                </div>
            </div>
        `;
    }

    container.innerHTML = `
        <div style="padding:40px;font-family:'Inter',sans-serif;max-width:100%;background:white;min-height:1123px;color:#1a1a1a;overflow:hidden;">
            <div style="text-align:center;border-bottom:3px solid #1a1a1a;padding-bottom:16px;margin-bottom:20px;">
                <div style="font-size:28px;font-weight:700;text-transform:uppercase;letter-spacing:2px;">${data.fullName}</div>
                <div style="font-size:16px;color:#555;margin-top:4px;">${data.professionalTitle}</div>
                <div style="display:flex;justify-content:center;gap:16px;font-size:12px;color:#555;margin-top:8px;flex-wrap:wrap;">
                    ${data.email ? `<span>✉️ ${data.email}</span>` : ''}
                    ${data.phone ? `<span>📱 ${data.phone}</span>` : ''}
                    ${data.location ? `<span>📍 ${data.location}</span>` : ''}
                    ${data.linkedin ? `<span>🔗 ${data.linkedin}</span>` : ''}
                    ${data.website ? `<span>🌐 ${data.website}</span>` : ''}
                </div>
            </div>
            
            ${data.summary ? `
            <div style="margin-bottom:16px;">
                <div style="font-size:16px;font-weight:700;text-transform:uppercase;border-bottom:1px solid #ddd;padding-bottom:4px;margin-bottom:8px;">Professional Summary</div>
                <div style="font-size:14px;line-height:1.8;color:#333;">${data.summary}</div>
            </div>
            ` : ''}
            
            ${experienceHtml}
            ${educationHtml}
            ${skillsHtml}
            ${projectsHtml}
            ${languagesHtml}
        </div>
    `;
}

function closeTemplatePreview() {
    const modal = document.getElementById('templatePreviewModal');
    if (modal) modal.classList.remove('active');
}

// ============================================================
// CUSTOMIZE TEMPLATE
// ============================================================
function customizeTemplate(templateId) {
    console.log('✏️ Customizing template:', templateId);
    
    if (typeof isUserLoggedIn !== 'undefined' && !isUserLoggedIn()) {
        if (typeof openLoginModal !== 'undefined') {
            openLoginModal();
        }
        return;
    }
    
    let template = null;
    
    // Try to get from cache
    const cached = localStorage.getItem(APP_CONFIG.templatesCacheKey);
    if (cached) {
        try {
            const parsed = JSON.parse(cached);
            template = parsed.find(t => t.id == templateId);
        } catch (e) {}
    }
    
    if (!template) {
        template = DEFAULT_TEMPLATES.find(t => t.id == templateId);
    }
    
    if (template && (template.plan === 'pro' || template.plan === 'premium') && typeof isProUser !== 'undefined' && !isProUser()) {
        showUpgradeModal(templateId);
        return;
    }
    
    localStorage.setItem('procv_selected_template', templateId);
    if (template) {
        localStorage.setItem('procv_template_data', JSON.stringify(template));
    }
    
    console.log('📋 Template saved, redirecting to builder...');
    window.location.href = 'builder.html';
}

// ============================================================
// GENERATE LIVE LINK
// ============================================================
function generateLiveLink(templateId) {
    const user = typeof getCurrentUser !== 'undefined' ? getCurrentUser() : null;
    if (!user) {
        showToast('Please login first', 'error');
        return;
    }
    
    let template = null;
    const cached = localStorage.getItem(APP_CONFIG.templatesCacheKey);
    if (cached) {
        try {
            const parsed = JSON.parse(cached);
            template = parsed.find(t => t.id == templateId);
        } catch (e) {}
    }
    if (!template) {
        template = DEFAULT_TEMPLATES.find(t => t.id == templateId);
    }
    
    if (!template || !template.isPortfolio) {
        showToast('Live links are only available for Portfolio templates.', 'warning');
        return;
    }
    
    if ((template.plan === 'pro' || template.plan === 'premium') && !isProUser()) {
        showUpgradeModal(templateId);
        return;
    }
    
    let cvData = {};
    const savedData = localStorage.getItem('procv_data');
    if (savedData) {
        try {
            cvData = JSON.parse(savedData);
        } catch (e) {}
    }
    
    const cvId = Date.now().toString();
    const cvRecord = {
        id: cvId,
        templateId: templateId,
        templateName: template?.name || 'Unknown Template',
        style: template?.style || 'classic',
        data: cvData,
        isPortfolio: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        liveLink: `${window.location.origin}/cv.html?userId=${user.uid}&cvId=${cvId}`
    };
    
    saveCvToUser(user.uid, cvRecord);
    showToast('✅ Portfolio CV saved!');
    showLiveLinkModalWithUrl(cvRecord.liveLink);
}

// ============================================================
// LIVE LINK MODAL
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
// UPGRADE MODAL
// ============================================================
function showUpgradeModal(templateId) {
    localStorage.setItem('procv_pending_template', templateId);
    
    if (typeof isUserLoggedIn !== 'undefined' && !isUserLoggedIn()) {
        if (typeof openLoginModal !== 'undefined') openLoginModal();
        return;
    }
    
    const modal = document.getElementById('upgradeModal');
    if (modal) {
        modal.classList.add('active');
    } else {
        window.location.href = 'pricing.html';
    }
}

function closeUpgradeModal() {
    const modal = document.getElementById('upgradeModal');
    if (modal) modal.classList.remove('active');
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
// GET ALL TEMPLATES
// ============================================================
function getAllTemplates() {
    return DEFAULT_TEMPLATES;
}

// ============================================================
// USER CVs STORAGE FUNCTIONS
// ============================================================
function getUserCvs(userId) {
    const key = `procv_user_cvs_${userId}`;
    const data = localStorage.getItem(key);
    if (data) {
        try {
            return JSON.parse(data);
        } catch (e) {
            return [];
        }
    }
    return [];
}

function saveCvToUser(userId, cvData) {
    const cvs = getUserCvs(userId);
    cvData.id = cvData.id || Date.now().toString();
    cvData.createdAt = cvData.createdAt || new Date().toISOString();
    cvData.updatedAt = new Date().toISOString();
    
    const existingIndex = cvs.findIndex(c => c.id === cvData.id);
    if (existingIndex !== -1) {
        cvs[existingIndex] = cvData;
    } else {
        cvs.push(cvData);
    }
    
    const key = `procv_user_cvs_${userId}`;
    localStorage.setItem(key, JSON.stringify(cvs));
    return cvData;
}

// ============================================================
// INIT - LOAD TEMPLATES ON PAGE LOAD
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 Page loaded, loading templates...');
    // Small delay to ensure Firebase is ready
    setTimeout(function() {
        loadTemplates();
    }, 300);
});

// ============================================================
// EXPOSE GLOBALLY
// ============================================================
window.renderCV = renderCV;
window.loadTemplates = loadTemplates;
window.loadTemplatesFromFirestore = loadTemplatesFromFirestore;
window.getAllTemplates = getAllTemplates;
window.previewTemplate = previewTemplate;
window.closeTemplatePreview = closeTemplatePreview;
window.customizeTemplate = customizeTemplate;
window.generateLiveLink = generateLiveLink;
window.showLiveLinkModalWithUrl = showLiveLinkModalWithUrl;
window.closeLiveLinkModal = closeLiveLinkModal;
window.copyLiveLink = copyLiveLink;
window.openLiveLink = openLiveLink;
window.showUpgradeModal = showUpgradeModal;
window.closeUpgradeModal = closeUpgradeModal;
window.showToast = showToast;
window.getUserCvs = getUserCvs;
window.saveCvToUser = saveCvToUser;

console.log('✅ templates.js loaded');