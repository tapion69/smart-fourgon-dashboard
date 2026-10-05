# Smart Fourgon Dashboard

[![Release](https://img.shields.io/github/v/release/tapion69/smart-fourgon-dashboard?display_name=tag)](https://github.com/tapion69/smart-fourgon-dashboard/releases)
[![Validate](https://github.com/tapion69/smart-fourgon-dashboard/actions/workflows/validate.yml/badge.svg)](https://github.com/tapion69/smart-fourgon-dashboard/actions/workflows/validate.yml)
[![HACS Custom](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://www.hacs.xyz/)
[![Home Assistant](https://img.shields.io/badge/Home%20Assistant-2026.5%2B-18BCF2.svg)](https://www.home-assistant.io/)
[![License](https://img.shields.io/github/license/tapion69/smart-fourgon-dashboard)](LICENSE)
[![Ko-fi](https://img.shields.io/badge/Ko--fi-Support%20the%20project-FF5E5B?logo=ko-fi&logoColor=white)](https://ko-fi.com/tapion69)

**Smart Fourgon Dashboard** is a free, configurable and responsive Home Assistant dashboard designed for camper vans, motorhomes and RVs.

It does not require any specific hardware brand. The dashboard uses entities that already exist in your Home Assistant instance and lets you decide what should be displayed.

## Preview

![Smart Fourgon Dashboard overview](docs/dashboard-preview.jpg)

## Highlights

- Dedicated **Smart Fourgon** panel in the Home Assistant sidebar.
- Responsive layout for **desktop, tablet and smartphone**.
- French and English dashboard UI.
- **Day / Night / Automatic** visual modes.
- Configurable van overview with only the sections you actually use.
- Solar, van consumption, battery, inverter and fresh-water data directly on the main image.
- Daily / monthly / yearly energy summaries.
- Fully configurable **Quick status** tiles.
- Unlimited custom pages such as Heating, Water, MaxxFan, Fridge, Lighting or Security.
- Native-style controls for switches, buttons, numbers, selects, fans and climate entities.
- Dynamic Home Assistant climate controls based on the capabilities exposed by each entity.
- Built-in entity history.
- Dynamic temperature colours.
- Configuration stored in Home Assistant and shared between devices.

## Main overview

The main image can display the following sections when configured.

### Solar

- power;
- voltage;
- current;
- energy today;
- energy this month;
- energy this year.

### Van consumption

- live power;
- energy today;
- energy this month;
- energy this year.

### Battery

- state of charge;
- power;
- voltage;
- current;
- temperature;
- 5-step battery gauge;
- charge today / month / year;
- discharge today / month / year.

### 12/230 V inverter

- state or power;
- voltage;
- frequency;
- current;
- temperature.

### Fresh water

- remaining litres;
- percentage;
- 5-step level indicator;
- water used today / month / year.

A section is hidden when it is disabled or when no useful Home Assistant entity is configured for it.

## Energy summary cards

On desktop, category cards can be displayed next to the main image:

- **Solar production** — live, today, month, year;
- **Van consumption** — live, today, month, year;
- **Battery charge** — today, month, year;
- **Battery discharge** — today, month, year;
- **Water used** — today, month, year.

On smartphones these cards move below the main image while the important live values remain over the van picture.

## Quick status

The **Quick status** area is fully configurable.

Each tile can use:

- any Home Assistant entity;
- a custom label;
- a Material Design icon.

Numeric values can be opened directly in the built-in history view.

## Custom pages

Create as many custom pages as you need, for example:

- Heating / Truma;
- Water;
- MaxxFan / ventilation;
- Refrigerator;
- Lighting;
- Security;
- Cameras;
- Any other Home Assistant equipment.

Each page can contain its own entities and can optionally be shown in additional dashboard navigation.

Supported entity/control types include:

- Auto;
- Sensor / read only;
- Binary Sensor;
- Switch;
- Number;
- Select;
- Button;
- Climate;
- Light;
- Fan.

## Home Assistant climate controls

Climate entities are rendered from the capabilities actually exposed by Home Assistant.

Depending on the entity, Smart Fourgon can automatically show:

- current temperature;
- target temperature;
- HVAC mode;
- fan mode;
- presets;
- swing mode;
- horizontal swing;
- low/high target temperatures.

This keeps the dashboard generic: a Truma heater, air conditioner or another thermostat can expose different controls without requiring a hard-coded page.

## Dynamic temperature colours

Recognised temperature entities can use dynamic colours.

| Temperature type | Low / normal | Warning | High |
| --- | --- | --- | --- |
| Battery | 0–30 °C green | 31–45 °C orange | >45 °C red |
| Inverter | 0–35 °C green | 36–55 °C orange | >55 °C red |
| Water | 0–30 °C blue | 31–45 °C orange | >45 °C red |
| Ambient | 0–15 °C blue | 16–25 °C green | >25 °C red |

## History

Clicking a numeric entity can open the integrated history view.

Available periods:

- 6 hours;
- 24 hours;
- 7 days;
- 30 days.

## Day and night modes

Three display modes are available:

- **Day**;
- **Night**;
- **Automatic**.

Automatic mode follows Home Assistant's `sun.sun` state.

## Installation with HACS

Smart Fourgon Dashboard can be installed as a **custom HACS Integration repository**.

1. Open **HACS**.
2. Open **Custom repositories**.
3. Add:

   ```text
   https://github.com/tapion69/smart-fourgon-dashboard
   ```

4. Select **Integration** as the category.
5. Install **Smart Fourgon Dashboard**.
6. Restart Home Assistant.
7. Go to **Settings → Devices & services → Add integration**.
8. Search for **Smart Fourgon Dashboard**.
9. Complete the setup.

The **Smart Fourgon** panel will then appear in the Home Assistant sidebar.

### Requirements

- Home Assistant **2026.5.0 or newer**;
- HACS for the easiest installation method;
- at least one Home Assistant entity to display.

No specific inverter, BMS, solar controller, heater or water-level system is required.

## Updating

Stable versions are published as **GitHub Releases** using semantic version tags such as:

```text
v1.0.7
v1.0.8
v1.1.0
```

HACS can detect new stable releases and offer the normal **Update** action.

Development work may still be committed to `main` between releases. Those individual development commits are not intended to trigger HACS update notifications.

See [RELEASING.md](RELEASING.md) for the release process.

## Validation

Every push to `main` and every Pull Request runs automated checks for:

- JSON files;
- Python syntax;
- frontend JavaScript syntax;
- HACS repository requirements;
- Home Assistant Hassfest validation.

## Privacy

Smart Fourgon Dashboard reads entities from your own Home Assistant instance and stores its dashboard configuration in Home Assistant storage.

It does not require an external cloud service to operate.

## Free and open source

**Smart Fourgon Dashboard is completely free and open source.**

There is no paid edition, no locked feature and no subscription required. Donations do **not** unlock extra features or change the licence.

Developing, testing and maintaining the project takes a significant amount of personal time. If you enjoy Smart Fourgon Dashboard and would like to support continued development, you can optionally buy me a coffee on Ko-fi:

[![Support me on Ko-fi](https://img.shields.io/badge/Support%20me%20on-Ko--fi-FF5E5B?style=for-the-badge&logo=ko-fi&logoColor=white)](https://ko-fi.com/tapion69)

**Ko-fi:** https://ko-fi.com/tapion69

Thank you for using the project, reporting bugs and sharing ideas — that already helps a lot.

## Contributing

Bug reports, feature ideas and Pull Requests are welcome.

- [Contributing guide](CONTRIBUTING.md)
- [Changelog](CHANGELOG.md)
- [Release process](RELEASING.md)

## License

Smart Fourgon Dashboard is released under the [MIT License](LICENSE).
