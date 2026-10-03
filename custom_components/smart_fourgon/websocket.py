from __future__ import annotations

import voluptuous as vol
from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback

from .const import DOMAIN


@websocket_api.websocket_command({vol.Required("type"): "smart_fourgon/config/get"})
@websocket_api.async_response
async def ws_get_config(hass: HomeAssistant, connection, msg: dict) -> None:
    connection.send_result(msg["id"], hass.data[DOMAIN]["store"].data)


@websocket_api.websocket_command({
    vol.Required("type"): "smart_fourgon/config/save",
    vol.Required("config"): dict,
})
@websocket_api.require_admin
@websocket_api.async_response
async def ws_save_config(hass: HomeAssistant, connection, msg: dict) -> None:
    saved = await hass.data[DOMAIN]["store"].async_save(msg["config"])
    connection.send_result(msg["id"], saved)


@websocket_api.websocket_command({vol.Required("type"): "smart_fourgon/config/reset"})
@websocket_api.require_admin
@websocket_api.async_response
async def ws_reset_config(hass: HomeAssistant, connection, msg: dict) -> None:
    saved = await hass.data[DOMAIN]["store"].async_reset()
    connection.send_result(msg["id"], saved)


@callback
def async_register_websocket(hass: HomeAssistant) -> None:
    websocket_api.async_register_command(hass, ws_get_config)
    websocket_api.async_register_command(hass, ws_save_config)
    websocket_api.async_register_command(hass, ws_reset_config)
