from __future__ import annotations

import json
from pathlib import Path

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .const import DOMAIN
from .panel import async_register_panel, async_unregister_panel
from .storage import SmartFourgonStore
from .websocket import async_register_websocket


async def async_setup(hass: HomeAssistant, config: dict) -> bool:
    hass.data.setdefault(DOMAIN, {})
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    domain_data = hass.data.setdefault(DOMAIN, {})
    store = SmartFourgonStore(hass)
    await store.async_load()
    domain_data["store"] = store

    if not domain_data.get("websocket_registered"):
        async_register_websocket(hass)
        domain_data["websocket_registered"] = True

    try:
        manifest = json.loads((Path(__file__).parent / "manifest.json").read_text(encoding="utf-8"))
        version = manifest.get("version", "0")
    except Exception:
        version = "0"

    await async_register_panel(hass, version)
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    async_unregister_panel(hass)
    hass.data.get(DOMAIN, {}).pop("store", None)
    return True
