# EPH Schedule Card

A custom Lovelace card for Home Assistant that displays the weekly heating schedule from EPH Controls Ember climate entities.

**Repository**: [https://github.com/UtzR/eph-schedule-card](https://github.com/UtzR/eph-schedule-card)

## Features

- Display weekly schedule from EPH Controls climate entities
- Day selector to view schedule for any day of the week
- Clean 3x3 grid layout showing periods (P1, P2, P3) with start and end times
- Read-only display (editing capability planned for future)
- Responsive design for mobile and desktop
- Matches Home Assistant theme automatically

## Installation

### Via HACS (Recommended)

1. Open HACS in Home Assistant
2. Click the three dots menu (⋮) in the top right corner
3. Select **Custom repositories**
4. Click **Add** and enter:
   - **Repository**: `https://github.com/UtzR/eph-schedule-card`
   - **Type**: **Dashboard**
5. Click **Add**
6. Go to the **Dashboard** tab in HACS
7. Find **EPH Schedule Card** in the list
8. Click **Download**
9. **Important**: After installation, you may need to manually add the resource:
   - Go to **Settings** → **Dashboards** → **Resources** (click the three dots menu)
   - Click **Add Resource**
   - URL: `/hacsfiles/eph-schedule-card/eph-schedule-card.js`
   - Resource type: **JavaScript Module**
   - Click **Create**
10. Restart Home Assistant
11. Clear your browser cache (Ctrl+Shift+R or Cmd+Shift+R)

### Manual Installation

1. Download `eph-schedule-card.js` from [GitHub](https://github.com/UtzR/eph-schedule-card) to your `www` directory in Home Assistant
2. Add the resource in Lovelace:
   - Go to **Settings** → **Dashboards** → **Resources**
   - Click **Add Resource**
   - URL: `/local/eph-schedule-card.js`
   - Type: **JavaScript Module**
3. Refresh your browser

## Configuration

### Card Options

| Name | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| `entity` | string | - | **Yes** | Entity ID of the EPH Controls climate entity (e.g., `climate.downstairs`) |
| `title` | string | "EPH Schedule" | No | Custom title for the card |
| `show_header` | boolean | `true` | No | Show/hide the card header |

### Example Configuration

#### YAML Mode

```yaml
type: custom:eph-schedule-card
entity: climate.downstairs
title: Downstairs Schedule
show_header: true
```

#### UI Mode

1. Edit your dashboard
2. Click **Add Card**
3. Search for "EPH Schedule Card" or select **Custom: EPH Schedule Card**
4. Configure:
   - **Entity**: Select your climate entity (e.g., `climate.downstairs`)
   - **Title**: Optional custom title
   - **Show Header**: Toggle header visibility

## Usage

1. Add the card to your dashboard
2. Select a day from the dropdown to view that day's schedule
3. The grid shows:
   - **Period**: P1, P2, or P3
   - **Start Time**: When the period starts (HH:MM format)
   - **End Time**: When the period ends (HH:MM format)
   - Disabled periods show "—" in both time columns

## Schedule Format

The card reads the `schedule` attribute from your EPH Controls climate entity. The schedule structure is:

```javascript
{
  "Sunday": { "p1": "07:40-15:10", "p2": null, "p3": null },
  "Monday": { "p1": null, "p2": "16:00-22:00", "p3": null },
  // ... other days
}
```

- Each day has three periods: `p1`, `p2`, `p3`
- A period can be `null` (disabled) or a time range string like `"HH:MM-HH:MM"`
- Times are in 24-hour format

## Troubleshooting

### Card not appearing in "Add Card" list

If the card doesn't appear in the dashboard's "Add Card" list after HACS installation:

1. **Verify the resource is added**:
   - Go to **Settings** → **Dashboards** → **Resources**
   - Look for `/hacsfiles/eph-schedule-card/eph-schedule-card.js`
   - If missing, add it manually (see step 9 in HACS installation)

2. **Check browser console for errors**:
   - Open browser developer tools (F12)
   - Check the Console tab for JavaScript errors
   - Common issues: import failures, syntax errors

3. **Try manual card addition**:
   - When adding a card, scroll to the bottom and select **Manual**
   - Enter: `type: custom:eph-schedule-card`
   - Then configure the entity in the card editor

4. **Clear browser cache**:
   - Hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
   - Or clear browser cache completely

5. **Verify HACS installation**:
   - Check that the card file exists in `/config/www/community/eph-schedule-card/`
   - Restart Home Assistant after installation

### Card shows "Entity not found"
- Verify the entity ID is correct
- Ensure the entity exists in Home Assistant
- Check that the EPH Controls integration is properly configured

### Card shows "No schedule attribute found"
- The climate entity may not have schedule data yet
- Try refreshing the entity or restarting Home Assistant
- Verify the EPH Controls integration is working correctly

### Times display incorrectly
- Ensure your EPH Controls integration is up to date
- The schedule attribute should contain properly formatted time strings

## Requirements

- Home Assistant 2023.3 or later
- EPH Controls Ember integration with MQTT support
- Climate entity with `schedule` attribute

## Development

This card is built using:
- LitElement for reactive UI
- Home Assistant's theme system for styling
- Standard Lovelace card API

## License

MIT License - see LICENSE file for details

## Support

For issues, feature requests, or contributions, please visit the [GitHub repository](https://github.com/UtzR/eph-schedule-card).
