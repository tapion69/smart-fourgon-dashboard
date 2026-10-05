from __future__ import annotations

from pathlib import Path

from homeassistant.components import frontend
from homeassistant.components.http import StaticPathConfig
from homeassistant.core import HomeAssistant

from .const import PANEL_ICON, PANEL_TITLE, PANEL_URL, STATIC_URL


async def async_register_panel(hass: HomeAssistant, version: str) -> None:
    frontend_dir = Path(__file__).parent / "frontend"
    await hass.http.async_register_static_paths(
        [StaticPathConfig(STATIC_URL, str(frontend_dir), True)]
    )

    if PANEL_URL in hass.data.get("frontend_panels", {}):
        return

    frontend.async_register_built_in_panel(
        hass,
        component_name="custom",
        sidebar_title=PANEL_TITLE,
        sidebar_icon=PANEL_ICON,
        frontend_url_path=PANEL_URL,
        config={
            "_panel_custom": {
                "name": "smart-fourgon-panel",
                "embed_iframe": False,
                "trust_external": False,
                "js_url": f"{STATIC_URL}/smart-fourgon-panel.js?v={version}",
            }
        },
        require_admin=False,
    )


def async_unregister_panel(hass: HomeAssistant) -> None:
    if PANEL_URL in hass.data.get("frontend_panels", {}):
        frontend.async_remove_panel(hass, PANEL_URL)
