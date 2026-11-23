/**
 * Modern Dynamic Toast, Confirmation, & Prompt Dialog Alert System
 * Replaces ugly browser alerts, confirms, and prompts with
 * elegant, institutional academic palette cards (#26648E, #4F8FC0, #53D2DC, #FFE3B3).
 */
class NotificationSystem {
  constructor() {
    this.toastContainer = null;
    this.modalOverlay = null;
    this.init();
  }

  init() {
    // 1. Toast Notification Container (Top-right)
    if (!document.getElementById('toast-notification-container')) {
      this.toastContainer = document.createElement('div');
      this.toastContainer.id = 'toast-notification-container';
      this.toastContainer.className = 'fixed top-4 right-4 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-3';
      document.body.appendChild(this.toastContainer);
    } else {
      this.toastContainer = document.getElementById('toast-notification-container');
    }

    // 2. Universal Modal Overlay Container
    if (!document.getElementById('dynamic-modal-overlay')) {
      this.modalOverlay = document.createElement('div');
      this.modalOverlay.id = 'dynamic-modal-overlay';
      this.modalOverlay.className = 'fixed inset-0 z-[10000] hidden items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 transition-all duration-200';
      document.body.appendChild(this.modalOverlay);
    } else {
      this.modalOverlay = document.getElementById('dynamic-modal-overlay');
    }

    // Modern bridge for legacy alert
    const self = this;
    window._nativeAlert = window.alert;
    window.alert = function(msg) {
      if (typeof msg === 'string' && (msg.includes('\n') || msg.length > 80)) {
        self.showModal(msg);
      } else {
        self.showToast(msg, 'info');
      }
    };
  }

  /**
   * Display a modern sliding toast notification
   */
  showToast(message, type = 'success', duration = 3500, title = '') {
    if (!this.toastContainer) this.init();

    const config = {
      success: {
        title: title || 'Success',
        iconName: 'check-circle-2',
        barColor: 'bg-[#26648E]',
        borderColor: 'border-[#4F8FC0]/35',
        iconBg: 'bg-[#53D2DC]/20',
        iconColor: 'text-[#26648E]',
        titleColor: 'text-[#26648E]'
      },
      error: {
        title: title || 'Notice',
        iconName: 'alert-circle',
        barColor: 'bg-rose-600',
        borderColor: 'border-rose-200',
        iconBg: 'bg-rose-50',
        iconColor: 'text-rose-600',
        titleColor: 'text-rose-900'
      },
      warning: {
        title: title || 'Warning',
        iconName: 'alert-triangle',
        barColor: 'bg-amber-500',
        borderColor: 'border-[#fedba0]',
        iconBg: 'bg-[#FFE3B3]',
        iconColor: 'text-[#26648E]',
        titleColor: 'text-[#26648E]'
      },
      info: {
        title: title || 'Information',
        iconName: 'info',
        barColor: 'bg-[#4F8FC0]',
        borderColor: 'border-[#4F8FC0]/30',
        iconBg: 'bg-[#4F8FC0]/15',
        iconColor: 'text-[#26648E]',
        titleColor: 'text-[#26648E]'
      }
    }[type] || {
      title: title || 'Notification',
      iconName: 'bell',
      barColor: 'bg-[#26648E]',
      borderColor: 'border-slate-200',
      iconBg: 'bg-slate-100',
      iconColor: 'text-slate-700',
      titleColor: 'text-slate-900'
    };

    const toast = document.createElement('div');
    toast.className = `toast-item pointer-events-auto transform transition-all duration-300 ease-out translate-x-full opacity-0 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border ${config.borderColor} flex items-start gap-3 relative overflow-hidden group`;
    
    toast.innerHTML = `
      <div class="absolute left-0 top-0 bottom-0 w-1.5 ${config.barColor}"></div>
      <div class="w-9 h-9 rounded-xl ${config.iconBg} ${config.iconColor} flex items-center justify-center shrink-0 shadow-2xs">
        <i data-lucide="${config.iconName}" class="w-5 h-5"></i>
      </div>
      <div class="flex-1 min-w-0 pr-5">
        <h4 class="text-xs font-black tracking-tight ${config.titleColor}">${config.title}</h4>
        <p class="text-xs text-slate-700 font-medium leading-relaxed mt-0.5 break-words">${message}</p>
      </div>
      <button type="button" class="toast-close-btn absolute top-3 right-3 text-slate-400 hover:text-slate-700 p-1 rounded-lg transition cursor-pointer" title="Dismiss">
        <i data-lucide="x" class="w-3.5 h-3.5"></i>
      </button>
      <div class="absolute bottom-0 left-0 h-0.5 ${config.barColor}" style="animation: toastProgress ${duration}ms linear forwards; width: 100%;"></div>
    `;

    this.toastContainer.appendChild(toast);

    if (window.lucide) {
      lucide.createIcons({ root: toast });
    }

    requestAnimationFrame(() => {
      toast.classList.remove('translate-x-full', 'opacity-0');
      toast.classList.add('translate-x-0', 'opacity-100');
    });

    const dismiss = () => {
      toast.classList.remove('translate-x-0', 'opacity-100');
      toast.classList.add('translate-x-full', 'opacity-0');
      setTimeout(() => {
        if (toast.parentElement) toast.remove();
      }, 300);
    };

    toast.querySelector('.toast-close-btn').addEventListener('click', dismiss);

    if (duration > 0) {
      setTimeout(dismiss, duration);
    }
  }

