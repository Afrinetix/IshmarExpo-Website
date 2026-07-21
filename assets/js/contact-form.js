/**
 * Wires the contact form on contact.html to insert into the
 * `contact_messages` table (public INSERT-only per policies.sql). The form
 * has no `company`/`event` columns to map to in the schema, so both are
 * folded into the stored message body rather than silently dropped.
 */
import { submitContactMessage } from '../../supabase/messages.js';

const SUBJECT_LABELS = {
  general: 'General Information',
  exhibitor: 'Exhibitor Booth Inquiry',
  halal: 'Halal Certification Support',
  empowerment: 'Empowerment Programs (Youth/Women)',
  registration: 'Event Registration',
  speaker: 'Speaker / Panelist Invitation',
  partnership: 'Government / NGO Partnership',
  investor: 'Investor & Mentor Interest',
  other: 'Other',
};

function init() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorBox = document.getElementById('contact-form-error');
    const submitBtn = document.getElementById('contact-form-submit');
    errorBox.style.display = 'none';

    if (!document.getElementById('consent').checked) {
      errorBox.textContent = 'Please confirm you agree to be contacted before sending.';
      errorBox.style.display = 'block';
      return;
    }

    submitBtn.disabled = true;
    try {
      const firstName = document.getElementById('first-name').value.trim();
      const lastName = document.getElementById('last-name').value.trim();
      const company = document.getElementById('company').value.trim();
      const subjectValue = document.getElementById('subject').value;
      const eventValue = document.getElementById('event').value;
      const messageText = document.getElementById('message').value.trim();

      const extraLines = [];
      if (company) extraLines.push(`Company/Organization: ${company}`);
      if (eventValue) extraLines.push(`Interested Event: ${eventValue}`);
      const fullMessage = extraLines.length ? `${messageText}\n\n${extraLines.join('\n')}` : messageText;

      await submitContactMessage({
        full_name: `${firstName} ${lastName}`.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim() || null,
        subject: SUBJECT_LABELS[subjectValue] || subjectValue || null,
        message: fullMessage,
      });

      form.style.display = 'none';
      document.getElementById('contact-form-success').style.display = 'block';
    } catch (err) {
      console.error('[contact-form] Submission failed:', err);
      errorBox.textContent = 'Something went wrong sending your message. Please try again, or reach us directly on WhatsApp.';
      errorBox.style.display = 'block';
    } finally {
      submitBtn.disabled = false;
    }
  });
}

init();
