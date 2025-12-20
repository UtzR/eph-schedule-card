import { LitElement, html, css } from 'https://unpkg.com/[email protected]/lit-element.js?module';

class EphScheduleCard extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object },
      _selectedDay: { type: String, state: true },
    };
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
    this.config = config;
    // Default to current day, or Monday if not available
    if (!this._selectedDay) {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const today = new Date().getDay();
      this._selectedDay = days[today];
    }
  }

  _getSchedule() {
    if (!this.hass || !this.config || !this.config.entity) {
      return null;
    }
    const state = this.hass.states[this.config.entity];
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
  }

  _renderScheduleGrid(daySchedule) {
    if (!daySchedule) {
      return html`
        <div class="error-message">
          No schedule data available for selected day.
        </div>
      `;
    }

    const periods = ['p1', 'p2', 'p3'];
    const periodLabels = ['P1', 'P2', 'P3'];

    return html`
      <table class="schedule-grid">
        <thead>
          <tr>
            <th>Period</th>
            <th>Start Time</th>
            <th>End Time</th>
          </tr>
        </thead>
        <tbody>
          ${periods.map((period, index) => {
            const timeRange = daySchedule[period];
            const parsed = this._parseTimeRange(timeRange);
            const isDisabled = !timeRange || timeRange === 'null' || parsed.start === null;

            return html`
              <tr class="${isDisabled ? 'disabled' : ''}">
                <td class="period-label">${periodLabels[index]}</td>
                <td class="time-cell">${isDisabled ? '—' : parsed.start}</td>
                <td class="time-cell">${isDisabled ? '—' : parsed.end}</td>
              </tr>
            `;
          })}
        </tbody>
      </table>
    `;
  }

  render() {
    if (!this.config || !this.config.entity) {
      return html`
        <ha-card>
          <div class="card-content error">
            <div class="error-message">Invalid configuration: entity is required</div>
          </div>
        </ha-card>
      `;
    }

    const state = this.hass?.states[this.config.entity];
    if (!state) {
      return html`
        <ha-card>
          <div class="card-content error">
            <div class="error-message">
              Entity ${this.config.entity} not found
            </div>
          </div>
        </ha-card>
      `;
    }

    const schedule = this._getSchedule();
    if (!schedule) {
      return html`
        <ha-card>
          ${this.config.show_header !== false ? html`
            <div class="card-header">
              ${this.config.title || 'EPH Schedule'}
            </div>
          ` : ''}
          <div class="card-content error">
            <div class="error-message">
              No schedule attribute found for ${this.config.entity}
            </div>
          </div>
        </ha-card>
      `;
    }

    const daySchedule = this._getDaySchedule(this._selectedDay);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    return html`
      <ha-card>
        ${this.config.show_header !== false ? html`
          <div class="card-header">
            ${this.config.title || 'EPH Schedule'}
          </div>
        ` : ''}
        <div class="card-content">
          <div class="day-selector-container">
            <label for="day-selector">Select Day:</label>
            <select
              id="day-selector"
              class="day-selector"
              .value="${this._selectedDay || 'Monday'}"
              @change="${this._handleDayChange}"
            >
              ${days.map(day => html`
                <option value="${day}" ?selected="${day === this._selectedDay}">
                  ${day}
                </option>
              `)}
            </select>
          </div>
          <div class="schedule-container">
            ${this._renderScheduleGrid(daySchedule)}
          </div>
        </div>
      </ha-card>
    `;
  }

  static get styles() {
    return css`
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
    `;
  }
}

customElements.define('eph-schedule-card', EphScheduleCard);

// Card editor for Lovelace UI
class EphScheduleCardEditor extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object },
    };
  }

  setConfig(config) {
    this.config = { ...EphScheduleCard.getStubConfig(), ...config };
  }

  _valueChanged(field, value) {
    if (!this.config) {
      return;
    }
    const newConfig = { ...this.config };
    newConfig[field] = value;
    this.config = newConfig;
    this._configChanged();
  }

  _configChanged() {
    const event = new CustomEvent('config-changed', {
      detail: { config: this.config },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }

  render() {
    if (!this.config) {
      return html``;
    }

    return html`
      <div class="card-config">
        <div class="form-group">
          <ha-entity-picker
            .hass="${this.hass}"
            .value="${this.config.entity}"
            .configValue="${'entity'}"
            @value-changed="${(ev) => this._valueChanged('entity', ev.detail.value)}"
            label="Entity"
            required
            .includeDomains="${['climate']}"
          ></ha-entity-picker>
        </div>
        <div class="form-group">
          <ha-textfield
            label="Title (optional)"
            .value="${this.config.title || ''}"
            .configValue="${'title'}"
            @input="${(ev) => this._valueChanged('title', ev.target.value)}"
          ></ha-textfield>
        </div>
        <div class="form-group">
          <ha-switch
            .checked="${this.config.show_header !== false}"
            .configValue="${'show_header'}"
            @change="${(ev) => this._valueChanged('show_header', ev.target.checked)}"
          >
            Show Header
          </ha-switch>
        </div>
      </div>
    `;
  }

  static get styles() {
    return css`
      .card-config {
        padding: 16px;
      }

      .form-group {
        margin-bottom: 16px;
      }

      ha-switch {
        display: flex;
        align-items: center;
        gap: 8px;
      }
    `;
  }
}

customElements.define('eph-schedule-card-editor', EphScheduleCardEditor);