  /**
   * Display a modern Confirmation Dialog Modal (Promise-based)
   * Replaces native window.confirm()
   * @param {string} message - Description message
   * @param {string} title - Heading title
   * @param {object} options - Options { confirmText, cancelText, type: 'danger'|'warning'|'info' }
   * @returns {Promise<boolean>}
   */
  confirm(message, title = 'Confirm Action', options = {}) {
    if (!this.modalOverlay) this.init();

    const {
      confirmText = 'Confirm',
      cancelText = 'Cancel',
      type = 'danger'
    } = options;

    return new Promise(resolve => {
      const typeConfig = {
        danger: {
          icon: 'trash-2',
          iconBg: 'bg-rose-50',
          iconBorder: 'border-rose-200',
          iconColor: 'text-rose-600',
          confirmBtn: 'bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/25 ring-2 ring-rose-400/30'
        },
        warning: {
          icon: 'alert-triangle',
          iconBg: 'bg-[#FFE3B3]',
          iconBorder: 'border-[#fedba0]',
          iconColor: 'text-[#26648E]',
          confirmBtn: 'bg-[#26648E] hover:bg-[#1b4b6d] text-white shadow-md shadow-[#26648E]/25 ring-2 ring-[#53D2DC]/50'
        },
        info: {
          icon: 'help-circle',
          iconBg: 'bg-[#53D2DC]/20',
          iconBorder: 'border-[#53D2DC]/40',
          iconColor: 'text-[#26648E]',
          confirmBtn: 'bg-[#26648E] hover:bg-[#1b4b6d] text-white shadow-md shadow-[#26648E]/25 ring-2 ring-[#53D2DC]/50'
        }
      }[type] || typeConfig.danger;

      this.modalOverlay.innerHTML = `
        <div class="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-fadeIn p-6 space-y-4">
          <div class="flex items-center gap-3.5">
            <div class="w-12 h-12 rounded-2xl ${typeConfig.iconBg} ${typeConfig.iconColor} border ${typeConfig.iconBorder} flex items-center justify-center shrink-0 shadow-2xs">
              <i data-lucide="${typeConfig.icon}" class="w-6 h-6"></i>
            </div>
            <div>
              <h3 class="text-base font-black text-slate-900 tracking-tight leading-snug">${title}</h3>
              <span class="text-[10px] font-extrabold uppercase tracking-wider text-[#4F8FC0]">Institutional Confirmation</span>
            </div>
          </div>

          <div class="text-xs text-slate-700 font-medium leading-relaxed bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 whitespace-pre-line">
            ${message}
          </div>

          <div class="flex items-center justify-end gap-2.5 pt-1">
            <button type="button" id="dialog-btn-cancel" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer">
              ${cancelText}
            </button>
            <button type="button" id="dialog-btn-confirm" class="px-5 py-2 ${typeConfig.confirmBtn} font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5">
              <span>${confirmText}</span>
            </button>
          </div>
        </div>
      `;

      this.modalOverlay.classList.remove('hidden');
      this.modalOverlay.classList.add('flex');

      if (window.lucide) {
        lucide.createIcons({ root: this.modalOverlay });
      }

      const close = (result) => {
        this.modalOverlay.classList.add('hidden');
        this.modalOverlay.classList.remove('flex');
        resolve(result);
      };

      document.getElementById('dialog-btn-cancel').onclick = () => close(false);
      document.getElementById('dialog-btn-confirm').onclick = () => close(true);
    });
  }

