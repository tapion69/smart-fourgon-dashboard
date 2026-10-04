from __future__ import annotations

from copy import deepcopy
from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .const import STORAGE_KEY, STORAGE_VERSION


def default_config() -> dict:
    return {
        "version": 1,
        "general": {
            "title": "SMART FOURGON",
            "language": "fr",
            "theme_mode": "auto",
        },
        "overview": {
            "solar": {
                "enabled": True,
                "icon": "mdi:solar-panel-large",
                "power": "", "voltage": "", "current": "",
                "energy_today": "", "energy_month": "", "energy_year": "",
            },
            "consumption": {
                "enabled": True,
                "icon": "mdi:van-utility",
                "power": "", "energy_today": "",
            },
            "battery": {
                "enabled": True,
                "icon": "mdi:battery-high",
                "soc": "", "power": "", "voltage": "", "current": "",
                "temperature": "", "charge_today": "", "discharge_today": "",
            },
            "inverter": {
                "enabled": True,
                "icon": "mdi:power-plug",
                "status": "", "power": "", "voltage": "", "frequency": "", "current": "",
                "temperature": "",
            },
            "water": {
                "enabled": True,
                "icon": "mdi:water",
                "percent": "", "liters": "", "consumed_today": "",
            },
        },
        "daily_counters": [
            {"id":"solar_day","label_fr":"Solaire","label_en":"Solar","icon":"mdi:white-balance-sunny","entity":"","enabled":True},
            {"id":"consumption_day","label_fr":"Conso fourgon","label_en":"Van consumption","icon":"mdi:van-utility","entity":"","enabled":True},
            {"id":"battery_charge_day","label_fr":"Charge batt.","label_en":"Battery charge","icon":"mdi:battery-plus","entity":"","enabled":True},
            {"id":"battery_discharge_day","label_fr":"Décharge batt.","label_en":"Battery discharge","icon":"mdi:battery-minus","entity":"","enabled":True},
            {"id":"alternator_day","label_fr":"Alternateur","label_en":"Alternator","icon":"mdi:engine","entity":"","enabled":True},
            {"id":"water_day","label_fr":"Eau consommée","label_en":"Water used","icon":"mdi:water-minus","entity":"","enabled":True}
        ],
        "tabs": [],
    }


class SmartFourgonStore:
    def __init__(self, hass: HomeAssistant) -> None:
        self._store: Store[dict] = Store(hass, STORAGE_VERSION, STORAGE_KEY)
        self.data = default_config()

    async def async_load(self) -> dict:
        saved = await self._store.async_load()
        self.data = _merge(default_config(), saved) if isinstance(saved, dict) else default_config()
        return deepcopy(self.data)

    async def async_save(self, data: dict) -> dict:
        self.data = _merge(default_config(), data if isinstance(data, dict) else {})
        await self._store.async_save(self.data)
        return deepcopy(self.data)

    async def async_reset(self) -> dict:
        self.data = default_config()
        await self._store.async_save(self.data)
        return deepcopy(self.data)


def _merge(base: dict, override: dict) -> dict:
    out = deepcopy(base)
    for key, value in override.items():
        if key in ("tabs", "daily_counters") and isinstance(value, list):
            out[key] = deepcopy(value)
        elif isinstance(value, dict) and isinstance(out.get(key), dict):
            out[key] = _merge(out[key], value)
        else:
            out[key] = deepcopy(value)
    return out
