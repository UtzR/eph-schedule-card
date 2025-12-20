// EPH Schedule Card - Vanilla JS version (no external dependencies)
class EphScheduleCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._selectedDay = null;
  }

  static getConfigElement() {
    return document.createElement('eph-schedule-card-editor');
  }

  static getStubConfig() {
    return {
      entity: '',
      title: 'EPH Schedule',
      show_header: true,
    };
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error('You need to define an entity');
    }
    this._config = config;
    // Default to current day
    if (!this._selectedDay) {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const today = new Date().getDay();
      this._selectedDay = days[today];
    }
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  _getSchedule() {
    if (!this._hass || !this._config || !this._config.entity) {
      return null;
    }
    const state = this._hass.states[this._config.entity];
    if (!state) {
      return null;
    }
    return state.attributes.schedule || null;
  }

  _getDaySchedule(dayName) {
    const schedule = this._getSchedule();
    if (!schedule || !schedule[dayName]) {
      return null;
    }
    return schedule[dayName];
  }

  _parseTimeRange(timeStr) {
    if (!timeStr || timeStr === 'null') {
      return { start: null, end: null };
    }
    const parts = timeStr.split('-');
    if (parts.length !== 2) {
      return { start: null, end: null };
    }
    return {
      start: parts[0].trim(),
      end: parts[1].trim(),
    };
  }

  _handleDayChange(event) {
    this._selectedDay = event.target.value;
    this._updateScheduleGrid();
  }

  _updateScheduleGrid() {
    // Only update the schedule grid, don't recreate the entire card
    const scheduleContainer = this.shadowRoot.querySelector('.schedule-container');
    if (!scheduleContainer) {
      // If container doesn't exist, fall back to full render
      this._render();
      return;
    }

    const daySchedule = this._getDaySchedule(this._selectedDay);
    
    let gridContent = '';
    if (!daySchedule) {
      gridContent = '<div class="error-message">No schedule data available for selected day.</div>';
    } else {
      const periods = ['p1', 'p2', 'p3'];
      const periodLabels = ['P1', 'P2', 'P3'];
      
      let rows = '';
      periods.forEach((period, index) => {
        const timeRange = daySchedule[period];
        const parsed = this._parseTimeRange(timeRange);
        const isDisabled = !timeRange || timeRange === 'null' || parsed.start === null;
        
        rows += `
          <tr class="${isDisabled ? 'disabled' : ''}">
            <td class="period-label">${periodLabels[index]}</td>
            <td class="time-cell">${isDisabled ? '—' : parsed.start}</td>
            <td class="time-cell">${isDisabled ? '—' : parsed.end}</td>
          </tr>
        `;
      });

      gridContent = `
        <table class="schedule-grid">
          <thead>
            <tr>
              <th>Period</th>
              <th class="time-header">Start Time</th>
              <th class="time-header">End Time</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      `;
    }

    scheduleContainer.innerHTML = gridContent;
  }

  _render() {
    if (!this._config || !this.shadowRoot) return;

    const styles = `
      <style>
        :host {
          display: block;
        }
        ha-card {
          padding: 0;
        }
        .card-header {
          padding: 16px;
          font-size: 18px;
          font-weight: 500;
          border-bottom: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
        }
        .card-content {
          padding: 16px;
        }
        .card-content.error {
          text-align: center;
          padding: 24px;
        }
        .error-message {
          color: var(--error-color, #db4437);
          font-size: 14px;
        }
        .day-selector-container {
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .day-selector-container label {
          font-size: 14px;
          font-weight: 500;
          color: var(--primary-text-color, rgba(0, 0, 0, 0.87));
        }
        .day-selector {
          flex: 1;
          max-width: 200px;
          padding: 8px 12px;
          border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
          border-radius: 4px;
          background-color: var(--card-background-color, #fff);
          color: var(--primary-text-color, rgba(0, 0, 0, 0.87));
          font-size: 14px;
          cursor: pointer;
        }
        .day-selector:hover {
          border-color: var(--primary-color, #03a9f4);
        }
        .day-selector:focus {
          outline: none;
          border-color: var(--primary-color, #03a9f4);
          box-shadow: 0 0 0 2px rgba(3, 169, 244, 0.2);
        }
        .schedule-container {
          margin-top: 16px;
        }
        .schedule-grid {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
        }
        .schedule-grid thead {
          background-color: var(--primary-color, #03a9f4);
          color: var(--text-primary-color, #fff);
        }
        .schedule-grid th {
          padding: 12px;
          text-align: left;
          font-weight: 500;
        }
        .schedule-grid th.time-header {
          text-align: center;
        }
        .schedule-grid tbody tr {
          border-bottom: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
        }
        .schedule-grid tbody tr:last-child {
          border-bottom: none;
        }
        .schedule-grid tbody tr:hover {
          background-color: var(--table-row-background-color, rgba(0, 0, 0, 0.02));
        }
        .schedule-grid tbody tr.disabled {
          opacity: 0.5;
        }
        .schedule-grid td {
          padding: 12px;
          color: var(--primary-text-color, rgba(0, 0, 0, 0.87));
        }
        .schedule-grid .period-label {
          font-weight: 500;
          width: 60px;
        }
        .schedule-grid .time-cell {
          font-family: 'Courier New', monospace;
          text-align: center;
        }
        @media (max-width: 600px) {
          .day-selector-container {
            flex-direction: column;
            align-items: stretch;
          }
          .day-selector {
            max-width: 100%;
          }
          .schedule-grid {
            font-size: 12px;
          }
          .schedule-grid th,
          .schedule-grid td {
            padding: 8px;
          }
        }
      </style>
    `;

    // Check if entity is configured
    if (!this._config.entity) {
      this.shadowRoot.innerHTML = `
        ${styles}
        <ha-card>
          <div class="card-content error">
            <div class="error-message">Invalid configuration: entity is required</div>
          </div>
        </ha-card>
      `;
      return;
    }

    // Check if hass is available and entity exists
    if (!this._hass) {
      this.shadowRoot.innerHTML = `
        ${styles}
        <ha-card>
          <div class="card-content error">
            <div class="error-message">Loading...</div>
          </div>
        </ha-card>
      `;
      return;
    }

    const state = this._hass.states[this._config.entity];
    if (!state) {
      this.shadowRoot.innerHTML = `
        ${styles}
        <ha-card>
          <div class="card-content error">
            <div class="error-message">Entity ${this._config.entity} not found</div>
          </div>
        </ha-card>
      `;
      return;
    }

    const schedule = this._getSchedule();
    const title = this._config.title || 'EPH Schedule';
    const showHeader = this._config.show_header !== false;

    // If no schedule attribute
    if (!schedule) {
      this.shadowRoot.innerHTML = `
        ${styles}
        <ha-card>
          ${showHeader ? `<div class="card-header">${title}</div>` : ''}
          <div class="card-content error">
            <div class="error-message">No schedule attribute found for ${this._config.entity}</div>
          </div>
        </ha-card>
      `;
      return;
    }

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const daySchedule = this._getDaySchedule(this._selectedDay);

    // Build day options
    const dayOptions = days.map(day => 
      `<option value="${day}" ${day === this._selectedDay ? 'selected' : ''}>${day}</option>`
    ).join('');

    // Build schedule grid
    let gridContent = '';
    if (!daySchedule) {
      gridContent = '<div class="error-message">No schedule data available for selected day.</div>';
    } else {
      const periods = ['p1', 'p2', 'p3'];
      const periodLabels = ['P1', 'P2', 'P3'];
      
      let rows = '';
      periods.forEach((period, index) => {
        const timeRange = daySchedule[period];
        const parsed = this._parseTimeRange(timeRange);
        const isDisabled = !timeRange || timeRange === 'null' || parsed.start === null;
        
        rows += `
          <tr class="${isDisabled ? 'disabled' : ''}">
            <td class="period-label">${periodLabels[index]}</td>
            <td class="time-cell">${isDisabled ? '—' : parsed.start}</td>
            <td class="time-cell">${isDisabled ? '—' : parsed.end}</td>
          </tr>
        `;
      });

      gridContent = `
        <table class="schedule-grid">
          <thead>
            <tr>
              <th>Period</th>
              <th class="time-header">Start Time</th>
              <th class="time-header">End Time</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      `;
    }

    this.shadowRoot.innerHTML = `
      ${styles}
      <ha-card>
        ${showHeader ? `<div class="card-header">${title}</div>` : ''}
        <div class="card-content">
          <div class="day-selector-container">
            <label for="day-selector">Select Day:</label>
            <select id="day-selector" class="day-selector">
              ${dayOptions}
            </select>
          </div>
          <div class="schedule-container">
            ${gridContent}
          </div>
        </div>
      </ha-card>
    `;

    // Add event listener for day selector
    const selector = this.shadowRoot.getElementById('day-selector');
    if (selector) {
      selector.addEventListener('change', (e) => this._handleDayChange(e));
    }
  }

  getCardSize() {
    return 3;
  }
}