  /**
   * Display a modern Input Prompt Dialog Modal (Promise-based)
   * Replaces native window.prompt()
   * @param {string} message - Prompt label/question
   * @param {string} defaultValue - Initial text value
   * @param {string} title - Heading title
   * @param {object} options - Options { placeholder, inputType, confirmText, cancelText }
   * @returns {Promise<string|null>}
   */
  prompt(message, defaultValue = '', title = 'Input Required', options = {}) {
    if (!this.modalOverlay) this.init();

    const {
      placeholder = 'Enter value...',
      inputType = 'text',
      confirmText = 'Submit',
      cancelText = 'Cancel'
    } = options;

    return new Promise(resolve => {
      this.modalOverlay.innerHTML = `
        <div class="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-fadeIn p-6 space-y-4">
          <div class="flex items-center gap-3.5">
            <div class="w-12 h-12 rounded-2xl bg-gradient-to-b from-[#f0f6fa] via-white to-[#FFE3B3]/25 border border-[#4F8FC0]/30 text-[#26648E] flex items-center justify-center shrink-0 shadow-2xs">
              <i data-lucide="${inputType === 'password' ? 'key-round' : 'edit-3'}" class="w-6 h-6"></i>
            </div>
            <div>
              <h3 class="text-base font-black text-[#26648E] tracking-tight leading-snug">${title}</h3>
              <span class="text-[10px] font-extrabold uppercase tracking-wider text-[#4F8FC0]">Departmental Action</span>
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-2">${message}</label>
            <input 
              id="dialog-prompt-input" 
              type="${inputType}" 
              value="${defaultValue || ''}" 
              placeholder="${placeholder}"
              class="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#4F8FC0] focus:border-[#26648E] outline-none font-medium text-slate-800 bg-white"
            />
          </div>

          <div class="flex items-center justify-end gap-2.5 pt-1">
            <button type="button" id="prompt-btn-cancel" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer">
              ${cancelText}
            </button>
            <button type="button" id="prompt-btn-confirm" class="px-5 py-2 bg-[#26648E] hover:bg-[#1b4b6d] text-white font-bold rounded-xl text-xs shadow-md shadow-[#26648E]/25 ring-2 ring-[#53D2DC]/50 transition cursor-pointer">
              ${confirmText}
            </button>
          </div>
        </div>
      `;

      this.modalOverlay.classList.remove('hidden');
      this.modalOverlay.classList.add('flex');

      if (window.lucide) {
        lucide.createIcons({ root: this.modalOverlay });
      }

      const input = document.getElementById('dialog-prompt-input');
      input.focus();
      input.select();

      const close = (result) => {
        this.modalOverlay.classList.add('hidden');
        this.modalOverlay.classList.remove('flex');
        resolve(result);
      };

      input.onkeydown = (e) => {
        if (e.key === 'Enter') {
          close(input.value);
        } else if (e.key === 'Escape') {
          close(null);
        }
      };

      document.getElementById('prompt-btn-cancel').onclick = () => close(null);
      document.getElementById('prompt-btn-confirm').onclick = () => close(input.value);
    });
  }

