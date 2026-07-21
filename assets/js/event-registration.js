/**
 * In-page event registration modal used by events.html for any event that
 * doesn't have an external registration_link (see dynamic-events.js, which
 * renders a `[data-register-event]` trigger button instead of a plain link
 * in that case). Injects the modal markup itself so events.html doesn't
 * need to hand-author it, and re-binds trigger clicks every time the events
 * grid re-renders by listening for the `ishmar:events-rendered` event that
 * dynamic-events.js already dispatches.
 */
import { submitRegistration } from '../../supabase/registrations.js';

const MODAL_HTML = `
  <div class="reg-modal-overlay" id="reg-modal-overlay">
    <div class="reg-modal">
      <button type="button" class="reg-modal-close" id="reg-modal-close" aria-label="Close">
        <i class="fas fa-times"></i>
      </button>
      <div class="section-label">Event Registration</div>
      <h3 id="reg-modal-event-title" style="font-family:var(--font-display); font-size:24px; font-weight:700; color:var(--ink); margin-bottom:20px;"></h3>

      <form id="reg-modal-form" novalidate>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="reg-name">Full Name *</label>
            <input type="text" id="reg-name" name="full_name" class="form-control" required />
          </div>
          <div class="form-group">
            <label class="form-label" for="reg-email">Email Address *</label>
            <input type="email" id="reg-email" name="email" class="form-control" required />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="reg-phone">Phone Number</label>
            <input type="tel" id="reg-phone" name="phone" class="form-control" placeholder="+254 700 000 000" />
          </div>
          <div class="form-group">
            <label class="form-label" for="reg-country">Country</label>
            <input type="text" id="reg-country" name="country" class="form-control" placeholder="Kenya" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="reg-company">Company / Organization</label>
            <input type="text" id="reg-company" name="company" class="form-control" />
          </div>
          <div class="form-group">
            <label class="form-label" for="reg-position">Position</label>
            <input type="text" id="reg-position" name="position" class="form-control" />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label" for="reg-ticket">Ticket Type</label>
          <select id="reg-ticket" name="ticket_type" class="form-control form-select">
            <option value="Visitor">Visitor</option>
            <option value="Exhibitor">Exhibitor</option>
            <option value="Sponsor">Sponsor</option>
            <option value="Media/Press">Media / Press</option>
          </select>
        </div>
        <div id="reg-modal-error" style="display:none; color:#E5484D; font-size:13px; margin-bottom:16px;"></div>
        <button type="submit" class="btn btn-primary" id="reg-modal-submit" style="width:100%; justify-content:center; padding:18px;">
          <i class="fas fa-paper-plane"></i> Complete Registration
        </button>
      </form>

      <div id="reg-modal-success" style="display:none; text-align:center; padding:20px 0;">
        <i class="fas fa-circle-check" style="font-size:40px; color:var(--gold); margin-bottom:16px; display:block;"></i>
        <h3 style="font-family:var(--font-display); font-size:22px; font-weight:700; color:var(--ink); margin-bottom:10px;">You're Registered!</h3>
        <p style="color:var(--gray); font-size:14px; line-height:1.7;">Thank you for registering. Our team will be in touch with further details ahead of the event.</p>
      </div>
    </div>
  </div>`;

const MODAL_STYLES = `
  .reg-modal-overlay {
    position: fixed; inset: 0; z-index: 9500;
    background: rgba(16,19,31,0.55); backdrop-filter: blur(6px);
    display: flex; align-items: center; justify-content: center;
    padding: 24px; opacity: 0; visibility: hidden; transition: opacity 0.3s, visibility 0.3s;
  }
  .reg-modal-overlay.open { opacity: 1; visibility: visible; }
  .reg-modal {
    position: relative; width: min(560px, 100%); max-height: 90vh; overflow-y: auto;
    background: var(--white); border-radius: var(--radius-lg); padding: 40px;
    box-shadow: var(--shadow-deep); transform: translateY(20px); transition: transform 0.3s;
  }
  .reg-modal-overlay.open .reg-modal { transform: translateY(0); }
  .reg-modal-close {
    position: absolute; top: 16px; right: 16px; width: 36px; height: 36px;
    border-radius: 50%; border: 1px solid var(--border); background: var(--secondary);
    color: var(--gray); font-size: 14px; cursor: pointer; transition: all 0.2s;
  }
  .reg-modal-close:hover { background: var(--gold); color: var(--white); border-color: var(--gold); }
  @media (max-width: 600px) { .reg-modal { padding: 28px 20px; } }`;

let currentEventId = null;

function injectModal() {
  if (document.getElementById('reg-modal-overlay')) return;
  const styleTag = document.createElement('style');
  styleTag.textContent = MODAL_STYLES;
  document.head.appendChild(styleTag);
  document.body.insertAdjacentHTML('beforeend', MODAL_HTML);

  const overlay = document.getElementById('reg-modal-overlay');
  document.getElementById('reg-modal-close').addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
  document.getElementById('reg-modal-form').addEventListener('submit', handleSubmit);
}

function openModal(eventId, eventTitle) {
  currentEventId = eventId;
  document.getElementById('reg-modal-event-title').textContent = eventTitle;
  document.getElementById('reg-modal-form').reset();
  document.getElementById('reg-modal-form').style.display = 'block';
  document.getElementById('reg-modal-success').style.display = 'none';
  document.getElementById('reg-modal-error').style.display = 'none';
  document.getElementById('reg-modal-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('reg-modal-overlay')?.classList.remove('open');
  document.body.style.overflow = '';
}

async function handleSubmit(e) {
  e.preventDefault();
  const submitBtn = document.getElementById('reg-modal-submit');
  const errorBox = document.getElementById('reg-modal-error');
  errorBox.style.display = 'none';
  submitBtn.disabled = true;

  try {
    await submitRegistration({
      full_name: document.getElementById('reg-name').value.trim(),
      email: document.getElementById('reg-email').value.trim(),
      phone: document.getElementById('reg-phone').value.trim() || null,
      country: document.getElementById('reg-country').value.trim() || null,
      company: document.getElementById('reg-company').value.trim() || null,
      position: document.getElementById('reg-position').value.trim() || null,
      ticket_type: document.getElementById('reg-ticket').value,
      event_id: currentEventId,
    });
    document.getElementById('reg-modal-form').style.display = 'none';
    document.getElementById('reg-modal-success').style.display = 'block';
  } catch (err) {
    console.error('[event-registration] Submission failed:', err);
    errorBox.textContent = 'Something went wrong sending your registration. Please try again, or reach us directly on WhatsApp.';
    errorBox.style.display = 'block';
  } finally {
    submitBtn.disabled = false;
  }
}

function bindTriggers() {
  document.querySelectorAll('[data-register-event]').forEach((btn) => {
    if (btn.dataset.regBound) return; // avoid double-binding on repeated ishmar:events-rendered firings
    btn.dataset.regBound = '1';
    btn.addEventListener('click', () => openModal(btn.dataset.registerEvent, btn.dataset.registerTitle || 'this event'));
  });
}

injectModal();
bindTriggers();
window.addEventListener('ishmar:events-rendered', bindTriggers);