// Card editor for Lovelace UI
class EphScheduleCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
  }

  setConfig(config) {
    // Preserve focus state if inputs exist
    let focusedField = null;
    let cursorPosition = null;
    if (this.shadowRoot) {
      const entityInput = this.shadowRoot.getElementById('entity');
      const titleInput = this.shadowRoot.getElementById('title');
      if (entityInput && entityInput === document.activeElement) {
        focusedField = 'entity';
        cursorPosition = entityInput.selectionStart;
      } else if (titleInput && titleInput === document.activeElement) {
        focusedField = 'title';
        cursorPosition = titleInput.selectionStart;
      }
    }

    this._config = { 
      entity: '',
      title: 'EPH Schedule',
      show_header: true,
      ...config 
    };
    this._render();

    // Restore focus and cursor position
    if (focusedField && this.shadowRoot) {
      const input = this.shadowRoot.getElementById(focusedField);
      if (input) {
        input.focus();
        if (cursorPosition !== null && input.setSelectionRange) {
          input.setSelectionRange(cursorPosition, cursorPosition);
        }
      }
    }
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  _valueChanged(field, value) {
    if (!this._config) return;
    
    const newConfig = { ...this._config };
    newConfig[field] = value;
    this._config = newConfig;
    
    const event = new CustomEvent('config-changed', {
      detail: { config: this._config },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }

  _render() {
    if (!this.shadowRoot) return;

    const styles = `
      <style>
        .card-config {
          padding: 16px;
        }
        .form-group {
          margin-bottom: 16px;
        }
        .form-group label {
          display: block;
          margin-bottom: 4px;
          font-weight: 500;
        }
        .form-group input[type="text"] {
          width: 100%;
          padding: 8px;
          border: 1px solid var(--divider-color, #ccc);
          border-radius: 4px;
          box-sizing: border-box;
        }
        .form-group .checkbox-container {
          display: flex;
          align-items: center;
          gap: 8px;
        }
      </style>
    `;

    this.shadowRoot.innerHTML = `
      ${styles}
      <div class="card-config">
        <div class="form-group">
          <label>Entity (required)</label>
          <input type="text" id="entity" value="${this._config.entity || ''}" placeholder="climate.downstairs">
        </div>
        <div class="form-group">
          <label>Title (optional)</label>
          <input type="text" id="title" value="${this._config.title || ''}" placeholder="EPH Schedule">
        </div>
        <div class="form-group">
          <div class="checkbox-container">
            <input type="checkbox" id="show_header" ${this._config.show_header !== false ? 'checked' : ''}>
            <label for="show_header">Show Header</label>
          </div>
        </div>
      </div>
    `;

    // Add event listeners
    const entityInput = this.shadowRoot.getElementById('entity');
    const titleInput = this.shadowRoot.getElementById('title');
    const showHeaderInput = this.shadowRoot.getElementById('show_header');

    if (entityInput) {
      entityInput.addEventListener('input', (e) => this._valueChanged('entity', e.target.value));
    }
    if (titleInput) {
      titleInput.addEventListener('input', (e) => this._valueChanged('title', e.target.value));
    }
    if (showHeaderInput) {
      showHeaderInput.addEventListener('change', (e) => this._valueChanged('show_header', e.target.checked));
    }
  }
}

// Register custom elements
customElements.define('eph-schedule-card', EphScheduleCard);
customElements.define('eph-schedule-card-editor', EphScheduleCardEditor);

// Register card with Home Assistant's card picker
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'eph-schedule-card',
  name: 'EPH Schedule Card',
  preview: false,
  description: 'Display weekly heating schedule from EPH Controls Ember climate entities',
  documentationURL: 'https://github.com/UtzR/eph-schedule-card',
});

// Log version for debugging
console.info(
  '%c EPH-SCHEDULE-CARD %c 1.0.0 ',
  'color: white; background: #03a9f4; font-weight: bold;',
  'color: #03a9f4; background: white; font-weight: bold;'
);