  /**
   * Display a modern centered pop-up modal alert (informative)
   */
  showModal(message, title = 'Audit Notification', type = 'info', onConfirm = null) {
    if (!this.modalOverlay) this.init();

    const icons = {
      success: { icon: 'check-circle-2', bg: 'bg-[#53D2DC]/20', border: 'border-[#53D2DC]/40', color: 'text-[#26648E]' },
      error: { icon: 'alert-circle', bg: 'bg-rose-50', border: 'border-rose-200', color: 'text-rose-600' },
      warning: { icon: 'alert-triangle', bg: 'bg-[#FFE3B3]', border: 'border-[#fedba0]', color: 'text-[#26648E]' },
      info: { icon: 'info', bg: 'bg-[#4F8FC0]/15', border: 'border-[#4F8FC0]/30', color: 'text-[#26648E]' }
    }[type] || { icon: 'bell', bg: 'bg-blue-50', border: 'border-blue-200', color: 'text-[#26648E]' };

    this.modalOverlay.innerHTML = `
      <div class="bg-white rounded-3xl shadow-2xl border border-[#4F8FC0]/30 max-w-md w-full overflow-hidden animate-fadeIn p-6 space-y-4">
        <div class="flex items-center gap-3.5">
          <div class="w-12 h-12 rounded-2xl ${icons.bg} ${icons.color} border ${icons.border} flex items-center justify-center shrink-0 shadow-sm">
            <i data-lucide="${icons.icon}" class="w-6 h-6"></i>
          </div>
          <div>
            <h3 class="text-base font-black text-[#26648E] tracking-tight leading-snug">${title || 'Notice'}</h3>
            <span class="text-[10px] font-extrabold uppercase tracking-wider text-[#4F8FC0]">IQAC Portal Alert</span>
          </div>
        </div>

        <div class="text-xs text-slate-700 font-medium leading-relaxed bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80 whitespace-pre-line max-h-60 overflow-y-auto">
          ${message}
        </div>

        <div class="flex items-center justify-end gap-2 pt-1">
          ${onConfirm ? `
            <button type="button" id="modal-btn-cancel" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer">
              Cancel
            </button>
          ` : ''}
          <button type="button" id="modal-btn-confirm" class="px-5 py-2 bg-[#26648E] hover:bg-[#1b4b6d] text-white font-bold rounded-xl text-xs shadow-md shadow-[#26648E]/25 ring-2 ring-[#53D2DC]/50 transition cursor-pointer">
            ${onConfirm ? 'Confirm' : 'Got It'}
          </button>
        </div>
      </div>
    `;

    this.modalOverlay.classList.remove('hidden');
    this.modalOverlay.classList.add('flex');

    if (window.lucide) {
      lucide.createIcons({ root: this.modalOverlay });
    }

    const close = () => {
      this.modalOverlay.classList.add('hidden');
      this.modalOverlay.classList.remove('flex');
    };

    const confirmBtn = document.getElementById('modal-btn-confirm');
    if (confirmBtn) {
      confirmBtn.onclick = () => {
        close();
        if (typeof onConfirm === 'function') onConfirm();
      };
    }

    const cancelBtn = document.getElementById('modal-btn-cancel');
    if (cancelBtn) {
      cancelBtn.onclick = close;
    }
  }
}

// Global singleton instances
window.notificationSystem = new NotificationSystem();

// Shorthands
window.showToast = function(msg, type = 'success', duration = 3500, title = '') {
  window.notificationSystem.showToast(msg, type, duration, title);
};

window.showModalAlert = function(msg, title = 'Notice', type = 'info', onConfirm = null) {
  window.notificationSystem.showModal(msg, title, type, onConfirm);
};

window.showConfirmDialog = function(message, title = 'Confirm Action', options = {}) {
  return window.notificationSystem.confirm(message, title, options);
};

window.showPromptDialog = function(message, defaultValue = '', title = 'Input Required', options = {}) {
  return window.notificationSystem.prompt(message, defaultValue, title, options);
};
