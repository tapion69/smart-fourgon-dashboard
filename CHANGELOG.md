# Changelog

All notable changes to Smart Fourgon Dashboard are documented in this file.

The project follows Semantic Versioning where practical.

## [Unreleased]

Changes currently being developed after the latest stable release.

## [1.0.8] - 2026-10-12

### Added

- Optional **Gas** section on the main overview.
- Support for up to **two gas bottles**, each with its own label and Home Assistant entity.
- Configurable **additional information** for every base overview section:
  - Solar;
  - Van consumption;
  - Battery;
  - Inverter;
  - Fresh water;
  - Gas.
- Additional overview values automatically use the unit exposed by Home Assistant.
- Temperature entities added as extra information keep dynamic temperature colouring.

### Improved

- Gas has its own orange visual identity on desktop and smartphone.
- Additional overview entities can be added or removed directly from Settings without editing source code.

[1.0.8]: https://github.com/tapion69/smart-fourgon-dashboard/releases/tag/v1.0.8

## [1.0.7] - 2026-10-05

### Added

- Dedicated Smart Fourgon panel in the Home Assistant sidebar.
- Configurable day, night and automatic display modes.
- Responsive desktop, tablet and smartphone layouts.
- Main overview for Solar, Van consumption, Battery, Inverter and Fresh water.
- Daily, monthly and yearly energy counters.
- Fully configurable Quick status section.
- User-created dashboard pages.
- Support for Sensor, Binary Sensor, Switch, Number, Select, Button, Climate, Light and Fan controls.
- Dynamic Home Assistant climate controls based on entity capabilities.
- Integrated 6 h / 24 h / 7 d / 30 d history view.
- Battery and water level indicators.
- Dynamic temperature colours for battery, inverter, water and ambient temperatures.
- French and English dashboard UI.
- Configurable location entity.
- Configurable icon catalogue with vanlife-oriented icons.
- Confirmation before deleting a custom page.
- Remembered open/closed state for settings sections.

### Improved

- Desktop readability.
- Smartphone overview layout with live values kept on the main image.
- Distinct category colours.
- Initial dashboard loading and browser caching.
- Settings scrolling and navigation on smartphones.

### HACS

- Added HACS repository validation.
- Added Home Assistant Hassfest validation.
- Added automated GitHub Release workflow for stable HACS updates.

[1.0.7]: https://github.com/tapion69/smart-fourgon-dashboard/releases/tag/v1.0.7
