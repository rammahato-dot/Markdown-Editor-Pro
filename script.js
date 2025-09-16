// DOM Elements
const editor = document.getElementById('editor');
const preview = document.getElementById('preview');
const themeSelect = document.getElementById('theme-select');
const fontSizeSelect = document.getElementById('font-size');
const exportBtn = document.getElementById('export-btn');
const openBtn = document.getElementById('open-btn');
const saveBtn = document.getElementById('save-btn');
const codeViewBtn = document.getElementById('code-view-btn');
const charCount = document.getElementById('char-count');
const wordCount = document.getElementById('word-count');

// State management
let currentText = '';
let isCodeView = false;

// Initialize from localStorage
const savedTheme = localStorage.getItem('theme') || 'light';
const savedFontSize = localStorage.getItem('fontSize') || '16px';
document.body.classList.add(savedTheme + '-mode');
document.documentElement.style.setProperty('--font-size', savedFontSize);
themeSelect.value = savedTheme;
fontSizeSelect.value = savedFontSize;

// Event Listeners
themeSelect.addEventListener('change', () => {
    document.body.className = '';
    document.body.classList.add(themeSelect.value + '-mode');
    localStorage.setItem('theme', themeSelect.value);
});

fontSizeSelect.addEventListener('change', () => {
    document.documentElement.style.setProperty('--font-size', fontSizeSelect.value);
    localStorage.setItem('fontSize', fontSizeSelect.value);
    renderMarkdown();
});

exportBtn.addEventListener('click', exportToHTML);
openBtn.addEventListener('click', openFile);
saveBtn.addEventListener('click', saveFile);
codeViewBtn.addEventListener('click', toggleCodeView);
editor.addEventListener('input', updateStatus);
editor.addEventListener('input', renderMarkdown);

// Initialize
renderMarkdown();
updateStatus();

// Markdown Rendering
function renderMarkdown() {
    currentText = editor.value;
    
    if (isCodeView) {
        preview.innerHTML = `<pre><code class="language-markdown">${escapeHtml(currentText)}</code></pre>`;
        Prism.highlightAll();
        return;
    }

    const html = marked.parse(currentText);
    preview.innerHTML = html;
    Prism.highlightAll();
}

// Code View Toggle
function toggleCodeView() {
    isCodeView = !isCodeView;
    codeViewBtn.textContent = isCodeView ? 'Preview View' : 'Code View';
    renderMarkdown();
}

// File Operations
function openFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.md,.txt';
    
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            editor.value = e.target.result;
            currentText = editor.value;
            renderMarkdown();
            updateStatus();
        };
        reader.readAsText(file);
    };
    
    input.click();
}

function saveFile() {
    const blob = new Blob([currentText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function exportToHTML() {
    const htmlContent = preview.innerHTML;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'preview.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Status Update
function updateStatus() {
    const text = editor.value;
    charCount.textContent = `${text.length} characters`;
    wordCount.textContent = `${text.trim() ? text.trim().split(/\s+/).length : 0} words`;
}

// Helper Function
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}